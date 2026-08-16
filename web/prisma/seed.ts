import assert from "node:assert/strict";
import { AffiliateCategory, AffiliateHealth, PrismaClient } from "@prisma/client";
import { isMarketingHomepageUrl } from "../src/lib/postback";

/**
 * Affiliate inventory seed.
 *
 * Do not run a blind reseed on production. /admin is the flip.
 * Yield confirmed these prod rows read-only on 2026-08-16. They did not write.
 * Do not flip any disabled row healthy. Do not invent URLs.
 *
 * Create-if-missing uses the defaults below (disabled placeholders).
 * On update, cpx-survey and freecash-cpa keep status and url when the row
 * is already healthy, or when url is already a real wall rather than a
 * marketing homepage. Writing seed defaults over those two would take
 * earn-live down.
 *
 * AdGate and TimeWall stay parked. Every other non-live slug stays a
 * disabled marketing homepage.
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
    // Parked. Stay disabled. Marketing homepage only. Do not invent a wall URL.
    status: AffiliateHealth.disabled,
    capDaily: 3000,
  },
  {
    slug: "timewall-backup",
    partner: "TimeWall",
    url: "https://timewall.io/",
    category: AffiliateCategory.offerwall_backup,
    priority: 4,
    // Parked. Stay disabled. Marketing homepage only. Do not invent a wall URL.
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
    // Create-if-missing stays the marketing homepage. Do not hardcode the wall.
    // Prod healthy id=dce672bc-f0c3-407c-9176-4b1df5448664. Update preserves it.
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
    // Referral URL is real. Create-if-missing still ships disabled.
    // Prod healthy id=cmsm9ac5r0004f6kwagabudpl. Update preserves it.
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

/** Yield read-only confirm 2026-08-16. Seed must not overwrite these two. */
const YIELD_KEEP_HEALTHY = [
  {
    slug: "cpx-survey",
    id: "dce672bc-f0c3-407c-9176-4b1df5448664",
    url: "https://offers.cpx-research.com/index.php?app_id=35413",
  },
  {
    slug: "freecash-cpa",
    id: "cmsm9ac5r0004f6kwagabudpl",
    url: "https://freecash.com/r/14APDV",
  },
] as const;

/** Yield read-only confirm 2026-08-16. Stay disabled marketing homepages. */
const YIELD_LEAVE_DISABLED = [
  { slug: "lootably-primary", id: "cmsm9ac1k0000f6kw5dd5yorj", url: "https://lootably.com/" },
  { slug: "bitlabs-survey", id: "cmsm9ac4w0003f6kw08wao825", url: "https://www.bitlabs.ai/" },
  { slug: "ayet-cpe", id: "cmsm9ac6j0005f6kw7ie3ftoi", url: "https://www.ayetstudios.com/" },
  { slug: "adgem-cpe", id: "70a306e1-a3ef-48eb-8b3c-e0960d7220dc", url: "https://adgem.com/" },
  { slug: "torox-backup", id: "cmsm9ac390001f6kwg5k0i2lv", url: "https://torox.io/" },
  { slug: "adgate-backup", id: "cmsm9ac410002f6kwyvyahtui", url: "https://adgatemedia.com/" },
  { slug: "timewall-backup", id: "95f2005e-e886-4c77-95a7-d691d01919d2", url: "https://timewall.io/" },
  { slug: "offerdaddy-backup", id: "5fa1d88e-cc46-47b3-bc16-6dbd6b8f3257", url: "https://offerdaddy.com/" },
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
  for (const row of SEED) {
    assert.equal(row.status, AffiliateHealth.disabled, `${row.slug} seed default must stay disabled`);
  }

  const cpxSeed = SEED.find((row) => row.slug === "cpx-survey");
  assert.ok(cpxSeed);
  assert.equal(cpxSeed.url, "https://www.cpx-research.com/");
  assert.notEqual(cpxSeed.url, YIELD_KEEP_HEALTHY[0].url);

  for (const live of YIELD_KEEP_HEALTHY) {
    const row = SEED.find((item) => item.slug === live.slug);
    assert.ok(row, live.slug);
    const update = affiliateSeedUpdate(row, {
      slug: live.slug,
      status: AffiliateHealth.healthy,
      url: live.url,
    });
    assert.equal("url" in update, false, `${live.id} ${live.slug} url must survive a second seed`);
    assert.equal("status" in update, false, `${live.id} ${live.slug} status must survive a second seed`);
  }

  const cpxWallStillDisabled = affiliateSeedUpdate(cpxSeed, {
    slug: "cpx-survey",
    status: AffiliateHealth.disabled,
    url: YIELD_KEEP_HEALTHY[0].url,
  });
  assert.equal("url" in cpxWallStillDisabled, false, "real cpx wall url must survive even if still disabled");
  assert.equal("status" in cpxWallStillDisabled, false);

  for (const parked of YIELD_LEAVE_DISABLED) {
    const row = SEED.find((item) => item.slug === parked.slug);
    assert.ok(row, parked.slug);
    assert.equal(row.url, parked.url, `${parked.id} ${parked.slug} seed url must stay the marketing homepage`);
    const update = affiliateSeedUpdate(row, {
      slug: parked.slug,
      status: AffiliateHealth.disabled,
      url: parked.url,
    });
    assert.equal(update.status, AffiliateHealth.disabled, `${parked.slug} must stay disabled`);
    assert.equal(update.url, parked.url, `${parked.slug} must keep its marketing homepage`);
  }

  console.log("seed update prove: ok (Yield-confirmed healthy rows survive a second seed)");
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
