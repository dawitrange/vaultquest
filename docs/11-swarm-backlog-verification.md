# Verification & Backup — Swarm Backlog (Agent Verification)

**Agent:** Verification & Backup subagent · **Date:** 2026-08-09 · **Workspace:** `C:\Users\mulaw\vaultquest`
**Inputs read:** `docs/10-legitimacy-application-pack.md` (v2026-08-09), `docs/04-affiliate-constraints.md`, `web/src/lib/affiliates.ts`, `web/src/app/proof/page.tsx`, `web/src/app/about/page.tsx`, `web/src/app/terms/page.tsx`, `web/src/app/privacy/page.tsx`, `web/src/app/earn/page.tsx`, `web/src/app/api/postback/route.ts`, `web/prisma/schema.prisma`, `docs/agents/compliance.md`, `docs/agents/offers-mix.md`, `web/src/app/layout.tsx` + `SiteFooter`/`SiteHeader`

---

## 1) Executive summary

- Legitimacy pack is **strong for compliance-first reviewers** (AdGate, Lootably, CPX) and **borderline for traffic-gated or brand-filtered reviewers** (Torox, Freecash Impact, ayeT, BitLabs).
- Biggest risk is **thin pre-launch traffic signal**: DAU <1K declared, Facebook 67 followers, no live redemption volume. Networks that audit DAU/followers/revenue will throttle or queue Vaultquest, not auto-ban — but approval will be conditional.
- Second risk is **`/terms` + `/privacy` flagged as "Outline draft — lawyer review $150–400 before paid scale"`**. Compliant networks forgive this at web-offerwall tier; premium/Impact brands may flag as incomplete legal.
- Recommended apply order (per §6 of pack, confirmed): **AdGate + Lootably + CPX in parallel (fastest wins) → Torox + BitLabs → ayeT → Freecash Impact last** (needs strongest media-property proof). Do not let Impact decide the launch date.
- Fallback waterfall is already half-built in `affiliates.ts` via `FALLBACK` + `serveAffiliateLink`. Proposal below extends it to **partner-level waterfall + health circuit-breaker + rotation audit log** without touching the HMAC postback contract.

---

## 2) Trust signals — page-by-page audit (what a partner reviewer sees in 60s)

| Page | URL | Signals that HELP verification | Gaps / flags reviewer will note | Fix before apply (owner, 30 min) |
|------|-----|-------------------------------|-------------------------------|----------------------------------|
| **About** | `/about` | Timeline 2020→2026 with proof bullets (YT @zakai1769 Joined 2020, FB Freesteamcodes21 Dec 26 2020, Weebly archived, legacy video `sOQWHaHeCkg` via `youtube-nocookie`), Keep-vs-Kill table (gestyy, contact-gated code killed), rebrand note `@zakai1769 → Vaultquest`, Impact verification + `/api/postback` callout | FB 67 followers is small — screenshot must show **Page Transparency creation date**, not follower count, as primary proof. No physical address / LLC badge (ok at this tier) | Attach Studio screenshot of Joined date, not channel URL alone. Keep FB posts public so reviewer can cross-check creation date. |
| **Proof & Rules** | `/proof` | 9 anchors: earnings (100 VP=$1 at 70% split, PENDING→POSTED 3–14d hold), never-do kill list (no generators, no Steam password, no "no-survey" lies), giveaways (eligibility 16+/18+, void where prohibited), winners honest empty state ("First winners after [date]" — no fake feed), disclosure listing **all 7 networks + rotation logging cite to `04-affiliate-constraints.md`**, antifraud (1 account, no VPN farming, PENDING→VOID escalation), creator disclosure (verbal+first-3-lines), support via `/contact` + Vault Assistant, legal disclaimers ("Not affiliated with Valve"), TOC pills | Compliance doc wants 10 sections — proof page has 9 rendered (merges support+legal). Acceptable but could add explicit "Age/Geo" subhead. No Trustpilot widget (intentional — avoids fake-review ban) | Add one line under §9 Legal: `Age gate 16+ default, wall/survey 18+ per network; geo varies` — already present as faint copy, keep it above fold in proof print. |
| **Terms** | `/terms` | 10 sections, matches `compliance.md §6` outline verbatim, points are promotional credits not cash, holds/clawbacks, giveaways incorporate by reference, partners are third-party, no Valve affiliation. Shows you have a real TOS. | Header says **"Outline draft for partner review — lawyer review before paid scale"** — honest but some reviewers flag as incomplete. No governing law jurisdiction set. | Keep draft label for now — do not fake a law firm. Add footer line "Effective 2026-08-09 · contact via /contact" so it doesn't look blank. Budget $150–400 for counsel before Meta/TikTok paid pushes (already flagged). |
| **Privacy** | `/privacy` | 10 sections, lists data collected (account, click_id/user_id/partner, device/IP, support), purposes (S2S credit, fraud, analytics), sharing (lists all 7 networks + Freecash Impact + Neon/Vercel/Resend), retention for audit/clawback, rights (CCPA/GDPR), not directed at <13 | Same "Outline draft" label; no cookie banner yet (ok pre-scale) | Same — keep draft label, add effective date. |
| **Earn** | `/earn` | Copy says "Partner links are wrapped and rotated if network caps/unhealthy. We may earn when you complete offers — that funds the vault." Shows rotation is product, not afterthought. S2S postback disclosure. | No live wall embeds yet — reviewer must trust postback contract without seeing fill | Seed admin table with 1 healthy link per category before screenshots so /admin not empty. |
| **Layout/SiteFooter** | all | `impact-site-verification=6c1cfdb4-889e-4703-8c10-f8a4960fb83a` in `<head>` (Impact requirement), nav includes About/Proof, footer links to About/How it works/Proof/Terms/Privacy, disclosure "Some links are affiliate/partner links... Vaultquest — YouTube since 2020 · Facebook since Dec 2020 · S2S verified · Rotation" | No physical mailing address in footer — low risk for wall networks, higher for Impact | Add generic contact email to footer only if you have a support inbox (already /contact). |
| **Postback** | `/api/postback` | GET+POST, `secret` checks `POSTBACK_SECRET`, HMAC validates `hash` via SHA1 + SHA256 fallback against `BITLABS_APP_SECRET`/`AYET_HMAC_SECRET`, tx dedupe via `tx_id`, `holdDays` from quest, ledger PENDING→POSTED, `hmac=ok` noted, duplicate → `{ok:true, duplicate:true}` with HTTP 200 | None — preserves contract | Do not change hash-stripping regex; it is correct for `?hash=` and `&hash=` forms. |

**Overall:** Passes the 60-second crawl for offerwall/survey networks. Impact/Freecash needs extra media-property proof beyond the meta (screenshots + channel age).

---

## 3) Current partner ranking — verification likelihood

Scored against legitimacy pack matrix (2026-08-09 crawl) + traffic/legal signals above.

| # | Partner | Verdict | Likelihood | Why (pack-anchored) | Primary risk & mitigation |
|---|---------|---------|------------|---------------------|---------------------------|
| 1 | **AdGate Media** | APPROVE FAST | **High** | "No traffic minimum. 1–2 day manual compliance review" — site explicitly cannot be illegal/defamatory/obscene and must disclose traffic/promo. Vaultquest clears all three: no banned claims, disclosure in footer + `/proof §5`, honest /earn + S2S postback ready. No DAU gate. | Risk low. Mitigation: wall URL `vaultquest.io/earn`, postback `vaultquest.io/api/postback`, keep "Outline draft" label — AdGate tolerates draft TOS pre-scale. |
| 2 | **Lootably** | APPROVE FAST | **High** | Placement fields (currency singular/plural, Pre-Split 100, Split 70%, Postback URL required) + Offers API `api.lootably.com/api/v2/offers/get` + placementID/apiKey. Our fit ✅ per pack. Newer aggregator needs publishers — low friction. | Low. After signup email `business@lootably.com` with pack subject verbatim; include placement block + postback URL; API key stored as env. |
| 3 | **CPX Research** | APPROVE FAST | **High** | Publisher app requires `app_id` + stable `ext_user_id` + mandatory `ip_user` + recommended `secure_hash` MD5. Script Tag (footer+div) or iframe `offers.cpx-research.com/index.php?app_id=…`. No traffic minimum published; docs claim notification box +240% vs frame. Vaultquest has stable userId + ip passthrough ready. | Very low. Marked ⚠️ script tag next sprint in pack — schedule it week 1, but wall will approve before script ships. Fill Postback Settings tab immediately after approval. |
| 4 | **BitLabs** | LIKELY, CONDITIONAL | **Medium** | Callback `[%USER:UID%] [%VALUE:CURRENCY%] [%TX%] [%VALUE:USD%]` + `&hash=HEX(SHA1_HMAC(urlWithoutHash, App Secret))` validated before credit, types COMPLETE/SCREENOUT/RECONCILIATION, dashboard tester + test mode, NET-30 $100 min. HMAC env `BITLABS_APP_SECRET` already wired with SHA256 fallback. | Fraud/quality gate: BitLabs is strict on survey attention and clawback reconciliation. Mitigation: enable hold `holdDays` 7–14 for BitLabs completions, forward `ip + user_agent` even though BitLabs doesn't require it (helps reconcile), use dashboard tester before requesting production flip. |
| 5 | **Torox (OfferToro)** | LIKELY, THROTTLED | **Medium** | "Must have game economy / virtual currency; Asks App/Website Link + DAU + Monthly Revenue; Daily traffic audit; fraud → clawback/ban; Min payout $50–200". We have Vault Points ledger + rotation — passes economy check. Submitted DAU <1K, revenue <50K pre-launch (pack template). | Traffic audit risk: pre-launch DAU/revenue is thin vs GPT staples that expect 5K+ DAU. Torox may approve as Tier 2 fill (low priority) and monitor daily. Mitigation: apply with growth narrative `YouTube organic → vaultquest.io first`, offer to share DAU + fraud logs, keep Torox in `offerwall_backup` until 2 weeks of postback volume proves quality. |
| 6 | **ayeT Studios** | CHECKLIST-GATED | **Medium** | Placement+AdSlot combo must match integration (Offerwall API vs Static API). Need AdSlot ID/Name, conversion rate, callback macros `click_id/val/transaction_id/hmac`, HTTP 200, HMAC, `ip + user_agent + client_hints`, static poll every 15–30 min. Callback already listed in pack. | Strict checklist: wrong AdSlot type = auto-reject or silent no-fill. Our postback returns HTTP 200 + validates HMAC + extracts `click_id/val/tx`, but `client_hints` capture not yet explicit in route. Mitigation: add `x-client-hints` forwarding stub, create AdSlot as "Website Offerwall API" exactly, test via ayeT callback tester before marking healthy. |
| 7 | **Freecash (Impact)** | BRAND-FILTERED | **Low → Medium** | "Requires complete Impact profile + verified media properties (vaultquest.io + YouTube + Facebook verified via `impact-site-verification` meta already in layout). Brand filters on location/followers." Pack notes CPA ~$3.27 SOI, $3–10 band. We land vaultquest.io first, Freecash is one quest inside /earn, not raw Impact destination. | Hardest approval: 67 FB followers + <1K YT subs at rebrand may trip Impact automated brand filters or Freecash advertiser whitelisting. Meta is live (`6c1cfdb4…`) but Impact also checks profile completeness and location. Mitigation: complete Impact media properties (set vaultquest.io primary, add YT + FB as verified properties), keep Freecash as `cpa_signup` priority 1 only when Impact link healthy — never sole CTA (hybrid lock), use subIDs `vq_user_id + campaign`. If rejected, treat as waterfall bonus not launch blocker. |

**Apply in this order (confirmed from pack §6):** `AdGate || Lootably || CPX` (parallel, fastest feeds launch) → `BitLabs + Torox` → `ayeT` (needs AdSlot admin) → `Freecash Impact` last. Do not gate launch on Impact.

---

## 4) Backup partners — fit evaluation if a primary is rejected

| Backup | Category fit | Integration | Why it fits Vaultquest | Risk / tradeoff | Verdict |
|--------|--------------|-------------|------------------------|-----------------|---------|
| **CPX Research** | `survey_wall` primary if BitLabs rejected/thin; also secondary `offerwall_backup` | Script Tag (footer + div + notification box) or iframe `offers.cpx-research.com/index.php?app_id=…&ext_user_id=…&ip_user=…&secure_hash=MD5` + Postback Settings tab. Supports `ext_user_id` stable. | Survey fill outside BitLabs is documented need; docs claim notification box +240% vs frame. Low traffic min, tolerates small publishers. Screenout micro-rewards ($0.01–0.10) improve fairness perception per `offers-mix.md`. Zero payout via PayPal/crypto. | Script tag is heavier than API wall (footer load). Survey inventory T3-geo limited. | **Include — Tier 1 backup.** Keep as `survey_wall` priority 2 (after BitLabs) and `offerwall_backup` tier 3. Already in current roster; if BitLabs High risk, promote CPX. |
| **OfferDaddy** | `offerwall_primary` backup tier 3, `cpe_play` tier 4 | Hosted wall + Offers API + S2S postback with click_id/tx, similar to Lootably/Torox. OAuth API key + postback secret. Low documented traffic minimum, long-tail CPI/CPE/catalog. | Fills geo holes when Torox+Lootably+AdGate thin. Used by smaller GPTs — approval fast, no DAU gate. Good for "More quests" tab. | Long-tail = higher clawback variance, EPC $0.20–0.80 typical, inventory overlaps with primary walls (dupe offer risk → needs `tx_id` dedupe, already implemented). | **Include — Tier 2 backup.** Seed as `offerwall_backup` priority 3, `cpe_play` priority 4. Low eng lift (same HMAC pattern). |
| **AdGem** | `cpe_play` primary backup, `offerwall_backup` tier 3 | Offerwall iframe/JS + API + postback; CPE-strong (install→level→purchase goals). Requires `user_id` stable, supports `ip` + `gaid/idfa` hints. | Mobile-heavy traffic benefits: `offers-mix.md` flags AdGem for "Mobile-heavy traffic or Torox/ayeT soft in a geo". Complements ayeT where ayeT geo gaps. | Mobile skew — desktop fill weaker. CPI fraud scrutiny high; needs device hints. Not a survey primary. | **Include — Tier 2 backup.** Map to `cpe_play` priority 2 (after ayeT), `offerwall_backup` priority 4 if mobile UA. Gate with UA sniff. |
| **Prime** *(PrimeLeads/Prime Reward)* | `survey_wall` tier 3, `offerwall_backup` tier 4 | Aggregator wall + survey router + S2S (MD5 or SHA1 HMAC depending on placement). Standard click_id/val/tx macros. Low min payout (~$10). | Broad survey + offer mix, good EU/US T2 fill. Sits behind BitLabs+CPX when T1 survey capped. | Smallest brand — EPC less predictable, clawback window unclear until dashboard live. Documentation thinner; test postback manually. | **Include — Tier 3 backup.** Add as `survey_wall` priority 3, `offerwall_primary` fallback tier 4. Mark `needs_manual_postback_test` until first credited tx. |
| **Timewall** | `survey_wall` tier 3–4, `offerwall_backup` tier 3 | Time-based + survey wall widget + API + postback. Widget embed or API poll; time rewards map to VP via seconds→VP conversion. | Timewall time-engagement format is unique — monetizes idle/session-duration where other walls have no offer. Good EU + LATAM fill per comparable GPTs. Simple widget. | Time rewards have low $/hour — needs conservative VP mapping (avoid over-promising vs EPC). Not a games/CPE primary. | **Include — Tier 3 backup.** Add to `survey_wall` fallback chain and `offerwall_backup` tier 4. Use only if `BitLabs+CPX` fill < target. |

**Not recommended as backup at this stage:** Tapjoy / Mistplay / Adjoe as primary (app/SDK-heavy, wrong for web MVP per `offers-mix.md`), PointsPrizes-class dead links (old-model failure: caps without failover), large exclusivity bonuses with one wall (kills rotation).

**Backup strategy in one line:** CPX + OfferDaddy + AdGem are "keep the lights on"; Prime + Timewall are "fill the geo/vertical holes" — all five seed as `disabled → healthy` via admin toggle after placement keys land, and the waterfall below will auto-skip any that are `capped/disabled` or empty.

---

## 5) Risk per partner — what can go wrong and what we do

| Partner | Top risk | Likelihood | Impact if hits | Early warning | Mitigation (code + ops) |
|---------|----------|------------|----------------|---------------|-------------------------|
| Torox | Daily audit flags low DAU or fraud spike → clawback/ban | Med | High — primary wall drops | Postback silence >50 clicks in 2h, fail rate >15% in 24h | Waterfall already falls to Lootably/AdGate; log rotation reason `health`; hold Vault redemptions 14d for Torox-sourced VP; alert #ops |
| Lootably | Empty inventory for user's geo/device | Med | Med — user sees "no offers" | API returns 0 offers | Fallback to Torox/AdGate + skip to next cat; client shows "not available in your region" copy (already in `/proof` legal) |
| AdGate | Compliance re-review after creative change | Low | Med | Wall URL 4xx/5xx | HTTP health check → `unhealthy` failover; never publish claims diverging from live offers |
| BitLabs | RECONCILIATION reversals (survey fraud) | Med-High | High — margin hit if VP already posted | Postback `RECONCILIATION` with negative VP | Ledger clawback `CLAWBACK` + `VOID` PENDING; lengthen hold 7→14d; never auto-promote PENDING to POSTED until hold clears |
| ayeT | Wrong AdSlot type or missing client_hints → silent zero fill | Med | Med | Zero postbacks after clicks | Validate AdSlot as Offerwall API in dashboard; capture `ip + user_agent + client_hints` in postback logger (see waterfall §6 stub) |
| CPX | Script blocked by adblock or footer load fail | Low | Low | Embed error budget > threshold | Keep iframe fallback URL ready; detect load fail → serve next survey wall |
| Freecash Impact | Brand filter rejects profile or CPA capped/disabled without notice | High for first app | Med — `cpa_signup` quest empties | `cpa_signup` serve returns null | Demote `cpa_signup` priority to Torox/AdGate CPA alternatives per `offers-mix.md §4` — user sees different featured quest, not dead CTA |

---

## 6) Fallback waterfall — implementation proposal

### 6.1 Design goals (from `04-affiliate-constraints.md` + `offers-mix.md §2–§4`)

- **Never strand users on dead CTA:** priority-ordered inventory per category, auto-serve next healthy under-cap link, log every rotation.
- **Health model:** `healthy | capped | disabled | unhealthy` — `unhealthy` maps to `disabled` + `unhealthyReason` until admin or auto-recovery clears it (Prisma currently has `healthy/capped/disabled`; see migration note).
- **Cap monitoring:** real-time `clicksTodayForLink` + daily rollup; auto-mark `capped` for the day; admin can reset.
- **Circuit breaker:** postback silence (clicks>50, zero postbacks in 2h) or fail rate >15% in 24h → mark unhealthy, failover, page on-call.
- **Empty inventory:** API 0-offers for geo/device → skip partner for that request without marking unhealthy.
- **HMAC contract:** unchanged. Postback is partner-agnostic (`click_id → click → user → vp → tx dedupe → ledger`); waterfall only affects **outbound** `serveAffiliateLink` / `createOfferClick`.

### 6.2 Proposed Prisma delta (optional, backward-compatible)

```prisma
// web/prisma/schema.prisma — additive only, no breaking change
enum AffiliateHealth {
  healthy
  capped
  disabled
  // add when ready: unhealthy  // or keep mapping unhealthy -> disabled + note
}

