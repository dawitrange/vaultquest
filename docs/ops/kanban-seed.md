# Kanban seed — VaultQuest · Car Fund

Use this to create the GitHub Project and the first issues. Labels and issue bodies are copy-paste ready.

**Repo:** `dawitrange/vaultquest`  
**Project name:** `VaultQuest · Car Fund`  
**WIP:** max 3 cards in **In Progress**.

### Seeded 2026-08-15 (live issues)

| # | Issue | Suggested column |
|---|-------|------------------|
| [#12](https://github.com/dawitrange/vaultquest/issues/12) | owner: set OPENROUTER_API_KEY on Vercel | Blocked (Ethio) |
| [#13](https://github.com/dawitrange/vaultquest/issues/13) | owner: reseed prod /earn links | Blocked (Ethio) |
| [#14](https://github.com/dawitrange/vaultquest/issues/14) | earn-live: one network crediting pending VP | This Week |
| [#15](https://github.com/dawitrange/vaultquest/issues/15) | site: production postback smoke | This Week |
| [#16](https://github.com/dawitrange/vaultquest/issues/16) | promo: queued FB + YT Community | Backlog (gated) |
| [#17](https://github.com/dawitrange/vaultquest/issues/17) | data: Vercel Web Analytics + which-link table | This Week |
| [#18](https://github.com/dawitrange/vaultquest/issues/18) | idea: first 3 monetization ideas | Backlog (gated) |

[#11](https://github.com/dawitrange/vaultquest/issues/11) is a write-access probe — **close it** (token could create issues but not close/comment/labels/projects).

**Still owner UI (API 403):** labels + Project v2. Create Project `VaultQuest · Car Fund` on github.com/dawitrange/vaultquest → Projects → New project → Board. Columns: `Backlog`, `This Week`, `In Progress`, `Blocked (Ethio)`, `Review`, `Done`. Add issues #12–#18. Create labels below, then apply them on each issue (names are also in the issue bodies).

If `gh` can write from your machine later:

```bash
# labels
for l in site promo data idea car-fund owner-needed gate:earn-live; do
  gh label create "$l" --repo dawitrange/vaultquest --force
done

# project (Projects v2 — owner user)
gh project create --owner dawitrange --title "VaultQuest · Car Fund"
```

---

## Labels

| Label | Color (suggested) | Use |
|-------|-------------------|-----|
| `site` | `#2dd4bf` | Builder |
| `promo` | `#c4a574` | Traffic |
| `data` | `#7dd3fc` | Yield |
| `idea` | `#c4b5fd` | Scout |
| `car-fund` | `#fbbf24` | Moves net toward $40k |
| `owner-needed` | `#fb7185` | Ethio must click |
| `gate:earn-live` | `#f97316` | Blocked until a prod postback credits VP |

---

## Issue 1 — Set OPENROUTER_API_KEY on Vercel

- **Labels:** `owner-needed` `car-fund`
- **Owner bot:** Manager (Ethio does the click)
- **Column:** `Blocked (Ethio)` → `This Week`

**Title:** `owner: set OPENROUTER_API_KEY on Vercel`

**Body:**

```md
## Owner bot
Manager (Ethio unblocks)

## Done-when
- `OPENROUTER_API_KEY` is set on the production Vercel project (plus credits).
- Vault Assistant is no longer hidden for missing-key (see PR #6 / #10 path).

## Why
Assistant + AI helpers (`web/src/lib/ai-helpers.ts`) stay dark without it. Not earn-live itself, but it is a 2-minute unblock from `docs/18-launch-orchestration.md`.

## Spend
none (existing OpenRouter account). Cost / lift / kill: n/a.

## Do not
Commit the key. Do not paste it into Grok Bot chat — secret card / Vercel env only.
```

---

## Issue 2 — Reseed prod AffiliateLink rows

- **Labels:** `owner-needed` `data` `gate:earn-live` `car-fund`
- **Owner bot:** Yield (Ethio runs seed or flips `/admin`)
- **Column:** `Blocked (Ethio)` → `This Week`

**Title:** `owner: reseed prod /earn links (no partner homepages)`

**Body:**

```md
## Owner bot
Yield + Ethio

## Done-when
- Production `/earn` does not send users to a partner **marketing homepage**.
- Each healthy `AffiliateLink` is a real wall/offer URL or `disabled`.
- Yield pastes before/after from `/admin` (id, url, health, category).

## Why
Dead homepage CTAs were the old-model failure mode (single/bad links). `docs/18-launch-orchestration.md` W2: `npm run db:seed` on prod `DATABASE_URL` **or** flip in `/admin`.

## Spend
none.

## Do not
Invent live placement URLs. If the network is not approved yet, set `disabled` / `unhealthy` rather than a homepage.
```

---

## Issue 3 — One self-serve network live + postback credits VP

- **Labels:** `owner-needed` `data` `gate:earn-live` `car-fund`
- **Owner bot:** Yield (Ethio: identity / payout / ToS)
- **Column:** `This Week` / `Blocked (Ethio)` for ToS steps

**Title:** `earn-live: one network crediting pending VP`

**Body:**

```md
## Owner bot
Yield; Ethio accepts ToS / tax / payout

## Done-when
- One of CPX / TimeWall / AdGate (or Lootably/Torox if already approved) is **healthy**.
- Postback URL `https://vaultquest.io/api/postback` is set at the network.
- A production (or Manager-approved test) postback creates **pending VP** with `availableAt` from `holdDays`.
- Yield certifies earn-live to Manager with evidence (tx id, ledger row, `/admin` funnel).

## Why
Without this, Traffic and paid ads waste CAC. Car fund stays $0.

## Spend
none to apply. Later Steam vault float is a separate proposal (`docs/agents/product-prd.md` §7) with cost/lift/kill.

## Do not
Bots must not submit Ethio’s legal identity or accept ToS as him.
```

---

## Issue 4 — Production smoke: click → postback → pending VP

- **Labels:** `site` `gate:earn-live` `car-fund`
- **Owner bot:** Builder (`@eng-qa` / `postback-tester`)
- **Column:** `This Week` (starts after or in parallel with issue 3 secrets)

**Title:** `site: production postback smoke (click → pending VP)`

**Body:**

```md
## Owner bot
Builder

## Done-when
- Offer click creates `OfferClick`.
- `/api/postback` accepts secret/HMAC; duplicate `tx_id` → 200 `{ok:true, duplicate:true}`.
- Ledger pending VP visible; `/admin` last-7d shows the credit.
- Notes which env vars were required (`POSTBACK_SECRET`, partner HMAC).

## Why
Certifies issue 3. Manager will not open Traffic posting without this.

## Spend
none.

## Spawn
`@eng-qa` skill `postback-tester`. Do not push secrets into the PR.
```

---

## Issue 5 — Queued FB + YT rebrand posts (gated)

- **Labels:** `promo` `owner-needed` `gate:earn-live`
- **Owner bot:** Traffic
- **Column:** `Backlog` until earn-live pass, then `This Week`

**Title:** `promo: post queued FB pinned + YT Community (after earn-live)`

**Body:**

```md
## Owner bot
Traffic; Ethio uploads logo/banner and may need to click Publish

## Done-when
- Logo PNG 800×800 + banner JPG 2560×1440 uploaded (`docs/15-rebrand-redesign.md` §8; delete SVG safe-guide rect before export).
- FB pinned + first-comment disclosure + YT Community posted from copy in `docs/task_logs.md` (2026-08-10 22:45).
- Links use UTM (`utm_source`, `utm_medium=organic`, `utm_campaign=rebrand-2026`).
- CTA is vaultquest.io, not raw CPA.

## Why
Rebrand has been queued since 2026-08-10. Posting before earn-live sends people to a product that cannot pay them.

## Spend
none (organic). Paid ads are a different issue and stay gated.

## Do not
Banned claims. Do not fake cashouts in Video 01 if earn-live is still blocked.
```

---

## Issue 6 — Vercel Web Analytics + which-link table

- **Labels:** `data` `site` `car-fund`
- **Owner bot:** Yield + Builder if code is needed
- **Column:** `This Week`

**Title:** `data: enable Vercel Web Analytics + first which-link click table`

**Body:**

```md
## Owner bot
Yield (enable + read); Builder only if `/admin` needs a code change

## Done-when
- Vercel Web Analytics enabled on the production project.
- Yield publishes a table: `AffiliateLink` id / partner / clicks today / credits (0 is allowed).
- Manager can paste sessions vs ledger into the Monday report without guessing.

## Why
We need data on which sites/offers work. Clicks without credits are not yield.

## Spend
none (Vercel Analytics is on-plan). Cost/lift/kill: n/a.
```

---

## Issue 7 — Scout: 3 ideas with kill criteria (queued)

- **Labels:** `idea` `car-fund`
- **Owner bot:** Scout
- **Column:** `Backlog` until earn-live, then Friday routine

**Title:** `idea: first 3 monetization ideas (queued until earn-live)`

**Body:**

```md
## Owner bot
Scout

## Done-when
- Exactly 3 ideas using the template in `docs/agents/grok-bots/scout.md`.
- Each has cost / lift / kill, hybrid fit (vaultquest.io first), banned-claim check.
- Manager parks or promotes. Scout does not ship.

## Why
Need people finding new ways to monetize — after the earn path exists so we do not distract Builder.

## Spend
none unless a crawl needs Apify credits (then cost/lift/kill + Ethio).

## Do not
Generators, contact-gated codes, sole-CTA to Freecash, casino.
```

---

## Suggested This Week cut (WIP ≤ 3 In Progress)

Start **In Progress** with at most:

1. Issue 2 (reseed) — if Ethio is at the keyboard
2. Issue 3 (one network) — Yield prep + Ethio ToS
3. Issue 4 (smoke) — Builder, unblocked as secrets land

Everything else stays This Week / Backlog / Blocked (Ethio). Issue 1 can complete in minutes and leave the WIP set.
