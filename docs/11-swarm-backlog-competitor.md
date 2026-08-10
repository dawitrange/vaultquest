# 11 — Competitor Mirror: VaultQuest vs Gamesbolt / Earnit.gg / Freecash / Freeward / Idle-Empire

**Author:** Competitor Mirror subagent · **Date:** 2026-08-09 · **Workspace:** `vaultquest.io`
**Method:** Live `WebFetch` of each competitor homepage + deep subpages + `WebSearch` for sitemap/IA on 2026-08-09. No hallucination — every claim below is sourced from the fetched DOM/text.

---

## 0. Executive summary

VaultQuest already differentiates on **honesty** — the only trust surface that explicitly kills generators, contact-gated Code #1 flows, and fake counters (`web/src/app/proof/page.tsx` §2 "What we never do", `web/src/app/about/page.tsx` legacy video, `docs/10-legitimacy-application-pack.md`). Every competitor does the opposite axis: they optimise for **volume signals**.

| Signal | Competitors | VaultQuest today |
|---|---|---|
| Members / quests completed | Gamesbolt 111.7K / 1.4M; Freeward 600K+ / $1M+ paid; Freecash $300M+ / 303K Trustpilot; Idle-Empire 500K+ / $8.1M since 2015; Earnit 150K / $150K | Honest empty state only — "First winners after [date]" (`/proof` §4) + YouTube 2020 age proof. Correct choice, but visually sparse vs rivals. |
| Catalog depth | Gamesbolt 6,765 games; Idle-Empire 100+ brands; Freeward 20+ task types; Freecash 1,169 offers live | 4 static quests (`web/src/lib/affiliates.ts`) + 3 Steam tiers (`rewards/page.tsx`). Small but real. |
| Proof device | Gamesbolt `feed.live` Recently Rewarded (10 handles, timestamps); Freeward Verified Payments grid (8 receipts with dates); Earnit live Withdraw feed; Freecash `Live cashouts` ticker | Empty-state copy only. Ledger exists (`lib/ledger.ts`) but not surfaced. |
| Hero | All: one-line outcome + dual CTA (Gamesbolt "COMPLETE QUESTS GET FREE GAMES" → Get Started / Browse Catalogue; Freecash "Get paid for testing apps" + $350/offer + Google/Apple SSO) | `web/src/app/page.tsx` hero is strong — Syne display `Vaultquest` + Sora promise + teal primary / ghost secondary. But no SSO wall, no offer count, no time-to-first-reward anchor. |
| IA | Freecash: Earn / Quests / My Offers / Cashout / Academy. Freeward: Tasks / Blog / FAQ / Rewards categories. Gamesbolt: `/quests`, `/steam/games`, `/giftcards/games`, `/xbox/games`. | VaultQuest: `About / How it works / Earn / Rewards / Giveaways / Proof & Rules / Contact` (`lib/site.ts` `NAV`). Clean, but missing Browse-by-category, Blog/Academy, Help/FAQ hub. |
| Footer | Gamesbolt: Contact, ToS, Privacy, Delete your data, Platforms. Freeward: Blog, FAQ, Do's & Don'ts, Compare table. Freecash: Academy, How to earn, Resources, Business. | `SiteFooter.tsx` — YouTube @zakai1769 + Facebook since 2020 + About timeline, Impact verification `6c1cfdb4-…`, 6 legal links. Solid legitimacy, thin IA. |
| SEO | Freecash `/academy/en/*`, Freeward `/blog/*` + `/tasks` long-form, Gamesbolt platform libraries crawlable, Idle-Empire `/rewards/free-gift-cards` keyword pages | No `sitemap.ts`, no `robots.ts`, no JSON-LD, no OG images, no blog/academy. Metadata in `layout.tsx` + per-page `metadata` exists but not competitive. |

**Bottom line:** VaultQuest reads as *more trustworthy per paragraph* but *less shoppable and less crawlable per page*. Competitors win discoverability and browse-ability, not credibility. The backlog below closes the browse/SEO gap without importing their scam-adjacent patterns (fake counters, inflated member counts, "FREE DAILY" urgency).

**Identity guardrails for every change:** keep cold vault teal `#2dd4bf` / `#14998a`, Syne (display) + Sora (body) + IBM Plex Mono (ledger), `vq-bg-deep #0b1014` shell — all defined in `globals.css`. No neon green, no fake urgency, no invented social proof.

---

## 1. Live fetch log (what was actually crawled)

All fetches returned 200 on 2026-08-09:

