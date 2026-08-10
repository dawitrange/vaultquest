# Offers / Monetization mix — Vaultquest

**Status:** Wave 1 deliverable  
**Owner priority:** Maximize net profit (partner yield − user redemption − clawbacks − fraud − support)  
**User requirement:** Fair, honest time-vs-reward; never over-promise vs expected partner yield  
**Model:** Hybrid locked — Vaultquest Earn UI owns the ledger; partners fill inventory behind rotation

Assumptions below are **planning ranges** for launch math, not contracted rates. Reconcile against live dashboard EPC/CPA after first 500–1,000 postbacks.

---

## 1. Partner shortlist (recommended)

### Tier A — Launch core (apply week 0)

| Partner | Role | Why it fits Vaultquest | Integration | Notes / risks |
|---------|------|------------------------|-------------|----------------|
| **Torox** (ex-OfferToro) | Primary multi-offer wall | Web-first GPT staple; strong fill + customization; used by Freecash-class apps | Web wall + API + S2S | Mature inventory; treat as default primary until live EPC loses to backup |
| **Lootably** | Primary/secondary aggregator wall | Multi-source fill (surveys, CPI, CPE, video); placement currency split + webhooks; Offers API for custom UI | Widget / Offers API + conversion webhooks | Newer than Torox/AdGate — diversify, don’t sole-source; excellent for hybrid Earn catalog |
| **AdGate Media** (AdGate Rewards / Prodege) | Broad offer wall | High campaign count; surveys + installs + subs; solid S2S postbacks + chargeback status | Web wall / API + postback | Easy publisher onboarding; good failover when Torox/Lootably thin |
| **BitLabs** | Survey + games/offers | Survey depth in T1 geos; Games & Offers product; HMAC S2S; NET-30 / $100 min payout | iframe / SDK / Offer API + callbacks | Best as **survey_wall** primary; clawback/recon hold needed |
| **ayeT Studios** | CPE / mobile game offers | Strong Offerwall + Static API; HMAC callbacks; multistep CPE goals map cleanly to “quests” | Offerwall API + callbacks | Prefer for playable/mobile quests; geo/device sensitive |
| **Freecash Impact** | CPA signup + featured partner quest | Public Impact CPA **~$3–$10 / email signup** (quality-dependent); global; creator-grade brand users already know | Impact tracking link + conversion pixel/S2S if available | **Never** the only CTA. See §5 |

### Tier B — Fast add if fill/geo gaps

| Partner | Role | When to add |
|---------|------|-------------|
| **CPX Research** | Dedicated survey wall / footer notifier | Survey fill weak outside BitLabs; low barrier, screenout micro-rewards improve fairness perception |
| **AdGem** | Extra CPI/CPE fill | Mobile-heavy traffic or Torox/ayeT soft in a geo |
| **OfferDaddy / Archer** | Long-tail fill | Only after Tier A live and secondary slots empty |

### Explicitly deprioritized (launch)

| Option | Reason |
|--------|--------|
| Legacy PointsPrizes-class single dead links | Caps + disablement without failover = old model failure mode |
| Tapjoy / Mistplay / Adjoe as primary | App/SDK-heavy; Vaultquest MVP is web Earn catalog |
| Sending creator traffic **only** to Freecash | Violates hybrid lock; kills Vaultquest margin + brand |

### Application order (ops)

1. Torox + Lootably + AdGate (offerwall_primary / backup)  
2. BitLabs + ayeT (survey + CPE categories)  
3. Freecash Impact (cpa_signup + featured quest)  
4. CPX if survey fill < target after 2 weeks live traffic  

---

## 2. Waterfall priority by category

Aligns with `docs/04-affiliate-constraints.md` categories. Serve highest priority **healthy + under-cap** link; log every rotation.

### `offerwall_primary` — default Earn catalog embed

| Priority | Partner | Serve when |
|----------|---------|------------|
| 1 | **Lootably** | Healthy (prefer custom Offers API into Vaultquest UI) |
| 2 | **Torox** | Lootably down/capped/thin fill |
| 3 | **AdGate** | Both above unhealthy or geo hole |

*Rationale:* Lootably’s multi-source inventory + currency split fits own-brand Earn UI; Torox is proven GPT primary; AdGate is reliable third seat.

### `offerwall_backup` — second wall / “More quests” tab

