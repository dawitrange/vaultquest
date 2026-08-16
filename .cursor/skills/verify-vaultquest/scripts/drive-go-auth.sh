#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PORT="${VERIFY_PORT:-3317}"
BASE="${VERIFY_BASE_URL:-http://127.0.0.1:${PORT}}"
OUT="$ROOT/.cursor/skills/verify-vaultquest/artifacts/go-auth-gate"
mkdir -p "$OUT"

fail() { echo "[verify-vaultquest drive-go-auth] FAIL $*" | tee "$OUT/result.txt"; exit 1; }

rest="${BASE#http://}"
rest="${rest#https://}"
host="${rest%%/*}"
host="${host%%:*}"
host="${host,,}"
if [[ "$host" == "vaultquest.io" || "$host" == "www.vaultquest.io" || "$host" == *.vaultquest.io ]]; then
  fail "refusing production $BASE. Unsigned GET /api/go/q-freecash still creates OfferClick on live until the auth-gate ships. Use preview or localhost."
fi

check_quest() {
  local quest="$1"
  local dest="$2"
  curl -sS -D "$OUT/${dest}.headers" -o "$OUT/${dest}.body" "$BASE/api/go/${quest}" || fail "curl /api/go/${quest}"
  local code
  code="$(awk 'BEGIN{c=""} /^HTTP/{c=$2} END{print c}' "$OUT/${dest}.headers")"
  echo "$code" >"$OUT/${dest}.status"
  [[ "$code" == "307" || "$code" == "302" ]] || fail "GET /api/go/${quest} HTTP $code (want 307/302)"
  local location
  location="$(awk 'BEGIN{IGNORECASE=1} /^location:/{sub(/^[^:]*:[[:space:]]*/, ""); gsub("\r",""); print; exit}' "$OUT/${dest}.headers")"
  echo "$location" >"$OUT/${dest}.location"
  [[ -n "$location" ]] || fail "GET /api/go/${quest} missing Location"
  if grep -qiE 'click_id=|subid=|freecash\.com|gamehag\.com' <<<"$location"; then
    fail "GET /api/go/${quest} Location looks like a tracked partner hop: $location"
  fi
  if ! grep -qE '/login(\?|$)' <<<"$location"; then
    fail "GET /api/go/${quest} Location is not login: $location"
  fi
  if ! grep -q 'from=earn' <<<"$location"; then
    fail "GET /api/go/${quest} Location missing from=earn: $location"
  fi
}

check_quest "q-freecash" "go-freecash"
check_quest "q-gamehag" "go-gamehag"
check_quest "q-surveys" "go-surveys"
check_quest "q-offerwall" "go-offerwall"
check_quest "q-play" "go-play"

{
  echo "PASS go-auth-gate"
  echo "base=$BASE"
  echo "q-freecash=$(cat "$OUT/go-freecash.status") $(cat "$OUT/go-freecash.location")"
  echo "q-gamehag=$(cat "$OUT/go-gamehag.status") $(cat "$OUT/go-gamehag.location")"
  echo "q-surveys=$(cat "$OUT/go-surveys.status") $(cat "$OUT/go-surveys.location")"
  echo "q-offerwall=$(cat "$OUT/go-offerwall.status") $(cat "$OUT/go-offerwall.location")"
  echo "q-play=$(cat "$OUT/go-play.status") $(cat "$OUT/go-play.location")"
} | tee "$OUT/result.txt"

exit 0
