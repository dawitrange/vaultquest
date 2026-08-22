# Redesign change file

Paper only. Tonight this file exists. Later work is scoped PRs. Do not merge this PR. Do not ship "we're live." Earn-live on production (click → CPX postback → PENDING EARN VP) is ledger truth. It does not unlock live-earn marketing copy.

No CSS. No new tokens. No visual system. Product stays hybrid Gamesbolt/Earnit UX: own accounts, Vault points, quests, redeem, real social proof.

---

## Tonight vs later

**Tonight.** This markdown. Inventory of files that already exist. Order for later. Builder does not merge.

**Later.** One surface per PR. Copy and chrome only. WIP max 3. A copy-only PR still needs a Manager flag before merge. Builder never merges. Do not implement from this file in the same turn as opening it.

Leave PRs #21, #25, #27, #19, #4, #2 alone.

---

## Inventory (main, 2026-08-16)

Verified present:

- `docs/01-brand.md`
- `docs/05-platform-vision.md`
- `docs/15-rebrand-redesign.md` (vault-wheel already specified)
- `docs/agents/design-system.md`
- `web/src/app/globals.css`
- `web/src/lib/site.ts`
- `web/public/vaultquest-logo.svg`
- `web/public/vaultquest-banner.svg`
- `web/src/app/icon.svg`

Also found, not invented:

- `docs/agents/kickoffs/brand-design.md`
- `docs/11-swarm-backlog-design.md`
- `docs/agents/youtube-channel-rebrand.md`
- `.cursor/agents/trust-designer.md`
- `web/src/app/page.tsx`
- `web/src/app/layout.tsx`
- `web/src/app/opengraph-image.tsx`
- `web/src/app/earn/page.tsx`
- `web/src/app/rewards/page.tsx`
- `web/src/app/rewards/[slug]/page.tsx`
- `web/src/app/proof/page.tsx`
- `web/src/app/account/page.tsx`
- `web/src/app/login/page.tsx`
- `web/src/app/signup/page.tsx`
- `web/src/components/SiteHeader.tsx`
- `web/src/components/SiteHeaderNav.tsx`
- `web/src/components/SiteFooter.tsx`
- `web/src/components/SocialProofBar.tsx`
- `web/src/components/HeroRedeemDemo.tsx`
- `web/public/hero-vault-steam.jpg`
- `.cursor/skills/verify-vaultquest/features/home-earn.md`

Missing:

- `docs/ops/` before this file
- `web/src/app/twitter-image.tsx`
- `web/src/app/apple-icon.svg` / `favicon.ico` (Next uses `icon.svg`)

Do not invent a second mark. Vault-wheel lives in the logo SVG, banner SVG, `icon.svg`, and the inline header SVG in `SiteHeader.tsx`. `docs/15-rebrand-redesign.md` already called that the hero mark. Home still uses `hero-vault-steam.jpg` instead.

---

## How the current pages work

Home (`page.tsx`) is a full-bleed Steam/gift-card photo, then `SITE` copy from `site.ts`, then CTAs **Start earning** → `/earn` and **Join giveaway** → `/giveaways`. Header wheel is already vault-wheel. Signed-in header CTA is still **Start earning** (`SiteHeaderNav.tsx`). OG (`opengraph-image.tsx`) is a teal/graphite card with a diamond glyph and `system-ui`. No `$50` on OG today. JSON-LD and footer still point Facebook at `Freesteamcodes21`.

`/earn` tells people to start earning Vault points. That reads as a live-earn promise next to a catalog. `/rewards` already says unlock Steam credit from about `$5`. `/proof` lists instant free `$50` as something we never promise. Auth already says we never ask for a Steam password.

Wave 1 design lock in `docs/agents/design-system.md` still names the dual CTA as **Start earning** / **View giveaways**. That is why home looks like a live earn hub. This file overrides that line for later traffic work. Do not rewrite the design system tonight.

---

## Why this order

Home is the leak. Steam card art plus **Start earning** plus **Join giveaway** says the product is a live Steam shop. OG repeats whatever home claims into shares. `/earn` must not contradict the new home. Social URLs are chrome, last in the traffic list so they move with footer/proof/layout, not as a rebrand stunt.

Earn-live being proven does not change that sequence. Ledger can credit PENDING EARN VP while the public site still refuses live-earn language.

`docs/15-rebrand-redesign.md` §5 drafts say "VaultQuest is live" and "quests are live." Do not post those. No announcement posts from this work.

`docs/01-brand.md` already locked Vault points, honest effort, expressive type, no Inter/Roboto default, no purple AI sludge, and "unlock from the vault." Later PRs follow that. They do not invent tokens.

---

## Traffic later order

Do not implement in this PR. Do not ship earn copy. Do not write "we're live."

1. Kill Steam-logo / gift-card hero art (`web/public/hero-vault-steam.jpg` in `page.tsx`). Use vault-wheel already specified in `docs/15-rebrand-redesign.md` plus `web/public/vaultquest-logo.svg`.
2. Homepage CTAs: **Sign up** / **Our story** / **Proof & Rules**. No "Start earning." No "Join giveaway." No "we're live."
3. Hero + OG without `$50` or an official Valve card. Keep `opengraph-image.tsx` off Valve art. Do not add a `$50` headline to fill the hole.
4. `/earn` copy must match homepage honesty. No live-earn promise. Do not write "we're live."
5. Social: `facebook.com/Vaultquest22/` and YouTube `@zakai1769` until the handle moves. Today the site still uses `facebook.com/Freesteamcodes21` in `layout.tsx`, `SiteFooter.tsx`, `SocialProofBar.tsx`, `proof/page.tsx`, `about/page.tsx`.