model AffiliateLink {
  id            String            @id @default(cuid())
  slug          String            @unique
  partner       String            // "torox" | "lootably" | "adgate" | "bitlabs" | "ayet" | "cpx" | "freecash" | "offerdaddy" | "adgem" | "prime" | "timewall"
  url           String
  category      AffiliateCategory
  priority      Int               @default(1)   // lower = served first within category
  status        AffiliateHealth   @default(healthy)
  capDaily      Int?
  // new (nullable, backward-compat):
  capMonthly    Int?
  unhealthyReason String?         // "postback_silence" | "fail_rate" | "http_5xx" | "manual"
  lastCheckedAt DateTime?
  lastPostbackAt DateTime?
  failRate1h    Float?            // 0..1
  notes         String?           // admin note, e.g. "Impact capped Jul-09"
  clicks        OfferClick[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([category, status, priority])
  @@index([partner, status])
}

// Optional audit table (or reuse existing log pipeline)
model RotationLog {
  id         String   @id @default(cuid())
  userId     String?
  category   AffiliateCategory
  linkId     String?
  partner    String?
  reason     String   // "cap" | "health" | "manual" | "empty_inventory" | "geo_skip" | "postback_silence"
  meta       Json?
  createdAt  DateTime @default(now())
  @@index([category, createdAt])
  @@index([partner, createdAt])
}
```

If you skip the schema delta pre-launch, keep `AffiliateHealth` as 3 values and store `unhealthyReason` in `notes` and auto-recovery via `updatedAt`.

### 6.3 Proposed `web/src/lib/affiliates.ts` — waterfall v2 (scaffold)

Save as `web/src/lib/affiliates.ts` when ready. **Nothing in `/api/postback` changes.** The route already handles every partner via generic `click_id/vp/tx_id/hash`.

```ts
// web/src/lib/affiliates.ts — waterfall v2 scaffold (drop-in, postback untouched)

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
    description: "Create a Freecash account via Vaultquest. Fixed VP when verified — not a magic code.",
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

// --- Waterfall config (per offers-mix.md §2, extended with backups) ---
// Order matters: lower priority number in DB wins within a category step.
// FALLBACK maps a quest's category → ordered category attempts.
// WATERFALL maps category → ordered partner preferences (for seeding + ops docs).
export const FALLBACK: Record<AffiliateCategory, AffiliateCategory[]> = {
  offerwall_primary: ["offerwall_primary", "offerwall_backup"],
  offerwall_backup: ["offerwall_backup", "offerwall_primary"],
  survey_wall: ["survey_wall", "offerwall_primary"],
  cpa_signup: ["cpa_signup", "offerwall_primary"],
  cpe_play: ["cpe_play", "offerwall_primary"],
};

// Partner priority within each category (lower = prefer). Mirrors offers-mix §2 + backup eval §4.
// Use this to seed AffiliateLink.priority; runtime still orders by DB priority.
export const PARTNER_WATERFALL: Record<AffiliateCategory, string[]> = {
  // offerwall_primary: Lootably → Torox → AdGate → OfferDaddy → Prime → Timewall
  offerwall_primary: ["lootably", "torox", "adgate", "offerdaddy", "prime", "timewall"],
  // offerwall_backup: Torox → AdGate → ayeT(offerwall) → Lootably → OfferDaddy → AdGem
  offerwall_backup: ["torox", "adgate", "ayet", "lootably", "offerdaddy", "adgem"],
  // survey_wall: BitLabs → CPX → AdGate(survey) → Lootably(survey) → Prime → Timewall
  survey_wall: ["bitlabs", "cpx", "adgate", "lootably", "prime", "timewall"],
  // cpa_signup: Freecash Impact → Torox/AdGate CPA alternatives → OfferDaddy
  cpa_signup: ["freecash", "torox", "adgate", "offerdaddy"],
  // cpe_play: ayeT → Lootably(game) → Torox → AdGate → AdGem → OfferDaddy
  cpe_play: ["ayet", "lootably", "torox", "adgate", "adgem", "offerdaddy"],
};

// --- Helpers ---

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function clicksTodayForLink(linkId: string) {
  return prisma.offerClick.count({
    where: { affiliateLinkId: linkId, createdAt: { gte: startOfUtcDay() } },
  });
}

export async function listAffiliateInventory() {
  return prisma.affiliateLink.findMany({ orderBy: [{ category: "asc" }, { priority: "asc" }] });
}

type RotationReason = "cap" | "health" | "empty_inventory" | "geo_skip" | "postback_silence" | "manual";

// Minimal logger — swap to your log sink; never throws.
async function logRotation(args: {
  userId?: string | null;
  category: AffiliateCategory;
  linkId?: string | null;
  partner?: string | null;
  reason: RotationReason;
  meta?: Record<string, unknown>;
}) {
  try {
    // Prefer RotationLog table if migrated; fallback to console.
    const anyPrisma = prisma as unknown as Record<string, unknown>;
    if (anyPrisma["rotationLog"] && typeof (anyPrisma["rotationLog"] as { create?: unknown })["create"] === "function") {
      await (anyPrisma["rotationLog"] as { create: (a: unknown) => Promise<unknown> }).create({
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

// Health gate — respects AffiliateHealth; treats capped/disabled as unservable.
// If you add `unhealthy` enum, extend here. For now unhealthy maps to disabled + note.
function isServable(link: DbLink): boolean {
  return (link.status as string) === "healthy";
}

// Optional: light HTTP check for wall URL liveness (call sparingly, not per-request in hot path).
// Run via cron / health endpoint, not inline with serveAffiliateLink.
export async function checkLinkLiveness(link: DbLink, timeoutMs = 3500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(link.url, { method: "HEAD", signal: controller.signal, redirect: "manual" });
    clearTimeout(t);
    // 2xx/3xx = live; 4xx/5xx = unhealthy
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

// Circuit-breaker helper: mark capped when daily cap hit; admin can reset via /admin.
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

// --- Core waterfall ---

export async function serveAffiliateLink(
  category: AffiliateCategory,
  opts?: { userId?: string | null; geo?: string | null; userAgent?: string | null }
): Promise<DbLink | null> {
  const order = FALLBACK[category];
  for (const cat of order) {
    const candidates = await prisma.affiliateLink.findMany({
      where: { category: cat, status: "healthy" as AffiliateHealth },
      orderBy: { priority: "asc" },
    });

    // Sort by PARTNER_WATERFALL within same priority to keep intent even if priority ties.
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

      // Geo skip stub — if you track geo allowlist per link, check here.
      // if (link.geoAllowlist && opts?.geo && !link.geoAllowlist.includes(opts.geo)) { log geo_skip; continue; }

      // Cap gate
      const underCap = await enforceDailyCap(link);
      if (!underCap) continue;

      // Empty-inventory skip is handled by caller after wall API returns 0 offers.
      // This serve step is click-creation time; we always return a link here.

      return link;
    }
  }

  await logRotation({ userId: opts?.userId, category, reason: "empty_inventory", meta: { fallback: order } });
  return null;
}

// Call this when a wall API returns 0 offers for a geo/device — marks nothing as unhealthy,
// just logs and lets caller retry next category/partner.
export async function reportEmptyInventory(args: {
  category: AffiliateCategory;
  partner: string;
  geo?: string | null;
  userId?: string | null;
}) {
  await logRotation({
    userId: args.userId,
    category: args.category,
    partner: args.partner,
    reason: "empty_inventory",
    meta: { geo: args.geo },
  });
}

// Admin / cron: mark unhealthy on circuit-breaker signals.
// postback_silence: clicks>50, zero postbacks in 2h  → status=disabled + note
// fail_rate: >15% invalid/chargeback in 24h       → status=disabled + note
export async function markLinkUnhealthy(linkId: string, reason: RotationReason, detail?: string) {
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      status: "disabled" as AffiliateHealth,
      // store reason in notes if column exists; else rely on log
      ...(detail ? { notes: `${reason}: ${detail}` } : {}),
      updatedAt: new Date(),
    } as unknown as Record<string, unknown>,
  });
  const link = await prisma.affiliateLink.findUnique({ where: { id: linkId } });
  if (link) await logRotation({ category: link.category, linkId, partner: link.partner, reason, meta: { detail } });
}

// Click creation — stable click_id for postback join; never exposes partner secret.
export async function createOfferClick(opts: {
  userId?: string | null;
  questId: string;
  category: AffiliateCategory;
  geo?: string | null;
  userAgent?: string | null;
}) {
  const link = await serveAffiliateLink(opts.category, {
    userId: opts.userId,
    geo: opts.geo,
    userAgent: opts.userAgent,
  });
  if (!link) return null;

  const click = await prisma.offerClick.create({
    data: {
      userId: opts.userId ?? null,
      affiliateLinkId: link.id,
      questId: opts.questId,
    },
  });

  // Build redirect URL with stable click_id for S2S join.
  // Partner macro map (examples):
  //   Torox/Lootably/AdGate/OfferDaddy:  subid/click_id  → click.id
  //   BitLabs:  [%USER:UID%]            → click.id
  //   ayeT:     {click_id}              → click.id
  //   CPX:      ext_user_id             → click.id (or userId stable; we use click.id for ledger, ext_user_id= userId when available)
  // CPX special: prefer userId for ext_user_id, fall back to click.id for anon
  const cpxExtUserId = opts.userId ?? click.id;

  return { click, link, cpxExtUserId };
}

export function getQuest(questId: string) {
  return QUESTS.find((q) => q.id === questId) ?? null;
}

// Ops helpers

export async function resetDailyCaps() {
  // Run at 00:00 UTC via cron; resets `capped` → `healthy` for next day.
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
```

### 6.4 What NOT to touch (postback invariants)

- Keep `/api/postback/route.ts` `verifyHash` exactly — it validates `hash` via `HEX(SHA1_HMAC(urlWithoutHash, BITLABS_APP_SECRET|AYET_HMAC_SECRET))` + SHA256 fallback, stripping `&hash=` / `?hash=` correctly. Do not add new required headers.
- Keep `POSTBACK_SECRET` as first gate; keep `click_id` aliases (`click_id|clickId|subid|ext_user_id`), `vp` aliases, `tx_id` aliases, duplicate guard `credited` + `ledgerEntry tx=` contains, `holdDays` per quest, PENDING→POSTED via `availableAt`.
- Keep response shapes: `{ok:true, duplicate:true}` and `{ok:true, click_id, vp, user_id}` at HTTP 200 — many networks retry on non-200.
- CPX `secure_hash = MD5(ip_user + ext_user_id + app_id + secret)` style is generated client-side wall URL; postback itself still uses `secret` + optional `hash` — no change.

### 6.5 Admin UX nudges (no schema break)

- ` /admin` already shows `AffiliateEditForm` + `CreateAffiliateForm` + clicks today + cap. Add two pills:
  - **Health pill:** `healthy (green) / capped (amber, auto-resets 00:00 UTC) / disabled (red, needs admin)`.
  - **Waterfall preview:** render `PARTNER_WATERFALL[category]` so admin sees why Lootably wins over OfferDaddy even at equal priority.
- Seed helper (run once after migration):

```ts
// scripts/seed-affiliate-waterfall.ts (run manually)
const seeds: Array<{ slug: string; partner: string; category: AffiliateCategory; priority: number; url: string; capDaily?: number }> = [
  // offerwall_primary
  { slug: "lootably-primary", partner: "lootably", category: "offerwall_primary", priority: 1, url: "https://api.lootably.com/api/v2/offers/get?placementID=REPLACE" },
  { slug: "torox-primary", partner: "torox", category: "offerwall_primary", priority: 2, url: "https://wall.torox.io/REPLACE" },
  { slug: "adgate-primary", partner: "adgate", category: "offerwall_primary", priority: 3, url: "https://wall.adgatemedia.com/REPLACE" },
  { slug: "offerdaddy-primary", partner: "offerdaddy", category: "offerwall_primary", priority: 4, url: "https://offerdaddy.com/wall/REPLACE" },
  // offerwall_backup
  { slug: "torox-backup", partner: "torox", category: "offerwall_backup", priority: 1, url: "https://wall.torox.io/REPLACE_BACKUP" },
  { slug: "adgate-backup", partner: "adgate", category: "offerwall_backup", priority: 2, url: "https://wall.adgatemedia.com/REPLACE_BACKUP" },
  { slug: "ayet-backup-wall", partner: "ayet", category: "offerwall_backup", priority: 3, url: "https://www.ayetstudios.com/offers/REPLACE" },
  // survey_wall
  { slug: "bitlabs-survey", partner: "bitlabs", category: "survey_wall", priority: 1, url: "https://web.bitlabs.ai/REPLACE" },
  { slug: "cpx-survey", partner: "cpx", category: "survey_wall", priority: 2, url: "https://offers.cpx-research.com/index.php?app_id=REPLACE" },
  { slug: "prime-survey", partner: "prime", category: "survey_wall", priority: 3, url: "https://prime.example/REPLACE" },
  { slug: "timewall-survey", partner: "timewall", category: "survey_wall", priority: 4, url: "https://timewall.io/REPLACE" },
  // cpa_signup
  { slug: "freecash-featured", partner: "freecash", category: "cpa_signup", priority: 1, url: "https://www.freecash.com/r/REPLACE?vq_user_id={click_id}" },
  // cpe_play
  { slug: "ayet-cpe", partner: "ayet", category: "cpe_play", priority: 1, url: "https://www.ayetstudios.com/offers/cpe/REPLACE" },
  { slug: "adgem-cpe", partner: "adgem", category: "cpe_play", priority: 2, url: "https://api.adgem.com/REPLACE" },
];
```

### 6.6 Rollout checklist

- [ ] Merge waterfall scaffold (this file §6.3) into `web/src/lib/affiliates.ts` — keep existing exports, add `PARTNER_WATERFALL` + `logRotation` + cap/circuit helpers.
- [ ] No change to `/api/postback/route.ts` — re-run `BITLABS_APP_SECRET` + `AYET_HMAC_SECRET` tester after any affiliate.ts deploy (regression guard).
- [ ] Optional: run Prisma delta (add `unhealthyReason/lastCheckedAt/RotationLog`) — safe to defer until first cap incident.
- [ ] Seed affiliate links per partner (populate real placement URLs + keys; start all as `healthy`, low `capDaily` until first 7-day EPC known).
- [ ] Cron: `resetDailyCaps()` at 00:00 UTC + health check `checkLinkLiveness` every 15 min (survey walls) via Vercel Cron.
- [ ] Verify: create one click per category, hit `/api/postback?secret=…&click_id=…&vp=1&tx_id=test` with and without `hash=` to confirm both paths.

---

## 7) What remains for the swarm

- **Build agent:** implement §6.3 scaffold (low-risk, additive), wire `cpxExtUserId` into CPX wall URL build, add cron for cap reset + liveness.
- **Offers agent:** apply per §3 order, paste placement keys, confirm first credited postback per partner via dashboard testers, reconcile EPC 7 days, re-rank waterfall from live data (don't defend planning order).
- **Compliance agent:** keep draft TOS/Privacy label until counsel; add effective date line; no claims drift from live offers.
- **Master:** approve $150–400 legal review before paid ads per `08-budget.md`; treat Freecash Impact as incremental CPA harvest, not launch gate.

---

## 8) Sources

- Legitimacy pack requirements matrix + copy/paste messages (§2–§3 of `10-legitimacy-application-pack.md`) — crawl dated 2026-08-09.
- Affiliate constraints `04-affiliate-constraints.md` categories + rotation logging rule.
- Offers mix `docs/agents/offers-mix.md` waterfall + economics (70% user share, 3–14d hold, $5 min redeem).
- Live site: `/proof` (9 sections), `/about` (timeline + youtube-nocookie), `/terms` + `/privacy` (draft outlines), `layout.tsx` Impact meta `6c1cfdb4-889e-4703-8c10-f8a4960fb83a`, `affiliates.ts` current `FALLBACK` + `serveAffiliateLink` + `capDaily` auto-mark, `postback/route.ts` HMAC-SHA1+SHA256, `schema.prisma` enums.
