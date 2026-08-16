#!/usr/bin/env bash
set -euo pipefail
PORT="${VERIFY_PORT:-3317}"
PIDFILE="/tmp/vq-verify-${PORT}.pid"
LOG="/tmp/vq-verify-${PORT}.log"

if [[ ! -f "$PIDFILE" ]]; then
  echo "[verify-vaultquest cleanup] nothing to stop ($PIDFILE missing)"
  exit 0
fi
pid="$(cat "$PIDFILE")"
if kill -0 "$pid" 2>/dev/null; then
  kill "$pid" 2>/dev/null || true
  for i in $(seq 1 20); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.2
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi
  echo "[verify-vaultquest cleanup] stopped pid $pid"
else
  echo "[verify-vaultquest cleanup] pid $pid already dead"
fi
rm -f "$PIDFILE"
# Keep $LOG and artifacts/ — evidence must survive.
echo "[verify-vaultquest cleanup] artifacts not deleted"
exit 0
