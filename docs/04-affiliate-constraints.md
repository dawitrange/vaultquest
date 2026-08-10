# Affiliate constraints & link rotation

## Hard product requirement

Maintain a **priority-ordered affiliate link inventory**. If a link/network hits a **cap**, is **disabled**, or fails a **health check** → **automatically serve the next healthy link** in the same category when possible. Log every rotation. Never strand users on a dead CTA.

## Tracking

- Prefer **S2S / postback** with click IDs into the VaultQuest ledger
- Browser pixels alone are **not** enough for in-house points credit
- Store: `click_id`, `user_id`, `partner`, `offer_id`, `sub_id`, timestamps, status, clawback flags

## User-side network rules (examples — Freecash-class)

- One account per person / often per household
- No VPN / emulators / multi-accounting
- No self-referrals
- Referral rewards may sit on **verification hold** (days)
- False earnings claims → bans (hurts our creator program too)

**UX implication:** Teach rules on How-it-works / Proof pages; don’t coach fraud.

## Publisher-side limits

- Daily/monthly caps per offer or account
- Geo / device restrictions
- Creative approval requirements
- Link disablement without notice
- Clawbacks on rejected or fraudulent leads
- Required subIDs / click IDs for attribution

## Rotation design (for Engineering)

```
categories: [offerwall_primary, offerwall_backup, cpa_signup, survey_wall, giveaway_partner]
each link: { id, partner, url, category, priority, status, cap_daily, health, last_checked }
serve(user, category) -> highest priority healthy under-cap link
on_postback_fail_rate | on_manual_disable | on_cap -> status=unhealthy; failover
```

## Compliance for Marketing

- Land traffic on **VaultQuest**, not raw CPA when possible
- Disclose sponsored/partner relationships where required
- Match ad claims to live offers
- No “working codes” creatives

## Offers agent ownership

Shortlist networks (e.g. Lootably, Torox, ayeT, BitLabs, AdGate, Freecash Impact, legacy PointsPrizes-class), EPC/CPA estimates, waterfall priority, and cap-monitoring alerts. Owner budget can fund premium publisher tiers if ROI is clear.
