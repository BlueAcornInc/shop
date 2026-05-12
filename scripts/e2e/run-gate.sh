#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

SPECS="${E2E_SPECS:-$(node scripts/e2e/select-specs.mjs)}"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  echo "[$(timestamp)] $*"
}

log "Selected E2E specs: $SPECS"

npm start >/tmp/shop-devserver.log 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

log "Started local dev server (pid=$SERVER_PID). Waiting for http://127.0.0.1:3000 ..."

heartbeat() {
  while true; do
    sleep 10
    if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      log "Still waiting for dev server readiness ..."
    else
      log "Dev server exited early. Last lines from /tmp/shop-devserver.log:"
      tail -n 40 /tmp/shop-devserver.log || true
      return 1
    fi
  done
}

heartbeat &
HEARTBEAT_PID=$!

if ! npx --yes wait-on@7.2.0 --timeout 180000 http://127.0.0.1:3000; then
  kill "$HEARTBEAT_PID" >/dev/null 2>&1 || true
  log "Timed out waiting for dev server. Last lines from /tmp/shop-devserver.log:"
  tail -n 40 /tmp/shop-devserver.log || true
  exit 1
fi

kill "$HEARTBEAT_PID" >/dev/null 2>&1 || true
log "Dev server is ready. Running Cypress ..."

if [ -x "$ROOT_DIR/cypress/node_modules/.bin/cypress" ]; then
  npm --prefix cypress run cypress:run -- --reporter spec --spec "$SPECS"
elif [ -x "$ROOT_DIR/.cypress-runner/node_modules/.bin/cypress" ]; then
  "$ROOT_DIR/.cypress-runner/node_modules/.bin/cypress" run \
    --project "$ROOT_DIR/cypress" \
    --config-file "$ROOT_DIR/cypress/cypress.config.js" \
    --reporter spec \
    --spec "$SPECS"
else
  log "Cypress executable not found."
  log "Install one of the following before rerunning:"
  log "  1) npm --prefix cypress install"
  log "  2) mkdir -p .cypress-runner && cd .cypress-runner && npm install cypress@13.13.0"
  log "If install fails with 403 while downloading Cypress, configure proxy/network access to download.cypress.io."
  exit 1
fi
