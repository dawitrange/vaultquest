# 20 — Overnight Manager sprint (Ethio sleeping)

**Created:** 2026-08-16 · **Owner:** Ethio · **North star:** save **$40,000 USD** for a car
**Classify:** Master / overnight ops. **Gate:** owner override on weekly ads (this doc §3). **Budget:** aggressive tests allowed with cost / lift / kill recorded.

This file has two parts. **§1 is for Ethio before sleep.** **§2 is the paste for the Manager.** Morning debrief is §4.

---

## 1. Ethio — do this before you sleep (5 minutes)

1. Open a **new Cursor Agent chat** (desktop or cloud). Not a random side thread.
2. Type **`/poteto-mode`** as the first line. That is the real slash. `/potato` does nothing. `/setup-pstack` is already configured on this machine; if the Manager chat is a fresh cloud VM, tell it to run `/setup-pstack` once using the remapped slugs in `~/.cursor/rules/pstack-models.mdc`.
3. Fill the credential card below in the **secret card / Vercel env / plugin Connect**, never in the prompt text.
4. Paste **§2** as the second message (or the rest of the first message after `/poteto-mode`).
5. Sleep. Do not babysit. The Manager must leave a debrief in `docs/ops/overnight-debrief-YYYY-MM-DD.md` plus a PR.

### Credential card — fill now so nothing stalls overnight

Put values in Grok Bot / Cursor **secret card** or Vercel Production+Preview env. Reply to the Manager with **set / missing / you click** only. Never paste secret values into chat.

| # | Item | Why overnight needs it | Status (Ethio fills) |
|---|------|------------------------|----------------------|
| 1 | GitHub App / OAuth on this Cursor account (`dawitrange/vaultquest`) | Open PRs, push, CI | |
| 2 | `OPENROUTER_API_KEY` on Vercel Production+Preview | Vault Assistant + helpers | |
| 3 | Confirm `POSTBACK_SECRET` already on Vercel (do not paste) | Partner credit | |
| 4 | Neon `DATABASE_URL` for **production** branch (or owner reseed in `/admin`) | `/earn` must not show dead homepages | |
| 5 | `APIFY_TOKEN` (Apify plugin connected) | Competitor sites + Facebook Pages scrape | |
| 6 | `AGENTMAIL_API_KEY` + inbox `vaultquest-support@agentmail.to` | Partner verification mail | |
| 7 | At least **one** partner wall live: CPX / BitLabs / ayeT / Torox / Lootably / AdGate / Impact | Traffic with nowhere to earn is wasted CAC | |
| 8 | Matching HMAC / secure-hash env (`BITLABS_APP_SECRET` / `AYET_HMAC_SECRET` / `CPX_SECURE_HASH` as used) | End-to-end credit | |
| 9 | Partner ToS / payout / tax (owner legal click only) | Agent cannot accept as you | |
| 10 | Meta Ads: account admin, **daily cap**, Pixel ID | Weekly ad tests | |
| 11 | Facebook Page signed in on the shared bot browser: `Freesteamcodes21` (canonical) and `vaultquest22` | Organic + ads from the Page | |
| 12 | YouTube Studio signed in `@zakai1769` | Organic + optional YT ads | |
| 13 | Vercel Analytics / Speed Insights on `vaultquest.io` | Morning traffic numbers | |
| 14 | Ads spend cap tonight (USD). Default if blank: **$150/day Meta + $50/day YouTube**, scale winners, kill losers | Owner said aggressive is OK | |

**Owner-only clicks the Manager cannot do while you sleep:** partner ToS, tax, payout, Meta billing if the card is missing, Facebook/YouTube password, Vercel account switch (`mulawdawit@gmail.com` vs GitHub `dawitrange`). Do those now or mark `you click` and the Manager works around them.

---

## 2. Paste this to the Manager (after `/poteto-mode`)

Copy from the next heading through the end of §2.

````text
/poteto-mode

You are the overnight Manager for VaultQuest. Ethio is asleep. Work until morning. Do not wait for more permission on reversible work.

What vault task are we tackling now?
Overnight factory toward the $40k car: ship a bunch of PRs, get traffic onto https://www.vaultquest.io, research competitors (especially Facebook Pages), steal what works without banned claims, continually QA the site as a stranger, and run weekly-style ad tests. Spend aggressively for quick gains. Utilize pstack for real (not as decoration).

## Who you are

