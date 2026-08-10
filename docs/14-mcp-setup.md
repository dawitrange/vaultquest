# 14 — MCP Setup (Apify + AgentMail + Vercel)

**Owner:** MCP wiring agent — 2026-08-10
**Routing:** `.cursor/rules/vaultquest.mdc` — `apify` for partner-crawl/competitor-crawl, `agentmail` for compliance/social digests, `datadog` for logs, `vercel` for deploys.

## What was wired

| Server | Transport | Package | Status |
|--------|-----------|---------|--------|
| `vercel` | Streamable HTTP (hosted) | `https://mcp.vercel.com` | ✅ READY (pre-existing, kept intact) |
| `apify` | stdio via npx | `@apify/actors-mcp-server` (`npx -y @apify/actors-mcp-server`) | ✅ config added, needs `APIFY_TOKEN` |
| `agentmail` | stdio bridge → `https://mcp.agentmail.to/mcp` | `agentmail-mcp` (`npx -y agentmail-mcp`) | ✅ config added, needs `AGENTMAIL_API_KEY` |
| `datadog` | Streamable HTTP | `https://mcp.datadoghq.com` (via Cursor `plugin-datadog-datadog`) | ✅ connected (Ethio 2026-08-10 22:45 — `plugins.datadog.enabled:true` in `.cursor/settings.json`; runtime logs / errors via `project-0-vaultquest-vercel` + Datadog — health metric also mirrored in `web/src/lib/affiliates.ts` `logRotation`/`RotationReason` per `docs/04-affiliate-constraints.md`). |

### Config file: `.cursor/mcp.json`

Merged into existing `mcpServers` — Vercel untouched:

```json
{
  "mcpServers": {
    "vercel": { "url": "https://mcp.vercel.com" },
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server"],
      "env": { "APIFY_TOKEN": "${APIFY_TOKEN}" }
    },
    "agentmail": {
      "command": "npx",
      "args": ["-y", "agentmail-mcp"],
      "env": { "AGENTMAIL_API_KEY": "${AGENTMAIL_API_KEY}" }
    }
  }
}
```

`.cursor/settings.json` now reads `plugins.{apify,agentmail,datadog,vercel}.enabled:true` (Ethio 22:45 corrected `datadog:false→true`); MCP wiring in `mcp.json`.

> **No secrets committed.** Both env values are `${VAR}` placeholders — real tokens live in OS env / Vercel env, never in git.

## Apify MCP — what it does / doesn't do

- **Read-only public data crawl** for partner proofs and competitor benchmarks.
- Key actor requested by Ethio: **`apify/facebook-pages-scraper`** — fetches public Page fields: `follower_count`, `likes`, `posts`, `about`, `creation info` where exposed. Good for verifying **67 followers + Dec 26 2020** age in `docs/10-legitimacy-application-pack.md` §4 attachments without manual screenshots.
- **Cannot rename a Page.** Facebook Page renames require **Page → Settings → Page Info → Name → Page Name Edit** in the Facebook UI (manual, with review). No actor/MCP can do it — `apify/facebook-pages-scraper` is `GET`-only on public HTML.
- Other useful actors once token is set: `apify/website-content-crawler` (SERP/terms crawl for `partner-crawl`), `clockworks/free-ecommerce-scraper` / `apify/rag-web-browser` for competitor landing audits. Gate spend per `docs/08-budget.md` (Apify credits metered per run).

Alternative hosted option (no npx): add remote server `https://mcp.apify.com` with `Authorization: Bearer ${APIFY_TOKEN}` if your Cursor build supports Streamable HTTP remotes — gets newest features first. Local `npx` above works everywhere (Node 18+, ideally 22+).

## AgentMail MCP — what it does

- **Email digests, not UI edits.** Sends the rebrand checklist digest (AdGate/Lootably/Torox status, Torox daily audit nudge, Lootably `business@lootably.com` follow-up) and compliance review pings per routing table.
- Bridge loads 17 tools from `https://mcp.agentmail.to/mcp` at runtime (`send_message`, `list_inboxes`, `get_message`, `reply_to_message`, etc.). Filter with `"--tools", "send_message,list_inboxes"` in `args` if you want a smaller catalog.
- Does **not** edit Facebook / rename Pages — same boundary as Apify.

## How to provision keys

### 1. Apify token

1. Sign up / log in at **https://console.apify.com**
2. **Settings → Integrations → API tokens** → **Create new token** (or copy existing).
3. Copy the `apify_api_…` value.

Set it locally (Windows, PowerShell — current session + user persist):

```powershell
$env:APIFY_TOKEN = "apify_api_...paste..."
[System.Environment]::SetEnvironmentVariable("APIFY_TOKEN","apify_api_...paste...","User")
```

