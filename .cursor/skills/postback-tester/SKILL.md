---
name: postback-tester
description: Tests Vaultquest /api/postback HMAC validation (BitLabs SHA1, ayeT), CPX MD5 secure_hash, and tx deduplication. Use when postback or ledger integration needs verification.
---

# postback-tester

Exercises `GET|POST /api/postback` with signed and unsigned callbacks, plus click → pending VP. Invoked by @eng-qa.

## When to use
After changes to `web/src/app/api/postback/route.ts`, `web/src/lib/postback.ts`, `web/src/lib/db.ts` ledger, or env `POSTBACK_SECRET` / `BITLABS_APP_SECRET` / `AYET_HMAC_SECRET` / `CPX_SECURE_HASH`.

## How to run
```bash
pwsh .cursor/skills/postback-tester/scripts/test.ps1
pwsh .cursor/skills/postback-tester/scripts/test.ps1 -Help
bash .cursor/skills/postback-tester/scripts/test.sh
bash .cursor/skills/postback-tester/scripts/test.sh --help
bash .cursor/skills/postback-tester/scripts/test.sh --offline
bash .cursor/skills/postback-tester/scripts/test.sh --probe-prod
bash .cursor/skills/postback-tester/scripts/test.sh --seed-local http://localhost:3000
```
Flags: `--help` prints cases without calling; `--probe-prod` public prod checks (no secrets); `--seed-local` localhost live credit; `--base-url` / first arg overrides target.

## What it does
1. Offline HMAC unit: strip `hash`, SHA1 + SHA256, fail-closed if hash present and no HMAC secret
2. Prod probe (optional): `/api/postback` without secret → 401/503; `/earn` CTAs; signed-out `GET /api/go/q-surveys` → `/login?from=earn` (no OfferClick). Never sends secrets. Do **not** GET `/api/go/q-freecash` on production from this runner until the all-QUESTS auth-gate is live (that hop still 307s to Freecash and writes `userId=null`). Verify q-freecash on preview/localhost.
3. Valid BitLabs signed callback → expects 200 + `hash=ok`
4. Bad hash → expects 401
5. Duplicate `tx_id` → expects HTTP 200 `{ok:true, duplicate:true}`
6. Missing secret → expects 401 or 503
7. Ledger PENDING + `availableAt` from quest `holdDays`; admin last-7d quoted as exact counts/fractions
8. Refuse marketing homepages (`adgatemedia.com/`, `www.cpx-research.com/`)
9. **CPX MD5:** official param is `secure_hash` = `md5(trans_id-appsecurehash)`. Fail-closed when `secure_hash` is present. `partner=cpx` with **no** HMAC `hash` must **not** 401 (Ethio’s current save). Do not put MD5 on `hash=` — current prod HMAC-checks `hash`.
10. **CPX status=2:** voids matching PENDING/POSTED EARN. Does **not** unwind REDEEM if already spent (flagged gap).
11. In-memory CPX replay uses the real handler to prove OfferClick claim + `credited=true` + one PENDING ledger row, including simultaneous same-transaction callbacks. User-only CPX binds only when that user has an uncredited `cpx-survey` click; otherwise the callback is write-free.
12. The Lab evidence join and CSV formatter prove the same OfferClick ID, ledger ID, credited state, VP state, and transaction ID are inspectable without a database write.
13. Flip watch: `--probe-prod` reads `/earn` and signed-out `/api/go/q-surveys` (login, no wall click). **Does not** hit `/api/go/q-freecash` on production (that would create a Freecash click until the auth-gate ships). After confirm, smoke path is **CPX / q-surveys only** — not Freecash, not a homepage.
14. Reports PASS/FAIL per case. `--help` and `--offline` need no server or database. Live credit needs localhost + env names below.

## Yield target: CPX (Yield is flipping — do not smoke yet)

- **AdGate** (`adgate-backup`) is **stalled (under review)**. Do not smoke `https://adgatemedia.com/`.
- **Ethio’s CPX postback test succeeded.** Live postback URL has **no `hash=`**.
- **Yield is flipping `cpx-survey`.** Do not smoke until Yield confirms the `/admin` flip.
- After confirm, smoke path is **CPX / `q-surveys` only** — not Freecash, not a homepage. No invented URL.
- CPX MD5 (`md5(trans_id-appsecurehash)` on official `secure_hash`) stays in this PR for later signed posts. Do **not** require `hash=` on the live URL while prod still HMAC-checks `hash`.
- **Not earn-live** until a production pending VP credit is visible.
- Freecash path + duplicate smoke is **not Yield** and **not earn-live**.

## Env names required for live credit (never commit or log values)
- `POSTBACK_SECRET`
- `BITLABS_APP_SECRET` or `AYET_HMAC_SECRET` (partner HMAC)
- `CPX_SECURE_HASH` or `CPX_APP_SECRET` (CPX MD5)
- `DATABASE_URL` (local or Neon **branch**, not a prod write)
- `POSTBACK_SMOKE_ALLOW_DB=1` (set by `--seed-local`)

## Output contract
- Console per-case PASS/FAIL table
- Exit 0 all pass, 1 any fail
- `--help` mode requires no server
- Live URLs in logs have `secret` / `hash` redacted

## Constraints
- Never sends real secrets to prod; use local env.
- Stage-only — do not trigger live network callbacks.
- Positive S2S credit requires an existing OfferClick. Never treat a clickless ledger row as a successful Lab case.
- Smoke AffiliateLink is first-party `https://www.vaultquest.io/proof` — do not invent partner placement URLs.
- Never smoke marketing homepages. Never flip `/admin`. Never hardcode a CPX wall URL.