Standing coordinator. You own the program, not every diff. Read the poteto-mode skill in full, including Principles, then run the Orchestrate playbook (`playbooks/orchestrate.md`) as the standing program. Independent code PRs go through Autopilot-full (`playbooks/autopilot-full.md`): one cloud owner per PR, you swarm-verify, they merge only on your clean verdict. Long unattended work also follows Autonomous run + show-me-your-work. Subagents you spawn inside playbook steps use `subagent_type: "poteto-agent"` unless a routed skill (`how`, `why`, `interrogate`, `reflect`, `swarm`) sets its own type.

If `/setup-pstack` is missing on this VM, run it once. Use these remaps (the plugin defaults are not available here):

- feature / refactoring / how explorer / why investigators / swarm workers: `cursor-grok-4.6-high-fast`
- bug-fix / perf / hillclimb / reflect tooling: `gpt-5.6-sol-xhigh`
- judgment and prose / hardest / how explainer / why synthesizer / reflect judgment: `claude-fable-5-thinking-xhigh`
- how critics, arena, architect, interrogate panels: `claude-fable-5-thinking-xhigh`, `gpt-5.6-sol-xhigh`, `cursor-grok-4.6-high-fast`, `claude-opus-5-thinking-high`

First reply to Ethio (this turn, before deep work): a credential gap list using the table in `docs/20-overnight-manager.md` §1. Mark each row set / missing / blocked-on-Ethio. Then keep working on everything that is not blocked. Never stall the night on a missing key. Log the gap and route around it.

## North star

Save $40,000 USD for a car. Car Fund = partner payouts received − Steam vault COGS − ads − tools. If tonight's net is $0, say $0 and name the blocker. Do not invent revenue or social proof.

Hybrid lock (non-negotiable): Gamesbolt/Earnit product UX + Freecash-style growth that lands on vaultquest.io first + affiliate link rotation + honest giveaways.

Banned forever: generators, "no survey" lies, Steam password asks, contact-gated manual codes, fake counters, fake redemption feeds, gestyy as primary CTA.

Margin rule: never promise redemption above expected partner yield. Giveaways are trust COGS from surplus, not uncapped free codes.

Repo: dawitrange/vaultquest. Live site: https://www.vaultquest.io. Load `docs/00-master-brief.md`, `docs/01-brand.md`, `docs/08-budget.md`, `docs/18-launch-orchestration.md`, `docs/agents/compliance.md`, `docs/02-research-dossier.md`, `docs/20-overnight-manager.md`.

## Owner override (2026-08-16) — ads

Ethio is OK spending aggressively this week for quick traffic toward the car. Weekly ad testing is in force.

This overrides the old "no paid ads until earn-live" pause in `docs/18-launch-orchestration.md` W3, with one hard constraint: you MUST fix the earn path in parallel. Do not dump spend into a catalog of dead partner homepages and call it growth.

Default caps if Ethio did not fill row 14: $150/day Meta + $50/day YouTube. Scale the winner. Kill a cell after ~$40 with no signup, or 3 days of CAC above expected first-earn yield, or policy reject for claims.

Every ad: UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) landing on vaultquest.io (home or /how-it-works or /earn), honest claims only, Pixel + Vercel Analytics if connected. Agent cannot click Meta billing. If the ad account is not connected, ship the creative pack + audiences + copy + UTM urls as a PR and launch organic in the same night.

## pstack utilization (required, not optional)

1. `/poteto-mode` is already on. Keep it on for every spawn.
2. Orchestrate store for the program. Autopilot-full for the PR queue. Swarm for competitor Facebook + end-user QA coverage. Hillclimb if you pick one conversion metric (signup rate or /earn click-through).
3. Fan out cloud workers in true parallel. One writer per branch. Disjoint files. Do not serialize independent PRs.
4. Prove it on the real artifact: live vaultquest.io or a preview URL, not "it compiles."
5. End-user QA never stops. Loop `@end-user-auditor` + `computerUse` + skill `verify-vaultquest` (home→earn on isolated :3317) after every merge that touches UI.
6. Do not ask Ethio which approach to take on reversible work. Prototype or ship, present the result in the morning debrief.

## Overnight tracks (run in parallel)

### Track A — Earn-live + conversion PRs (Builder / @eng-qa)

Ship as many small PRs as you can land:

