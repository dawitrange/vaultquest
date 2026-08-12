import type { AffiliateCategory, AffiliateHealth, AffiliateLink as DbLink } from "@prisma/client";
import { prisma } from "@/lib/db";

export type Quest = {
  id: string;
  title: string;
  description: string;
  effort: "Low" | "Medium" | "High";
  timeHint: string;
  vpReward: number;
  category: AffiliateCategory;
  featured?: boolean;
  holdDays?: number;
};

export const QUESTS: Quest[] = [
  {
    id: "q-offerwall",
    title: "Offer wall quests",
    description: "Browse partner offers — games, apps, and tasks for your region.",
    effort: "Medium",
    timeHint: "15–90 min per offer",
    vpReward: 500,
    category: "offerwall_primary",
    featured: true,
    holdDays: 7,
  },
  {
    id: "q-freecash",
    title: "Featured partner signup",
    description: "Create a Freecash account via VaultQuest. Fixed VP when verified — not a magic code.",
    effort: "Low",
    timeHint: "5–10 min",
    vpReward: 150,
    category: "cpa_signup",
    featured: true,
    holdDays: 5,
  },
  {
    id: "q-surveys",
    title: "Survey wall",
    description: "Share opinions when surveys are available. Availability varies by country.",
    effort: "Low",
    timeHint: "5–20 min",
    vpReward: 80,
    category: "survey_wall",
    holdDays: 3,
  },
  {
    id: "q-play",
    title: "Play & reach milestones",
    description: "Install and progress in partner games. Follow steps exactly — no VPN.",
    effort: "High",
    timeHint: "1–several hours",
    vpReward: 1200,
    category: "cpe_play",
    holdDays: 14,
  },
];

const FALLBACK: Record<AffiliateCategory, AffiliateCategory[]> = {
  offerwall_primary: ["offerwall_primary", "offerwall_backup"],
  offerwall_backup: ["offerwall_backup", "offerwall_primary"],
  survey_wall: ["survey_wall", "offerwall_primary"],
  cpa_signup: ["cpa_signup", "offerwall_primary"],
  cpe_play: ["cpe_play", "offerwall_primary"],
};

// Partner priority within each category — mirrors docs/agents/offers-mix.md §2 + backup eval.
// Used to seed AffiliateLink.priority and to break ties at runtime; not a replacement for DB priority.
export const PARTNER_WATERFALL: Record<AffiliateCategory, string[]> = {
  offerwall_primary: ["lootably", "torox", "adgate", "offerdaddy", "prime", "timewall"],
  offerwall_backup: ["torox", "adgate", "ayet", "lootably", "offerdaddy", "adgem"],
  survey_wall: ["bitlabs", "cpx", "adgate", "lootably", "prime", "timewall"],
  cpa_signup: ["freecash", "torox", "adgate", "offerdaddy"],
  cpe_play: ["ayet", "lootably", "torox", "adgate", "adgem", "offerdaddy"],
};

type RotationReason = "cap" | "health" | "empty_inventory" | "geo_skip" | "postback_silence" | "manual";

async function logRotation(args: {
  userId?: string | null;
  category: AffiliateCategory;
  linkId?: string | null;
  partner?: string | null;
  reason: RotationReason;
  meta?: Record<string, unknown>;
}) {
  try {
    const anyPrisma = prisma as unknown as Record<string, { create?: (a: unknown) => Promise<unknown> }>;
    if (anyPrisma["rotationLog"]?.create) {
      await anyPrisma["rotationLog"].create({
        data: {
          userId: args.userId ?? undefined,
          category: args.category,
          linkId: args.linkId ?? undefined,
          partner: args.partner ?? undefined,
          reason: args.reason,
          meta: args.meta ?? undefined,
        },
      });
    } else {
      console.info("[affiliates:rotation]", args);
    }
  } catch {
    // never break serving on log failure
  }
}

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function clicksTodayForLink(linkId: string) {
  return prisma.offerClick.count({
    where: {
      affiliateLinkId: linkId,
      createdAt: { gte: startOfUtcDay() },
    },
  });
}

export async function listAffiliateInventory() {
  return prisma.affiliateLink.findMany({ orderBy: [{ category: "asc" }, { priority: "asc" }] });
}

function isServable(link: DbLink): boolean {
  return (link.status as string) === "healthy";
}

async function enforceDailyCap(link: DbLink): Promise<boolean> {
  if (link.capDaily == null) return true;
  const clicks = await clicksTodayForLink(link.id);
  if (clicks < link.capDaily) return true;
  await prisma.affiliateLink.update({
    where: { id: link.id },
    data: { status: "capped" as AffiliateHealth, updatedAt: new Date() },
  });
  await logRotation({ category: link.category, linkId: link.id, partner: link.partner, reason: "cap", meta: { clicks, capDaily: link.capDaily } });
  return false;
}

