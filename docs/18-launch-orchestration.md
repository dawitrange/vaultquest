# 18 — Launch Orchestration Plan (Team + Workflow + Manager)

**Created:** 2026-08-12 · **Manager (orchestrator):** `@vault-planner` (the cloud agent acts as manager this run) · **Goal:** get VaultQuest revenue-ready and drive first Facebook traffic — safely and fast.

This plan turns the current research + QA into an executable, gated workflow. It respects `.cursor/rules/vaultquest.mdc` (budget guard, no paid spend before the landing/claims gate, no fake proof/claims) and `docs/08-budget.md` (cost / lift / kill + owner approval).

---

## 1. Team & responsibilities

| Role | Agent | Owns |
|------|-------|------|
| **Manager / orchestrator** | `@vault-planner` (this run) | Sequencing, gates, merging outputs, owner asks, this doc |
| Competitor & voice research | `@competitor-researcher` | Voice/copy playbook; natural, user-centric language vs defensive "trust-me" tone |
| Trust / compliance copy | `@trust-designer` | Reviews copy rewrites so required disclosures + banned-claim rules stay intact |
| Monetization go-live | `@partner-researcher` | Self-serve provider signup runbook (owner-vs-agent split), postback mapping |
| Engineering / QA | `@eng-qa` | Implements copy + UX changes, `vault-build-check`, postback smoke |
| Live-site QA | `computerUse` | Reproduces user-facing issues on the real site |
| Support inbox | AgentMail (`vaultquest-support@agentmail.to`) | Receives provider verification + application email |

**Superpowers plugin:** not available in the cloud-agent environment (not wired into the environment MCP config). Orchestration runs on the repo's agent network + Task subagents instead — same outcome.

---

## 2. Workstreams

### W1 — Copy / voice realignment (site "sounds natural", user-centric)
- **Problem:** the site over-signals trust ("NO GENERATORS", "S2S VERIFIED", "we never…") on every surface. To users and AI reviewers this reads defensive/unnatural.
- **Do:** `@competitor-researcher` → voice playbook; manager synthesizes old→new copy vs the live-QA notes; `@eng-qa` implements; `@trust-designer` reviews that affiliate disclosure + age gate + no banned claims remain.
- **Guardrail:** keep honesty as a quiet default, not a billboard. Never add hype, fake counters, or banned claims.
- **Output:** copy PR (hero, /earn, /rewards, /proof framing, footer pills).

### W2 — Monetization go-LIVE (the actual blocker for revenue)
- **Do:** `@partner-researcher` → per-provider go-live runbook (CPX Research, TimeWall, +1). Manager executes the agent-doable steps; owner completes identity/payout/ToS steps; AgentMail receives verification.
- **After approval:** owner sets provider keys + `POSTBACK_SECRET` on Vercel; flip the matching `AffiliateLink` to `healthy` in `/admin` **with the real offer URL** (not a homepage).
- **Also fix now (owner):** reseed the **production** DB so `/earn` stops showing dead partner-homepage links (`npm run db:seed` on prod `DATABASE_URL`, or flip links to `disabled` in `/admin`). See PR #5.
- **Also (owner):** set `OPENROUTER_API_KEY` on Vercel so the Vault Assistant works (PR #6 hides it until then).

### W3 — Marketing / Facebook (gated on W2)
- **Do:** prepare campaign assets (angles, creative concepts, audiences, budget, tracking) so we can launch the moment prerequisites clear.
- **Gate (hard):** per `vaultquest.mdc` #7 + `docs/07-orchestration-roadmap.md`, **no paid spend before** (a) landing MVP solid, (b) claims/copy policy done (W1), (c) at least one monetization network LIVE and crediting (W2). Spending before that drives users to a product that can't pay them = wasted CAC, bad first impression, and Facebook rewards-vertical policy risk.
- **Budget guard:** any spend needs a cost / lift / kill line + explicit owner approval and a connected Meta ad account. The agent cannot launch or fund ads.

---

## 3. Critical path to first Facebook traffic (the honest "tomorrow" answer)

FB spend "tomorrow" is only responsible if this path is cleared first — most steps are fast:

1. **(Owner, minutes)** Set `OPENROUTER_API_KEY` on Vercel → assistant works.
2. **(Owner, minutes)** Reseed prod DB / flip links → `/earn` stops showing dead links.
3. **(Agent + owner, hours)** Get ONE self-serve provider LIVE (W2 runbook) so new users can actually earn + a postback credits VP end-to-end.
4. **(Agent, hours)** Ship the W1 copy realignment PR.
5. **(Owner)** Connect Meta ad account + approve a small test budget with kill criteria.
6. **Then** launch a small FB test (not a big push) → measure CAC vs first-earn rate → scale only if unit economics work.

If steps 1–5 land quickly, a **small** FB test within ~24–48h is realistic. A large push tomorrow is not advisable.

---

## 4. Owner action checklist (unblocks everything)

- [ ] `OPENROUTER_API_KEY` on Vercel (+ credits) — assistant.
- [ ] Reseed prod DB or disable stale links — `/earn` dead links.
- [ ] Provide identity/payout details (or complete those signup steps yourself) for provider approvals — agent cannot submit legal/tax/ToS as you.
- [ ] `AGENTMAIL_API_KEY` — provided (rotate within 24h as agreed). Used for signup verification + support.
- [ ] Connect Meta ad account + approve test budget with kill criteria before any spend.
- [ ] Rotate the AgentMail + Apify keys pasted in chat once things are running.

---

## 5. Guardrails (non-negotiable)

- No paid spend before the W3 gate + owner approval (budget guard).
- No fabricated social proof, winner feeds, or inflated counters (competitor "static counter" tells are liabilities, not goals).
- No banned claims ever: generators, "no survey", Steam password asks, guaranteed $.
- Agents do not submit an owner's legal identity, tax, or payout info, or accept ToS on their behalf, without explicit authorization.