---

## What would change, in what order

One surface per later PR. Copy/chrome only. WIP max 3.

### 1. Home

**Now.** Steam jpg hero. **Start earning** + **Join giveaway**. Brand name is already hero-sized Syne via `SITE.name`.

**Change.** Vault-wheel atmosphere from existing SVG language. CTAs: Sign up → `/signup`, Our story → `/about`, Proof & Rules → `/proof`. Drop giveaway from the first viewport. Header signed-in CTA cannot stay **Start earning** or home still lies.

**Done when.** First viewport has no Steam/Valve card art, no **Start earning**, no **Join giveaway**, no `$50`, no "we're live." Verify skill `.cursor/skills/verify-vaultquest/features/home-earn.md` currently asserts **Start earning**. That skill must move with the home PR or the test will enforce the old lie.

### 2. OG / social cards

**Now.** `opengraph-image.tsx` uses tagline + promise, diamond glyph, `system-ui`. No `$50` today. No `twitter-image.tsx`.

**Change.** Same honesty as home. Vault-wheel or wordmark, not Valve packaging. Fonts already loaded in `layout.tsx` are Syne / Sora / IBM Plex Mono. Do not fall back to Inter/Roboto.

**Done when.** Share preview has no `$50`, no official Steam gift card, no "we're live," no "Start earning."

### 3. `/earn`

**Now.** "Pick a quest and start earning Vault points." Empty state talks about networks that are live and verified.

**Change.** Match home. Quests exist. Holds exist. No promise that the visitor is already in a live earn mill. Keep partner disclosure.

**Done when.** Page copy has no "start earning," no "we're live," no generator/password language. Catalog can still list quests.

### 4. Social chrome

**Now.** YouTube `@zakai1769` is correct. Facebook still `Freesteamcodes21`.

**Change.** Facebook → `https://www.facebook.com/Vaultquest22/`. YouTube stays `@zakai1769` until the handle moves. Same URLs in footer, proof, layout `sameAs`, social bar. `/about` timeline copy moves with this PR if it still names the old Page as current.

**Done when.** Public chrome points at Vaultquest22 + `@zakai1769`. No launch announcement post.

### 5. `/rewards`

**Now.** "Unlock" + Steam Wallet `$5` / `$10` / `$20`. Guide pages still CTA **Start earning** (`rewards/[slug]/page.tsx`).

**Change.** Keep "unlock from the vault." Kill **Start earning** on guide pages. Do not add `$50` SKUs or Valve card art.

**Done when.** Catalog copy matches home honesty. No live-earn CTA. No Steam password ask.

### 6. `/proof`

**Now.** Strong kill list. `$50` appears only as a banned claim. Facebook link is still the old Page.

**Change.** Facebook URL with the social chrome PR, or a one-line URL swap here if that PR did not land. Do not turn proof into a "we're live" badge.

**Done when.** Rules still ban generators, `$50` promises, password asks. 2020 YouTube explainer `sOQWHaHeCkg` stays history on `/about`, not a current earn claim.

### 7. `/account`

**Now.** Available / pending VP. Empty ledger says complete a demo credit on Earn.

**Change.** Empty state can point at `/earn` without "start earning" or "we're live." Keep PENDING vs available.

**Done when.** Ledger language matches holds. No live-earn hype.

### 8. Auth (`/login`, `/signup`)

**Now.** Signup already: never ask for Steam password. Earn prompt asks for an account so quests credit.

**Change.** Same honesty as home. Sign up is the CTA. Do not add "Start earning" on the form.

**Done when.** Auth copy has no live-earn promise, no `$50`, no Steam password field.

---

## Brand rules to keep (`docs/01-brand.md`)

- Currency is **Vault points**. Redeem framing is **unlock from the vault**.
- Voice: direct, gamer-native, calm. Honest about effort and time.
- Expressive type. Designed stack is Syne / Sora / IBM Plex Mono in `globals.css` and `layout.tsx`. No Inter/Roboto default.
- Atmosphere is cold vault, not purple AI sludge.
- We are a rewards hub. We are not a generator.

`docs/05-platform-vision.md` still wants Gamesbolt/Earnit clarity: quests, how-it-works, real proof only. That is product UX, not a new look.

---

## Banned on later PRs

- Start earning
- Join giveaway as a home hero CTA
- We're live / VaultQuest is live / quests are live
- `$50` as a promise or hero number
- Generators, working codes, CODE ACCEPTED
- Steam password asks
- 2020 YT explainer `sOQWHaHeCkg` as a current claim
- New visual system, new CSS tokens, new fonts
- Announcement posts
- Fake social proof

---

## Later PR rules

- Copy/chrome scoped. No redesign of tokens.
- One surface. WIP max 3 open.
- Manager flag required before merge, even for copy-only.
- Builder never merges.
- Do not merge this change-file PR as a substitute for those PRs.