export async function checkLinkLiveness(link: DbLink, timeoutMs = 3500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(link.url, { method: "HEAD", signal: controller.signal, redirect: "manual" });
    clearTimeout(t);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

export async function serveAffiliateLink(
  category: AffiliateCategory,
  opts?: { userId?: string | null; geo?: string | null; userAgent?: string | null },
): Promise<DbLink | null> {
  const order = FALLBACK[category];
  for (const cat of order) {
    const candidates = await prisma.affiliateLink.findMany({
      where: { category: cat, status: "healthy" as AffiliateHealth },
      orderBy: { priority: "asc" },
    });
    const waterfallOrder = PARTNER_WATERFALL[cat] ?? [];
    candidates.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const ai = waterfallOrder.indexOf(a.partner.toLowerCase());
      const bi = waterfallOrder.indexOf(b.partner.toLowerCase());
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    for (const link of candidates) {
      if (!isServable(link)) {
        await logRotation({ userId: opts?.userId, category, linkId: link.id, partner: link.partner, reason: "health" });
        continue;
      }
      const underCap = await enforceDailyCap(link);
      if (!underCap) continue;
      return link;
    }
  }
  await logRotation({ userId: opts?.userId, category, reason: "empty_inventory", meta: { fallback: order } });
  return null;
}

export async function reportEmptyInventory(args: {
  category: AffiliateCategory;
  partner: string;
  geo?: string | null;
  userId?: string | null;
}) {
  await logRotation({ userId: args.userId, category: args.category, partner: args.partner, reason: "empty_inventory", meta: { geo: args.geo } });
}

export async function markLinkUnhealthy(linkId: string, reason: RotationReason, detail?: string) {
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      status: "disabled" as AffiliateHealth,
      updatedAt: new Date(),
    } as unknown as Record<string, unknown>,
  });
  const link = await prisma.affiliateLink.findUnique({ where: { id: linkId } });
  if (link) await logRotation({ category: link.category, linkId, partner: link.partner, reason, meta: { detail } });
}

export async function createOfferClick(opts: {
  userId?: string | null;
  questId: string;
  category: AffiliateCategory;
  geo?: string | null;
  userAgent?: string | null;
}) {
  const link = await serveAffiliateLink(opts.category, { userId: opts.userId, geo: opts.geo, userAgent: opts.userAgent });
  if (!link) return null;

  const click = await prisma.offerClick.create({
    data: {
      userId: opts.userId ?? null,
      affiliateLinkId: link.id,
      questId: opts.questId,
    },
  });

  // CPX uses stable ext_user_id — prefer VaultQuest userId, fall back to click id for anon
  const cpxExtUserId = opts.userId ?? click.id;

  return { click, link, cpxExtUserId };
}

export async function resetDailyCaps() {
  await prisma.affiliateLink.updateMany({
    where: { status: "capped" as AffiliateHealth },
    data: { status: "healthy" as AffiliateHealth },
  });
}

export async function getWaterfallSnapshot() {
  const links = await listAffiliateInventory();
  return {
    fallback: FALLBACK,
    partnerWaterfall: PARTNER_WATERFALL,
    links: links.map((l) => ({ id: l.id, slug: l.slug, partner: l.partner, category: l.category, priority: l.priority, status: l.status, capDaily: l.capDaily, url: l.url })),
  };
}

export function getQuest(questId: string) {
  return QUESTS.find((q) => q.id === questId) ?? null;
}

/**
 * Categories that can currently serve a real offer — i.e. the category (or a
 * fallback category) has at least one `healthy` affiliate link. Used to gate
 * the Earn UI so we never present a "Start quest" CTA that would dump the user
 * on a bare partner homepage. Until a network is approved AND integrated (a real
 * offer URL flipped to `healthy` in admin), the honest state is "no quests".
 */
export async function getServableCategories(): Promise<Set<AffiliateCategory>> {
  const healthy = await prisma.affiliateLink.findMany({
    where: { status: "healthy" as AffiliateHealth },
    select: { category: true },
  });
  const healthySet = new Set(healthy.map((h) => h.category));
  const servable = new Set<AffiliateCategory>();
  (Object.keys(FALLBACK) as AffiliateCategory[]).forEach((cat) => {
    if (FALLBACK[cat].some((c) => healthySet.has(c))) servable.add(cat);
  });
  return servable;
}