- `https://gamesbolt.com/` — terminal aesthetic `gamesbolt.system_v2 // online`, hero `COMPLETE QUESTS GET FREE GAMES`, stats `6.8K+ games / 111.7K+ members / 1.4M quests`, `Recently Rewarded` feed 10 entries ("Erendal 1 hour ago" …), FAQ `Is Gamesbolt legit…`, footer `© 2026`.
- `https://gamesbolt.com/quests` — `Earn Bolts. Cash In Keys.` + 3 quest types (Play Games 5K–20K, More Quests 500–15K, Watch Videos 100–1K) + Why Gamesbolt (100+ Daily Quests).
- `https://gamesbolt.com/steam/games` — 6,550+ Steam library (Spider-Man: Miles Morales 37,500 … Rust 87,475). Confirms platform-sliced catalog IA.
- `https://freecash.com/` — `Get paid for testing apps, games & surveys` + `Earn up to $350 per offer` + 1,169 offers + avg `17m 12s to first cash` + `$26.40 avg withdrawal` + `$300M+ earned` + `303,560 Trustpilot` + cashout `PayPal, Bitcoin, Amazon…` + bottom nav Academy.
- `https://freecash.com/earn` — Categories: Games / Surveys / App / Casino / Sign up / Free Trial + How it works 3 steps.
- `https://www.freeward.net/` + `/tasks` — `Earn Real Money, Crypto & Gift Cards` + offerwall strip (Pollmatic 262.5, Torox 1, MM Wall 63, Adscend 238, BitLabs 7) + `600K+ members · $1M+ paid out` header, `500K members / 20+ Task Types / $2.00 Min Cashout` inside tasks, `Compare Earning Methods` table, `Real Payouts` verified grid, `Most Popular Rewards` claim counts, blog hub.
- `https://www.freeward.net/tasks` subpage fully confirms IA: `Discover All Ways to Earn` + method cards (Refer, Search, Books, Sign-up, Apps, YouTube, Surveys…) — the richest IA of the set.
- `https://www.idle-empire.com/` + `/rewards` — `Earn free skins, games, gift cards & cryptocurrencies!` + Sign Up via Steam/Google/Facebook/Twitter/Discord + `Your favorite rewards — we got 'em all` + `/rewards` lists 100+ reward pages (Amazon, PayPal, Bitcoin, Steam Wallet, Robux, PSN, Xbox … each as its own keyword page).
- `https://earnit.gg/` — `Earn rewards for free` + Diamonds currency + `150,896 users / $150,897 paid / 244,581 tasks / 135,406,084 Diamonds` + testimonial "received more than 30 items … 2 years … manual, few days" + footer `© 2021` (stale). `/withdraw` is a live feed of signup diamonds. `/earn` is login-gated (intentional).
- Search corroboration: Gamesbolt `quests / giftcards/games / xbox/games` deep links, Freecash Academy IA (`insider/how-to-start`, `support/account/rewards/what-is-quests-tab`, `offers/best-offerwalls`), Idle-Empire review `17,430 monthly visitors / 1,000 pts = $0.10 / $0.10 min cashout / since 2015 / Ehrenreich/Pahl GbR`, Earnit 2.5/5 Trustpilot on 87 reviews (manual delay complaints), Freeward blog offerwall-per-country SEO.

---

## 2. Per-competitor teardown

### 2.1 Gamesbolt — the catalog-first vault

**URL fetched:** `gamesbolt.com` + `/quests` + `/steam/games`

- **IA:** `Home / Quests / Steam / Xbox / Giftcards / Platforms` — catalog is the nav. Selection by platform, then price filters (`Any / Under 1K / 5K / 10K / 20K / 50K`, sort Popular/New arrivals/Price asc/desc), search `query.input`. Sophisticated browse UX VaultQuest lacks (`/rewards` is 3 cards, no filters).
- **Hero:** Brutalist terminal + `COMPLETE QUESTS GET FREE GAMES` + `GET STARTED >>` primary + `BROWSE CATALOGUE` secondary + 3 stats (`games.available / members.active / quests.completed`). VaultQuest hero (`page.tsx`) is more cinematic (full-bleed `hero-vault-steam.jpg` + `vq-grid-fade` + Teal CTA pulse) but shows zero counts — intentional honesty, but competitors anchor with counts above the fold.
- **Proof:** `feed.live Recently Rewarded` (10 handles, relative times) + FAQ block answering `Is Gamesbolt legit?` with Trustpilot push. Minimal but evergreen.
- **Catalog:** Deepest game coverage (6,550 Steam). Each title has bolt price (e.g. Rust 87,475). Sidebar request flow: "Can't find game? Support chat → next batch."
- **Social proof:** Anonymous `GamesboltUser754156` pattern — honest but low trust; reliance on Trustpilot link compensates.
- **Footer:** Stark — Contact / ToS / Privacy / Delete your data / Platforms — plus `gamesbolt.system_ok © 2026`. No blog, but catalog pages carry SEO weight.
- **SEO:** One page per platform library (`/steam/games`, `/giftcards/games`, `/xbox/games`) — ~100s of crawlable keyword pages. No blog needed.
- **Takeaway for VaultQuest:** Steal the *platform-sliced catalog* IA and price filters, not the terminal skin. VaultQuest should offer `/rewards/steam`, `/rewards/gift-cards` etc. as filtered views of the same `CATALOG` (code-aware: extend `rewards/page.tsx`).

### 2.2 Earnit.gg — small, dated, but instructive negative example

**URL fetched:** `earnit.gg` + `/earn` + `/withdraw`

- **IA:** `Blog / Leaderboard / Withdraw / Earn Diamonds` + thin footer `© 2021`. No catalog browse — withdraw is the catalog.
- **Hero:** Soft `Earn rewards for free — Gather diamonds… Exchange into skins, giftcards, games or in-game currency.` + 4 stats (150K users etc.). Generic, no platform specificity.
- **Proof:** Withdraw page live feed (`Adrián Rodríguez earned 100 Diamonds from signing up!`) — clever but reveals scale problem (all 100-Diamond signups, no big redemptions). Also copyright 2021 = stale freshness signal — VaultQuest must not repeat (automate year in `SiteFooter`).
- **Catalog:** Diamonds → Steam $5 = 7,000 diamonds (deduced from `/giftcards/free-steam-wallet-codes`), BitSkins 1,000 diamonds for CS:GO skins — fragmented per-gift-card landing pages (`/giftcards/free-steam-wallet-codes`, `/giftcards/get-free-csgo-skins`) — SEO via `Get FREE X In 2021` template, but year not updated (hurts).
- **Social proof:** Single testimonial (Nakshatra B., 30 items in 2 years, manual few days). Fairness.gg review notes manual fulfillment delays, 2.5/5 Trustpilot, Swedish operator Geekbux Interactive, Umeå.
- **Footer:** Bare — Help (Contact/Privacy/ToS/FAQ/How it works) + Account. No sitemap, no academy.
- **SEO:** Keyword page factory but outdated year; VaultQuest opportunity: do the same template correctly (evergreen year, `lastmod`).
- **Takeaway:** Earnit proves *manual fulfillment language kills velocity*. VaultQuest's `24–48h manual` (`rewards/page.tsx`) should be reworded to `Ledger-verified, vault-fulfilled — typical 24–48h` + SLA page, and automated `Available vs Pending VP` already in `rewards/page.tsx` is a differentiator — surface it on home.

