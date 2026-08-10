# Affiliate simulation — Vaultquest (Offers / Monetization)

**Status:** Planning brief for Ethio (owner)  
**Priority rule (CRITICAL):** **Capacity / scale ceiling first**, then owner profit, then hybrid Earn-UI fit. Prefer a network that can absorb ~10⁵–10⁶ completions over time over a higher-CPA deal that caps at ~10² affiliates/referrals.  
**Fairness:** Target ~**70% user / 30% owner** of gross partner yield on offerwalls/surveys/CPE (Freecash CPA uses a **fixed** fair VP quest — see §2).  
**Honesty:** All $ figures below are **ESTIMATES for planning**, not contracted rates. Caps, CPA, and EPC vary by deal, geo, traffic quality, and incent approval. No fake precision.

Related: `docs/agents/offers-mix.md`, `docs/04-affiliate-constraints.md`, `docs/08-budget.md`, `web/src/lib/affiliates.ts`, `web/prisma/seed.ts`.

---

## 1. Launch checklist answer

### Do we need to buy a domain **now**?

**This week: yes, buy `vaultquest.*` (cheap foundation spend).**  
Not because monetization math requires it today — because **publisher applications ask for a website/app URL**, and a real domain + simple landing beats a random localhost story for Torox / Lootably / AdGate / BitLabs / ayeT / Impact review.

| Timing | Recommendation |
|--------|----------------|
| **This week** | Register domain + point DNS to hosting (Vercel/Cloudflare). Budget slice: ~$10–20/yr domain inside Foundation ($50–150) per `docs/08-budget.md`. |
| **Can start partner apps before domain resolves?** | Yes — submit with staging URL if needed, then update when live. Do **not** wait weeks for “perfect site” before applying. |
| **Do not wait for** | Paid ads, Steam float top-ups, or premium network tiers before applications. |

### Sign up as publisher with which partners?

**Apply week 0 (parallel):**

1. **Lootably** — offerwall primary candidate  
2. **Torox** — offerwall primary/backup  
3. **AdGate Media** — offerwall failover  
4. **BitLabs** — survey wall  
5. **ayeT Studios** — CPE / play quests  
6. **Freecash via Impact** — featured CPA signup quest (not the whole product)

**Tier B (after Tier A live or if survey/CPI fill is thin):** CPX Research, AdGem.

**Do not** build launch inventory around PointsPrizes-class single dead links.

### Placeholder seed URLs — not live affiliates

`web/prisma/seed.ts` currently stores **homepage / marketing URLs** (e.g. `https://lootably.com/`, `https://torox.io/`). Those are **PLACEHOLDERS for local UI / rotator wiring**.

They are **not**:

- Approved publisher tracking links  
- Placement iframes / Offers API endpoints  
- Impact Freecash deep links with Vaultquest subIDs  
- Live postback-verified inventory  

Until each partner approves Vaultquest and you replace seed URLs + wire S2S secrets, **Earn clicks do not monetize**. Treat seed `capDaily` values as engineering defaults, not partner contracts.

---

## 2. Partner scorecard

**Scoring method (capacity-first):**

- **Capacity 1–10:** How high is the realistic scale ceiling for *Vaultquest as incent GPT web*? (inventory depth, campaign caps vs hard affiliate-count caps, household/fraud friction)  
- **Profit 1–10:** Owner float quality after fair user rewards + typical clawbacks  
- **Featured suitability:** `0.55×Capacity + 0.30×Profit + 0.15×Hybrid` (Hybrid = fits Vaultquest Earn UI + rotation, not “send traffic only to partner”)

Assumptions labeled **ESTIMATE**.

### Tier A

