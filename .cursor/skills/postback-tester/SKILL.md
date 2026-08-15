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
bash .cursor/skills/postback-tester/scripts/test.sh --probe-prod
bash .cursor/skills/postback-tester/scripts/test.sh --seed-local http://localhost:3000
```
Flags: `--help` prints cases without calling; `--probe-prod` public prod checks (no secrets); `--seed-local` localhost live credit; `--base-url` / first arg overrides target.

## What it does
1. Offline HMAC unit: strip `hash`, SHA1 + SHA256, fail-closed if hash present and no HMAC secret
2. Prod probe (optional): `/api/postback` without secret → 401/503; `/earn` CTAs — never sends secrets
3. Valid BitLabs signed callback → expects 200 + `hash=ok`
4. Bad hash → expects 401
5. Duplicate `tx_id` → expects HTTP 200 `{ok:true, duplicate:true}`
6. Missing secret → expects 401 or 503
7. Ledger PENDING + `availableAt` from quest `holdDays`; admin last-7d quoted as exact counts/fractions
8. Refuse marketing homepages (`adgatemedia.com/`, `www.cpx-research.com/`)
9. **CPX MD5 hook:** `md5(trans_id-CPX_SECURE_HASH)` vs `hash`/`secure_hash`. Fail-closed if secret, trans_id, or hash missing/mismatch. Live happy path only on localhost when `CPX_SECURE_HASH` is set. Earn-live is **not** certified.
10. Reports PASS/FAIL per case. `--help` needs no server. Live credit needs localhost + env names below.

## Yield target: CPX (AdGate stalled)

- **AdGate** (`adgate-backup`) is **stalled (under review)**. Do not smoke `https://adgatemedia.com/`.
- **Next network: CPX** (`cpx-survey`). Still **disabled** at `https://www.cpx-research.com/` (homepage). Do **not** smoke that URL. Do **not** flip `/admin`.
- When Ethio sends a real `offers.cpx-research.com` or `wall.cpx-research.com` URL **with his app_id**, **Yield** writes the `/admin` flip. Do not invent that URL here.
- After that flip, smoke with MD5 as `/api/postback` requires. Until then, do not smoke production against a homepage.
- `POSTBACK_SECRET` is already set on Vercel. That gate alone is **not** enough for CPX — also need `CPX_SECURE_HASH`.
- **Hook ready ≠ earn-live.** WIP stays 2/3. Do not certify earn-live.
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
- Smoke AffiliateLink is first-party `https://www.vaultquest.io/proof` — do not invent partner placement URLs.
- Never smoke marketing homepages. Never flip `/admin`. Never invent a CPX wall URL.