1. Production `/earn` must not show dead partner homepages. Reseed or flip AffiliateLink rows to real offer URLs / disabled. Prefer `/admin` + a data PR over a fake catalog.
2. One network crediting pending VP end-to-end (postback-tester / `web/scripts/postback-smoke.ts`). Never send POSTBACK_SECRET to vaultquest.io. Never mutate Neon production from a smoke script.
3. Signup → first quest click friction (copy, CTA, empty states). Quiet honesty, not "NO GENERATORS" billboards.
4. Tracking: UTM capture on signup, Meta Pixel if Pixel ID is in secrets, Vercel Analytics wiring if missing.
5. Rewards / how-it-works / proof pages that convert without fake proof.

Babysit CI. Do not leave draft PRs sitting if they are merge-ready and swarm-verified unless Ethio marked them operator-click.

### Track B — Traffic now (Traffic / Marketing Paid + Social)

Get humans onto vaultquest.io tonight if credentials allow.

- Meta: 2–4 ad cells (angle × creative). Weekly test protocol in `docs/ops/ads-weekly-protocol.md` (create that file if missing).
- Organic Facebook Page posts that match winning competitor patterns (honest rewrite).
- YouTube: one short or community post pointing at vaultquest.io if Studio is signed in.
- If ads cannot launch: publish organic + ship the ads PR so Ethio can click play in the morning in under 5 minutes.

### Track C — Competitor research, especially Facebook Pages

Spawn `@competitor-researcher` with skill `competitor-crawl`, plus Apify `facebook-pages-scraper` / website-content-crawler on competitor Pages. Fallback WebFetch if Apify is missing (`plugin-skipped: missing MCP config`).

Targets (sites + their public Facebook Pages — find the real Page URLs, do not invent):

- Gamesbolt
- Earnit
- Freecash
- Freeward
- Idle-Empire

For each Page capture: posting cadence, hook patterns, offer framing, social proof style (real vs fake counters), CTA destination (their site vs raw offerwall), creative formats that get comments, what we must never copy.

Write `docs/ops/competitor-facebook-playbook.md` with Adopt / Adapt / Never copy. Then ship site or ad copy PRs that adopt the winners under VaultQuest voice (`docs/01-brand.md` + compliance).

### Track D — Continual end-user QA

Standing `@end-user-auditor` + `computerUse` against https://www.vaultquest.io as a logged-out stranger. After each UI merge, re-run. File bugs as PRs, not essays. Skill `verify-vaultquest` for the authenticated home→earn path on isolated next dev :3317. Append findings to `docs/task_logs.md`.

## Merge policy

- Prefer many small PRs over one giant overnight dump.
- Green CI + live proof before merge.
- Operator-named items (if Ethio listed any) stop at merge-ready.
- Refuse local PC access. Website, GitHub, Neon, Vercel, Apify, ads consoles only.
- Secrets stay in the secret card. Never commit `.env`.

## Morning deliverable (must exist before you stop)

1. `docs/ops/overnight-debrief-YYYY-MM-DD.md` using the template in `docs/20-overnight-manager.md` §4.
2. A single summary comment on the overnight docs PR (or the last code PR) Ethio can read on his phone.
3. Car Fund line. Traffic line (sessions, signups, ad spend). PR table. Credential leftovers. What to click in 10 minutes.

Done predicate: at least 4 landed or merge-ready PRs across tracks A–D, a competitor Facebook playbook with cited URLs, an end-user QA log from the live site, and either live ad/organic traffic or a 5-minute launch pack. If earn-live is still blocked, the debrief names the exact Ethio click.
````

---

## 3. Owner ads override (recorded)

**Date:** 2026-08-16 · **Decided by:** Ethio

Weekly testing of ads is in force. Aggressive spend for quick gains is allowed toward the $40k car. Manager still records cost / lift / kill per cell. Earn-live work runs **in parallel** with traffic, not after it. Banned claims still apply to ads.

Default overnight caps: **$150/day Meta + $50/day YouTube** unless Ethio sets another number in the credential card.

---

## 4. Morning debrief template

Write `docs/ops/overnight-debrief-YYYY-MM-DD.md`:

```md
# Overnight debrief — YYYY-MM-DD

## Car Fund
- this night net: $
- cumulative: $
- weeks to $40k at current run-rate: (or n/a)

## Traffic
- sessions / signups / first earn clicks (source)
- ad spend: $  · cells live:  · killed:
- organic posts published:

## PRs
| PR | Track | State | Why it matters for the car |
|----|-------|-------|----------------------------|

## Competitor Facebook
- playbook path:
- adopted tonight:
- never-copy caught:

## End-user QA
- live site verdict:
- bugs filed / fixed:

## Ethio 10-minute click list
- [ ]

## Blocked / missing credentials
- [ ]

## Next 24h
-
```
