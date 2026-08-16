# VaultQuest

In-house gaming rewards hub + honest giveaways (Hybrid model).

- **UX:** Gamesbolt / Earnit clarity  
- **Growth:** Freecash-style funnels → this site first (video marketing **after** site)  
- **Must-haves:** Vault points, affiliate link rotation, giveaways  

## Docs

Start at [docs/00-master-brief.md](docs/00-master-brief.md). Wave 1 status: [docs/09-wave1-status.md](docs/09-wave1-status.md).

## Website

```bash
cd web
# edit .env (see .env.example)
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Deploy to Vercel

See **[docs/deploy-vercel.md](docs/deploy-vercel.md)**. Vercel MCP is configured in [`.cursor/mcp.json`](.cursor/mcp.json).

### Configure (`web/.env`)

| Var | Purpose |
|-----|---------|
| `ADMIN_EMAIL` | Your email → Admin link + `/admin` |
| `RESEND_API_KEY` + `CONTACT_TO_EMAIL` | Contact form email delivery |
| `POSTBACK_SECRET` | Offerwall S2S `/api/postback` (shared secret; never commit the value) |
| `BITLABS_APP_SECRET` | Optional BitLabs HMAC (`hash=` SHA1; SHA256 fallback) |
| `AYET_HMAC_SECRET` | Optional ayeT HMAC (`hash=`) |
| `AUTH_GOOGLE_ID/SECRET` | Google OAuth |
| `AUTH_DISCORD_ID/SECRET` | Discord OAuth |

### Routes

| Route | What |
|-------|------|
| `/contact` | Contact form (saved + emailed if Resend set) |
| `/admin` | Caps, fulfillment, contact inbox |
| `/api/go/[questId]` | Tracked click → rotated partner |
| `/api/postback` | S2S credit (`secret`, `click_id`, `vp`) |
| `/signup` `/login` | Email auth + OAuth when configured |
