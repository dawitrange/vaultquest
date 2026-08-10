---
name: competitor-crawl
description: Crawls Gamesbolt/Earnit/Freecash/Freeward/Idle-Empire for IA, trust signals, and growth patterns to benchmark Vaultquest. Use when competitor research is needed.
---

# competitor-crawl

Crawls competitor surfaces via apify when wired, else WebFetch fallback. Invoked by @competitor-researcher.

## When to use
Verification cycle or UX benchmarking — maps what Gamesbolt/Earnit templates do vs Vaultquest.

## How to run
```bash
pwsh .cursor/skills/competitor-crawl/scripts/crawl.ps1
bash .cursor/skills/competitor-crawl/scripts/crawl.sh
```
Flags: `-Quick` (3 sites), `-Out docs/competitor-crawl.json`

## What it does
1. Fetches `gamesbolt.com`, `earnit.gg`, `freecash.com`, `freeward.net`, `idle-empire.com` (subset per flag).
2. Captures: nav/IA, How it works, Earn/offer surface, proof feed (real vs synthetic), currency/redeem framing, CTA transparency.
3. Writes `docs/competitor-crawl.json` and delta markdown; logs `plugin-skipped: missing MCP config` if needed.

## Output contract
- `docs/competitor-crawl.json` — array of `{ site, url, ia, trust, currency, cta, checkedAt }`
- Console delta table: Adopt / Adapt / Never copy

## Constraints
- Cite URLs + date; do not invent results.
- Never propose generators, synthetic feeds, or opaque shortlinks.
- Keep language transparent and verifiable.
