#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://vaultquest.io}"
OUT="${2:-docs/site-audit.json}"
echo "[site-audit] Auditing $BASE ..."
paths=("/" "/about" "/how-it-works" "/earn" "/rewards" "/giveaways" "/proof" "/terms" "/privacy" "/contact")
echo "[" > "$OUT.tmp"
first=1
for p in "${paths[@]}"; do
  url="$BASE$p"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  status="WARN"; note="HTTP $code"
  [[ "$code" == "200" ]] && status="PASS"
  [[ "$code" == "000" ]] && status="FAIL" && note="fetch failed"
  [[ $first -eq 0 ]] && echo "," >> "$OUT.tmp"
  first=0
  jq -n --arg url "$url" --arg status "$status" --arg note "$note" --arg at "$(date -u +%FT%TZ)" '{url:$url,status:$status,note:$note,checkedAt:$at}' >> "$OUT.tmp"
done
echo "]" >> "$OUT.tmp"
jq -s '.' "$OUT.tmp" > "$OUT" && rm "$OUT.tmp"
echo "Wrote $OUT"
cat "$OUT" | jq -r '.[] | "\(.status) \(.url) — \(.note)"'
if ! grep -q apify .cursor/mcp.json 2>/dev/null; then echo "plugin-skipped: missing MCP config (apify)"; fi
