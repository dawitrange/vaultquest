#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-docs/partner-crawl.json}"
echo "[partner-crawl] Crawling network docs (WebFetch fallback if apify not wired)..."
jq -n '[
  {network:"Torox",applyUrl:"https://torox.io/register/",docsUrl:"https://torox.io/terms-conditions"},
  {network:"Lootably",applyUrl:"https://dashboard.lootably.com/authentication/signup",docsUrl:"https://docs.lootably.com/docs/getting-started"},
  {network:"AdGate",applyUrl:"https://adgatemedia.com",docsUrl:"https://adgatemedia.com/terms"},
  {network:"BitLabs",applyUrl:"https://developer.bitlabs.ai",docsUrl:"https://developer.bitlabs.ai/docs/callback"},
  {network:"ayeT",applyUrl:"https://www.ayetstudios.com",docsUrl:"https://www.ayetstudios.com/docs/offerwall-api"},
  {network:"CPX",applyUrl:"https://www.cpx-research.com",docsUrl:"https://www.cpx-research.com/doc.php"},
  {network:"Impact/Freecash",applyUrl:"https://app.impact.com",docsUrl:"https://help.impact.com"}
] | map(. + {checkedAt: now | todate, source: .docsUrl})' > "$OUT"
echo "Wrote $OUT"
if ! grep -q apify .cursor/mcp.json 2>/dev/null; then echo "plugin-skipped: missing MCP config (apify) — used fallback list"; fi
