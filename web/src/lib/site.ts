export const SITE = {
  name: "Vaultquest",
  tagline: "Transparent gaming rewards",
  promise: "Complete quests, build Vault points, unlock Steam credit & keys — or enter fair giveaways.",
  minRedeemUsd: 5,
  vpPerUsd: 100,
} as const;

export const NAV = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/earn", label: "Earn" },
  { href: "/rewards", label: "Rewards" },
  { href: "/giveaways", label: "Giveaways" },
  { href: "/proof", label: "Proof & Rules" },
  { href: "/contact", label: "Contact" },
] as const;
