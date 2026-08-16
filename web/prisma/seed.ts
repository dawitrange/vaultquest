import assert from "node:assert/strict";
import { AffiliateCategory, AffiliateHealth, PrismaClient } from "@prisma/client";
import { isMarketingHomepageUrl } from "../src/lib/postback";

/**
 * Affiliate inventory seed.
 *
 * Do not run a blind reseed on production. /admin is the flip.
 *
 * Create-if-missing uses the defaults below (disabled placeholders).
 * On update, cpx-survey and freecash-cpa keep their status and url when
 * the row is already healthy, or when url is already a real wall rather
 * than a marketing homepage. Prod Neon already has those two healthy
 * (2026-08-16). Writing seed defaults over them would take earn-live down.
 *
 * Every other slug stays a disabled marketing homepage. Do not invent
 * wall URLs. Serving already refuses homepages via isMarketingHomepageUrl.
 *
 * Priority follows docs/agents/offers-mix.md §2 + PARTNER_WATERFALL.
 */
const SEED = [
  // --- offerwall_primary ---
  {
    slug: "lootably-primary",
    partner: "Lootably",
    url: "https://lootably.com/",
    category: AffiliateCategory.offerwall_primary,
    priority: 1,
    status: AffiliateHealth.disabled,
    capDaily: 5000,
  },
  // --- offerwall_backup (self-serve / instant-approval friendly) ---
  {
    slug: "torox-backup",
    partner: "Torox",
    url: "https://torox.io/",
    category: AffiliateCategory.offerwall_backup,
    priority: 2,
    // Rejected 2026-08 ("not a good fit"): needs DAU / monthly revenue + daily
    // traffic audit. Keep the row so we can reapply + re-enable after traffic.
    status: AffiliateHealth.disabled,
    capDaily: 3000,
  },
  {
    slug: "adgate-backup",
    partner: "AdGate Media",
    url: "https://adgatemedia.com/",
    category: AffiliateCategory.offerwall_backup,
    priority: 3,
    // Marketing homepage. Do not flip healthy until Ethio pastes a real
    // AdGate Rewards wall/embed URL. Yield writes that /admin flip. Never invent it.
    status: AffiliateHealth.disabled,
    capDaily: 3000,
  },
  {
    slug: "timewall-backup",
    partner: "TimeWall",
    url: "https://timewall.io/",
    category: AffiliateCategory.offerwall_backup,
    priority: 4,
    // Self-serve, no traffic minimum. Fastest activation for new sites.
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },
  {
    slug: "offerdaddy-backup",
    partner: "OfferDaddy",
    url: "https://offerdaddy.com/",
    category: AffiliateCategory.offerwall_backup,
    priority: 5,
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },

  // --- survey_wall (low barrier, self-serve) ---
  {
    slug: "bitlabs-survey",
    partner: "BitLabs",
    url: "https://www.bitlabs.ai/",
    category: AffiliateCategory.survey_wall,
    priority: 1,
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },
  {
    slug: "cpx-survey",
    partner: "CPX Research",
    url: "https://www.cpx-research.com/",
    category: AffiliateCategory.survey_wall,
    priority: 2,
    // Marketing homepage for create-if-missing only. Do not hardcode a wall URL.
    // Prod already has a healthy offers-host wall from /admin. Update preserves it.
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },

  // --- cpa_signup ---
  {
    slug: "freecash-cpa",
    partner: "Freecash",
    url: "https://freecash.com/r/14APDV",
    category: AffiliateCategory.cpa_signup,
    priority: 1,
    // Referral URL is real. Status stays disabled on create-if-missing.
    // Update preserves a healthy /admin flip so a reseed cannot disable it.
    status: AffiliateHealth.disabled,
    capDaily: 1000,
  },

  // --- cpe_play (mobile / playable) ---
  {
    slug: "ayet-cpe",
    partner: "ayeT Studios",
    url: "https://www.ayetstudios.com/",
    category: AffiliateCategory.cpe_play,
    priority: 1,
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },
  {
    slug: "adgem-cpe",
    partner: "AdGem",
    url: "https://adgem.com/",
    category: AffiliateCategory.cpe_play,
    priority: 2,
    // Self-serve publisher onboarding. Keep disabled until a real wall URL exists.
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },
] as const;

