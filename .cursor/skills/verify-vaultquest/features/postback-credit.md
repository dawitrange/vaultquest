# Postback credit

Partners credit Vault points over S2S `/api/postback`. The user does not see this URL; they see pending VP on `/account` after a quest. This feature proves the credit boundary without teaching internal setters as the user path.

## Sub-features

- `postback-unconfigured` without `POSTBACK_SECRET` does not silently credit (503 or skip).
- `postback-prod-probe` public production checks never send secrets.
- `postback-local-credit` on a verify DB: click → postback → pending VP (issue #15).
- `postback-duplicate` same `tx_id` does not double-credit.
- `postback-click-required` rejects positive callbacks that cannot bind an existing OfferClick.

## How to get to it (user POV)

- User: **Start quest** on `/earn` (tracked `/api/go/<questId>`), complete the partner offer, later see pending VP on `/account`.
- Operator/agent: `web/scripts/postback-smoke.ts` for the S2S half. Do not call admin APIs as a stand-in for the user.

## Driving it with verify-vaultquest

Preconditions:

- Secrets stay in env: `POSTBACK_SECRET` (and HMAC names if testing BitLabs/ayeT). Never print them.
- Live credit: non-production `DATABASE_URL` and `POSTBACK_SMOKE_ALLOW_DB=1` as required by the smoke script.
- Local server launched (this skill’s port or `localhost:3000` as the smoke `--base-url`).

- **Help / offline.** From repo root: `bash .cursor/skills/postback-tester/scripts/test.sh --help`. Exit 0. No secret values in stdout.
- **Isolated replay.** From repo root: `bash .cursor/skills/postback-tester/scripts/test.sh --offline`. The real handler runs against an in-memory stand-in and must show one bound OfferClick, `credited=true`, one PENDING ledger row, and one duplicate result for simultaneous same-transaction callbacks.
- **Prod probe (no secrets).** `bash .cursor/skills/postback-tester/scripts/test.sh --probe-prod`. Must not POST secrets to vaultquest.io.
- **Local credit (optional).** After launch: `(cd web && npx tsx scripts/postback-smoke.ts --base-url http://127.0.0.1:3317)` with env as in the script header. Expect click row + pending ledger, duplicate `tx_id` → `{ duplicate: true }` or equivalent PASS.
- **User-visible follow-up.** Sign in on the verify instance and open `/account`. Pending VP matches the credited amount (or skip if credit case was not run).
- **Admin evidence.** Sign in as an admin and open `/admin` → **S2S Postback Lab**. A valid bound credit reads `BOUND_CREDITED`, shows the same OfferClick and LedgerEntry IDs, `credited=true`, stored ledger status, effective availability, and `availableAt`. Download the same read-only rows from `/api/admin/postback-lab.csv`.
- **Proof.** Save smoke stdout to `artifacts/postback-credit/smoke.txt` (redact any secret if a tool leaked one).

## Gotchas

- `POSTBACK_SECRET` on Vercel is marked Sensitive — you cannot copy it out. Local verify uses a **different** value in the verify env, or the value you still have in a password manager.
- BitLabs/ayeT `hash=` uses `BITLABS_APP_SECRET` / `AYET_HMAC_SECRET`, not `POSTBACK_SECRET`.
- First-party smoke link to `/proof` is isolate scaffolding, not a live offerwall. Do not call that “partner paid”.
- Admin/CSV rows prove database linkage and credit state only. They do not prove that a partner accepted or paid a conversion.
- Never use `--base-url https://www.vaultquest.io` with a secret.
