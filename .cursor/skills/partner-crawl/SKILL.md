---
name: partner-crawl
description: Crawls Torox/Lootably/AdGate/BitLabs/ayeT/CPX/Impact publisher docs for terms, postback formats, and HMAC schemes. Use when partner verification or waterfall research is needed.
---

# partner-crawl

Crawls network publisher terms via apify when wired, else WebFetch fallback. Invoked by @partner-researcher (never directly by vault-planner).

## When to use
Partner matrix refresh, waterfall ranking, or HMAC/payout validation before applications.

## How to run
```bash
# PowerShell (Windows)
pwsh .cursor/skills/partner-crawl/scripts/crawl.ps1

# Bash (CI/Unix)
bash .cursor/skills/partner-crawl/scripts/crawl.sh
```
Flags:
- `-Quick` — skip CPX/Impact secondary docs
- `-Out docs/partner-crawl.json` — write structured JSON for vault_plan.md merge

## What it does
1. Fetches each apply URL + docs page from `docs/10-legitimacy-application-pack.md` §2 table.
2. Extracts: apply URL, required placement fields, postback format, HMAC scheme, payout floor, review SLA.
3. Writes `docs/partner-crawl.json` and console table; logs `plugin-skipped: missing MCP config` if apify not wired.

## Output contract
- `docs/partner-crawl.json` — array of `{ network, applyUrl, requires, postback, hmac, payout, sla, source, checkedAt }`
- Console markdown table for direct paste into `docs/vault_plan.md` § Partner Matrix

## Constraints
- Cite source URL + date; never invent rates.
- Keep language transparent and verifiable.
- No spend — uses existing apify/WebFetch; log skip if not wired.
