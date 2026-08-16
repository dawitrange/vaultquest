#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PORT="${VERIFY_PORT:-3317}"
BASE="${VERIFY_BASE_URL:-http://127.0.0.1:${PORT}}"
OUT="$ROOT/.cursor/skills/verify-vaultquest/artifacts/home-earn"
mkdir -p "$OUT"

fail() { echo "[verify-vaultquest drive-home-earn] FAIL $*" | tee "$OUT/result.txt"; exit 1; }

save() {
  local path="$1" dest="$2"
  curl -sS -D "$OUT/${dest}.headers" -o "$OUT/${dest}.html" "$BASE$path" || fail "curl $path"
  local code
  code="$(awk 'BEGIN{c=""} /^HTTP/{c=$2} END{print c}' "$OUT/${dest}.headers")"
  echo "$code" >"$OUT/${dest}.status"
  [[ "$code" == "200" ]] || fail "GET $path HTTP $code (want 200)"
}

save "/" "home"
grep -q "Turn quests into Steam credit" "$OUT/home.html" || fail "home missing headline"
grep -q "See quests" "$OUT/home.html" || fail "home missing See quests CTA"
if grep -q "Start earning" "$OUT/home.html"; then fail "home still says Start earning"; fi
# Policy denials ("we do not run generators") are allowed. Fail only on scam CTAs.
if grep -qiE 'working codes|unlimited free steam|guaranteed \$[0-9]' "$OUT/home.html"; then
  fail "home contains banned generator-product copy"
fi
grep -q 'href="/earn"' "$OUT/home.html" || fail "home See quests is not /earn"

save "/earn" "earn"
grep -q ">Earn<" "$OUT/earn.html" || grep -q "Earn" "$OUT/earn.html" || fail "earn missing heading"
if grep -qi "working codes" "$OUT/earn.html"; then fail "earn contains banned working-codes copy"; fi
if grep -qi "no survey" "$OUT/earn.html"; then fail "earn contains banned no-survey copy"; fi

{
  echo "PASS home-earn"
  echo "base=$BASE"
  echo "home_status=$(cat "$OUT/home.status")"
  echo "earn_status=$(cat "$OUT/earn.status")"
  echo "home_headline=Turn quests into Steam credit"
  echo "home_cta=See quests -> /earn"
  echo "earn_reached=yes"
} | tee "$OUT/result.txt"

exit 0
