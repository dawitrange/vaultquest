# Deploy Vaultquest to Vercel (from Cursor)

App lives in `web/`. Local SQLite is fine for `npm run dev`. **Vercel needs a cloud database** (Neon/Postgres) — file SQLite will not persist on serverless.

## 1. Enable Vercel MCP in Cursor

Project config is already at [`.cursor/mcp.json`](../.cursor/mcp.json).

1. Open **Cursor Settings → MCP**
2. Find **vercel** and enable it
3. Complete the **Vercel login / OAuth** prompt when it appears
4. Start a **new chat** (or reload) so the agent can see Vercel tools

One-click alternative: [Install Vercel MCP](cursor://anysphere.cursor-deeplink/mcp/install?name=vercel&config=eyJ1cmwiOiJodHRwczovL21jcC52ZXJjZWwuY29tIn0=)

Optional: Marketplace → **Vercel plugin** (`/add-plugin vercel`) for extra slash commands.

## 2. Create a free Postgres (required for auth/ledger)

1. Sign up at [neon.tech](https://neon.tech) (or Vercel Storage → Postgres)
2. Create a project → copy the **connection string**
3. You’ll paste it as `DATABASE_URL` in Vercel env (step 4)

Then run migrations against that DB (from your machine once):

```bash
cd web
# temporarily set DATABASE_URL to the Neon URL in your shell, then:
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## 3. Domain (can be later)

Buy `vaultquest.com` (or available TLD) → in Vercel project → **Domains** → add it → set DNS as Vercel shows.

You can deploy on `*.vercel.app` first for partner applications.

## 4. Vercel project env vars

In Vercel → Project → Settings → Environment Variables (Production + Preview):

| Name | Notes |
|------|--------|
| `DATABASE_URL` | Neon/Postgres URL |
| `AUTH_SECRET` | Long random string (`openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Your email |
| `POSTBACK_SECRET` | Shared with offerwalls |
| `AUTH_URL` / `NEXTAUTH_URL` | `https://your-deployment.vercel.app` (or custom domain) |
| `RESEND_API_KEY` | Optional until contact / password-reset email |
| `CONTACT_TO_EMAIL` | Optional |
| `CONTACT_FROM_EMAIL` | Optional |
| `AUTH_GOOGLE_*` / `AUTH_DISCORD_*` | Optional |

Set **Root Directory** to `web` if you import the whole `vaultquest` repo.

## 5. First deploy (pick one)

### A) Ask the agent (after MCP login)
> “Deploy the `web` folder to Vercel as a new project and give me the URL.”

### B) CLI
```bash
cd web
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```

### C) Git
Push to GitHub → Vercel “Import project” → root `web` → Deploy.

## 6. After deploy checklist

- [ ] Open the `*.vercel.app` URL
- [ ] Sign up works (DB connected)
- [ ] Set `ADMIN_EMAIL` to that user → see **Admin**
- [ ] Put the public URL on publisher applications
- [ ] Later: attach custom domain

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `prisma generate` | Ensure `postinstall` / build runs `prisma generate` (already in `package.json`) |
| Auth broken on Vercel | Set `AUTH_SECRET` + correct site URL |
| Data disappears | You still pointed at SQLite — switch `DATABASE_URL` to Neon |
| MCP tools missing | Re-auth Vercel MCP; new Agent chat |
