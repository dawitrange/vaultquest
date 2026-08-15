import { PrismaClient, AffiliateCategory, AffiliateHealth } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Affiliate inventory seed.
 *
 * Every row ships `disabled`: a link only serves real traffic once the operator
 * has (a) been approved by that network and (b) pasted a real deep-linked offer
 * URL — then flips it to `healthy` in /admin. Shipping `healthy` rows that point
 * at bare partner homepages creates dead "Start quest" CTAs, which reads as a
 * broken/fake product to reviewers (a likely factor in the Torox rejection).
 * With no healthy inventory, /earn shows an honest empty state instead.
 *
 * Priority is ordered per docs/agents/offers-mix.md §2 + PARTNER_WATERFALL in
 * web/src/lib/affiliates.ts. Zero-traffic / solo-publisher friendly, self-serve
 * networks are stocked first because audit-heavy walls (e.g. Torox) reject new
 * sites until real traffic exists.
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
    // Marketing homepage — do NOT flip healthy until Ethio pastes a real
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
    // Self-serve, no traffic minimum — one of the fastest activations for new sites.
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
    // Self-serve publisher signup, near-instant — strong first survey wall.
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
    // Self-serve publisher onboarding, good CPI/CPE fill for mobile quests.
    status: AffiliateHealth.disabled,
    capDaily: 2000,
  },
] as const;

async function main() {
  for (const row of SEED) {
    await prisma.affiliateLink.upsert({
      where: { slug: row.slug },
      create: row,
      update: {
        partner: row.partner,
        url: row.url,
        category: row.category,
        priority: row.priority,
        status: row.status,
        capDaily: row.capDaily,
      },
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
