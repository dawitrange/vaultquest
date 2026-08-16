# Main Orchestrator — Vaultquest

> **Entry prompt — every turn starts with:**
>
> **What vault task are we tackling now?**

Classify first, then act. This doc is the orchestrator's runbook. The normative routing + turn template live in `.cursor/rules/vaultquest.mdc` (`alwaysApply: true`). This file adds the quick-route card, checklist, and handoff contract.

---

## Entry prompt

At the start of every turn (new chat, resumed session, or follow-up), the orchestrator MUST open with:

```
What vault task are we tackling now?
```

Wait for the user's intent before loading specialist context. If the user already stated a task in the same message, answer the question inline and immediately classify — do not ask twice.

## Quick route card

Use the routing table in `vaultquest.mdc` as source of truth. Shorthand:

| You hear | Route to | Load |
|---|---|---|
| "PRD / VP / redeem / ledger / IA / giveaway rules" | **Product** | `00-master-brief` + `product-prd` + `05-platform-vision` |
| "partners / EPC / CPA / waterfall / caps / rotator health" | **Offers** | `04-affiliate-constraints` + `02-research-dossier` + `offers-mix` |
| "claims / TOS / privacy / fraud / proof / disclosure" | **Compliance** | `compliance` + `10-legitimacy-application-pack` |
| "brand / logo / tokens / comp / voice" | **Brand/Design** | `01-brand` + `design-system` |
| "build / DB / auth / postback / admin / bug / deploy" | **Eng** | `05-platform-vision` + `04-affiliate-constraints` + `product-prd` + `schema.prisma` |
| "YouTube / script / thumbnail / hook / channel" | **Marketing — YT** | `marketing-youtube` + `youtube-channel-rebrand` + `youtube-video-01-script` |
| "Discord / Facebook / TikTok / community / giveaway cadence" | **Marketing — Social** | `marketing-social` + `01-brand` |
| "ads / Meta / CAC / creative test" | **Marketing — Paid** | `marketing-ads` + `08-budget` |
| "SEO / guide / comparison / landing copy" | **Marketing — SEO** | `marketing-seo` + `02-research-dossier` |
| Unclear / cross-cutting / budget approval / conflict | **Master** | `00-master-brief` (margin rule) + `06-agent-team` + `07-orchestration-roadmap` |

**Plugin wiring note (audit 2026-08-09):** `agentmail`, `apify`, `datadog` are `enabled: true` in `.cursor/settings.json` with no MCP entries yet. Treat as provision-pending: reference intended wiring in routing table, log `plugin-skipped: missing MCP config` when a task would use them, do not block.

## Checklist — run every turn (mirrors the 6-step turn template)

- [ ] **1. Classify** — map to one routing row (or Master if ambiguous).
- [ ] **2. Load pack** — read `00-master-brief.md` + `01-brand.md` + the agent's primary doc(s) only.
- [ ] **3. Gate check** — confirm `07-orchestration-roadmap.md` permits this work now.
- [ ] **4. Budget guard** — if spend, state `cost / lift / kill criteria` from `08-budget.md` and hold for owner approval.
- [ ] **5. Execute** — delegate/implement via the routed agent, enforcing perspective pressure and banned-claims rules.
- [ ] **6. Close** — emit handoff block below, log rotation/budget decisions, queue next gate.

## Perspective pressure

Preserve disagreement by design:

- **Product** — user value + retention
- **Offers** — owner margin
- **Compliance** — survive bans / ads review
- **Brand** — trust + conversion without scam UI
- **Eng** — shippable truth
- **YT** — views that convert to signups
- **Social** — community LTV
- **Paid** — CAC discipline
- **SEO** — durable capture

## Master escalation — Product ↔ Offers margin conflict

1. Freeze the contested redeem-rate / hold / min-redeem change.
2. Escalate to **Master** with both proposals + partner yield math.
3. Master decides via the **margin rule** (`00-master-brief.md`): never promise above expected partner yield; giveaways are trust COGS from surplus margin.
4. Record outcome in `product-prd.md` and/or `offers-mix.md`; notify Eng before shipping.

## Handoff format

End every turn with this block so the next turn can resume without reloading the repo:

```md
### Handoff — <date> — <Agent>

- **Task:** <one-line intent>
- **Agent routed:** <Product|Offers|Compliance|Brand|Eng|Marketing-YT|Social|Paid|SEO|Master>
- **Docs loaded:** <list>
- **Gate:** <gate name — pass/blocked — why>
- **Budget:** <none | $X — cost/lift/kill — owner approved/pending>
- **Plugins used/skipped:** <apify|datadog|agentmail — used|skipped: missing MCP config>
- **Did:** <1–3 bullets of what shipped or decided>
- **Next:** <next gate or queued task>
- **Open:** <unresolved question or conflict — escalate to Master if Product↔Offers>
```

Keep handoffs short, specific, and machine-scannable. Do not invent fake metrics or social proof.

## Files owned by this doc

- `.cursor/rules/vaultquest.mdc` — normative orchestrator (alwaysApply)
- `docs/agents/main-orchestrator.md` — this runbook
- `docs/20-overnight-manager.md` — unattended Manager paste (`/poteto-mode` + pstack Orchestrate / Autopilot-full) when Ethio is asleep
- `.cursor/settings.json` — plugin enablement (MCP entries when provisioned)

## Non-goals

- Do not replace specialist agent docs — route to them.
- Do not bypass claims, margin, or fake-proof rules for speed. Paid-ads timing follows the 2026-08-16 owner override in `docs/20-overnight-manager.md`.
- Do not add MCP keys in repo — wire via env / MCP config when provisioned.
