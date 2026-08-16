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

### W3 — Marketing / Facebook
- **Do:** campaign assets (angles, creative, audiences, budget, tracking) **and** launch weekly tests when the ad account is connected. Competitor Facebook playbook: steal cadence/hooks that convert, never fake counters or banned claims. Protocol: `docs/ops/ads-weekly-protocol.md`.
- **Gate (updated 2026-08-16, owner override):** Ethio approved aggressive weekly ad tests toward the $40k car. Claims policy on the live landing still binds. Earn-live (W2) runs **in parallel** — do not scale spend into dead partner-homepage `/earn` links. Overnight factory prompt: `docs/20-overnight-manager.md`.
- **Budget guard:** each cell still needs cost / lift / kill. Default caps $150/day Meta + $50/day YouTube unless Ethio sets another number. The agent cannot click Meta billing or accept partner ToS.

---

## 3. Critical path to first Facebook traffic

Earn-live still matters (dead `/earn` burns CAC). Owner override 2026-08-16 runs ads **in parallel** with that fix. Overnight factory: `docs/20-overnight-manager.md`.

1. **(Owner, minutes)** `OPENROUTER_API_KEY` on Vercel. Reseed or disable dead `/earn` links. Meta Ads admin + daily cap. Facebook Page + YouTube Studio signed in on the bot browser.
2. **(Agent + owner)** One provider crediting VP. Agent cannot accept ToS/tax/payout as Ethio.
3. **(Agent, overnight)** PRs + competitor Facebook playbook + end-user QA + weekly ad cells (or a 5-minute launch pack if billing is not connected).
4. **Morning** read `docs/ops/overnight-debrief-YYYY-MM-DD.md`. Click the 10-minute list. Scale winners.

---

## 4. Owner action checklist (unblocks everything)

- [ ] `OPENROUTER_API_KEY` on Vercel (+ credits) — assistant.
- [ ] Reseed prod DB or disable stale links — `/earn` dead links.
- [ ] Provide identity/payout details (or complete those signup steps yourself) for provider approvals — agent cannot submit legal/tax/ToS as you.
- [ ] `AGENTMAIL_API_KEY` — used for signup verification + support.
- [ ] Connect Meta ad account + set a daily cap (default $150 Meta / $50 YouTube if unset). Pixel ID if you have one.
- [ ] Sign in Facebook Page + YouTube Studio on the shared bot browser.
- [ ] Overnight Manager: `/poteto-mode` then paste `docs/20-overnight-manager.md` §2.

---

## 5. Guardrails (non-negotiable)

- Paid spend: owner override 2026-08-16 allows weekly tests; still no banned claims, no fake proof, and no scaling into a broken earn path.
- No fabricated social proof, winner feeds, or inflated counters (competitor "static counter" tells are liabilities, not goals).
- No banned claims ever: generators, "no survey", Steam password asks, guaranteed $.
- Agents do not submit an owner's legal identity, tax, or payout info, or accept ToS on their behalf, without explicit authorization.
