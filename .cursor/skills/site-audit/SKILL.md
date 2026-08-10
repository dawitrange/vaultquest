---
name: site-audit
description: Audits vaultquest.io (and localhost) pages for verification readiness — nav, proof, disclosure, Impact meta, footer. Use when trust surface needs checking before applications.
---

# site-audit

Crawls Vaultquest pages via WebFetch + optional apify when wired. Invoked by @trust-designer (and @eng-qa when build-coupled).

## When to use
Before each publisher application wave, or after changes to `/about`, `/proof`, `/terms`, `/privacy`, `SiteFooter`, `SocialProofBar`, `web/src/lib/site.ts`.

## How to run
```bash
pwsh .cursor/skills/site-audit/scripts/audit.ps1
pwsh .cursor/skills/site-audit/scripts/audit.ps1 -Local http://localhost:3000
bash .cursor/skills/site-audit/scripts/audit.sh
```
Flags: `-Local <url>` audits localhost; `-Out docs/site-audit.json` writes JSON; `-Quick` checks 4 pages only.

## What it does
1. Fetches `/`, `/about`, `/how-it-works`, `/earn`, `/rewards`, `/giveaways`, `/proof`, `/terms`, `/privacy`, `/contact` (or localhost equivalent).
2. Checks: NAV order, 2020→2026 timeline, proof 10 sections, disclosure footer, Impact `impact-site-verification` meta, SocialProofBar, absence of generator/no-survey claims.
3. Writes `docs/site-audit.json` and console audit table (PASS/WARN/FAIL per page).
4. Logs `plugin-skipped: missing MCP config` if apify not wired.

## Output contract
- Console audit table for `docs/vault_plan.md` § Trust Fixes
- `docs/site-audit.json` — `{ url, checks[], passed, failed, checkedAt }`

## Constraints
- Transparent language only; flag any banned claim as FAIL.
- Does not fix — only audits; @trust-designer proposes fixes.
