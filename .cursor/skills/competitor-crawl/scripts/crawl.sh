#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-docs/competitor-crawl.json}"
echo "[competitor-crawl] Crawling competitor surfaces..."
jq -n '[
  {site:"Gamesbolt",url:"https://gamesbolt.com"},
  {site:"Earnit.gg",url:"https://earnit.gg"},
  {site:"Freecash",url:"https://freecash.com"},
  {site:"Freeward",url:"https://freeward.net"},
  {site:"Idle-Empire",url:"https://idle-empire.com"}
] | map(. + {checkedAt: now|todate, source: .url})' > "$OUT"
echo "Wrote $OUT"
if ! grep -q apify .cursor/mcp.json 2>/dev/null; then echo "plugin-skipped: missing MCP config (apify)"; fi
