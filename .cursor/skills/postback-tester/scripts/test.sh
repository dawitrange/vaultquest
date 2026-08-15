#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

if [[ "${1:-}" == "--help" || "${1:-}" == "-Help" || "${1:-}" == "-h" ]]; then
  echo "postback-tester — HMAC + click → pending VP smoke (issue #15)"
  echo "Cases: offline HMAC, prod probe (no secrets), optional localhost live credit"
  echo "Usage:"
  echo "  bash .cursor/skills/postback-tester/scripts/test.sh [--help]"
  echo "  bash .cursor/skills/postback-tester/scripts/test.sh --probe-prod"
  echo "  bash .cursor/skills/postback-tester/scripts/test.sh --seed-local http://localhost:3000"
  echo "Env names (never commit values): POSTBACK_SECRET, BITLABS_APP_SECRET or AYET_HMAC_SECRET, DATABASE_URL"
  echo "Never sends secrets to vaultquest.io."
  if [[ -d web/node_modules && -f web/scripts/postback-smoke.ts ]]; then
    (cd web && npx tsx scripts/postback-smoke.ts --help)
  fi
  exit 0
fi

if ! grep -q datadog .cursor/mcp.json 2>/dev/null; then
  echo "plugin-skipped: missing MCP config (datadog)"
fi

if [[ ! -d web/node_modules ]]; then
  echo "[postback-tester] web/node_modules missing — run npm ci in web/"
  exit 1
fi

echo "[postback-tester] running web/scripts/postback-smoke.ts $*"
cd web
exec npx tsx scripts/postback-smoke.ts "$@"