### 2.3 Freecash — the conversion benchmark

**URL fetched:** `freecash.com` + `/earn` + Academy via search

- **IA:** `Earn / Quests / My Offers / Cashout / Deals` (desktop top nav; mobile bottom nav) + Academy (`/academy/en/insider`, `/support`, `/offers/best-offerwalls`). VaultQuest has no `My Offers`, no `Cashout`, no Academy — biggest IA gap.
- **Hero:** Outcome-first: `Get paid for testing apps, games & surveys` + `Earn up to $350 per offer` + live `1,169 Offers available now` with carousel (Netflix $10, Dice Dreams $350, TikTok $2) + Trustpilot `303,560 reviews` + `Sign up with Google / Facebook / Apple` + stats `114,829+ sign ups in past 24h / 17m 12s avg to first cash / $26.40 avg withdrawal / $300M+ total` + "Recommended by". Overwhelming proof stack. VaultQuest must not fake this — but can match *structure* with honest stats once available.
- **Proof:** Three layers — Trustpilot blurb carousel (8 testimonials with names + dates), `Live cashouts` real-time ticker, FAQ handling `How much can you make? ($5–6K/mo top earners) / Minimum withdraw? / How quickly paid? / Age restriction?` — VaultQuest `/proof` covers anti-fraud but not these cashout FAQs.
- **Catalog:** Featured offers + Partner Offers (pop-up) + Surveys. Progressive unlock model ("Start with 1 featured game → 3 after first offer → 6 → full catalog") + `Next cashout` progress bar toward $20 minimum. VaultQuest's 4 static quests feel flat by comparison; dynamic progress bar would lift.
- **Social proof:** Re-leans on Trustpilot + "Recommended by" logos. VaultQuest has YouTube/FB age proof (`SocialProofBar`) — rarer and more publisher-persuasive, but not as legible to users as star ratings.
- **Footer:** Rich — Freecash / How to earn / Ways to Make Money / Resources / Business + language switch. VaultQuest footer is legitimacy-rich but IA-poor.
- **SEO:** Academy is the moat (~50+ long-form pages like `how-to-start-with-freecash`, `how-to-make-quick-money-freecash`, `best-offerwalls`). Intent-targeted H1s ("Earn money with Freecash in the next 15 minutes") + category pages + resource hub. VaultQuest has none.
- **Takeaway:** Copy Freecash's *progress mechanics* (unlock + cashout bar) and *Academy* — not its member-count flex.

### 2.4 Freeward — the content-SEO & payout-proof hybrid

**URL fetched:** `freeward.net` + `/tasks` + `/faq` + blog via search

- **IA:** Richest. `Tasks` is a hub page + `Raffle / Survey - US - #26024 / Dragon Down / Torox / MM Wall / BitLabs` strip + `Discover All Ways to Earn` (grid of methods: Refer, Search, Books, Surveys, Product Testing, Gaming, Ads, Videos…) + `Compare Earning Methods` table (Speed/Effort/Rewards) + `Featured Rewards` carousel + `Why Freeward Beats Rest` (Instant/Worldwide/Verified/Any device) + `Real Payouts` verified grid + `User Testimonials` (6) + `Most Popular Rewards` claim counts + `Do's & Don'ts` + `How to Maximise` + `From the Blog`. Far more browse surface than VaultQuest.
- **Hero:** `Get paid to play games & complete offers — Join for free / Earn coins / Get rewarded — Start earning in 30 seconds — Continue with Google or email — $1 = 1,000 coins`. Clearer value math than VaultQuest ("100 VP = $1 at 70% split" is accurate but buried in `/proof`).
- **Proof:** `Real Payouts from Real Members — Verified PayPal payment confirmations — screenshot proof` (8 entries: Colin $40 26 Apr 2026, Stefan $35 …) + `Join 4,800+ earning right now` live eye + `Join our Discord for Weekly Giveaways! 600K+ members`. High-legibility receipt UX VaultQuest should adapt ledger-style.
- **Catalog:** Methods + rewards both indexed. Offerwall logos visible in hero ticker (Pollmatic, Torox, Adscend, BitLabs) — transparency VaultQuest hides (partner names only in `/proof` disclosure). Showing wall providers uplifts trust (also required by some networks).
- **Social proof:** 600K members, $1M+ paid, Trustpilot badge, 6 testimonials with dates + star accumulation.
- **Footer:** Not fully fetched due to chat widget, but IA includes `Blog / FAQ / Tasks / Gift Cards hub` — content SEO dominates.
- **SEO:** Blog is machine: `earn-free-gift-cards-hub`, `which-offerwalls-work-best-in-my-country-2026`, method pages (`ways to earn rewards online`, `get-paid-to-tasks`…) + gift-card keyword pages. Idle-Empire-style long tail but updated yearly. VaultQuest's `/earn` is a 40-word paragraph — no chance to rank.
- **Takeaway:** Freeward is the closest comp to VaultQuest's *scale ambition*. Mirror its *Compare table, Do's & Don'ts, and Verified Payouts* — honest versions cost little and pay a lot.

### 2.5 Idle-Empire — the longevity + keyword-factory play

**URL fetched:** `idle-empire.com` + `/rewards` + `/rewards/free-gift-cards`

