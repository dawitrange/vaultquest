#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "vault-build-check — Vaultquest local build gate"
  echo "Usage: bash .cursor/skills/vault-build-check/scripts/check.sh [--help] [--quick]"
  echo "  --help   Show this help (no build)"
  echo "  --quick  Smoke: prisma generate --help + next --help"
  exit 0
fi
if [[ "${1:-}" == "--quick" ]]; then
  echo "[vault-build-check] Quick smoke..."
  (cd web && npx prisma generate --help >/dev/null && npx next --help >/dev/null && echo "PASS — prisma + next CLIs present")
  exit 0
fi
echo "[vault-build-check] Full build: prisma generate && next build"
(cd web && npx prisma generate && npm run build 2>&1 | tee .vault-build.log && echo "PASS — build succeeded — log web/.vault-build.log")