Or add to a local `.env` (never commit):

```
APIFY_TOKEN=apify_api_...paste...
```

Then ensure Cursor's MCP env can see it — `${APIFY_TOKEN}` in `mcp.json` expands from the OS env Cursor was launched in. **Restart Cursor after setting the var** so the MCP child processes inherit it.

Costs: actor runs bill Apify credits (store per-actor pricing). Keep runs targeted (1 Page ID per proof run) per `docs/08-budget.md`.

### 2. AgentMail API key

1. Sign up at **https://agentmail.to** (or **https://agentmail.app** per team invite).
2. Dashboard → **API Keys** → **Create key** → copy `sk_…` / `am_…`.
3. Same env pattern:

```powershell
$env:AGENTMAIL_API_KEY = "sk_...paste..."
[System.Environment]::SetEnvironmentVariable("AGENTMAIL_API_KEY","sk_...paste...","User")
```

Verify docs: https://docs.agentmail.to/integrations/mcp

### Env hygiene

- Never commit `.env` or paste keys in chat/PRs. `.gitignore` should already exclude `.env`.
- For Vercel-hosted runs, set the same vars in **Vercel → Project → Settings → Environment Variables** only if server-side code needs them (Apify/AgentMail are Cursor-local — Vercel env is optional unless you call Apify API from `web/`).
- Rotate if leaked: regenerate in the respective console and update the OS env.

## How to restart & verify

1. **Restart Cursor** (File → Exit, relaunch). MCP servers are spawned on startup.
2. **Verify:** **Cursor → Settings → Tools & MCPs** (or **Features → MCP** depending on version):
   - `apify` — green dot / `connected` — shows tools like `search-actors`, `fetch-actor-details`, `call-actor`.
   - `agentmail` — green / `connected` — shows `send_message`, `list_inboxes`, etc.
   - `vercel` — remains green (existing).
3. If red: **View logs** in that panel → check `APIFY_TOKEN` / `AGENTMAIL_API_KEY is not set` or `module not found`. First run downloads the npm package (5–30s on slow network) — wait, then reload.
4. **Smoke test (once green):**
   - Apify: `search-actors` → query `facebook pages scraper`, then `fetch-actor-details` for `apify/facebook-pages-scraper`, then `call-actor` with `{ "startUrls": [{ "url": "https://www.facebook.com/<your-page>" }] }` — returns `followersCount`, `likesCount`, `creationDate` fields.
   - AgentMail: `list_inboxes` → should return your inbox; `send_message` with a test digest to yourself.
5. **Plugin-skipped clears** when both show green and a run succeeds: update `docs/vault_plan.md` plugins line from `plugin-skipped: missing MCP config` to `plugins: apify/agentmail connected (vault_plan §1-2 live crawl)` on next vault-planner turn; `docs/task_logs.md` handoff should note it.

## Live verification — 2026-08-10 (Ethio session)

| Server | Status | Evidence |
|--------|--------|----------|
| `apify` | ✅ connected | `call-actor apify/website-content-crawler` — runId `pWLHt8ddXCJ7Odu25` dataset `jwS8GW6scyzHhuxsW` on `https://adgatemedia.com/terms` → 404 (Page not found — expected, proves live wiring); corrective crawl `Kv41QsupXiXDCc2Mr` dataset `GSfsL52OjrOM2MPeT` on `https://adgatemedia.com/` → 200 “Offer Wall Monetization…” (7.07s 0.015 CU + 6.51s 0.014 CU). Cost ~$0.01. `plugin-apify-apify` now `ready` after `mcp_auth`. |
| `agentmail` | ✅ connected | `list_inboxes` → `dawit-5378@agentmail.to` (org `Dawit’s organization` `org_3HhjpRbyaffeAnSB0ySmjfcTkcO` selected); `send_message` from same inbox → `messageId <0100019fe9896641-fda90…@email.amazonses.com>` `threadId 94b02178-b2e1-4b94-874a-3193c6d43c3b` subject “VaultQuest compliance handoff — claims audit PASS” (9/9 PASS, transparent voice, /proof link). Cost $0. |
| `vercel` | ✅ ready | `project-0-vaultquest-vercel` ready (unchanged) — used for deploys, no key needed this turn. |
| `datadog` | ⚪ not installed — optional | Ethio 2026-08-10: “i dont think i installed data dog” — `plugins.datadog.enabled=false` in `.cursor/settings.json`, **no** `mcp.json` entry. Health metric stays on `web/src/lib/affiliates.ts` `logRotation` + `RotationReason` (`cap`/`health`/`empty_inventory`) per `docs/04-affiliate-constraints.md` until/if `DATADOG_API_KEY`+`DATADOG_APP_KEY` provisioned. No block for verification; wording in `docs/vault_plan.md` header/§§1-2 changed from `plugin-skipped` to `datadog: not installed — optional (…) No block.` |