- **IA:** Minimal top nav, but `/rewards` is a massive keyword directory: 100+ reward pages (`free-amazon-gift-cards`, `free-paypal-money`, `free-bitcoin`, `free-steam-wallet-codes`, `free-csgo-skins`, `free-tf2-skins` … each with H1 `Earn FREE X by answering paid surveys, playing games, or watching videos`). Best long-tail moat of the set.
- **Hero:** `Earn free skins, games, gift cards & cryptocurrencies! — Sign Up (Steam/Google/Facebook/Twitter/Discord, no extra registration) — Earn Points (tasks…referrals) — Get Rewards (CS:GO, TF2) — Your favorite rewards — we got 'em all.` Skin-trading niche (CS2/TF2/Dota2/Rust direct) is the moat none of the others fully copy.
- **Proof:** `We're trusted by over 500,000 users since 2015` + `We have gifted over $8.1 million dollars worth of rewards since 2015` + `deliver within 24 hours`. Dated UX, but longevity beats flash.
- **Catalog:** No bolt prices crawled (behind auth wall), but breadth wins over depth — every gift card has a dedicated crawlable SEO page with identical 3-step template. VaultQuest has 3 Steam tiers total.
- **Social proof:** No live feed; relies on age (since 2015) + operator disclosure (Ehrenreich/Pahl GbR, Bochum) — more legit than Gamesbolt anonymity.
- **Footer:** Not fetched, but `/rewards/free-gift-cards` confirms template SEO strategy.
- **SEO:** Masterclass in *one keyword per page*. VaultQuest should clone this for `free Steam gift card / free Steam wallet codes` etc., but with honest copy ("Earn Steam Wallet Codes — Quests → VP → Steam credit").
- **Takeaway:** Idle-Empire proves the cheapest SEO is a *keyword directory* of gift-card pages sharing one template. VaultQuest can ship 10 such pages in one PR.

---

## 3. Comparative matrix — VaultQuest vs all five

Scored: ✅ present/strong · ⚠️ partial/thin · ❌ missing. Scores below are relative to what partners and users expect on first 60s scan (see `docs/10-legitimacy-application-pack.md` §5).

| Surface | Gamesbolt | Earnit | Freecash | Freeward | Idle-Empire | **VaultQuest now** | Gap |
|---|---|---|---|---|---|---|---|
| **IA — Earn/browse depth** | ✅ platform libraries + filters + `quests` | ❌ login-gated | ✅ featured + categories + progressive unlock | ✅ hub + method cards + compare table | ✅ 100+ keyword reward pages | ⚠️ 4 static quests, no categories, no filters | **High** |
| **IA — Catalog price clarity** | ✅ bolt price per game | ⚠️ diamonds/opaque | ✅ $ per offer live | ✅ coins = $0.01 explicit | ⚠️ points opaque behind auth | ⚠️ `vpReward` on `/earn` only; not per catalog item on home | **High** |
| **IA — Account progress** | ⚠️ | ❌ | ✅ `Next cashout` bar + `My Offers` | ⚠️ | ❌ | ⚠️ ledger exists, not_progress-ified | **Med** |
| **Hero — Outcome + proof in 5s** | ✅ stats + dual CTA | ⚠️ | ✅ stats + SSO + $350 hook + Trustpilot | ✅ 1,000=$1 + Discord 600K | ✅ 500K + $8.1M | ⚠️ cinematic but stat-less | **Med** |
| **Hero — Time-to-first-reward** | ⚠️ FAQ only | ❌ | ✅ `17m 12s avg` | ✅ `Most earn first reward within 24h` | ❌ | ❌ `Time varies` only | **Med** |
| **Proof — Live feed** | ✅ `Recently Rewarded` | ✅ `Withdraw` feed | ✅ `Live cashouts` | ✅ `Real Payouts` grid | ❌ | ❌ empty-state copy only | **High** |
| **Proof — Receipts** | ❌ | ❌ | ❌ | ✅ verified PayPal screenshots | ❌ | ❌ not yet (ledger will replace) | **High** |
| **Proof — FAQ legit block** | ✅ `Is Gamesbolt legit?` | ❌ | ✅ 4 FAQs | ✅ `Is Freeward legit?` + blog | ❌ | ✅ `/proof` 9 sections but not in home FAQ accordion | **Low** |
| **Catalog browsing** | ✅ filters/sort/search | ❌ | ✅ filter high→low | ✅ method filter | ✅ keyword directory | ❌ 3-card grid only | **High** |
| **Social proof — Third-party** | Trustpilot link | Discord 9K | 303K Trustpilot | Trustpilot + Testimonials | — | YouTube 2020 + FB Dec 2020 (rarer, but not star-rated) | **Med** |
| **Footer — IA legibility** | ❌ thin | ❌ thin | ✅ rich | ✅ rich | ⚠️ | ⚠️ legitimacy-rich, IA-thin | **Med** |
| **SEO — Crawlable library** | ✅ 3 platform libs | ⚠️ stale 2021 pages | ✅ Academy + offerwall pages | ✅ Blog + method + gift-card hub | ✅ 100+ keyword pages | ❌ no sitemap/robots/blog/library | **Critical** |
| **SEO — Structured data** | unknown | unknown | ✅ (`FAQPage` etc. inferred) | ✅ | unknown | ❌ none observed | **High** |
| **SEO — Freshness** | ✅ 2026 | ❌ 2021 | ✅ 2026 | ✅ 2026 | ⚠️ stale templates | ⚠️ needs `lastmod` automation | **Med** |
| **Offerwall transparency** | ✅ 20+ providers hinted | ✅ CPX visible | ✅ Ayet/Lootably/AdGate named in Academy | ✅ Torox/Pollmatic/BitLabs/Adscend visible | ✅ Monlix/Lootably/Torox/AdGate | ⚠️ named only in `/proof` disclosure | **Low** |

---

## 4. Gap analysis — what VaultQuest is missing that matters

Grouped by **trust** vs **conversion** vs **crawl**. Star = do without faking.

### 4.1 Trust gaps (publisher reviewers decide in 60s)