type SeedRow = (typeof SEED)[number];

type ExistingAffiliate = {
  slug: string;
  status: AffiliateHealth;
  url: string;
};

const LIVE_WALL_SLUGS = new Set(["cpx-survey", "freecash-cpa"]);

/** True when a second seed run must leave status and url alone. */
export function shouldPreserveLiveWall(existing: ExistingAffiliate): boolean {
  if (!LIVE_WALL_SLUGS.has(existing.slug)) return false;
  if (existing.status === AffiliateHealth.healthy) return true;
  return !isMarketingHomepageUrl(existing.url);
}

export function affiliateSeedUpdate(row: SeedRow, existing: ExistingAffiliate | null) {
  const update: {
    partner: string;
    category: AffiliateCategory;
    priority: number;
    capDaily: number;
    url?: string;
    status?: AffiliateHealth;
  } = {
    partner: row.partner,
    category: row.category,
    priority: row.priority,
    capDaily: row.capDaily,
  };
  if (existing && shouldPreserveLiveWall(existing)) {
    return update;
  }
  update.url = row.url;
  update.status = row.status;
  return update;
}

function proveAffiliateSeedUpdate(): void {
  const cpx = SEED.find((row) => row.slug === "cpx-survey");
  const freecash = SEED.find((row) => row.slug === "freecash-cpa");
  const lootably = SEED.find((row) => row.slug === "lootably-primary");
  assert.ok(cpx && freecash && lootably);

  const cpxLive = affiliateSeedUpdate(cpx, {
    slug: "cpx-survey",
    status: AffiliateHealth.healthy,
    url: "https://offers.cpx-research.com/index.php?app_id=35413",
  });
  assert.equal("url" in cpxLive, false, "second seed must not reset healthy cpx-survey url");
  assert.equal("status" in cpxLive, false, "second seed must not reset healthy cpx-survey status");

  const freecashLive = affiliateSeedUpdate(freecash, {
    slug: "freecash-cpa",
    status: AffiliateHealth.healthy,
    url: "https://freecash.com/r/14APDV",
  });
  assert.equal("url" in freecashLive, false, "second seed must not reset healthy freecash-cpa url");
  assert.equal("status" in freecashLive, false, "second seed must not reset healthy freecash-cpa status");

  const cpxWallStillDisabled = affiliateSeedUpdate(cpx, {
    slug: "cpx-survey",
    status: AffiliateHealth.disabled,
    url: "https://offers.cpx-research.com/index.php?app_id=35413",
  });
  assert.equal("url" in cpxWallStillDisabled, false, "real cpx wall url must survive even if still disabled");
  assert.equal("status" in cpxWallStillDisabled, false);

  const cpxPlaceholder = affiliateSeedUpdate(cpx, {
    slug: "cpx-survey",
    status: AffiliateHealth.disabled,
    url: "https://www.cpx-research.com/",
  });
  assert.equal(cpxPlaceholder.status, AffiliateHealth.disabled);
  assert.equal(cpxPlaceholder.url, "https://www.cpx-research.com/");

  const lootablyUpdate = affiliateSeedUpdate(lootably, {
    slug: "lootably-primary",
    status: AffiliateHealth.healthy,
    url: "https://lootably.com/",
  });
  assert.equal(lootablyUpdate.status, AffiliateHealth.disabled);
  assert.equal(lootablyUpdate.url, "https://lootably.com/");

  console.log("seed update prove: ok (second run does not reset healthy cpx-survey / freecash-cpa)");
}

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const row of SEED) {
      const existing = await prisma.affiliateLink.findUnique({
        where: { slug: row.slug },
        select: { slug: true, status: true, url: true },
      });
      await prisma.affiliateLink.upsert({
        where: { slug: row.slug },
        create: row,
        update: affiliateSeedUpdate(row, existing),
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (adminEmail) {
      await prisma.user.updateMany({
        where: { email: adminEmail },
        data: { role: "ADMIN" },
      });
    }

    console.log(`Seeded ${SEED.length} affiliate links`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv.includes("--prove")) {
  proveAffiliateSeedUpdate();
} else {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