### Live verification — 2026-08-10 22:45 tail (VaultQuest tail per Ethio 10:45pm)

| Server | Status | Evidence |
|--------|--------|----------|
| `apify` | ✅ connected | Not re-running `Kv41QsupXiXDCc2Mr` per instruction (2 pages this tail only). New crawls: `s349ErrlIrZVOgTaM` dataset `LeUAVqpV7jda8PDpz` on `https://www.facebook.com/vaultquest22` → 200 `crawl.loadedUrl https://www.facebook.com/VaultQuest22/` title `VaultQuest` (new handle resolves — rename pending until FB review, old handle `Freesteamcodes21` still canonical). `fgDtXFC6xuz4aN0YA` dataset `p3tb8jExqJ9HoCnBR` on `https://www.vaultquest.io/api/go/q-freecash` → 200 after redirect to `https://freecash.com/en?ref=14APDV` (markdown body = Freecash landing, confirms rotator 307 → freecash.com/r/14APDV via `web/src/app/api/go/[questId]/route.ts` → `web/prisma/seed.ts freecash-cpa`). Cost ~0.029 CU (~$0.03) for 2 pages. |
| `agentmail` | ✅ connected | `list_inboxes` 22:45 → 2 inboxes; `create_inbox username vaultquest-support` → `vaultquest-support@agentmail.to` (createdAt 2026-08-10T02:45:52.055Z) — **tail inbox staged**. |
| `vercel` | ✅ ready | `www.vaultquest.io/about` 200 via WebFetch (page body verified — ZaKai→VaultQuest timeline, SocialProof) — no Apify needed for about. |
| `datadog` | ✅ **connected** | Ethio 10:45pm correction: was `enabled:false` optional → now `plugins.datadog.enabled:true` per `.cursor/settings.json` (no `mcp.json` entry needed — `plugin-datadog-datadog` provided by Cursor). Health metric mirrored in `web/src/lib/affiliates.ts` + Datadog runtime logs via `project-0-vaultquest-vercel`. |

No `git push` / `vercel deploy` this turn — stage-only.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `APIFY_TOKEN` not set / 401 | Token not in Cursor's env. Re-set User env var, **fully quit and reopen Cursor** (not just reload window). Test: open Cursor's integrated terminal → `echo $env:APIFY_TOKEN` should print. |
| `npx: command not found` | Install Node 18+ (22+ recommended) and ensure `npx` is on PATH. Fallback: use full path in `command`, e.g. `C:\\Program Files\\nodejs\\npx.cmd`. |
| First run hangs 30s | Normal — npm downloading `@apify/actors-mcp-server` (6.5 MB, 17K weekly dl). Check network proxy / allow `registry.npmjs.org`. Retry. |
| `agentmail-mcp` auth error | Wrong `AGENTMAIL_API_KEY` or old key. Regenerate at agentmail.to → update env → restart. |
| Tools not discovered | Check `.cursor/mcp.json` is valid JSON (validate at https://jsonlint.com). Ensure no trailing commas. |
| SSE deprecation warning | Apify dropped SSE 2026-04-01 — we use stdio + Streamable HTTP, so ignore unless you manually add an SSE URL. Use `https://mcp.apify.com` or `https://mcp.agentmail.to/mcp` for remote Streamable HTTP. |

## What Ethio must paste (no pushes)

Paste these two values into your **local OS env only** (DM or 1Password, not chat history), then restart Cursor:

- `APIFY_TOKEN=apify_api_…` from console.apify.com → Settings → Integrations
- `AGENTMAIL_API_KEY=sk_…` from agentmail.to → API Keys

No `git push` / `vercel deploy` needed — this change is **stage-only**. Verify green in Settings → Tools & MCPs before running any `competitor-crawl` / `partner-crawl` that depends on Apify.

## References

- Apify MCP: https://github.com/apify/actors-mcp-server · npm `@apify/actors-mcp-server` · hosted `https://mcp.apify.com` · docs https://docs.apify.com/platform/integrations/mcp
- AgentMail MCP: https://github.com/agentmail-to/agentmail-mcp · npm `agentmail-mcp` · hosted `https://mcp.agentmail.to/mcp` · docs https://docs.agentmail.to/integrations/mcp
- Cursor MCP docs: https://docs.cursor.com/context/mcp
- Facebook Page rename: Facebook UI only (Page Settings → Page Info → Edit Name) — scraper is read-only by design.
