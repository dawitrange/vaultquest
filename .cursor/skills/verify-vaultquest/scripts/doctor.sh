#!/usr/bin/env bash
set -euo pipefail
PORT="${VERIFY_PORT:-3317}"
HOST="127.0.0.1"
PIDFILE="/tmp/vq-verify-${PORT}.pid"
PUBLIC=0
if [[ "${1:-}" == "--public" ]]; then
  PUBLIC=1
fi
BASE="${VERIFY_BASE_URL:-http://${HOST}:${PORT}}"

if [[ "$PUBLIC" -eq 0 ]]; then
  if [[ ! -f "$PIDFILE" ]]; then
    echo "[verify-vaultquest doctor] FAIL no pid file $PIDFILE — run launch.sh (or pass --public for vaultquest.io)"
    exit 1
  fi
  pid="$(cat "$PIDFILE")"
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "[verify-vaultquest doctor] FAIL pid $pid is not alive"
    exit 1
  fi
  echo "[verify-vaultquest doctor] pid $pid alive"
fi

tmp="$(mktemp)"
code="$(curl -sS -o "$tmp" -w '%{http_code}' "$BASE/" || true)"
if [[ "$code" != "200" ]]; then
  echo "[verify-vaultquest doctor] FAIL GET $BASE/ → HTTP $code"
  rm -f "$tmp"
  exit 1
fi
if ! grep -q "VaultQuest" "$tmp"; then
  echo "[verify-vaultquest doctor] FAIL body missing VaultQuest"
  rm -f "$tmp"
  exit 1
fi
rm -f "$tmp"
echo "[verify-vaultquest doctor] PASS $BASE/ HTTP 200 contains VaultQuest"
exit 0