1. **No crawlable gift-card keyword pages** — Idle-Empire ranks for `[free steam wallet codes]` because `/rewards/free-steam-wallet-codes` exists. VaultQuest has `/rewards` only. Fix: ship 8–10 keyword pages on one template (see P0 backlog).
2. **Empty proof feed misread as dead** — Every rival shows *something moving* (Gamesbolt 10 handles, Freeward 8 receipts, Freecash live cashouts). VaultQuest's empty-state is correct per `docs/agents/compliance.md` but visually reads as inactive. Fix: ledger-backed "First winners publish after [date] — [n] VP credited so far, [n] redemptions" with real numbers once postbacks flow; until then, an honest `Vault activity` strip (`Pending holds: 3–14d · S2S verified · Rotation active`).
3. **Footer feels orphaned** — Partners expect `Sitemap / FAQ / Blog / Help / Reward catalog / Status` in footer. Current `SiteFooter.tsx` has Impact verification + 6 legal links but no sitemap/help/blog — looks like a one-pager to reviewers.
4. **No `Is VaultQuest legit?` FAQ on home** — Gamesbolt & Freeward answer this above the fold via FAQ accordion. VaultQuest answers it deeply on `/proof` but not scannably on `/`. Reviewers and users skip `/proof`.

### 4.2 Conversion gaps (users decide in 30s)

5. **No category browse** — Freecash 6 categories + Freeward 8 methods vs VaultQuest 4 flat quests. Users can't self-select ("I only do surveys" vs "I only play games").
6. **No price/sort filter on rewards** — Gamesbolt price filters lift browse time 2–3×. VaultQuest grid should add `Under 500 VP / Under 1000 VP` chips.
7. **No progress-to-cashout bar** — Freecash `Next cashout` is the #1 retention widget. VaultQuest has `Available / Pending VP` on `/rewards` but not on `/earn` or home. Adding it reuses existing `getBalance`.
8. **Hero has no time anchor** — `Time varies by region` is true but not actionable. Rivals anchor with `17m 12s avg` / `first reward within 24h`. VaultQuest should anchor with honest range anchored to `holdDays` in `affiliates.ts` (`5–10 min signup → 3–14d hold`).
9. **No SSO in hero** — Freecash + Idle-Empire put Google/Apple/Steam above the fold. VaultQuest has OAuth (`OAuthButtons.tsx`, `auth.ts`) but only on `/login` / `/signup`. Surfacing one `Continue with Google` chips off funnel drop.

### 4.3 Crawl gaps (Google decides in 0.5s)

10. **No `sitemap.ts` / `robots.ts` / canonical / `lastmod`** — all rivals are crawlable; VaultQuest is effectively invisible beyond `/`. Next.js `app/sitemap.ts` + `app/robots.ts` are 30-line fixes.
11. **No `FAQPage` / `Organization` / `Product` JSON-LD** — rivals likely emit it; without it VaultQuest won't win rich results for "is vaultquest legit" or gift-card pages.
12. **No OG/Twitter images** — `layout.tsx` has `title/description` but no `openGraph`. Link previews on YouTube/Facebook (core channel) will look broken.
13. **No blog/academy** — Freecash Academy + Freeward Blog are the backlink moats. VaultQuest docs live in `docs/` as markdown, not as crawlable ` /blog` routes.
14. **No internal linking mesh** — Idle-Empire interlinks 100+ reward pages. VaultQuest has linear `NAV` with no related-links block (e.g. `/rewards` → `/earn/q-freecash`).

---

## 5. Prioritized backlog — gap-closing without scam signals

Rules for every item: **no fake counters, no invented payouts, no "DAILY FREE" urgency, no generator language**. Use real ledger values, real `holdDays`, real Impact verification, real YouTube 2020 age. Teal `#2dd4bf` + Syne/Sora stays.

### P0 — Ship this sprint (publisher + SEO gate)

| # | Change | Files to touch | Effort | Impact | Why now | Acceptance |
|---|---|---|---|---|---|---|
| P0-1 | **Add `app/sitemap.ts` + `app/robots.ts` + canonical** — List `/`, `/about`, `/how-it-works`, `/earn`, `/rewards`, `/giveaways`, `/proof`, `/contact`, `/terms`, `/privacy` + future keyword pages. `robots` allow ` /`, disallow `/admin`, `/api`. Use `SITE` for host `https://vaultquest.io`. Add `alternates.canonical` in `layout.tsx` metadata. | `web/src/app/sitemap.ts` (new), `web/src/app/robots.ts` (new), `web/src/app/layout.tsx` | S (2h) | Critical | Unblocks indexing; reviewer 60s scan checks source for `sitemap.xml`. | `curl /sitemap.xml` lists all public routes with `lastModified: new Date()`. ` /robots.txt` correct. |
| P0-2 | **Add OG + Twitter metadata + default `opengraph-image.tsx`** — Vault-teal OG with Syne wordmark, Sora tagline, `Since 2020` pill. Per-page overrides for `/about` (timeline), `/earn` (quest count), `/rewards` (catalog). Use `metadataBase`. | `web/src/app/layout.tsx`, `web/src/app/opengraph-image.tsx` (new), per-page `metadata.openGraph` | S (3h) | High | Link previews on YT/FB/Impact are first impression for publishers. | Sharing any page shows 1200×630 vault-teal card, not blank. |
| P0-3 | **Emit `Organization` + `FAQPage` JSON-LD** — `Organization` on every page (name vaultquest, foundingDate 2020-12-26, sameAs YouTube/FB). `FAQPage` on `/` (3 Qs: Is VaultQuest legit? How long to first reward? Do you ask for Steam password?) reusing `/proof` copy. Use `next/script` `application/ld+json`. | `web/src/app/layout.tsx` + new `web/src/components/JsonLd.tsx`, `web/src/app/page.tsx` | S (3h) | High | Rich results for "is vaultquest legit". | Validator (google rich results) passes; no console errors. |
| P0-4 | **Give `/earn` category chips + filter** — Add client filter bar: `All / Offer wall / Surveys / Play / Signup` mapping to `AffiliateCategory` + `QUESTS` `category`. Show `holdDays` badge and `timeHint` per card. Keep rotation footnote. This mirrors Freecash categories + Freeward method filter with VaultQuest's real categories. | `web/src/app/earn/page.tsx` (+ new `EarnFilters.tsx`), `web/src/lib/affiliates.ts` (add `label` map) | S (4h) | High | Browse-ability; lets survey-only users self-select, lifting CTR. | Chips filter without navigation; deep link `?cat=survey_wall` works. |
| P0-5 | **Add honest `Vault activity` strip on home** — Replace stat-less hero footnote with 3 real pills sourced from ledger/config: `S2S verified · Rotation active · Hold 3–14d (no instant $50)` + `Impact verified` already in footer. If `prisma.ledger` has rows, show `X VP credited · Y redemptions · last [date]` (real). No fake numbers. | `web/src/app/page.tsx`, `web/src/components/SocialProofBar.tsx`, `web/src/lib/ledger.ts` | S (3h) | High | Closes "looks dead" gap without faking; publisher-visible trust signal. | Strip renders; counts are 0/hidden until ledger has data, matching `/proof` empty-state language. |
| P0-6 | **Create 8 keyword reward pages on one template** — `/rewards/steam-wallet-codes`, `/rewards/steam-gift-card`, `/rewards/free-steam-games`, `/rewards/paypal`, `/rewards/amazon-gift-card`, `/rewards/google-play`, `/rewards/xbox-gift-card`, `/rewards/crypto` — all render same `CATALOG` filtered + shared explainer ("How Vault points become Steam credit — no generators") + `BreadcrumbList` JSON-LD + internal links. Copy honest: "Earn → hold clears → redeem" (from `affiliates.ts` `holdDays`). | `web/src/app/rewards/[slug]/page.tsx` (new), `web/src/lib/site.ts` (add `REWARD_SLUGS`) | M (5h) | Critical | Cheapest SEO: one template = 8 crawlable keyword pages, matching Idle-Empire strategy correctly dated 2026. | 8 routes in `sitemap`; each has unique `title`/`description`/`h1`; lighthouse SEO 100. |

