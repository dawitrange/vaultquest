---
name: vault-build-check
description: Verifies Vaultquest local build health via prisma generate && next build. Use before any stage or to smoke-test verification changes.
---

# vault-build-check

Runs Prisma generate + Next.js build inside `web/`. Invoked by @eng-qa (and @trust-designer/@profit-ai when they ship code).

## When to use
After any `web/` change, before `git add`, or as smoke test for vault_plan verification.

## How to run
```bash
pwsh .cursor/skills/vault-build-check/scripts/check.ps1
pwsh .cursor/skills/vault-build-check/scripts/check.ps1 -Help
bash .cursor/skills/vault-build-check/scripts/check.sh
bash .cursor/skills/vault-build-check/scripts/check.sh --help
```
Flags: `-Help` / `--help` — print usage without building; `-Quick` — `prisma generate --help` + `next --help` smoke only.

## What it does
1. `npx prisma generate` (or `--help` in smoke mode)
2. `npm run build` (or `next --help` in smoke mode)
3. Reports PASS/FAIL with failing file and exit code; does not push.

## Output contract
- Console PASS/FAIL + log file `web/.vault-build.log` on full build
- Exit 0 on success, 1 on failure — suitable for CI gate

## Constraints
- Stage-only discipline: never `git push` or `vercel deploy` from this skill.
- If swarm b4ef1aa2 already validated, log `reused swarm build output` and skip full build on smoke flag.