| Priority | Partner |
|----------|---------|
| 1 | Torox (if not already primary for that user/session) |
| 2 | AdGate |
| 3 | ayeT (offerwall mode) |
| 4 | Lootably (if primary was Torox that session) |

Rule: **Never show two walls that credit the same underlying offer to the same user in one session** without ledger dedupe keys — Engineering must key on partner `transaction_id` + user_id.

### `survey_wall`

| Priority | Partner |
|----------|---------|
| 1 | **BitLabs** |
| 2 | **CPX Research** |
| 3 | AdGate (survey-heavy filter) |
| 4 | Lootably (survey-type filter if API allows) |

### `cpa_signup` — partner account signup quests (not Vaultquest signup)

| Priority | Partner / offer |
|----------|-----------------|
| 1 | **Freecash Impact** (featured “Join Freecash” quest — after Vaultquest account exists) |
| 2 | Other approved GPT/app CPA deals (Impact or direct) as added |
| 3 | High-payout single CPA from Torox/AdGate API if Impact capped |

### `cpe_play` — install / reach level / playtime quests

| Priority | Partner |
|----------|---------|
| 1 | **ayeT Studios** |
| 2 | Lootably (game/CPE) |
| 3 | Torox |
| 4 | AdGate / AdGem |

### `giveaway_partner` — optional sponsored giveaway slots

| Priority | Use |
|----------|-----|
| 1 | Surplus-margin funded Vaultquest giveaways (no partner required) |
| 2 | Partner-sponsored prize only if disclosure + net margin ≥ organic giveaway COGS |

### Session / user routing notes

- New user first Earn view → `offerwall_primary` (Lootably) + soft suggest 1 survey card from BitLabs.  
- User flagged mobile Android/iOS → bias `cpe_play` ayeT higher in catalog sort.  
- User from creator “Freecash” content → still land Vaultquest first; surface Freecash as **one quest** in catalog + optional secondary CTA after first Vaultquest earn event (see §5).

---

## 3. Rough EPC / CPA / margin assumptions

### Currency & split (owner profit primary, fairness required)

| Knob | Launch default | Guardrail |
|------|----------------|-----------|
| User share of **gross partner revenue** | **70%** credited as Vault points (USD-equivalent) | Floor **60%** if clawbacks >8% of revenue; ceiling **80%** only for promo weeks funded by surplus |
| Owner float | **30%** before redemption COGS, fraud, support | Must fund Steam vault + giveaways + ops |
| Hold window | **3–14 days** pending → available (partner-dependent) | Match network clawback windows; BitLabs/ Freecash-class longer |
| Min redeem | **~$5** Steam-equivalent | Do not lower until blended margin ≥ 15% after 30 days |
| VP rate example | 100 VP = $1.00 user credit (= $1.00 of the 70% share) | Product owns display; Offers owns that credit ≤ expected yield |

**Margin rule (locked):** Never advertise a quest reward that exceeds **expected net partner yield × user share** for that action after typical clawback.

### Planning yields (blended, T1 geos US/UK/CA/DE/AU; web GPT traffic)

| Category | Gross EPC / event (publisher) | After 70/30 split to user | Owner gross before COGS | Confidence |
|----------|-------------------------------|---------------------------|-------------------------|------------|
| Offerwall click → conversion (mixed) | **$0.40–$1.20 EPC** (highly geo/quality dependent) | User sees ~70% of that event | ~30% | Medium — calibrate week 2 |
| Survey complete (BitLabs/CPX) | **$0.30–$2.50** per complete; screenouts **$0.01–$0.10** | Same split | ~30% | Medium-high for T1 |
| CPE game goal | **$0.50–$15+** per goal (fat tails) | Cap displayed VP to conservative expected; release rest on postback | ~30% + hold | Low until live |
| Freecash Impact CPA | **$3–$10** / qualified signup (Impact quote) | **Do not** pass 70% of CPA as VP for a 30-second email — see Freecash quest economics below | Owner keeps most CPA; user gets fixed fair quest reward | High on public CPA band; medium on approval |

### Freecash quest economics (fair + profitable)

| Item | Assumption |
|------|------------|
| Expected CPA (approved Impact) | **$5** mid (range $3–$10) |
| User VP reward for “Create Freecash account + verify email” | **$0.75–$1.50** equivalent (fixed quest, not % of CPA) |
| Owner residual | CPA − user reward − expected clawback/fraud reserve (~15–25%) |
| Why fixed not %-of-CPA | Signup CPA ≠ effort parity with a $5 survey; over-rewarding cannibalizes offerwall engagement |

