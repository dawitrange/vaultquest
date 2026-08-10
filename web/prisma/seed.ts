import { PrismaClient, AffiliateCategory, AffiliateHealth } from "@prisma/client";

const prisma = new PrismaClient();

const SEED = [
  {
    slug: "lootably-primary",
    partner: "Lootably",
    url: "https://lootably.com/",
    category: AffiliateCategory.offerwall_primary,
    priority: 1,
    status: AffiliateHealth.healthy,
    capDaily: 5000,
  },
  {
    slug: "torox-backup",
    partner: "Torox",
    url: "https://torox.io/",
    category: AffiliateCategory.offerwall_backup,
    priority: 2,
    status: AffiliateHealth.healthy,
    capDaily: 3000,
  },
  {
    slug: "adgate-backup",
    partner: "AdGate",
    url: "https://adgatemedia.com/",
    category: AffiliateCategory.offerwall_backup,
    priority: 3,
    status: AffiliateHealth.healthy,
    capDaily: 3000,
  },
  {
    slug: "bitlabs-survey",
    partner: "BitLabs",
    url: "https://www.bitlabs.ai/",
    category: AffiliateCategory.survey_wall,
    priority: 1,
    status: AffiliateHealth.healthy,
    capDaily: 2000,
  },
  {
    slug: "freecash-cpa",
    partner: "Freecash",
    url: "https://freecash.com/r/14APDV",
    category: AffiliateCategory.cpa_signup,
    priority: 1,
    status: AffiliateHealth.healthy,
    capDaily: 1000,
  },
  {
    slug: "ayet-cpe",
    partner: "ayeT Studios",
    url: "https://www.ayetstudios.com/",
    category: AffiliateCategory.cpe_play,
    priority: 1,
    status: AffiliateHealth.healthy,
    capDaily: 2000,
  },
];

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

  console.log("Seeded affiliate links");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
