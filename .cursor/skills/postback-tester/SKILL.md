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
9. **CPX MD5:** official param is `secure_hash` = `md5(trans_id-appsecurehash)`. Fail-closed when `secure_hash` is present. `partner=cpx` with **no** HMAC `hash` must **not** 401 (Ethio’s current save). Do not put MD5 on `hash=` — current prod HMAC-checks `hash`.
10. **CPX status=2:** voids matching PENDING/POSTED EARN. Does **not** unwind REDEEM if already spent (flagged gap).
11. Flip confirmed: Yield flipped `cpx-survey` healthy. `--probe-prod` reads `/earn` only. **Does not** hit `/api/go/q-surveys` again (click-half already done: `cmsv1k67w0003jx04ykpzrfn9`). Signed postback waits on Vercel — secret off chat.
12. Reports PASS/FAIL per case. `--help` needs no server. Live credit needs localhost + env names below.

## Yield target: CPX (flipped — click-half done)

- **Yield HAS flipped `cpx-survey`** healthy: `https://offers.cpx-research.com/index.php?app_id=35413` (`dce672bc-f0c3-407c-9176-4b1df5448664`).
- Click-half done: `GET /api/go/q-surveys` → 307, OfferClick `cmsv1k67w0003jx04ykpzrfn9` (userId null, credited false). **Do not fire another go.**
- Signed postback fire is **waiting on Vercel**. `POSTBACK_SECRET` stays off chat.
- Live postback URL has **no `hash=`**. CPX MD5 stays in this PR for later signed posts. Do not require `hash=` while prod HMAC-checks `hash`.
- Ledger pending EARN still **0**. Demo 500 + REDEEM 500 only. **Not earn-live.**
- Do not smoke Freecash or a homepage. AdGate remains stalled.

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
- Never smoke marketing homepages. Never flip `/admin`. Never hardcode a CPX wall URL.