### Blended unit economics (target after soft launch)

| Metric | Target |
|--------|--------|
| Gross partner revenue / DAU (engaged earner) | **$0.80–$2.50** |
| User liability created / DAU | ≤ **70%** of gross |
| Clawback / reversal rate | **< 8%** of credited gross; alert at 5% |
| Net contribution after Steam COGS + giveaway COGS | **≥ 15%** of gross partner revenue |
| Kill / reprice trigger | Net contribution **< 5%** for 14 consecutive days |

Steam redemption COGS ≈ face value of GC/keys. Giveaways funded only from surplus above the 15% net target (or explicit budget float per `docs/08-budget.md`).

---

## 4. Cap monitoring + rotation triggers

### Health model (per link inventory row)

```
link: {
  id, partner, category, priority, url,
  status: healthy | capped | disabled | unhealthy,
  cap_daily, cap_monthly, served_today, revenue_today,
  fail_rate_1h, last_postback_at, last_checked_at
}
```

### Automatic triggers → mark unhealthy / capped → failover

| Trigger | Threshold (launch) | Action |
|---------|-------------------|--------|
| Daily cap hit | `served` or `revenue` ≥ partner/account cap | `status=capped`; serve next priority same category |
| Manual partner disable | Dashboard or admin flag | `status=disabled`; never serve until cleared |
| Postback silence | Zero postbacks while clicks > N (e.g. 50) in 2h | `status=unhealthy`; page on-call |
| Fail / reject rate | Chargebacks or invalid > **15%** of conversions in 24h | Pause link; reduce user share or hold longer |
| HTTP health check | Wall URL 4xx/5xx or embed error budget exceeded | Failover |
| EPC collapse | Rolling 7d EPC < 50% of partner baseline | Demote priority one step; alert Offers |
| Geo empty | API returns 0 offers for user geo/device | Skip to next partner in category |

### Monitoring cadence

| Check | Cadence | Owner |
|-------|---------|-------|
| Cap counters | Real-time on serve + daily rollup | Engineering rotator |
| Partner dashboards | Daily (launch month), then 3×/week | Offers |
| Clawback report | Weekly reconcile vs ledger | Offers + Product |
| Alert channels | Slack/email when any Tier A link unhealthy > 15 min | Ops |

### Rotation logging (required)

Every serve and every failover logs: `user_id`, `category`, `link_id`, `partner`, `reason` (`cap` | `health` | `manual` | `empty_inventory`), timestamps. Supports Proof page honesty and partner disputes.

### Cap budgeting (publisher side)

- Prefer **multiple placements** per network (Earn primary vs backup) only if ToS allows — else one placement + category routing.  
- Soft-throttle high-clawback geos before hard cap.  
- When Freecash Impact monthly cap approaches 80%, demote `cpa_signup` priority and surface Torox/AdGate CPA alternatives.

---

## 5. Freecash: Earn UI vs creator CTA

Hybrid lock: **Creators and ads → Vaultquest first.** Freecash is inventory + growth partner, not the product.

### Behind Vaultquest Earn UI (default)

| Placement | Behavior |
|-----------|----------|
| Featured quest card | “Bonus quest: Join Freecash” with honest time + fixed VP reward |
| Rotator category | `cpa_signup` priority 1 when Impact link healthy |
| Post-earn upsell | After first offerwall credit, optional “Want more ways to earn?” → Freecash quest |
| Attribution | Impact subIDs = `vq_user_id` + campaign (`yt`, `tiktok`, `earn_card`) |
| Ledger | Credit VP only on **verified** Impact conversion (or documented interim hold if pixel-only); never double-credit Freecash in-app earnings into Vaultquest |

### Creator / YouTube CTA (growth template)

| Do | Don’t |
|----|-------|
| Primary end screen / description: **Vaultquest** Earn URL | Primary CTA only to Freecash |
| Script: “Make a Vaultquest account, complete quests, redeem Steam — Freecash is one of the partner quests inside” | Imply Vaultquest *is* Freecash |
| Secondary pinned comment: Freecash Impact link **only** if video is Freecash review and disclosure is clear | Send all traffic raw to Impact and skip Vaultquest signup |
| Disclose sponsored/partner relationships | Fake “working codes” or guaranteed Freecash bonuses |

