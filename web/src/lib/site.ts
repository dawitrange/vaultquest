export const SITE = {
  name: "VaultQuest",
  tagline: "Transparent gaming rewards",
  headline: "Quests → Vault Points → Steam.",
  promise: "Complete real partner quests, bank Vault points, and cash out to Steam — or enter our scheduled giveaways.",
  /** Canonical production origin (www). */
  url: "https://www.vaultquest.io",
  minRedeemUsd: 5,
  vpPerUsd: 100,
} as const;

/** Effective / last-updated date shown on Terms & Privacy. */
export const LEGAL_EFFECTIVE = "August 12, 2026";

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/play", label: "Play" },
  { href: "/earn", label: "Earn" },
  { href: "/rewards", label: "Rewards" },
  { href: "/giveaways", label: "Giveaways" },
  { href: "/proof", label: "Proof & Rules" },
  { href: "/contact", label: "Contact" },
] as const;

/** Public indexable routes for sitemap (exclude auth/admin/api). */
export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/how-it-works",
  "/play",
  "/earn",
  "/rewards",
  "/giveaways",
  "/giveaway",
  "/proof",
  "/contact",
  "/terms",
  "/privacy",
] as const;

/**
 * Keyword reward guides (Idle-Empire-style directory, honest copy only).
 * Indexed under /rewards/[slug] — no generator claims, no guaranteed $.
 */
export const REWARD_GUIDES = [
  {
    slug: "steam-wallet-codes",
    title: "Steam Wallet codes",
    h1: "Earn Steam Wallet codes with VaultQuest",
    description:
      "How to earn Steam Wallet credit on VaultQuest: complete partner quests, build Vault points, redeem from about $5.",
    intro:
      "Steam Wallet codes are the most common VaultQuest redemption. You earn Vault points (VP) by finishing real partner quests — games, surveys, and apps — then unlock Steam credit from the vault once your available balance clears the minimum.",
    bullets: [
      "100 VP = $1 user credit (70% share of partner yield after typical clawbacks).",
      `Minimum redeem is about $${SITE.minRedeemUsd}. MVP fulfillment is manual from our Steam inventory (24–48h).`,
      "Credits start as PENDING for a partner hold (3–14 days by network), then become available.",
    ],
  },
  {
    slug: "steam-gift-card",
    title: "Steam gift cards",
    h1: "Steam gift card path via Vault points",
    description:
      "Redeem Vault points toward Steam gift-card style wallet credit, with clear time expectations.",
    intro:
      "People search “Steam gift card” when they want wallet credit without buying retail cards. VaultQuest funds Steam credit from partner commissions — not free generators. Expect real task time and a short verification hold.",
    bullets: [
      "Pick a listed quest on /earn that fits your region and device.",
      "Finish the offer the way it is written. VPN tricks and multi-accounts get clawed back.",
      "Unlock Steam Wallet tiers from the vault on /rewards when available VP is ready.",
    ],
  },
  {
    slug: "free-steam-games",
    title: "Free Steam games",
    h1: "Toward free Steam games — the honest way",
    description:
      "Use VaultQuest to earn Steam credit for games you want. Partner-funded quests, transparent holds, fair giveaways.",
    intro:
      "“Free Steam games” usually means earning wallet credit or keys through effort, not magically generating codes. On VaultQuest you complete quests, bank VP, then unlock Steam credit — or enter scheduled giveaways when those are live.",
    bullets: [
      "Steam credit from the vault can buy games on your own Steam account.",
      "Giveaways (when scheduled) publish rules and odds on /giveaways before each draw.",
      "We never ask for your Steam password.",
    ],
  },
  {
    slug: "paypal",
    title: "PayPal rewards",
    h1: "PayPal is not live yet",
    description:
      "VaultQuest MVP focuses on Steam wallet redemptions. PayPal is not a live redeem option yet.",
    intro:
      "Some reward sites pay PayPal. VaultQuest's current vault is Steam-first. If we add PayPal later, it will appear on /rewards with the same pending to available ledger rules. We will not advertise it before it ships.",
    bullets: [
      "Steam Wallet is what you can unlock from the vault today.",
      "Want PayPal? Use /contact. Demand helps prioritization. It is not a promise.",
      "Any future cash-out still follows the margin rule: never above expected partner yield.",
    ],
  },
  {
    slug: "amazon",
    title: "Amazon gift cards",
    h1: "Amazon gift cards are not live yet",
    description:
      "Amazon gift cards are not in the VaultQuest MVP catalog. Steam is the primary redeem path today.",
    intro:
      "Amazon gift cards are a common rewards keyword. We are not listing them until fulfillment is funded and reliable. Until then, Steam Wallet credit is the honest catalog.",
    bullets: [
      "Check /rewards for what you can unlock from the vault now.",
      "Pick a listed quest on /earn. VP still banks toward Steam today.",
      "We only list rewards we can actually fulfill. Amazon is not one yet.",
    ],
  },
  {
    slug: "google-play",
    title: "Google Play credit",
    h1: "Google Play credit is not live yet",
    description:
      "Google Play is not a live VaultQuest redeem option yet. Earn VP today toward Steam; mobile catalog may expand later.",
    intro:
      "Mobile players often want Google Play credit. VaultQuest MVP ships Steam first. Play offers on /earn may still pay VP that unlock as Steam today.",
    bullets: [
      "Pick a listed quest on /earn when one fits your region.",
      "What you can unlock today is Steam Wallet from the vault on /rewards.",
      "We will only list Google Play when inventory and ops are ready.",
    ],
  },
  {
    slug: "xbox",
    title: "Xbox gift cards",
    h1: "Xbox gift cards are not live yet",
    description:
      "Xbox gift cards are not in the current VaultQuest vault. Steam remains the primary gaming redeem.",
    intro:
      "Xbox / Microsoft gift cards are on many competitors’ SEO pages. We would rather say “not live” than invent a catalog item. Steam is what we can fulfill from the vault today.",
    bullets: [
      "Primary catalog: Steam Wallet $5 / $10 / $20.",
      "Fair giveaways may include gaming prizes when funded — see /giveaways.",
      "Read /proof for how partner yield funds rewards.",
    ],
  },
  {
    slug: "crypto",
    title: "Crypto rewards",
    h1: "Crypto payouts — not offered",
    description:
      "VaultQuest does not pay crypto. We focus on Steam credit and transparent partner-funded rewards.",
    intro:
      "Crypto cashouts add compliance and volatility risk we are not taking in MVP. If you need Steam credit from real quests, you are in the right place; if you need crypto, another platform may fit better.",
    bullets: [
      "No crypto redeem, no crypto giveaways in the current product.",
      "Ledger is Vault points → Steam (or future non-crypto catalog items we announce).",
      "Support: support@vaultquest.io — we will never ask for wallet seed phrases either.",
    ],
  },
] as const;