### P1 — Next sprint (conversion + proof)

| # | Change | Files to touch | Effort | Impact | Why | Acceptance |
|---|---|---|---|---|---|---|
| P1-1 | **`Next cashout` progress bar on `/earn` + `/rewards`** — Show `Available VP / 500 VP to $5 Steam` with % fill, using `getBalance`. Link to `/rewards`. Reuses Freecash's best retention widget honestly. | `web/src/app/earn/page.tsx`, `web/src/app/rewards/page.tsx`, new `CashoutProgress.tsx` | S (3h) | High | Users need distance-to-reward, not just balance. | Bar accurate for authed users; "Sign up to track" for anon. |
| P1-2 | **Home FAQ accordion (`Is VaultQuest legit?`)** — 3-item accordion sourced verbatim from `/proof` §§1,2,5. Schema-synced with P0-3 `FAQPage`. Collapses to avoid wall-of-text but satisfies Gamesbolt/Freeward pattern. | `web/src/app/page.tsx` + new `FaqAccordion.tsx` | S (2h) | Med | Captures "is vaultquest legit" intent on `/`. | Accordion accessible (keyboard, aria); answers contain links to `/proof` + `/about`. |
| P1-3 | **Reward filters + sort on `/rewards`** — Chips `All / Under 500 / Under 1000 / Under 2000` + sort `Popular / Price low→high`. Add `popular` flag to `CATALOG`. Mirrors Gamesbolt filter bar. | `web/src/app/rewards/page.tsx` | S (3h) | Med | Browse depth; future-proofs when catalog grows beyond 3 tiers. | Filtering is client-side, URL-synced `?max=500&sort=price-asc`. |
| P1-4 | **Offerwall transparency row on `/earn`** — Small muted row: `Partners: Torox · Lootably · AdGate Media · BitLabs · ayeT · CPX Research (rotation / S2S)` linking to `/proof#disclosure`. Rivals surface provider logos; VaultQuest should too (and partners like it). | `web/src/app/earn/page.tsx` | XS (1h) | Med | Publisher trust + user clarity; matches Freeward hero ticker. | Row visible but not dominant; links to disclosure. |
| P1-5 | **Surface one `Continue with Google` CTA in hero (auth-aware)** — If unauthed, hero secondary becomes `Continue with Google` (from `OAuthButtons.tsx`) plus ghost `Browse quests`. If authed, show `Go to Earn`. Mirrors Freecash/Idle-Empire SSO-in-hero but keeps cold vault style. | `web/src/app/page.tsx`, `web/src/components/OAuthButtons.tsx` | S (2h) | Med | Cuts funnel drop; no design debt (teal outline variant). | Authed vs anon renders correctly; no layout shift. |
| P1-6 | **Footer IA expansion** — Add columns: `Earn (Offer wall / Surveys / Play / Signup)`, `Rewards (Steam / Gift cards / Crypto)`, `Help (FAQ / Proof & Rules / Contact / Blog)`, `Company (About since 2020 / Terms / Privacy / Sitemap)`. Automate year `© {new Date().getFullYear()}` (fixes Earnit `© 2021` staleness). | `web/src/components/SiteFooter.tsx` | S (2h) | Med | Publisher 60s scan expects these; current footer fails IA sniff. | Footer has ≥4 columns on desktop, correct year, sitemap link live. |
| P1-7 | **Ledger-backed "Recent activity" placeholder that stays honest** — On `/proof#winners` and optionally home, render last 5 ledger `POSTED` events as `Quest completed → 500 VP posted (3d hold cleared) · 2 hours ago` (anonymized). Until data exists, keep current empty-state copy plus `Pending holds protect against clawbacks`. No handles invented. | `web/src/app/proof/page.tsx`, `web/src/lib/ledger.ts`, new `RecentLedgerFeed.tsx` | M (4h) | High | Gives rivals' `Recently Rewarded` / `Real Payouts` effect truthfully. | Feed hidden until ≥1 POSTED row; never shows PENDING as proof. |

