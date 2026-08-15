---
name: postback-tester
description: Tests Vaultquest /api/postback HMAC validation (BitLabs SHA1, ayeT) and tx deduplication. Use when postback or ledger integration needs verification.
---

# postback-tester

Exercises `GET|POST /api/postback` with signed and unsigned callbacks, plus click → pending VP. Invoked by @eng-qa.

## When to use
After changes to `web/src/app/api/postback/route.ts`, `web/src/lib/postback.ts`, `web/src/lib/db.ts` ledger, or env `POSTBACK_SECRET` / `BITLABS_APP_SECRET` / `AYET_HMAC_SECRET`.

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
8. AdGate macros `{s1}` / `{points}` / `{payout}` / `{conversion_id}`; refuse marketing homepages (`adgatemedia.com/`)
9. CPX `secure_hash` MD5 is **not** verified — tester flags this and the route returns 501. Do not smoke CPX unless asked.
10. Reports PASS/FAIL per case. `--help` needs no server. Live credit needs localhost + env names below.

## AdGate production smoke (Yield + Ethio)
Target: `adgate-backup`. Still **disabled** at `https://adgatemedia.com/` (homepage). Do **not** smoke that URL.
1. Ethio pastes a real AdGate Rewards wall/embed URL and confirms `POSTBACK_SECRET` on Vercel.
2. Yield flips `/admin` (`url` + `healthy`). Do not invent the wall URL here.
3. Prefer AdGate **Test Mode** convert-on-click if available.
4. Then: signed-in click → `/api/postback` with template (secret is a placeholder, never commit a value):
   `https://vaultquest.io/api/postback?secret=…&click_id={s1}&user_id={s1}&vp={points}&payout_usd={payout}&tx_id={conversion_id}&partner=adgate`

## Env names required for live credit (never commit or log values)
- `POSTBACK_SECRET`
- `BITLABS_APP_SECRET` or `AYET_HMAC_SECRET` (partner HMAC)
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
- Never smoke `adgatemedia.com/` or other marketing homepages. Stay on AdGate; do not switch to CPX unless asked.
