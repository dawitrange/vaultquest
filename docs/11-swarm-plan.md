# 11 — Swarm Plan — VaultQuest Orchestrator Merge (2026-08-09)

**Lead:** Orchestrator swarm · **Owner:** Ethio (stepped away — all permissions pre-approved)
**Inputs:** 5 parallel subagents — Competitor, Verification, Design/Trust, Profit/OpenRouter, Eng/QA
**Backlogs:** `docs/11-swarm-backlog-competitor.md` · `11-swarm-backlog-verification.md` · `11-swarm-backlog-design.md` · `11-swarm-backlog-profit.md` · `11-swarm-backlog-qa.md`
**Stack:** Next.js 16 at `web/` · Prisma + Neon · `vaultquest.io` live · `localhost:3000` test

---

## 1. What was compared (Competitor mirror — LIVE fetches 2026-08-09)

| Competitor | Fetched | Signal |
|---|---|---|
| **Gamesbolt** `gamesbolt.com/quests + /steam/games` | 6,765 games, 111.7K members, 1.4M quests, `Recently Rewarded` feed, platform-sliced catalog with price filters | Catalog-first vault — steal filters, not terminal skin |
| **Freecash** `freecash.com + /earn` | 1,169 offers, $350/offer hook, $300M+ paid, 303K Trustpilot, Academy IA, progressive unlock + `Next cashout` bar | Conversion benchmark — steal progress bar + Academy |
| **Freeward** `freeward.net + /tasks` | 600K members / $1M paid, offerwall strip (Torox/Pollmatic/BitLabs), Compare table, 8-receipt Verified Payouts grid | Content-SEO + payout-proof hybrid — closest comp |
| **Idle-Empire** `idle-empire.com + /rewards` | 500K users / $8.1M since 2015, 100+ keyword reward pages (each gift card = own SEO page) | Keyword-factory moat — cheapest SEO = directory |
| **Earnit.gg** `earnit.gg + /withdraw` | 150K users, Diamonds currency, live withdraw feed, stale `©2021` | Negative example — manual-delay complaints, thin IA |

**VaultQuest read:** `page.tsx` cinematic teal hero + `SiteFooter` YouTube @zakai1769 + FB Dec 2020 + Impact `6c1cfdb4…` + `proof` 9 sections (no fake counters) + 4 quests + 3 Steam tiers. Verdict: *more trustworthy per paragraph, less shoppable/crawlable per page.* Gap is browse + SEO, not credibility.

---

## 2. Unified P0 backlog — ship this sprint (publisher + SEO gate)

No fake counters, no invented payouts, no generator language. Keep cold vault teal `#2dd4bf` + Syne/Sora + IBM Plex Mono.

| # | Change | Owner file(s) | Effort | Source |
|---|---|---|---|---|
| **P0-1** | `app/sitemap.ts` + `app/robots.ts` + canonical (`metadataBase` + `alternates.canonical`) | `web/src/app/sitemap.ts` (new), `robots.ts` (new), `layout.tsx` | S 2h | Competitor §5 |
| **P0-2** | OG + Twitter meta + default `opengraph-image.tsx` (vault-teal 1200×630) | `layout.tsx`, `opengraph-image.tsx` | S 3h | Competitor §5 |
| **P0-3** | `Organization` + `FAQPage` JSON-LD (`JsonLd.tsx`, FAQ on `/` from `/proof` §1,2,5) | `layout.tsx`, `components/JsonLd.tsx`, `page.tsx` | S 3h | Competitor §5 |
| **P0-4** | `/earn` category chips + filter (`All / Offer wall / Surveys / Play / Signup`, deep link `?cat=`) | `app/earn/page.tsx`, `components/EarnFilters.tsx` | S 4h | Competitor §5 |
| **P0-5** | Honest `Vault activity` strip on home (S2S verified · Rotation active · Hold 3–14d) + ledger counts when available | `page.tsx`, `SocialProofBar.tsx` | S 3h | Competitor §5 |
| **P0-6** | 8 keyword reward pages on one template (`/rewards/[slug]` ×8: steam-wallet-codes, steam-gift-card, free-steam-games, paypal, amazon, google-play, xbox, crypto) + `BreadcrumbList` + internal mesh | `app/rewards/[slug]/page.tsx`, `lib/site.ts` | M 5h | Competitor §5 |

**P1 next sprint (already scaffolded where noted):** `Next cashout` progress bar (reuse `getBalance`), home FAQ accordion, reward filters/sort, offerwall transparency row, `Continue with Google` in hero, footer IA expansion (4 columns + auto year), ledger-backed Recent activity (honest, hidden until POSTED exists). See `11-swarm-backlog-competitor.md` P1 and `11-swarm-backlog-design.md` backlog.

---

## 3. Verification + backup waterfall

