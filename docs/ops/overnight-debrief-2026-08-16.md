# Overnight debrief — 2026-08-16

**Manager (morning):** TBD
**Overnight:** paper-docs agent (this file)
**Hybrid lock:** Gamesbolt/Earnit UX + Freecash-style growth on vaultquest.io first — unchanged.

Filled from `docs/20-overnight-manager.md` §4. **Known facts only.** No invented revenue.

## Car Fund / cash
- Tonight net: **$0**
- Partner payout received: **no**
- Notes: Car Fund tonight net $0. Do not book a receivable. Do not infer CPX dashboard cash from the pending VP row.

## Pipe / ledger
- Postback host: **www.vaultquest.io** (apex **308s** — do not use apex)
- New credits:
  - CPX S2S wrote **PENDING EARN 35 VP**
  - id `cmsv8iod80001k0044dgb9um6`
  - tx=`1001164886769`
  - clickId **null**
  - availableAt `2026-08-19T03:17:54Z`
- Holds / voids: this row is PENDING until `availableAt`. Not POSTED. Not cash.

## Rotator
- Healthy: `cpx-survey`, `freecash-cpa`
- Disabled / homepage / not live: **all others** (disabled homepages — do not send users there)

## Ads / billing
- Meta billing: **$25.06 unpaid**; **$300 held**
- Queued spend: **$20 FB boost queued — blocked** on the unpaid $25.06
- Caps in force: $150/day Meta + $50/day YouTube (unless Owner changed)
- Cells killed overnight: none (no live paid cell; boost never started)
- Agent clicked billing?: **no** (cannot)

## PRs (Manager fills in the morning)
| PR | Title | Merge? | Notes |
|----|-------|--------|-------|
| TBD | TBD | TBD | Manager fills |

## Traffic (Manager fills in the morning)
- Sessions / source: TBD
- Signups: TBD
- Offer clicks → first earn: TBD
- Vercel Analytics / Pixel: TBD (do not invent)

## Blockers
- Meta / Page boost: $20 queued, blocked on $25.06 unpaid; $300 held. Agent cannot click Meta billing.
- Paid “we’re live, start earning” still Manager-gated.
- Apex postback / ad destination would 308 — keep www.

## Asks for Manager
- Pay or kill the $25.06 unpaid (and decide what the $300 hold is for) before any boost.
- Fill the PR table and traffic lines above from morning dashboards.
- Confirm whether PENDING 35 VP (clickId null) is an accepted CPX user_id-only credit or needs a click attach.
- Keep postback URL on **www.vaultquest.io**.
