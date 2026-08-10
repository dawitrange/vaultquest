# Platform vision — VaultQuest

## In-house (prefer)

| System | Purpose |
|--------|---------|
| Auth / accounts | Email + OAuth (Google/Discord); optional Steam login later for trust — **never** ask password |
| **Vault points ledger** | Earn / redeem / expire / adjust / audit log |
| Earn catalog UI | Wraps partner links; ranking + rotation controlled by us |
| Rewards catalog | Steam GC denominations, keys, giveaway tickets |
| Giveaway engine | Entries, eligibility, winners, public proof posts |
| Postback receiver | Credit points on verified conversions |
| Admin | Link health, caps, priority, margin dashboard, fraud flags |
| Analytics | Funnel: visit → signup → first offer → redeem / giveaway |

## Outsourced (necessary)

- Offer/survey inventory (offerwall networks)
- Steam fulfillment (manual vault purchase initially; API/supplier when volume justifies — propose from budget)
- Owner payout rails from networks (PayPal/bank)

## Points economy (constraints for Product)

- User-facing rates must feel fair vs time
- Owner keeps **float** (asymmetric rate vs partner payout)
- Min redeem ~$5 Steam-equivalent unless Offers proves lower is safer
- Pending vs available balance (holds for clawback windows)

## Giveaways

- Scheduled, rules published, winners posted
- Entry via: account + optional VP spend and/or offer completion
- Funded as acquisition COGS from surplus margin / budget float
- Not the primary “everyone gets a code” promise

## UX template to mirror

**Gamesbolt / Earnit**
- Quest / earn framing
- Clear How-it-works
- Live recent rewards (real data only)
- Instant or clearly timed fulfillment
- Honest FAQ on time-to-reward

## Growth template to mirror

**Freecash-style creators**
- YT walkthroughs with honest hooks
- CTA → VaultQuest landing
- Optional secondary partner deep-links via rotator
- Creator briefs with allowed/banned claims

## Stack suggestion (Engineering may refine)

- Next.js (App Router) + TypeScript
- Auth: Clerk or NextAuth
- DB: Postgres (Neon/Supabase)
- Host: Vercel or Cloudflare
- Email: Resend
- Deploy within foundation budget slice