**Apply order (confirmed — don't gate launch on Impact):** `AdGate + Lootably + CPX` (parallel, fastest) → `BitLabs + Torox` → `ayeT` (needs AdSlot) → `Freecash Impact` last.

| Partner | Likelihood | Why |
|---|---|---|
| **AdGate** | **High** | No traffic min, 1–2d manual compliance — vaultquest clears |
| **Lootably** | **High** | Pre/Post split 100/70 + postback URL — low friction |
| **CPX Research** | **High** | Needs `ext_user_id + ip + MD5` — ready |
| **BitLabs** | Medium | HMAC SHA1+SHA256 ok, but RECONCILIATION clawbacks strict — lengthen hold 7→14d |
| **Torox** | Medium | Has economy, but DAU <1K + daily audit throttles |
| **ayeT** | Medium | Checklist-gated AdSlot+client_hints — wrong slot = silent zero |
| **Freecash Impact** | Low→Medium | Brand filter on 67 FB followers — complete Impact media properties, keep as `cpa_signup` bonus |

**Backup evaluation:** CPX (Tier1 survey_backup), OfferDaddy (Tier2 offerwall_backup/P3), AdGem (Tier2 cpe_play, mobile), Prime + Timewall (Tier3 geo fill). All map into `PARTNER_WATERFALL` without new HMAC.

**What was already shipped in `web/src/lib/affiliates.ts` (non-breaking, postback untouched):**
- `PARTNER_WATERFALL` + `FALLBACK` per `offers-mix.md` §2 + backups
- `serveAffiliateLink(category, {userId,geo,userAgent})` now tie-breaks by `PARTNER_WATERFALL` within equal priority, enforces `capDaily` via `enforceDailyCap`, logs `cap/health/empty_inventory`
- `checkLinkLiveness` (HEAD, for cron), `reportEmptyInventory`, `markLinkUnhealthy`, `resetDailyCaps` (00:00 UTC), `getWaterfallSnapshot`, `cpxExtUserId` in `createOfferClick`
- **Postback invariants preserved:** `verifyHash` SHA1+SHA256, `POSTBACK_SECRET`, `click_id/vp/tx_id` aliases, duplicate guard, `holdDays`, HTTP 200 on duplicate — untouched

**Remaining:** seed `AffiliateLink` rows with real placement URLs, add Vercel cron for cap reset + liveness, re-test `hash=` and no-hash postbacks. Schema delta (`unhealthyReason`/`RotationLog`) deferred until first cap incident. Full spec: `11-swarm-backlog-verification.md` §6.

---

## 4. Design/Trust — shipped locally

Verified: nav includes About (`lib/site.ts` NAV[0]), scrollbar fix intact (`html overflow-y:auto + scrollbar-gutter:stable`, body/shell `overflow-x:clip` only), no fake counters.

| Ship | File | What |
|---|---|---|
| Footer trust row | `components/SiteFooter.tsx` | `NO GENERATORS · NO PASSWORD ASKS · S2S VERIFIED · LINK ROTATION · MANUAL VAULT 24–48H` + `How we stay transparent → /proof` |
| Earn inline trust | `app/earn/page.tsx` | S2S postback + holds clarified, chips `Holds 3–14d`/`No password asks`, honest empty-state (no fake offers), disclosure footer |
| Rewards reassurance | `app/rewards/page.tsx` | `manual vault 24–48h` + `code via account` per card, vault explainer bar → `/proof#winners` |
| A11y | `app/globals.css` + `app/layout.tsx` + `components/SiteHeaderNav.tsx` | Skip-to-content link, `prefers-reduced-motion` guard, mobile Menu `aria-label` toggle |

Backlog remaining: proof anchor copy-links + active TOC, account empty-state CTA, giveaways schedule window — see `11-swarm-backlog-design.md`.

---

## 5. Profit × OpenRouter — 1 flagship scaffolded, 4 queued

Inventory: only Vault Assistant chat uses OpenRouter (`openrouter.ts` + `/api/chat` 12/min streaming `gpt-4o-mini` ~$0.0004/call). No other call sites.

| Feature | Cost/1k | Vol | Lift | Kill | Status |
|---|---|---|---|---|---|
| **F1 Triage (FLAGSHIP)** `triageSupportMessage` 380 tok T=0.2 6h cache 30/min | $0.40 | 200 msgs/day → $0.08/day | 5–10h/week ops, fraud catch | <75% accuracy on 50-label eval or <30% time-to-action win in 2w | **Scaffolded in `web/src/lib/ai-helpers.ts`** |
| F2 Earn Personalizer | $0.30 | 1k DAU → $0.30/day | CTR +5–15% | A/B <3% @1k imp | queued |
| F3 Quest Copy Enricher | $0.10 | one-time | CTR +2–5% | human prefers original >40% | queued |
| F4 SEO Guide Gen | $0.55 | 20/mo → $0.01/mo | Organic (long-term) | >50% rewrite or 0 impr @4w | queued |
| F5 Sentiment Sentinel | $0.12 | low | Churn −1–2% | r<0.4 vs human | queued |

**`web/src/lib/ai-helpers.ts` guards (all features must use `callGuarded()`):** model allowlist (blocks `gpt-4o` 10×), `MAX_TOKENS_CAP=600`, per-feature token-bucket rate limits, 500-entry LRU TTL caches, daily cap `AI_HELPERS_DAILY_CAP_USD` default $5 (pre-estimate check + `isAiKillSwitchTripped`), `TRIAGE_SYSTEM_PROMPT` versioned const, JSON extraction + enum validation. Global kill switch fast-fails to rules/cache fallback. Details + admin route + cron example: `11-swarm-backlog-profit.md` §3. Budget kill table: `docs/08-budget.md`.

**Next:** wire `/api/admin/triage` behind ADMIN role + nightly cron batch (`triageBatch`), label 50 msgs → eval → only then add `aiCategory` columns.

---

## 6. Eng/QA — local test plan (do NOT push yet)

**Build 2026-08-09:** `npm run build` (`prisma generate && next build`) **PASS** — 19 routes emitted, Turbopack, exit 0. `npx tsc --noEmit` PASS. `npm run lint` PASS after fixing `VaultAssistant.tsx` false-positive `react-hooks/immutability` + unused catch binding. Scroll not locked, About in nav, `/proof` + `/earn` render, postback HMAC round-trip PASS (SHA1+SHA256, `?hash=` and `&hash=` handled). Report: `11-swarm-backlog-qa.md`.

**No `git push` / `vercel --prod` was run — staged only.**

---

## 7. Permissions + agent network

- User pre-approved stepping away — Shell calls used `required_permissions: ["all"]` / `["full_network"]` where needed.
- Plugins `agentmail+apify` enabled but not connected — no keys wired yet; triage/admin route is the natural first consumer of `agentmail` (inbound support → `ContactMessage` → `triageSupportMessage`).
- Network: 5 specialists met via these 4 backlogs + this merge doc. Keep this file as the single handoff.

---

## 8. Exact next command to go live (run on a Git-capable machine — DO NOT auto-run)

```bash
# 0. Repo root
cd C:\Users\mulaw\vaultquest
cd web

# 1. Re-verify (repeatable — must all exit 0)
npm ci
npm run build          # prisma generate + next build — expect 19 routes
npx tsc --noEmit
npm run lint

# 2. DB (Neon) — first time or after schema change
npx prisma migrate deploy        # or: npx prisma db push
npx prisma generate
npm run db:seed                 # seeds AffiliateLink waterfall inventory

# 3. Local QA
npm run dev
# → http://localhost:3000 — click every NAV (About/How it works/Earn/Rewards/Giveaways/Proof/Contact/Terms/Privacy), test mobile drawer, scroll /proof + /about, test /earn → /api/go/* while signed in, test VaultAssistant

# 4. Postback smoke (after a real OfferClick)
curl "http://localhost:3000/api/postback?secret=$POSTBACK_SECRET&click_id=CLICK_ID&vp=500"
curl "http://localhost:3000/api/postback?secret=$POSTBACK_SECRET&click_id=CLICK_ID&vp=500&hash=$(node -p "require('crypto').createHmac('sha1', process.env.BITLABS_APP_SECRET).update('http://localhost:3000/api/postback?secret='+process.env.POSTBACK_SECRET+'&click_id=CLICK_ID&vp=500').digest('hex')")"

# 5. Stage — DO NOT PUSH until you review the 5 backlogs + this plan
# Windows: use Git Bash or WSL if `git` not in PATH
git status
git add docs/11-swarm-*.md docs/11-swarm-plan.md docs/08-budget.md web/src/lib/affiliates.ts web/src/lib/ai-helpers.ts web/src/components/SiteFooter.tsx web/src/app/earn/page.tsx web/src/app/rewards/page.tsx web/src/app/globals.css web/src/app/layout.tsx web/src/components/SiteHeaderNav.tsx web/src/components/VaultAssistant.tsx
git commit -m "$(cat <<'EOF'
swarm: competitor+verification+design+profit+qa — waterfall, trust row, triage scaffold, QA green

- Competitor mirror live (Gamesbolt/Earnit/Freecash/Freeward/Idle-Empire): P0 backlog sitemap/robots/OG/JSON-LD/earn chips/vault strip/8 keyword pages
- Verification: AdGate/Lootably/CPX High → Torox/BitLabs/ayeT Medium → Impact Low-Med; PARTNER_WATERFALL + cap/circuit in affiliates.ts (postback HMAC untouched)
- Design: footer trust row + earn/rewards reassurance + a11y skip/reduced-motion, no fake counters
- Profit: ai-helpers.ts flagship triageSupportMessage with rate/cache/$5 cap allowlist; 4 more queued + budget kill table
- QA: build 19 routes PASS, tsc PASS, lint PASS, HMAC round-trip PASS — no push yet

EOF
)"
# 6. When ready — explicit deploy (MANUAL)
# git push origin HEAD
# vercel --prod   # or push to GitHub → Vercel Git integration
```

Keep `web/.env` populated (`DATABASE_URL`, `POSTBACK_SECRET`, `BITLABS_APP_SECRET`/`AYET_HMAC_SECRET`, `AUTH_SECRET`, `OPENROUTER_API_KEY`, `AI_HELPERS_DAILY_CAP_USD=5`). Budget $150–400 legal review for `/terms`/`/privacy` before paid traffic. Treat Freecash Impact as harvest bonus, not launch gate.
