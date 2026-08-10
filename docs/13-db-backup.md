# 13 — DB Backup & Recovery — VaultQuest (DB Guardian)

**Owner:** @db-guardian (fallback + DB master) · **Stack:** Prisma 6 · Postgres Neon · `DATABASE_URL`

## Strategy (zero spend until approved)

| Trigger | Action | Where |
|---|---|---|
| **Daily 02:00 UTC** | `createNeonBranch(daily-YYYY-MM-DD)` + `exportLedgerSnapshot()` + `verifyBackup()` | `web/src/lib/backup.ts` + cron |
| **Pre-migration** | `createNeonBranch(pre-migrate-<sha>)` before `prisma migrate deploy` | manual / CI hook |
| **On-demand** | `@db-guardian backup now` or `npm run backup:verify` | local/CI |

**Neon branching is free** on Neon Free tier (keeps point-in-time copies without extra storage billing). Retain last 3 daily + last 3 pre-migrate branches; delete older via Neon API or dashboard. Local JSON snapshots write to `web/.backup/` (gitignored) — no remote storage cost.

## Helpers

- `web/src/lib/backup.ts` — `createNeonBranch(prefix)`, `exportLedgerSnapshot({outDir})`, `verifyBackup()`. If `NEON_API_KEY`/`NEON_PROJECT_ID` missing, logs `neon-skipped` and returns ok. If `DATABASE_URL` missing, snapshot/verify skip with PASS (build-safe).
- `web/scripts/verify-backup.ts` — read-only smoke: counts 6 tables, groups `LedgerEntry` by `status`, checks orphan `clickId`, samples `computeBalance` on 5 users. Run via `npm run backup:verify`.

## Verification

1. `npx prisma validate` — schema ok
2. `npx prisma generate` — client fresh
3. `npm run backup:verify` — counts + invariants
4. `npm run build` — 19 routes

`verifyBackup()` is read-only — safe on prod.

## Restore Drill (quarterly, propose before running on prod)

1. Pick latest `daily-*` branch in Neon dashboard → create child branch `restore-drill-YYYY-MM-DD`.
2. Point isolated `DATABASE_URL` at drill branch, run `npx prisma migrate deploy`, `npm run backup:verify`, `npm run build`, postback smoke (`/api/postback?secret=...&click_id=...&vp=...` with HMAC).
3. Document RTO (time to promote branch) and RPO (max data loss = 24h or since last pre-migrate branch).
4. Tear down drill branch.

## Env

- Required: `DATABASE_URL`
- Optional (enables real Neon branches): `NEON_API_KEY`, `NEON_PROJECT_ID` (from Neon console → Project settings → API keys)
- Without Neon keys, daily job still logs snapshot counts and PASSes — so CI stays green pre-provisioning.

## Cron (Vercel — when wired)

Add to `web/vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/backup", "schedule": "0 2 * * *" }] }
```
Route `web/src/app/api/cron/backup/route.ts` should call `createNeonBranch("daily")`, `exportLedgerSnapshot`, `verifyBackup` and require `CRON_SECRET` header.

## Cost / Lift / Kill

- **Cost:** $0 today (Neon branching free, local snapshots gitignored, `verifyBackup` is 6 `COUNT(*)` + one `GROUP BY`). Remote object storage (e.g., Neon PITR export to R2/S3) only if owner approves — propose with cost before enabling.
- **Lift:** RPO 24h → ~hours after first incident; prevents ledger loss (VP liability). Keeps verification posture with partners (postback audit trail).
- **Kill criteria:** If daily job errors 3× without `DATABASE_URL`/`NEON_API_KEY` (i.e., env not wired), keep skipped PASS and re-propose after env provisioned. If counts drift or `balanceSampleOk=false`, escalate to @eng-qa + @vault-planner before any migration.

## npm scripts (add to `web/package.json`)

```json
"backup:verify": "npx tsx scripts/verify-backup.ts",
"backup:branch": "npx tsx -e \"import('./src/lib/backup').then(m=>m.createNeonBranch(process.argv[1]||'manual').then(r=>console.log(r)))\""
```
