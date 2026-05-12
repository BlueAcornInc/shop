#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  echo "[$(timestamp)] $*"
}

start_static_fallback() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi

  PORT_PIDS="$(lsof -ti tcp:3000 || true)"
  if [ -n "$PORT_PIDS" ]; then
    log "Killing existing process(es) on port 3000: $PORT_PIDS"
    kill $PORT_PIDS >/dev/null 2>&1 || true
  fi

  log "Falling back to static server for local smoke ..."
  npx --yes http-server@14.1.1 . -a 127.0.0.1 -p 3000 -c-1 >/tmp/shop-staticserver.log 2>&1 &
  SERVER_PID=$!
  SERVER_LABEL="http-server"

  if ! npx --yes wait-on@7.2.0 --timeout 90000 tcp:127.0.0.1:3000; then
    log "Timed out waiting for static server. Last lines from /tmp/shop-staticserver.log:"
    tail -n 40 /tmp/shop-staticserver.log || true
    exit 1
  fi
}

npm start >/tmp/shop-devserver.log 2>&1 &
SERVER_PID=$!
SERVER_LABEL="aem-up"

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

log "Started $SERVER_LABEL server (pid=$SERVER_PID). Waiting for tcp:127.0.0.1:3000 ..."

if ! npx --yes wait-on@7.2.0 --timeout 180000 tcp:127.0.0.1:3000; then
  log "Timed out waiting for AEM dev server. Last lines from /tmp/shop-devserver.log:"
  tail -n 40 /tmp/shop-devserver.log || true
  start_static_fallback
fi

log "$SERVER_LABEL ready. Running local smoke checks ..."
if ! npm run e2e:local-smoke; then
  if [ "$SERVER_LABEL" = "aem-up" ]; then
    log "Smoke failed on aem-up; retrying against static fallback ..."
    start_static_fallback
    log "$SERVER_LABEL ready. Re-running local smoke checks ..."
    npm run e2e:local-smoke
  else
    exit 1
  fi
fi