### Economic intent

1. Capture account + email + future LTV on Vaultquest.  
2. Monetize offerwalls/surveys with 70/30 split.  
3. Harvest Freecash CPA as **high-margin incremental** when user chooses that quest.  
4. Creators may still earn Freecash-style narrative authority; Vaultquest keeps the shell and margin control.

---

## 6. Paid publisher-tier budget proposals

Default: **use free/standard publisher accounts** until live EPC proves inventory limits. Proposals below follow `docs/08-budget.md` (cost / lift / kill). Owner approves before spend.

### Proposal A — Steam redemption float (required trust; not a network tier)

| | |
|--|--|
| **Cost** | **$150–$300** from product/fulfillment bucket |
| **Lift** | Enables first real Steam redeems + giveaway prizes; reduces “is this fake?” bounce |
| **Kill** | If < 10 redeems in 45 days after earn-live, pause further float top-ups and switch giveaways to VP-entry only |

### Proposal B — Freecash Impact / premium creator creatives (optional)

| | |
|--|--|
| **Cost** | **$0–$100** (Impact usually free; budget for whitelisted landing tests or creative refresh only) |
| **Lift** | Higher CPA approval odds + cleaner subID reporting; better YT conversion to featured quest |
| **Kill** | If Freecash quest CVR < 3% of Earn visitors over 2 weeks **or** clawback > 25%, demote quest below other CPA and stop paid creative spend |

### Proposal C — Paid “premium / managed” publisher tier (any network that gates fill)

| | |
|--|--|
| **Cost** | Cap **$200** trial / first month (only if a Tier A network requires fee or minimum for API/priority fill) |
| **Expected lift** | +15–30% offerwall EPC or unlock Offers API / better T1 survey fill vs standard |
| **Kill** | If incremental gross revenue < **2×** fee over 30 days, downgrade to free tier and reshuffle waterfall |
| **When to consider** | After ≥ 2 weeks traffic **and** measured empty-inventory rate > 20% of Earn sessions |

### Proposal D — CPX Research + notifier (cheap fill, not premium fee)

| | |
|--|--|
| **Cost** | **$0** network; **≤ $50** eng time equivalent already in build — no cash unless paid UI kit |
| **Lift** | Survey fairness (screenout cents) + fill outside BitLabs |
| **Kill** | If survey revenue / session < 10% of offerwall after 3 weeks, hide CPX from default UI (keep in rotator only) |

### Proposal E — Do **not** buy at launch

| Spend | Why wait |
|-------|----------|
| Large integration bonuses / exclusivity with one wall | Kills rotation resilience |
| Paid traffic before postbacks + claims policy live | Burns marketing bucket on unmeasured margin |
| Tapjoy/Mistplay SDK stacks | Wrong surface for web MVP |

### Suggested slice from $1,000+ (Offers-relevant)

| Item | Amount |
|------|--------|
| Steam float (A) | $150–$300 |
| Premium network trial reserve (C) | $0–$200 (hold until data) |
| Impact/creative tests (B) | $0–$100 |
| **Offers max without new approval** | Prefer ≤ **$400** combined until ROI proof |

---

## 7. Launch checklist (Offers)

- [ ] Apply Torox, Lootably, AdGate, BitLabs, ayeT, Freecash Impact  
- [ ] Confirm S2S postbacks + HMAC/IP allowlists into Vaultquest ledger  
- [ ] Configure placement currency: 70% user share, holds, clawback reversals  
- [ ] Seed admin link table with priorities in §2  
- [ ] Wire cap + health alerts  
- [ ] Define Freecash quest fixed VP reward + Impact subID map  
- [ ] Reconcile first 7 days: EPC by partner, clawback %, empty-inventory %, net contribution  
- [ ] Re-rank waterfall from live data (do not defend planning order)

---

## 8. Open items for other agents

| Agent | Need |
|-------|------|
| **Product** | VP display rates, pending/available UX, min redeem $5, anti-double-credit across walls |
| **Engineering** | Rotator + postback receiver per `docs/04-affiliate-constraints.md` |
| **Marketing / YouTube** | Vaultquest-first CTAs; Freecash as secondary/in-wall narrative |
| **Compliance** | Disclosures for Impact/offerwalls; age gates 16+/18+ by network |
| **Master** | Approve any Proposal B/C spend before cash out |
