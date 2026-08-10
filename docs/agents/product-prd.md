# Product PRD — Vaultquest

**Status:** Wave 1 draft  
**Model:** Hybrid Concept 3 (locked)  
**UX template:** Gamesbolt / Earnit  
**Growth template:** Freecash-style creator funnels → Vaultquest first  
**Non-negotiable:** No generators, no password asks, no fake “working codes”

---

## 1. Product summary

Vaultquest is a gaming rewards hub where users create an account, complete partner quests/offers, earn **Vault points (VP)**, and unlock Steam credit / keys — or enter fair, scheduled giveaways.

We own the account, points ledger, earn UI, redeem catalog, and giveaway engine. Offer inventory and Steam fulfillment start outsourced. Affiliate links rotate automatically under the earn surface; creators and ads send traffic to **our** site first.

**Owner win:** Partner commissions − redemptions − fraud − support − ads → profit.  
**Customer win:** Credible path to Steam rewards with honest time-vs-reward expectations.

**Margin rule:** Never promise redemption that exceeds expected partner yield for that action. Giveaways are growth/trust COGS from surplus margin and budget float — not uncapped free codes.

---

## 2. User journeys

### 2.1 Signup → first earn

| Step | User sees / does | System does |
|------|------------------|-------------|
| 1. Land | Home: Vaultquest brand + promise + dual CTA (Earn / Giveaway) | Attribution capture (UTM, creator, campaign) |
| 2. Understand | Optional How it works: quests → VP → redeem / giveaway; typical times | — |
| 3. Sign up | Email or OAuth (Google/Discord). Age gate per partner rules (default 16+/18+) | Create account; never ask Steam password |
| 4. Onboard | Short checklist: verify email (if needed), pick first quest | Assign fraud risk baseline |
| 5. Earn | Earn catalog: quests/offers with honest effort/time labels | Serve rotated affiliate/offerwall links; track clicks |
| 6. Complete | Finishes survey / app / video / game offer on partner | Postback → credit **pending** VP |
| 7. Unlock | Pending clears after hold window | Move VP to **available**; show in ledger |

**Success moment:** First available VP credited with clear “why pending / when available” copy.

### 2.2 Earn → redeem (Steam / keys)

| Step | User sees / does | System does |
|------|------------------|-------------|
| 1. Balance | Rewards: available + pending VP; recent ledger | Enforce holds / clawback windows |
| 2. Catalog | Steam GC denominations (MVP), optional keys | Show cost in VP; min redeem ~$5 Steam-equivalent |
| 3. Request | Choose reward + delivery (email / Steam trade if keys later) | Validate available balance ≥ cost; check fraud flags |
| 4. Deduct | Confirmation: “Unlocking from the vault…” | Debit VP; create redemption order |
| 5. Fulfill | Status: Instant / within X hours / within Y days (honest SLA) | Manual vault purchase initially; mark fulfilled + proof |
| 6. Proof | Optional public “recently rewarded” ticker (real only) | Append anonymized redemption event |

**Guardrails:** Block redeem if pending-only; block if under min; block if fraud hold; never oversell vault stock without wait messaging.

### 2.3 Earn / engage → giveaway

| Step | User sees / does | System does |
|------|------------------|-------------|
| 1. Discover | Giveaways: schedule, prize, rules, odds framing | Publish open / closed / drawn states |
| 2. Enter | Account required; entry via free entry (if any) and/or VP spend and/or qualifying offer | Deduct VP / verify offer; one entry method rules per campaign |
| 3. Wait | Clear close time; no fake urgency generators | Freeze entries at close |
| 4. Draw | Public winner post (handle/initials + prize) | RNG or documented fair draw; store audit |
| 5. Fulfill | Winner contacted via account email | Prize from giveaway float; post proof |

**Positioning:** Giveaways are a trust/growth lever, not the primary “everyone gets a code” promise.

### 2.4 Creator / ad path (growth UX)

1. YouTube/TikTok/etc. → Vaultquest landing (honest hook)  
2. Signup on Vaultquest  
3. Earn via our catalog (partners behind rotator)  
4. Optional secondary deep-link only as featured quest — never replace our site as the CTA destination  

---

## 3. Vault points economy

### 3.1 Philosophy

- **User-facing fairness:** Rates should feel credible vs time (surveys take longer → more VP; short videos → less). Honesty > hype.  
- **Owner float:** Asymmetric conversion — partner payout to us is higher than user redeem value so margin funds fraud, support, ads, and giveaways.  
- **Steam-first framing:** Users think in “Steam dollars unlocked,” not abstract crypto.  
- **No magic:** Points only from verified postbacks / admin adjustments with audit log.  
- **Transparency:** Show pending vs available; explain holds; never invent live reward feeds.

### 3.2 Units & redemption

| Concept | Spec |
|---------|------|
| Currency | **Vault points (VP)** — internal `vp` |
| Display | Whole VP preferred; optional 1 decimal if partner rates need it |
| Min redeem | **~$5 Steam-equivalent** (unless Offers agent proves a lower floor is safer) |
| Catalog (MVP) | Steam gift card / wallet credit denominations at/above min |
| Framing | “Unlock from the vault” |
| Rate tables | Admin-configurable; must pass margin rule before publish |