#### Lootably

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Medium.** Apply at [dashboard.lootably.com signup](https://dashboard.lootably.com/authentication/signup); manual approval; need site + traffic story. Docs: placements, currency split, Offers API, postbacks. |
| Typical capacity | **High ceiling.** Multi-source wall (surveys, CPI, CPE, video). Caps are mostly **per-campaign advertiser budgets**, not “100 publisher slots.” Soft limits: empty inventory by geo/device, quality holds, placement disable. Practical scale for a growing GPT site: **tens of thousands–millions of offer completions over time** if fill stays healthy. Daily publisher “serves” not usually hard-capped like referral programs. |
| Revenue model | Aggregated **CPA / CPE / CPI / survey** → publisher share; configurable **currency split** (map to 70/30). |
| $ to Vaultquest / activated user | **~$0.40–$1.20** gross per *first* offerwall conversion (T1 web GPT mix); owner ~**30%** → **~$0.12–$0.36** before clawback/fraud. Blended DAU later higher if users complete multiple offers. |
| User VP fairness | Strong — native split + honest time hints; aligns with 70/30. |
| Capacity | **9** |
| Profit | **7** |
| Hybrid fit | **9** (Offers API → own Earn UI) |
| **Featured suitability** | **~8.4** — top featured wall |

#### Torox (ex-OfferToro)

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Medium.** [torox.io/register](https://torox.io/register/) publisher form (site, DAU band, revenue). Mature GPT network; expect review. |
| Typical capacity | **High ceiling.** Web offerwall + API; campaign-level caps; used at Freecash-class scale. Same pattern: fill/geo/quality limit you before “affiliate headcount.” |
| Revenue model | Mixed **CPA/CPE** offerwall; S2S. |
| $ / activated user | Gross first conversion **~$0.40–$1.20** (similar band to Lootably; live EPC decides winner); owner **~$0.12–$0.36**. |
| User VP fairness | Strong with hold windows. |
| Capacity | **9** |
| Profit | **7** |
| Hybrid fit | **8** (embed/API; slightly less “custom catalog” than Lootably Offers API) |
| **Featured suitability** | **~8.3** — co-primary / primary backup |

#### AdGate Media (AdGate Rewards / Prodege)

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Easy–medium.** Broad publisher onboarding; compliance review common (Prodege). |
| Typical capacity | **High.** Large campaign count; surveys + installs + subs. Caps = campaign/account quality, not tiny referral ceilings. Excellent **failover** when Lootably/Torox thin. |
| Revenue model | Offerwall **CPA/CPI/CPL**-style mix; S2S + chargeback status. |
| $ / activated user | Gross **~$0.35–$1.10** first conversion (often slightly below best Torox/Lootably EPC in some geos — **ESTIMATE**); owner **~$0.10–$0.33**. |
| User VP fairness | Good; watch survey screenouts. |
| Capacity | **8** |
| Profit | **6** |
| Hybrid fit | **8** |
| **Featured suitability** | **~7.4** — featured as **#3 wall / failover**, not sole hero |

#### BitLabs

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Medium.** Publisher apply + HMAC/S2S setup; NET-30 / ~$100 min payout typical. |
| Typical capacity | **High for surveys in T1**; thinner outside US/UK/CA/DE/AU. Completions scale with DAU × survey supply, not affiliate seats. Screenout rate is the real “cap” on user happiness. |
| Revenue model | Survey completes + Games/Offers; **CPE/survey payouts**. |
| $ / activated user | Gross complete **~$0.30–$2.50** (wide); planning mid **~$0.80–$1.20** for a *successful* complete; owner **~$0.09–$0.75**. Screenouts **~$0.01–$0.10**. |
| User VP fairness | High if screenout micro-rewards shown; else frustration. |
| Capacity | **8** |
| Profit | **6** |
| Hybrid fit | **8** (`survey_wall` primary) |
| **Featured suitability** | **~7.4** — featured **survey** card, not whole Earn home |

#### ayeT Studios

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Medium.** Publisher account + placement/adslot; AM helps postbacks. |
| Typical capacity | **Medium–high**, but **geo/device sensitive** (mobile playables). Multistep CPE goals = many events per user; campaign daily caps common. Scale ceiling still far above “100 referrals,” lower than pure web walls for desktop-only users. |
| Revenue model | **CPE** goals + offerwall/static API. |
| $ / activated user | First credited goal **~$0.50–$15+** (fat tails); planning conservative first-goal **~$1.50–$3.00** gross; owner **~$0.45–$0.90** after 70/30 — hold long (clawbacks). |
| User VP fairness | Cap displayed VP to conservative expected; release rest on postback. |
| Capacity | **7** |
| Profit | **8** (when goals convert) |
| Hybrid fit | **8** (`cpe_play`) |
| **Featured suitability** | **~7.5** — featured **play** quests for mobile users |

#### Freecash — Impact CPA + native referral

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Impact CPA: Medium–hard** for incent GPT (Vaultquest rewards users → often needs **incent approval**). Apply via Freecash partner / Impact flow ([Freecash partner page](https://freecash.com/academy/en/discover/partner/become-a-partner)). **Native in-app referral:** easy (any Freecash user) but **wrong primary model** for Vaultquest scale. |
| Typical capacity | **Impact:** Can be **large** if incent approved (top partners publicly cite high monthly volume) — still subject to **monthly budgets, geo, quality, clawbacks**. Not a hard “100 affiliates” program, but **not unlimited**: incent may be throttled or paused. **Native referral:** **low scale ceiling for us** — one account/person/household, verification holds, region tables, self-referral bans; fine as personal side channel, **bad as Vaultquest inventory backbone**. |
| Revenue model | Impact: **CPA ~$3–$10 / qualified email signup** (public band). Native: country table (e.g. US ~$2.50 signup+install + ~$10 first withdrawal — **user-facing referral**, not publisher CPA). |
| $ to Vaultquest / activated user | Impact mid **~$5** gross (range $3–$10). **Do not** pass 70% as VP. Fixed quest **~$0.75–$1.50** user liability → owner residual **~$2–$7** before ~15–25% fraud/clawback reserve. |
| User VP fairness | Fair only with **fixed** low-effort reward (seed quest = 150 VP ≈ $1.50 Steam-eq). %-of-CPA would overpay vs effort. |
| Capacity | **6** (Impact, incent-dependent) / **3** (native referral as sole path) |
| Profit | **9** (Impact, if approved) / **5** (native) |
| Hybrid fit | **7** as **one featured quest** / **2** if traffic bypasses Vaultquest |
| **Featured suitability** | **~6.9 Impact featured quest** — **not** #1 Earn surface under capacity-first |

### PointsPrizes-class (if relevant)

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | Often easy historically; links die. |
| Typical capacity | **Low.** Caps, disablement, thin failover — classic failure mode of single-link GPT sites. |
| Revenue model | Opaque CPA/rev-share; unreliable. |
| $ / activated user | Irrelevant if link dies at N≪ scale. |
| Capacity | **2** |
| Profit | **4** (when alive) |
| Hybrid fit | **2** |
| **Featured suitability** | **~2.6** — **deprioritize**; never sole CTA |

### Tier B

#### CPX Research

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Easy–medium**; low barrier survey wall / notifier. |
| Typical capacity | **Medium–high** survey fill supplement; geo-dependent. |
| Revenue model | Survey **CPE**/complete + screenout cents. |
| $ / activated user | Often **lower EPC** than BitLabs in T1; useful for fairness + fill. Gross complete **~$0.20–$1.50** band (**ESTIMATE**). |
| Capacity | **7** |
| Profit | **5** |
| Hybrid fit | **7** |
| **Featured suitability** | **~6.4** — secondary survey, not launch hero |

#### AdGem

| Dimension | ESTIMATE |
|-----------|----------|
| Signup / access | **Medium**; CPI/CPE publisher. |
| Typical capacity | **Medium–high** for mobile-heavy; weaker as desktop-only web primary. |
| Revenue model | **CPI/CPE**. |
| $ / activated user | Overlaps offerwall/CPE band; use as **fill**, not featured brand. |
| Capacity | **7** |
| Profit | **6** |
| Hybrid fit | **6** |
| **Featured suitability** | **~6.6** — Tier B rotator |

### Scorecard summary (capacity-first)

| Partner | Cap | Profit | Featured suitability | Role |
|---------|-----|--------|----------------------|------|
| Lootably | 9 | 7 | **~8.4** | Featured offerwall #1 |
| Torox | 9 | 7 | **~8.3** | Featured / backup wall #2 |
| AdGate | 8 | 6 | **~7.4** | Wall #3 / failover |
| ayeT | 7 | 8 | **~7.5** | Featured CPE (mobile) |
| BitLabs | 8 | 6 | **~7.4** | Featured surveys |
| Freecash Impact | 6 | 9 | **~6.9** | Featured **CPA quest only** |
| AdGem | 7 | 6 | **~6.6** | Tier B |
| CPX | 7 | 5 | **~6.4** | Tier B surveys |
| PointsPrizes-class | 2 | 4 | **~2.6** | Avoid |

---

## 3. Simulation tables

### Method (document once)

| Knob | Planning assumption |
|------|---------------------|
| Population | **N** Vaultquest users who each attempt **one primary action** with that partner |
| Completion rate | **55%** mid of **40–70%** “signed up → complete primary action” (stated per partner if different) |
| Split | Offerwall / survey / CPE: user liability = **70%** of gross; owner net = **30%** of gross (before ads, fraud, Steam COGS, support) |
| Freecash | Gross = Impact CPA mid **$5**; user liability = **$1.50** fixed (150 VP); owner = gross − user liability |
| Cap risk | Would partner/program limits likely bind **before** this N? |
| Label | All $ are **ESTIMATES**; use mid of ranges from §2 |

**Primary action definitions:**

| Partner | Action simulated |
|---------|------------------|
| Lootably / Torox / AdGate | **First offerwall conversion** (any credited offer) |
| BitLabs / CPX | **First survey complete** (not screenout-only) |
| ayeT / AdGem | **First CPE goal credit** |
| Freecash Impact | **Qualified signup CPA** (email SOI per deal) |
| Freecash native referral | **Referral signup+install credit** (not Impact) — shown only for contrast |
| PointsPrizes-class | **Single CPA click conversion** (fragile link) |

Owner net below = **gross partner payout − user redeem liability** (Steam-eq). Ignores clawbacks (~plan 5–15% reserve later).

### Shared offerwall mid case (Lootably / Torox / AdGate)

Assumptions: **55%** complete; gross **$0.80** / conversion; user **$0.56**; owner **$0.24** / conversion.

#### Lootably — N = 10 / 50 / 100

| N | Assumed conversions (55%) | Gross to us | User VP liability | Owner net | Cap risk before N? |
|---|---------------------------|-------------|-------------------|-----------|--------------------|
| 10 | ~6 | ~$4.80 | ~$3.36 | ~$1.44 | **No** — far below inventory scale |
| 50 | ~28 | ~$22 | ~$15 | ~$7 | **No** |
| 100 | ~55 | ~$44 | ~$31 | ~$13 | **No** (campaign soft caps possible in thin geos; rotator covers) |

#### Torox — same mid economics

| N | Conv. | Gross | User liability | Owner net | Cap risk? |
|---|-------|-------|----------------|-----------|-----------|
| 10 | ~6 | ~$4.80 | ~$3.36 | ~$1.44 | **No** |
| 50 | ~28 | ~$22 | ~$15 | ~$7 | **No** |
| 100 | ~55 | ~$44 | ~$31 | ~$13 | **No** |

#### AdGate — mid gross **$0.70** (slightly lower ESTIMATE)

| N | Conv. (55%) | Gross | User (70%) | Owner net | Cap risk? |
|---|-------------|-------|------------|-----------|-----------|
| 10 | ~6 | ~$4.20 | ~$2.94 | ~$1.26 | **No** |
| 50 | ~28 | ~$20 | ~$14 | ~$5.90 | **No** |
| 100 | ~55 | ~$39 | ~$27 | ~$12 | **No** |

### BitLabs — first survey complete

Assumptions: **45%** complete (surveys harder than “any offer”); mid gross **$1.00** / complete.

| N | Conv. (45%) | Gross | User (70%) | Owner net | Cap risk? |
|---|-------------|-------|------------|-----------|-----------|
| 10 | ~5 | ~$5 | ~$3.50 | ~$1.50 | **No** in T1; **maybe empty inventory** in weak geos |
| 50 | ~23 | ~$23 | ~$16 | ~$6.90 | Soft geo fill risk, not affiliate-count cap |
| 100 | ~45 | ~$45 | ~$32 | ~$14 | Same |

### ayeT — first CPE goal

Assumptions: **40%** reach first goal; mid gross **$2.00**.

| N | Conv. (40%) | Gross | User (70%) | Owner net | Cap risk? |
|---|-------------|-------|------------|-----------|-----------|
| 10 | ~4 | ~$8 | ~$5.60 | ~$2.40 | Unlikely at N=10; device/geo may zero some users |
| 50 | ~20 | ~$40 | ~$28 | ~$12 | Campaign daily caps possible → rotate |
| 100 | ~40 | ~$80 | ~$56 | ~$24 | **Possible** per-campaign day caps; capacity still ≫ referral-class |

### Freecash Impact CPA — featured signup quest

Assumptions: **60%** of N complete qualified signup; CPA **$5**; user **$1.50**; owner **$3.50** / conversion.

| N | Conv. (60%) | Gross | User liability | Owner net | Cap risk? |
|---|-------------|-------|----------------|-----------|-----------|
| 10 | ~6 | ~$30 | ~$9 | ~$21 | **Low** if incent approved |
| 50 | ~30 | ~$150 | ~$45 | ~$105 | Watch **monthly Impact budget / quality** |
| 100 | ~60 | ~$300 | ~$90 | ~$210 | **Maybe** — incent throttles or monthly cap; still better than 100-affiliate walls **if** approved |

*Capacity-first note:* At N=100, Freecash **profit** dominates walls — but walls remain safer **featured catalog** because they absorb **repeat** completions and don’t depend on one advertiser’s UA budget.

### Freecash native referral (contrast — not recommended as primary)

Assumptions: **50%** attributed; US-like **~$2.50** signup+install only (ignore withdrawal leg for “one primary action”); household rules bind.

| N | Conv. | Gross | User liability (VQ fixed $1.50 if we still pay quest) | Owner net | Cap risk? |
|---|-------|-------|------------------------------------------------------|-----------|-----------|
| 10 | ~5 | ~$12.50 | ~$7.50 | ~$5 | Fraud/household rejects |
| 50 | ~25 | ~$62 | ~$38 | ~$25 | **Rising** multi-account / geo limits |
| 100 | ~50 | ~$125 | ~$75 | ~$50 | **Yes risk** — wrong scale model for Earn UI |

### CPX (Tier B) — first survey complete

Assumptions: **45%** complete; mid gross **$0.60**.

| N | Conv. | Gross | User | Owner | Cap risk? |
|---|-------|-------|------|-------|-----------|
| 10 | ~5 | ~$3 | ~$2.10 | ~$0.90 | No |
| 50 | ~23 | ~$14 | ~$9.70 | ~$4.10 | Soft geo |
| 100 | ~45 | ~$27 | ~$19 | ~$8.10 | Soft geo |

### AdGem (Tier B) — first CPI/CPE

Assumptions: **40%**; mid gross **$1.20**.

| N | Conv. | Gross | User | Owner | Cap risk? |
|---|-------|-------|------|-------|-----------|
| 10 | ~4 | ~$4.80 | ~$3.36 | ~$1.44 | Device skew |
| 50 | ~20 | ~$24 | ~$17 | ~$7.20 | Campaign caps possible |
| 100 | ~40 | ~$48 | ~$34 | ~$14 | Same |

### PointsPrizes-class — fragile single CPA

Assumptions: **50%** convert while link live; gross **$2** (optimistic); **high disable risk**.

| N | Conv. | Gross | User (70%) | Owner | Cap risk? |
|---|-------|-------|------------|-------|-----------|
| 10 | ~5 | ~$10 | ~$7 | ~$3 | **Elevated** — link may die anytime |
| 50 | ? | Unreliable | — | — | **Likely hit cap/disable before N=50** |
| 100 | — | Treat as **$0** planning | — | — | **Yes** — do not feature |

### Simulation takeaway

At N≤100, **Freecash Impact wins raw owner $** if approved; **Lootably/Torox win capacity-first featured placement** because they (a) won’t cliff at small affiliate caps, (b) support ongoing catalog volume, (c) keep hybrid margin control. Use Freecash as **high-margin side quest**, not the only CTA.

---

## 4. Recommendation — featured waterfall (capacity-first)

### Earn UI featured rank

1. **Lootably** — primary offerwall / catalog (capacity + custom UI)  
2. **Torox** — co-primary / instant backup wall  
3. **AdGate** — third wall / geo failover  
4. **BitLabs** — featured survey module  
5. **ayeT** — featured play/CPE (boost on mobile)  
6. **Freecash Impact** — featured **CPA signup quest** (fixed VP)  
7. **CPX / AdGem** — Tier B fill only  

**Deprioritize:** PointsPrizes-class; Freecash **native** referral as inventory; any “send creators only to Freecash.”

### Primary waterfall order (by category)

Aligns with `offers-mix.md`, reaffirmed under capacity-first:

| Category | Order |
|----------|--------|
| `offerwall_primary` | **Lootably → Torox → AdGate** |
| `offerwall_backup` | **Torox → AdGate → ayeT → Lootably** (avoid dual-credit same offer) |
| `survey_wall` | **BitLabs → CPX → AdGate surveys → Lootably survey filter** |
| `cpe_play` | **ayeT → Lootably → Torox → AdGate/AdGem** |
| `cpa_signup` | **Freecash Impact → other approved CPA → wall CPA offers** |

Re-rank after first **500–1,000** live postbacks; do not defend planning order against measured EPC/empty-inventory %.

---

## 5. Next actions for Ethio (owner)

### A. Domain (this week)

1. Buy **`vaultquest.com`** (or best available TLD) — Foundation budget.  
2. Point DNS to Vercel/Cloudflare; ship a **real landing** (brand + Earn coming soon / waitlist OK).  
3. Use that URL on **all** publisher applications.

**Verdict:** Buy domain **this week**. Don’t block apps if DNS lags by a day or two — update applications when live.

### B. Publisher signups (do in parallel)

| Partner | Step | Link / entry |
|---------|------|----------------|
| Lootably | Apply publisher → create placement → set currency split ~70% user → postback URL | https://dashboard.lootably.com/authentication/signup — docs: https://documentation.lootably.com |
| Torox | Register as Publisher → submit site/DAU | https://torox.io/register/ |
| AdGate | Publisher signup from AdGate Media site → compliance review | https://www.adgatemedia.com (Publishers) |
| BitLabs | Publisher / offerwall apply → HMAC callbacks | https://www.bitlabs.ai |
| ayeT | Publisher account → placement + adslot → API key | https://www.ayetstudios.com |
| Freecash Impact | Partner form → Impact program → **ask explicitly for incent/GPT approval** + subIDs | https://freecash.com/academy/en/discover/partner/become-a-partner |
| Later | CPX Research, AdGem | After Tier A live or fill gaps |

In applications, describe Vaultquest honestly: **web GPT / rewards site**, users earn Vault Points redeemable for Steam — expect **incent** classification.

### C. What to put in `.env` (when approved)

Current `web/.env.example` already has ledger/postback basics. Add partner secrets as you receive them (names illustrative — match Engineering when wiring):

```bash
# Already in example — set for prod
AUTH_SECRET="..."
ADMIN_EMAIL="you@yourdomain.com"
POSTBACK_SECRET="long-random-shared-with-walls"
RESEND_API_KEY="..."
CONTACT_TO_EMAIL="..."
CONTACT_FROM_EMAIL="Vaultquest <noreply@vaultquest.YOUR_TLD>"

# Add when partners approve (Engineering may rename)
LOOTABLY_API_KEY=""
LOOTABLY_PLACEMENT_ID=""
LOOTABLY_POSTBACK_SECRET=""

TOROX_APP_ID=""
TOROX_SECRET=""

ADGATE_AFFILIATE_ID=""
ADGATE_WALL_CODE=""

BITLABS_API_TOKEN=""
BITLABS_HMAC_SECRET=""

AYET_API_KEY=""
AYET_ADSLOT_ID=""

# Freecash Impact tracking
IMPACT_ACCOUNT_SID=""
IMPACT_AUTH_TOKEN=""
FREECASH_IMPACT_CLICK_URL=""   # approved deep link; replace seed https://freecash.com/
```

Also replace every row in `web/prisma/seed.ts` (or admin inventory) with **approved tracking URLs** — never ship homepage placeholders to production Earn.

### D. Order of ops (capacity-first)

1. Domain + landing  
2. Apply Lootably + Torox + AdGate (+ BitLabs + ayeT + Freecash Impact same week)  
3. Wire S2S → ledger → holds → 70/30  
4. Soft traffic / creators → Vaultquest first  
5. Reconcile 7 days → re-rank waterfall  
6. Steam float $150–300 when first real redeems approach (`offers-mix` Proposal A)

---

## 6. Open honesty box

- Network **daily/monthly caps** are deal- and geo-specific; dashboards beat this doc the day you go live.  
- **Incent** traffic can be cut without notice — rotation is mandatory (`docs/04-affiliate-constraints.md`).  
- Seed `capDaily` (5000/3000/…) is **not** a partner promise.  
- Freecash **high CPA ≠ highest featured rank** under owner’s capacity-first rule.
