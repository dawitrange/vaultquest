# Agent team — Vaultquest

Local multi-agent team. All agents read `docs/00-master-brief.md`, `docs/01-brand.md`, `docs/02-research-dossier.md`, `docs/04-affiliate-constraints.md`, `docs/08-budget.md` before working.

**Standing ops (2026-08-15):** weekly execution lives in **Grok Bot**, not in this 9-role table. Five standing teammates — Manager, Builder, Traffic, Yield, Scout — own the **$40k car fund**, GitHub Project `VaultQuest · Car Fund`, and Monday scoreboard. Operating system: [`docs/19-grok-bot-ops.md`](19-grok-bot-ops.md). Paste-ready first messages: [`docs/agents/grok-bots/`](agents/grok-bots/).

Do **not** clone this Wave-1 roster into nine Grok Bots. Map: Master → Manager; Eng → Builder; YT/Social/SEO → Traffic; Offers → Yield; new ideas/competitors → Scout. Compliance/Brand stay as gates Manager enforces and specialists `@trust-designer` when spawned. Paid ads stay Manager-gated.

Cursor specialists in [`.cursor/agents/`](../.cursor/agents/) (`@vault-planner`, `@eng-qa`, `@partner-researcher`, `@profit-ai`, `@competitor-researcher`, `@trust-designer`, `@db-guardian`, …) are **spawned workers** (cloud agent / Task), not standing Grok Bots.

## Roster

| Agent | Owns | Inputs | Outputs | Starts after |
|-------|------|--------|----------|--------------|
| **Master** | Direction, arbitration, pack updates | Owner decisions | Briefs, conflict calls | Done (Phase 0) |
| **Product** | PRD, VP economy, redeem + giveaway rules, metrics | Master pack | `docs/agents/product-prd.md` | Phase 0 approved |
| **Offers / Monetization** | Partner mix, EPC/CPA, waterfall, caps | Constraints + research | `docs/agents/offers-mix.md` | Phase 0 approved |
| **Compliance / Trust** | Claims, TOS, fraud policy, Proof page copy | Master + Offers | `docs/agents/compliance.md` | Phase 0 approved |
| **Brand / Design** | Visual system, comps | Brand doc | `docs/agents/design-system.md` + assets | Phase 0 approved |
| **Engineering** | App, ledger, postbacks, rotator, admin | PRD + constraints + design | Working MVP in repo | PRD + design tokens |
| **Marketing — YouTube** | Scripts, formats, CTA | Claims + landing | `docs/agents/marketing-youtube.md` | Compliance + landing MVP |
| **Marketing — Social** | Discord/FB/TikTok organic, giveaway cadence | Brand + rules | `docs/agents/marketing-social.md` | Brand + community pick |
| **Marketing — Paid Ads** | Meta/YT/TikTok tests | Compliance + LTV | `docs/agents/marketing-ads.md` | Compliance + landing |
| **Marketing — SEO** | Guides, comparisons | Research keywords | `docs/agents/marketing-seo.md` | IA locked |

## Perspective pressure (intentional)

- Product: user value + retention  
- Offers: owner margin  
- Compliance: survive bans / ads review  
- Brand: trust + conversion without scam UI  
- Eng: shippable truth  
- YT: views that convert to signups  
- Social: community LTV  
- Ads: CAC discipline  
- SEO: durable capture  

Master resolves Product ↔ Offers conflicts using the margin rule in `00-master-brief.md`. On the Grok Bot company, **Manager** makes that call and records it; Builder does not ship a contested rate/hold.

## Kickoff prompts

See `docs/agents/kickoffs/` after orchestration starts (Wave-1 doc agents).

Grok Bot first messages: `docs/agents/grok-bots/{manager,builder,traffic,yield,scout}.md`. Monday backup automation prompt: `docs/19-grok-bot-ops.md` §9.
