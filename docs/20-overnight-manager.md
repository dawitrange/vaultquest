# 20 — Overnight Manager brief

**Role:** Overnight Manager (orchestrator / `@vault-planner` when that agent is on). Keep the pipe honest, the ledger true, and the morning short.

**Hybrid lock:** Gamesbolt / Earnit UX + Freecash-style growth on **vaultquest.io first**.

**This file is paper.** No secrets in git. No site-code changes from this brief. Do not merge your own PRs unless the owner said to.

**Related:** `docs/00-master-brief.md`, `docs/08-budget.md`, `docs/18-launch-orchestration.md`, `docs/ops/ads-weekly-protocol.md`, `docs/ops/overnight-debrief-YYYY-MM-DD.md`.

---

## §1 — Credential table

Never paste values. Mark holder + where it lives + what the agent may do. If status is unknown, write **unknown — do not invent**.

| Credential | Holder | Where it lives | Agent may | Notes |
|------------|--------|----------------|-----------|-------|
| **GitHub** | Owner (dawitrange) + agents via PRs | `github.com/dawitrange/vaultquest` | Branch, commit, push, open **draft** PRs | Do not merge unless owner asked. No force-push to `main`. |
| **Vercel** | Owner | Vercel project for `www.vaultquest.io` | Read deploy/logs if MCP is authed; do not rotate env | Production host is **www**. Apex 308s — do not treat apex as the postback host. |
| **Neon** | Owner | `DATABASE_URL` on Vercel (and local `.env`, never committed) | Read / isolated branch for smoke when asked | No prod destructive SQL. No connection strings in PRs or chat logs. |
| **POSTBACK_SECRET** | Owner | Vercel env; shared with walls | Confirm *presence* (e.g. 401 on wrong secret). Never print the value | First gate on `/api/postback`. Do not put in URLs in docs. |
| **CPX** | Owner publisher account | CPX dashboard + Vercel `CPX_*` / secure-hash env | Map macros; never invent wall URLs | Postback host **must** be `www.vaultquest.io`. Known app_id in task logs is owner-confirmed; do not invent a new one. |
| **Meta billing** | **Owner only** | Meta Business / Ads Manager / Page boost pay wall | **Cannot click billing.** May queue copy and record a block | Unpaid balance = stop paid. See ads protocol. |
| **Facebook Page** | Owner | Page for VaultQuest / legacy Freesteamcodes21 | Draft posts; do not rename or boost-pay | Age proof (Dec 26, 2020) stays public. Rename is Facebook UI only. |
| **YouTube Studio** | Owner | https://www.youtube.com/@zakai1769 | Draft titles/thumbs/scripts | Rebrand to VaultQuest; no generator titles. Agent does not publish as the channel unless asked. |
| **YouTube ads** | Owner | Google Ads / YouTube | Draft campaigns; **cannot** click billing | Default cap **$50 / day**. Kill rules in `docs/ops/ads-weekly-protocol.md`. |
| **Apify** | Owner | `APIFY_TOKEN` in local/OS env / MCP | Crawl public pages when token is present | `plugin-skipped: missing MCP config` if unset. No tokens in git. |
| **AgentMail** | Owner | `AGENTMAIL_API_KEY`; inbox `vaultquest-support@agentmail.to` | Read/send support + verification mail if MCP authed | No internal leaks (`POSTBACK_SECRET`, HMAC, env, `/api/postback` raw). |
| **OpenRouter** | Owner | `OPENROUTER_API_KEY` on Vercel | Use helpers already in product; do not raise the daily cap | Default helper cap in `docs/08-budget.md`. Kill switch is owner. |
| **Meta Pixel** | Owner | Meta Events Manager → site | Do not invent a pixel ID | If not confirmed installed, leave ads without event optimization. |
| **Vercel Analytics** | Owner | Vercel project → Analytics | Read if MCP/dashboard access exists | Do not invent session counts. Traffic lines in the debrief stay TBD until Manager fills them. |
| **Ad caps** | Policy + Owner | This table + ads protocol | Enforce; never raise | Defaults: **$150 / day Meta** + **$50 / day YouTube**. Owner can change after cost / lift / kill. |

**Hard rule:** if a cell needs a secret to “just work,” stop and ask the owner. Overnight work is docs, PRs, and kill recommendations — not credential fishing.

---

## §2 — Overnight authority

**Do**

- Open paper PRs (docs only) when asked. Leave them unmerged.
- Record known ledger / rotator / billing facts in that night’s debrief.
- Pause or *recommend* pause on ads that hit kill lines (if pause access exists).
- Keep claims honest. Hybrid lock stays on.

**Do not**

- Change site code unless the owner’s task is explicitly Eng.
- Click Meta / YouTube / Google **billing**.
- Merge to `main`.
- Invent revenue, CAC, member counts, competitor Facebook URLs, or pixel IDs.
- Say “we’re live, start earning” until Manager says so.
- Land postbacks or ads on apex `vaultquest.io`.

---

## §3 — Spend

Paid is gated: landing MVP + claims policy + at least one crediting earn path + owner OK (`docs/07-orchestration-roadmap.md`, `docs/18-launch-orchestration.md` W3, `docs/08-budget.md`).

Every spend proposal: **cost / lift / kill**. Defaults and kill lines: `docs/ops/ads-weekly-protocol.md`.

If a boost is queued and billing is unpaid, the overnight note is “blocked,” not “spent.”

---

## §4 — Morning debrief template

Copy to `docs/ops/overnight-debrief-YYYY-MM-DD.md`. Fill **known facts only**. Leave a line **TBD** rather than guess.

```md
# Overnight debrief — YYYY-MM-DD

**Manager (morning):** <name / TBD>
**Overnight:** <agent or human>
**Hybrid lock:** Gamesbolt/Earnit UX + Freecash-style growth on vaultquest.io first — unchanged.

## Car Fund / cash
- Tonight net: <$>
- Partner payout received: <yes $X / no>
- Notes: <no invented revenue>

## Pipe / ledger
- Postback host: www.vaultquest.io (apex 308s — do not use apex)
- New credits: <PENDING/POSTED, VP, id, tx, clickId, availableAt — or none>
- Holds / voids: <or none>

## Rotator
- Healthy: <slugs>
- Disabled / homepage / not live: <slugs or “all others”>

## Ads / billing
- Meta billing: <current / unpaid $X / held $X>
- Queued spend: <e.g. $20 FB boost — blocked or live>
- Caps in force: $150/day Meta + $50/day YouTube (unless Owner changed)
- Cells killed overnight: <or none>
- Agent clicked billing?: no

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
- <list or none>

## Asks for Manager
- <list>
```

Fill the dated file the same night. Do not wait for morning numbers you do not have.
