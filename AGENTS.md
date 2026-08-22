# AGENTS.md

VaultQuest is a single Next.js 16 (App Router) full-stack app living entirely in `web/`. It serves both the UI and the API routes (`web/src/app/api/*`) from one process, backed by PostgreSQL via Prisma. See `README.md` and `docs/00-master-brief.md` for product context.

## Cursor Cloud specific instructions

The app lives in `web/` — run all app commands from there. Node 22 + npm (lockfile is `web/package-lock.json`). Standard scripts are in `web/package.json`: `npm run dev`, `npm run build`, `npm run lint` (note: `lint` runs `eslint` directly — `next lint` was removed in Next 16), `npm run db:migrate`, `npm run db:seed`.

Dependencies are refreshed automatically by the startup update script (`cd web && npm install`, which also runs `prisma generate` via `postinstall`). The items below are the non-obvious startup steps that update script does NOT do.

### Database (required, not auto-started)
- The app needs PostgreSQL and a `DATABASE_URL`; there is **no** `.env.example` and `.env*` is gitignored, so `web/.env` must exist locally.
- PostgreSQL 16 is installed but the service is **not auto-started** on boot. Start it with: `sudo pg_ctlcluster 16 main start`.
- Local dev role/db used during setup: role `vault` / password `vault`, database `vaultquest`. Recreate if missing:
  - `sudo -u postgres psql -c "CREATE ROLE vault LOGIN PASSWORD 'vault';"`
  - `sudo -u postgres createdb -O vault vaultquest`
- If `web/.env` is missing, recreate it with at least:
  - `DATABASE_URL="postgresql://vault:vault@localhost:5432/vaultquest?schema=public"`
  - `AUTH_SECRET="<any random string>"` (email/password auth works without OAuth)
  - `ADMIN_EMAIL="admin@vaultquest.local"` and `POSTBACK_SECRET="dev-postback-secret"` are useful for the admin panel and the earn/postback loop.
- Apply schema + seed after the DB is up (run from `web/`): `npx prisma migrate deploy` then `npm run db:seed`. Seeding populates the affiliate-link inventory used by the Earn flow; the Earn page is not meaningful until it runs. `db:seed` uses `npx tsx` and will fetch `tsx` on first run.

### Running / testing
- Dev server: `cd web && npm run dev` → http://localhost:3000. Do not run the production `build`/`start` for development.
- The `npm run build` step calls out to Google Fonts for the `/opengraph-image` route; in a network-restricted VM it logs `Failed to download dynamic font` — this is a **non-fatal warning**, the build still succeeds.
- All external integrations (Google/Discord OAuth, Resend email, OpenRouter AI chat, partner postbacks, Neon backups) are optional and the code degrades gracefully when their env vars are unset.
- Core earn→credit loop can be exercised without a real partner: hit `/api/go/<questId>` (e.g. `q-freecash`) to create a tracked click, then S2S credit it via `GET /api/postback?secret=$POSTBACK_SECRET&click_id=<id>&user_id=<id>&vp=150`. Postbacks are idempotent per click.
