---
name: postback-tester
description: Tests Vaultquest /api/postback HMAC validation (BitLabs SHA1, ayeT) and tx deduplication. Use when postback or ledger integration needs verification.
---

# postback-tester

Exercises `POST /api/postback` with signed and unsigned callbacks. Invoked by @eng-qa.

## When to use
After changes to `web/src/app/api/postback/route.ts`, `web/src/lib/db.ts` ledger, or env `BITLABS_APP_SECRET` / `AYET_HMAC_SECRET`.

## How to run
```bash
pwsh .cursor/skills/postback-tester/scripts/test.ps1
pwsh .cursor/skills/postback-tester/scripts/test.ps1 -Help
bash .cursor/skills/postback-tester/scripts/test.sh
```
Flags: `-Help` prints cases without calling; `-BaseUrl http://localhost:3000` overrides target.

## What it does
1. Valid BitLabs signed callback → expects 200 + `hash=ok`
2. Bad hash → expects 401 or `hash=fail`
3. Duplicate `tx_id` → expects deduped 200 (no double credit)
4. Missing secret param variants → expects 401
5. Reports PASS/FAIL per case; requires dev server on `localhost:3000` for full run.

## Output contract
- Console per-case PASS/FAIL table
- Exit 0 all pass, 1 any fail
- `--help` mode requires no server

## Constraints
- Never sends real secrets to prod; use local env.
- Stage-only — do not trigger live network callbacks.
