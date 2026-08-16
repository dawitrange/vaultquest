#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"
PORT="${VERIFY_PORT:-3317}"
HOST="127.0.0.1"
PIDFILE="/tmp/vq-verify-${PORT}.pid"
WEB="$ROOT/web"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[verify-vaultquest launch] DATABASE_URL is required (Postgres). Copy the name from web/.env.example; do not commit the value."
  exit 1
fi
if [[ -z "${AUTH_SECRET:-}" ]]; then
  echo "[verify-vaultquest launch] AUTH_SECRET is required. Generate with: openssl rand -base64 32"
  exit 1
fi

export AUTH_URL="${AUTH_URL:-http://${HOST}:${PORT}}"
export NEXT_TELEMETRY_DISABLED=1

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "[verify-vaultquest launch] already running pid=$(cat "$PIDFILE") on :$PORT"
  exit 0
fi
rm -f "$PIDFILE"

if [[ ! -d "$WEB/node_modules" ]]; then
  echo "[verify-vaultquest launch] npm ci in web/"
  (cd "$WEB" && npm ci)
fi

(cd "$WEB" && npx prisma generate)

LOG="/tmp/vq-verify-${PORT}.log"
: >"$LOG"
(
  cd "$WEB"
  exec npx next dev --hostname "$HOST" --port "$PORT"
) >>"$LOG" 2>&1 &
echo $! >"$PIDFILE"

for i in $(seq 1 90); do
  code="$(curl -sf -o /dev/null -w '%{http_code}' "http://${HOST}:${PORT}/" || true)"
  if [[ "$code" == "200" ]]; then
    echo "[verify-vaultquest launch] ready http://${HOST}:${PORT}/ pid=$(cat "$PIDFILE")"
    exit 0
  fi
  if ! kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "[verify-vaultquest launch] process died. last log:"
    tail -n 40 "$LOG" || true
    rm -f "$PIDFILE"
    exit 1
  fi
  sleep 1
done

echo "[verify-vaultquest launch] timed out waiting for :$PORT. log: $LOG"
tail -n 40 "$LOG" || true
exit 1