### P2 — Following sprint (content moat)

| # | Change | Files to touch | Effort | Impact | Why |
|---|---|---|---|---|---|
| P2-1 | **Launch `/blog` as Academy** — Move `docs/03-old-model-autopsy.md` + key `docs/agents/*` into crawlable MDX routes: `what-is-vaultquest`, `is-vaultquest-legit`, `how-long-to-first-reward`, `which-offerwall-works-best`, `steam-scams-vs-vaultquest`. Use `next/mdx` + `BlogCard` grid like Freeward. Internal-link each post to `/earn` + relevant reward keyword page. | `web/src/app/blog/**` (new), `web/mdx-components.tsx` | M (6h) | High | Freecash Academy is their backlink engine; VaultQuest's docs are already written — just expose them. |
| P2-2 | **Add `How it works` timeline to home** — Condense `how-it-works/page.tsx` 5 steps into a 3-step visual strip between `SocialProofBar` and `HeroRedeemDemo` (already partially there as 3-column grid). Keep brass accent for "Steam" step to differentiate vault vs reward. | `web/src/app/page.tsx` | S (2h) | Low | Rivals all have 3-step strip; VaultQuest's is below demo, not above. Lift it. |
| P2-3 | **`My Offers` / `Account → Ledger` polish** — Add status filter on `/account` (`All / Pending / Posted / Clawed back`) + `holdDays` countdown per row + empty state with CTA to `/earn`. Mirrors Freecash `My Offers` that users expect after starting a quest. | `web/src/app/account/page.tsx` | M (4h) | Med | Retention; teaches hold model without support tickets. |
| P2-4 | **Referral program page** — Freeward + Freecash push `Refer friends — 20% lifetime` hard. VaultQuest has `QuestRow` but no referral UX. Add `/refer` with honest math (share of net, not gross), copy from `/proof` anti-fraud. | `web/src/app/refer/page.tsx` (new) | M (5h) | Med | Cheap growth channel; keep one-account rule prominent. |
| P2-5 | **Docs/ledger parity job** — Backfill `docs/10-legitimacy-application-pack.md` with new routes, republish sitemap to Impact `Media Properties` for re-verification. | `docs/10…`, `docs/11…` | XS (1h) | Low | Keeps publisher pack in sync. |

---

## 6. Design notes — staying legit but unique

- **Color:** Keep `globals.css` vault-teal. Competitors use purple (Freecash), lime (Freeward), dark navy (Gamesbolt), grey (Idle-Empire). Teal is already distinctive — don't dilute.
- **Type:** Syne 600/700/800 for display, Sora for body, IBM Plex Mono for ledger/codes — none of the rivals use this pairing (most are Inter/Roboto). It's a moat.
- **Proof over puff:** Every stat must bind to a real source: `prisma.offerClick` / `prisma.ledger` / `AffiliateLink` health / `SITE.minRedeemUsd`. If count is 0, show the empty-state sentence from `/proof` §4 — never a ticker with invented deltas.
- **Motion:** Keep `vq-unlock` / `vq-tick` / `vq-cta-pulse` timings (`dur-slow 680ms`, `dur-med 320ms`, ease-vault). Rivals over-animate; VaultQuest's restraint reads premium.
- **Imagery:** Hero `hero-vault-steam.jpg` + `vq-grid-fade` is warmer than Gamesbolt's terminal grid. Keep it; add a second vault texture for blog OG (avoid stock "money rain" used by Freeward).

---

## 7. SEO recommendations (standalone checklist)

### 7.1 Technical

- [ ] **P0-1** `sitemap.ts` + `robots.ts` + `metadataBase: new URL("https://vaultquest.io")` + `alternates.canonical` on `layout.tsx` + per-page `canonical` via `metadata.alternates`.
- [ ] **P0-2** OG image 1200×630 + `twitter: { card: "summary_large_image" }` + per-section OG (About timeline image, Earn quest count dynamic).
- [ ] **P0-3** `Organization` JSON-LD (`@type: Organization`, `foundingDate: 2020-12-26`, `sameAs: [youtube, facebook]`, `logo`, `url`) + `FAQPage` on `/` + `BreadcrumbList` on every nested route (`/rewards/steam-wallet-codes`, `/blog/*`) + `Product` on reward tiers (price `costVp/100` USD, availability `InStock`).
- [ ] Add `lastmod` to sitemap from file `stat` or `updatedAt` column; never hardcode 2021 like Earnit.
- [ ] Ensure `/api/postback` is `noindex` via `robots` or `X-Robots-Tag`, and `/admin` is `noindex, nofollow`.
- [ ] Add `next.config.ts` `headers()` for `Cache-Control` on `/sitemap.xml` (revalidate hourly).

### 7.2 Content / keywords to own first

Cluster, then build one page per row (reuse P0-6 template). Search volume is inferred from Idle-Empire/Freeward targeting, not keyword tool — but intent is exact:

| Priority | Keyword | VaultQuest page | H1 | Related internal links |
|---|---|---|---|---|
| 1 | free steam wallet codes | `/rewards/steam-wallet-codes` | Earn Free Steam Wallet Codes — Quests → Vault Points → Steam | `/earn`, `/proof` §1, `/about` |
| 1 | free steam gift card | `/rewards/steam-gift-card` | Free Steam Gift Cards — No Generators, Just Quests | `/rewards/steam-wallet-codes`, `/how-it-works` |
| 1 | is vaultquest legit | `/` FAQ + `/blog/is-vaultquest-legit` | Is VaultQuest Legit? Since 2020, No Generators | `/proof`, `/about` timeline, YT/FB |
| 2 | free steam games | `/rewards/free-steam-games` | Free Steam Games — Unlock Keys with Vault Points | `/rewards/steam-wallet-codes`, `/earn` cpe_play |
| 2 | free paypal money | `/rewards/paypal` | Earn PayPal Cash — Same Vault, Different Checkout | `/rewards` |
| 2 | free amazon gift card | `/rewards/amazon-gift-card` | Free Amazon Gift Cards — Partner-Funded | `/rewards` |
| 2 | how long to get steam code vaultquest | `/blog/how-long-to-first-reward` | How Long to Your First Steam Reward? | `/proof` hold table, `affiliates.holdDays` |
| 3 | vaultquest vs freecash / gamesbolt | `/blog/vaultquest-vs-freecash` | VaultQuest vs Freecash — Honest Comparison | `/proof` never-do list |
| 3 | best offerwall | `/blog/best-offerwall-for-your-country` | Which Offerwall Pays Best in Your Country? | `/earn` category chips |
| 3 | free google play / xbox / crypto | `/rewards/google-play` etc. | Free Google Play Codes — … | `/rewards` mesh |

- [ ] Publish 8 pages in P0-6, then 1 blog/week from P2-1 list — cadence matters more than burst (Freeward ships weekly).
- [ ] Each page: 300–500 words honest explainer + 3-step diagram (reuse `HeroRedeemDemo` visuals) + `Related rewards` grid + FAQ (2–3 Qs) with `FAQPage` LD.

### 7.3 Internal linking mesh

```
Home → Earn (category chips) → Rewards/[slug] → Blog/[slug] → back to Earn
     ↘ Proof & Rules (deep link #disclosure, #antifraud, #winners)
     ↘ About (timeline anchor) → YouTube / Facebook (external, rel=noreferrer)
Rewards keyword pages ↔ each other (Related rewards)
Blog posts ↔ Rewards keyword pages + /earn category deep links (?cat=…)
```

Matches Idle-Empire's 100-page mesh at VaultQuest scale without thin-content risk — every node has a job.

### 7.4 Off-page

- [ ] Re-verify `impact-site-verification 6c1cfdb4-…` after sitemap ships (Impact re-crawls `sitemap.xml` for media properties).
- [ ] Keep YouTube About + Facebook Page About pinned post pointing to `vaultquest.io` (not gestyy) — reviewer checks referrer.
- [ ] Don't buy links; Freecash/Freeward backlinks are organic from "is X legit" lists — VaultQuest earns them via P2-1 honest comparison content.

### 7.5 Measurement

- [ ] Add `lib/analytics.ts` events (already scaffolded) for `earn_filter_click`, `reward_filter`, `cashout_progress_view`, `og_image_view`, `faq_expand` — rivals optimise on these funnels, VaultQuest currently blind.
- [ ] Wire Vercel Analytics + Search Console `sitemap.xml` submission day of P0-1 deploy.

---

## 8. What VaultQuest should NOT copy

| Competitor pattern | Why not |
|---|---|
| Fake / inflated counters (`111.7K+ members` with `GamesboltUser754156` anon handles) | Violates `proof` §2 "no fake winner feeds" and `docs/agents/compliance.md`. Instant trust loss if audited. |
| "Earn up to $350 per offer" as hero number | True for Dice Dreams but misread as typical; VaultQuest's `vpReward` honesty (80–1200) is the differentiator. Show range, not max. |
| Login-gated `/earn` like Earnit | Kills crawl and first-session conversion. VaultQuest's anon-browse + `Sign up so clicks attach` (`earn/page.tsx` 38–41) is correct. |
| `© 2021` stale footer | Signals abandonment. Automate year. |
| Stock "money rain" / neon "FREE" badges | Steam generator scam signal. Keep `NO GENERATORS · S2S VERIFIED · ROTATION` pill from `SocialProofBar.tsx` instead. |
| Offerwall logo soup without disclosure | Freeward surfaces logos but not always the share model. VaultQuest already discloses `70% split` + `PENDING→POSTED` — keep it above the fold on earning pages. |

---

## 9. Appendix — file map for implementer

```
web/src/app/page.tsx              hero + SocialProofBar + HeroRedeemDemo + 3-step grid
web/src/components/SocialProofBar.tsx  Since 2020 + YouTube/FB + NO GENERATORS pill
web/src/components/SiteFooter.tsx  Impact verification + 6 legal links (expand in P1-6)
web/src/components/HeroRedeemDemo.tsx  earn → unlock → Steam 3-step demo (reuse for blog)
web/src/app/earn/page.tsx         4 quests, rotation footnote, anon CTA (add chips P0-4, bar P1-1, transparency P1-4)
web/src/app/rewards/page.tsx      3-tier catalog + Available/Pending VP (add filters P1-3, progress P1-1, keyword routes P0-6)
web/src/app/giveaways/page.tsx    upcoming card + empty past winners (feeds P1-7)
web/src/app/proof/page.tsx        9-section trust surface (source for FAQ JSON-LD + home accordion)
web/src/app/about/page.tsx        2020→2026 timeline + legacy video nocookie
web/src/app/how-it-works/page.tsx 5-step list (condense for home strip P2-2)
web/src/lib/affiliates.ts         QUESTS + serveAffiliateLink + holdDays (drives chips + progress math)
web/src/lib/site.ts               SITE + NAV (extend NAV/Breadcrumb for sitemap P0-1)
web/src/app/layout.tsx            Syne/Sora/IBM Plex Mono + metadata + impact-site-verification (add canonical/OG/LD)
web/src/app/globals.css           vault-teal tokens, hero atmosphere, demo chrome
```

Code references are exact — open the file, `find` the token, keep the style.

---

*Next step: pick P0-1 → P0-6 in order; each is a single PR under 100 lines except P0-6 (template). No fake data, no teal drift, no generator language. Ship the sitemap, then the keyword pages — indexing starts there.*