**Illustrative economics (final numbers = Offers + margin math):**  
If a completed offer nets Vaultquest $X, credit the user ≤ ~40–70% of $X in redeemable Steam value (after expected clawbacks), holding the rest as float. Exact % is an Offers/Finance input — Product enforces “never promise above expected yield.”

### 3.3 Holds (pending vs available)

| State | Meaning |
|-------|---------|
| **Pending** | Conversion reported; waiting partner clawback / chargeback window |
| **Available** | Eligible to redeem or spend on giveaway entries |
| **Locked / fraud hold** | Manual or auto hold; user informed at high level |
| **Reversed** | Clawback: deduct pending first, then available; if already redeemed → negative balance / repay before next unlock |

**Default hold window:** Align to partner postback risk (often 1–30 days by offer type). Prefer shorter holds for low-risk video/survey completions when networks allow; longer for high-payout app installs.

**UX requirement:** Every pending credit shows expected available date or “usually within N days.”

### 3.4 Earn sources (MVP)

- Offerwall / survey / CPA offers via rotator  
- Featured partner quests (e.g. Freecash-class) as catalog items, not the homepage CTA destination  
- Admin goodwill / support adjustments (audited, rare)  
- Optional light daily/streak VP later (cap cost tightly)

### 3.5 Spend sinks

- Redeem Steam GC / keys  
- Giveaway ticket entries (VP spend)  
- Future: Nitro, skins, etc. (post-MVP)

### 3.6 Expiry (later-safe default)

MVP: no aggressive expiry. Document optional inactivity expiry (e.g. 12 months) for later if ledger bloat / liability requires it — communicate clearly before enabling.

---

## 4. Giveaway rules (product policy)

### 4.1 Principles

1. **Scheduled** — open/close times published before launch  
2. **Rules published** — eligibility, entry methods, prize, how winners are chosen  
3. **Winners posted** — public proof on Giveaways + optional social  
4. **Funded** — from surplus margin and/or dedicated vault float, not “infinite free Steam”  
5. **Honest odds** — no guaranteed win language; no generator-style urgency  

### 4.2 Eligibility (baseline)

- Active Vaultquest account  
- Age/geo compliance with prize and partner terms  
- One account per person; multi-account = disqualification  
- Employees/owner discretionary exclusion  

### 4.3 Entry methods (per campaign, pick explicit mix)

| Method | Use |
|--------|-----|
| Free entry | Trust / accessibility; rate-limit (e.g. 1/day) |
| VP spend | Converts points into engagement; price tickets clearly |
| Qualifying offer | Acquisition + revenue; credit entry only after verified postback |

Campaigns must state which methods apply. Do not imply “everyone gets a code.”

### 4.4 Drawing & fulfillment

- Documented fair draw (seeded RNG or equivalent) with admin audit trail  
- Contact winners via account email; reclaim window if no response (e.g. 7 days) → redraw  
- Prize fulfillment from giveaway inventory, separate from redeem queue when stock is tight  
- Archive: campaign rules snapshot + winner list for Proof & Rules page  

### 4.5 Cadence (MVP suggestion)

- Start with **1–2 small scheduled giveaways** (e.g. $10–$25 Steam) once earn path is live  
- Scale frequency only if margin + fraud metrics stay healthy  

---

## 5. Success metrics

### 5.1 North-star

**Profitable Steam unlocks:** Users who redeem (or win) real Steam value while contribution margin after fraud/support stays positive.

### 5.2 Funnel KPIs

| Stage | Metric |
|-------|--------|
| Visit → signup | Signup conversion rate (by channel) |
| Signup → first offer click | Activation rate |
| Click → verified conversion | Offer completion rate |
| Conversion → available VP | Hold survival (1 − clawback rate) |
| Available → redeem request | Redeem intent rate |
| Redeem request → fulfilled | Fulfillment success + SLA hit rate |
| Visit → giveaway entry | Giveaway engagement (secondary) |

### 5.3 Economy / trust KPIs

- Gross partner revenue vs VP liability vs Steam COGS  
- Contribution margin per activated user  
- Fraud / multi-account rate; chargeback %  
- Support tickets per 100 redemptions  
- Time-to-first-available-VP; time-to-fulfill  
- Trust signals: real recent-rewards feed volume; Trustpilot (later)  

### 5.4 Growth KPIs

- Creator/organic traffic → signup (Vaultquest-first, not partner bounce)  
- CAC vs LTV (partner yield − redeem − giveaway COGS)  
- YouTube CTR → landing → signup for Vaultquest-branded content  

### 5.5 Kill / iterate thresholds (examples)

- Clawbacks > X% of credited VP for 2 weeks → tighten holds / cut offer types  
- Margin negative after float for redeem cohort → raise min redeem or lower earn rates  
- Fake-urgency complaints / generator association → claims + creative rewrite immediately  

---

## 6. MVP vs later

### 6.1 MVP (ship to first real redeem)

**Must ship**

