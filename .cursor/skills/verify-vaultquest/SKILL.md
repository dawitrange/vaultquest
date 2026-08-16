---
name: verify-vaultquest
description: Drive the VaultQuest Next.js site (web UI at vaultquest.io / local next dev) the way a user does — launch, doctor, exercise mapped features, capture proof. Use after UI/auth/earn/postback changes, before claiming earn-live, or when asked if the site actually works.
---

# verify-vaultquest

Project-local control skill for **VaultQuest** (`web/` Next.js 16 App Router). Primary surface is the **web UI**. Secondary: S2S `/api/postback` (partner, not a user click) via existing `web/scripts/postback-smoke.ts`. CLI is not a user surface.

Read this file cold, then the matching file under `features/`. Do not invent selectors or routes.

## Interview (repo facts)

| | |
|--|--|
| **Surface** | Public web: `/`, `/about`, `/how-it-works`, `/earn`, `/rewards`, `/giveaways`, `/proof`, `/contact`, `/signup`, `/login`. Auth `/account`, `/admin`. |
| **Run** | `cd web && npm run dev` (Next default **3000**). Needs `DATABASE_URL` (Postgres/Neon), `AUTH_SECRET`. Optional `POSTBACK_SECRET`, `ADMIN_EMAIL`. See `web/.env.example`. Seed: `npm run db:seed`. |
| **Drive** | No Playwright/Cypress in-repo. Public pages are SSR — `curl` of HTML is the user-visible document. Prefer Cursor browser / computer-use when clicking. Quest start is `GET /api/go/<questId>` (307). Postback: `npx tsx scripts/postback-smoke.ts` from `web/`. |
| **Observe** | HTML/ARIA text, HTTP status, screenshots if a browser is available, `OfferClick` / ledger rows, smoke JSON. |
| **Isolate** | Two `next dev` instances need different ports. Share one Postgres unless you set a **non-production** `DATABASE_URL` (Neon branch `issue-15-postback-smoke` / `br-damp-paper-ayhl81at` is for smoke; **production** `br-lively-morning-aydx8h4v` is not for signup/postback mutations). Never send `POSTBACK_SECRET` to `vaultquest.io`. |

## Launch

Default verify bind: **`http://127.0.0.1:3317`** so a human `localhost:3000` is not stolen.

```bash
export VERIFY_PORT="${VERIFY_PORT:-3317}"
export AUTH_URL="http://127.0.0.1:${VERIFY_PORT}"
# DATABASE_URL and AUTH_SECRET must already be in the environment (not in git).
bash .cursor/skills/verify-vaultquest/scripts/launch.sh
```

**Ready:** log line `Ready` **or** `curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:3317/` returns `200`.

PID file: `/tmp/vq-verify-${VERIFY_PORT}.pid` (not under `artifacts/`).

If `web/node_modules` is missing, launch runs `npm ci` in `web/`.

Production fallback for **read-only public pages only**: `https://www.vaultquest.io` — never mutate (no signup, no postback with secrets).

## Doctor

```bash
bash .cursor/skills/verify-vaultquest/scripts/doctor.sh
```

Pass when: PID file exists, that PID is alive, port 3317 (or `$VERIFY_PORT`) answers `200`, body contains `VaultQuest`. Fail and stop driving if doctor fails.

Against production, skip the PID check: `VERIFY_BASE_URL=https://www.vaultquest.io bash .cursor/skills/verify-vaultquest/scripts/doctor.sh --public`.

## Drive

Harness: `scripts/drive-home-earn.sh` plus browser clicks documented in `features/`. Stable handles:

- Home logo link: accessible name `VaultQuest — home`
- Primary nav: `aria-label="Primary"` — links **About**, **How it works**, **Earn**, **Rewards**, **Giveaways**, **Proof & Rules**, **Contact**
- Home primary CTA: visible text **See quests** → `/earn`
- Header when signed out: **Sign in** → `/login`, **Sign up** → `/signup`
- Login: heading **Sign in**; fields **Email**, **Password**; submit **Sign in**
- Signup: heading **Create account**; **Name**, **Email**, **Password**; required age checkbox; submit **Create account**
- Earn: heading **Earn**; quest CTA **Start quest** → `/api/go/q-offerwall` (or `Not available yet` if rotator empty). Signed-out GET `/api/go/q-freecash` (and every other QUESTS hop) must 307 `/login?from=earn`, same as surveys. Do not follow that hop on production until the auth-gate is live.
- Banned on every page: generator claims, “no survey” as a lie, Steam password asks

Feature recipes: `features/README.md`.

## Evidence

Directory: `.cursor/skills/verify-vaultquest/artifacts/<feature-id>/`

Proof standards:

- Exercise the real user path (home CTA, nav, forms, `/api/go/…`), not admin-only setters.
- Capture **action + resulting state** (request URL + status + distinctive body text), not only a final screenshot.
- Side effects: signup → `User` row; quest start → `OfferClick`; postback → pending ledger. Use a non-prod DB for those.
- Mocks only at the partner network boundary (postback-smoke first-party `/proof` URL is an allowed isolate, not a fake user feed).

Do not treat `vault-build-check` (`next build`) as user-path proof.

## Cleanup

```bash
bash .cursor/skills/verify-vaultquest/scripts/cleanup.sh
```

Kills **only** the PID in `/tmp/vq-verify-${VERIFY_PORT}.pid`. Does **not** delete `artifacts/`. Does not `pkill node` / `pkill next`.

## Helpers

All executable; run from **repo root**.

| Script | Purpose |
|--------|---------|
| `scripts/launch.sh` | `npm ci` if needed, `prisma generate`, `next dev -p $VERIFY_PORT`, wait for 200, write PID |
| `scripts/doctor.sh` | PID + HTTP 200 + `VaultQuest` in body (`--public` skips PID) |
| `scripts/drive-home-earn.sh` | User path `/` → `/earn`; writes artifacts |
| `scripts/drive-go-auth.sh` | Signed-out GET `/api/go/q-freecash` (and other QUESTS) → login; refuses production |
| `scripts/cleanup.sh` | Stop the launched instance only |

```bash
bash .cursor/skills/verify-vaultquest/scripts/launch.sh
bash .cursor/skills/verify-vaultquest/scripts/doctor.sh
bash .cursor/skills/verify-vaultquest/scripts/drive-home-earn.sh
bash .cursor/skills/verify-vaultquest/scripts/drive-go-auth.sh
bash .cursor/skills/verify-vaultquest/scripts/cleanup.sh
```

Postback (existing, do not fork): `bash .cursor/skills/postback-tester/scripts/test.sh --help`

## Related (not this skill)

- `vault-build-check` — compile only
- `postback-tester` / `web/scripts/postback-smoke.ts` — HMAC + optional local credit
- `site-audit` — trust copy, not a running user session
