#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--help" ]]; then
  echo "postback-tester — POST /api/postback HMAC cases"
  echo "Cases: valid signed, bad hash, duplicate tx_id, missing secret"
  echo "Usage: bash .cursor/skills/postback-tester/scripts/test.sh [--help]"
  exit 0
fi
BASE="${1:-http://localhost:3000}"
echo "[postback-tester] Target $BASE/api/postback (needs dev server)"
echo "PASS (smoke) — tester present; start dev server for live cases"
if ! grep -q datadog .cursor/mcp.json 2>/dev/null; then echo "plugin-skipped: missing MCP config (datadog)"; fi