| Area | Scope |
|------|--------|
| Auth | Email + Google/Discord OAuth; age gate |
| Ledger | Earn / redeem / adjust / audit; pending vs available |
| Earn UI | Quest catalog wrapping rotated partner links |
| Postbacks | Credit VP on verified conversions |
| Rewards | Steam-first catalog; ~$5 min; manual vault fulfillment |
| Giveaways | Scheduled campaigns, rules, entries, public winners |
| Trust pages | How it works, Proof & Rules, FAQ (honest times), Contact |
| Admin | Link health, caps/priority, margin view, fraud flags, fulfill queue |
| Analytics | visit → signup → first offer → redeem / giveaway |
| Claims | Allowed/banned copy enforced on site surfaces |

**Site IA (baseline)**  
Home → How it works → Earn → Rewards → Giveaways → Proof & Rules → Contact/Support  

**Explicitly out of MVP**

- Generators, “working codes,” password phishing flows  
- Full casino / gambling product  
- Instant uncapped free Steam  
- Manual “email us after Code #1” fulfillment theater  
- Fake social-proof tickers  

### 6.2 Later (post-MVP)

- Steam OpenID login (trust only — never password)  
- Automated Steam GC/key supplier API when volume justifies  
- Keys / Nitro / skins / more denominations  
- Streaks, dailies, referral VP (tight caps)  
- Trustpilot + richer proof widgets  
- Creator CPA dashboard / Impact-style tracking  
- Aggressive multi-geo localization  
- Point expiry policies  
- Mobile app  

### 6.3 Steam fulfillment path (decision)

| Phase | Path | When |
|-------|------|------|
| MVP | **In-house Steam vault** — buy GC/keys ahead; manual send on redeem/giveaway | Now / launch |
| Scale | Supplier or API automation | Volume + ops time justify paid expansion |

Product owns UX/SLA messaging; Ops/Owner executes purchases until automation.

---

## 7. Budget proposals — Steam vault float

Aligned with `docs/08-budget.md` (initial **$1,000+**; Product / fulfillment float ~**$100–400**). Owner approves before spend.

### Proposal A — Launch trust vault (recommended)

| | |
|--|--|
| **Cost** | **$150–250** initial Steam GC inventory (mix of $5 / $10 denominations) + small giveaway prize pool ($20–50) |
| **Lift** | Enable first redemptions without delay; proof for “recently rewarded”; seed 1–2 honest giveaways; reduce early churn from “can’t cash out” |
| **Kill** | If after 30 days & ≥50 activated users, redeem demand &lt; 20% of float **and** signup→earn is broken, pause restock and fix funnel before buying more. If fraud burns &gt;25% of float, freeze redeems and tighten verification |

### Proposal B — Buffer vault (expansion)

| | |
|--|--|
| **Cost** | **+$150–200** restock when available vault &lt; 2 weeks of projected redeem COGS |
| **Lift** | Keep fulfillment SLA honest (“within 24–48h”); avoid public stockouts that tank trust |
| **Kill** | If contribution margin on redeemed cohort is negative for 2 consecutive weeks after rate/hold tuning, stop restock and reprice earn/redeem |

### Proposal C — Automation (later only)

| | |
|--|--|
| **Cost** | Paid Steam/key supplier or gift-card API (TBD quote; typically ongoing fee + face value) |
| **Lift** | Cut manual ops; faster fulfillment at volume |
| **Kill** | If monthly redeem volume &lt; threshold where manual time &lt; ~2h/week, stay manual. If supplier fees erase margin rule, cancel |

**Spend order reminder:** Domain/hosting/email → **small Steam vault** → content tooling → paid ads only after live earn path + claims policy.

---

## 8. Cross-agent dependencies

| Agent | Need from Product / need for Product |
|-------|--------------------------------------|
| Offers | Partner shortlist, postback windows, payout math → set VP rates & holds |
| Engineering | Ledger, rotator, postbacks, admin, analytics per this PRD |
| Brand / Design | Gamesbolt-like UX without scam generator UI; brand-first home |
| Marketing / YouTube | Vaultquest-first CTAs; allowed claims; giveaway promotion |
| Compliance | Age gates, disclosures, giveaway legality by geo |
| Support | Fulfillment SLA language; fraud / clawback user comms |

---

## 9. Open product questions

1. Exact VP↔Steam conversion table (blocked on Offers margin math)  
2. Default hold days by offer category (blocked on partner terms)  
3. Primary community surface for winner posts (Discord vs Facebook — Marketing)  
4. Whether MVP includes any non-Steam redeem SKU (recommend **Steam-only** at launch)  

---

## 10. Acceptance checklist (MVP)

- [ ] User can sign up without Steam password  
- [ ] User can start a quest via rotated partner link  
- [ ] Verified postback credits pending → available VP with visible hold  
- [ ] User can redeem ≥ ~$5 Steam-equivalent from available VP  
- [ ] Fulfillment status is honest and trackable  
- [ ] At least one giveaway can open, accept entries, close, draw, and post a winner  
- [ ] Recent rewards feed (if shown) uses real data only  
- [ ] No generator, fake code, or “guaranteed free $50” surfaces ship  
