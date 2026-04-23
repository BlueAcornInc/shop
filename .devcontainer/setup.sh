#!/usr/bin/env bash
# Runs on every container attach — output is visible in the attached VS Code
# terminal, and re-running is cheap because each step is idempotent.
#
# - GitHub HTTPS auth so private github: npm deps resolve without SSH
# - npm install + install:dropins (theme files land in styles/ + scripts/)
# - aio-cli + plugins for aio/<app> development (one-time, skipped on reruns)
set -eo pipefail

echo "→ configuring git + netrc for github.com"
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git config --global url."https://github.com/".insteadOf "git@github.com:"
  git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
  umask 077
  # Write netrc without -x tracing so the token doesn't hit the log.
  cat > "$HOME/.netrc" <<EOF
machine github.com login x-access-token password ${GITHUB_TOKEN}
EOF
else
  echo "  (GITHUB_TOKEN not set — private github: npm deps may fail)"
fi

echo "→ npm install"
npm install

echo "→ npm run install:dropins (copies @dropins + theme files into served paths)"
npm run install:dropins

# Resolve `aio` without hitting shop/bin/aio (that's our shim that falls back
# to npx, so it's always "present" — we want to know if a *real* aio is on PATH).
real_aio_installed() {
  local self
  self="$(readlink -f "$(pwd)/bin/aio" 2>/dev/null || echo /dev/null)"
  local IFS=':'
  for dir in $PATH; do
    if [ -x "$dir/aio" ]; then
      local resolved
      resolved="$(readlink -f "$dir/aio" 2>/dev/null || echo "$dir/aio")"
      [ "$resolved" != "$self" ] && return 0
    fi
  done
  return 1
}

if ! real_aio_installed; then
  echo "→ installing @adobe/aio-cli globally (this takes a few minutes — progress below)"
  # --loglevel=http prints one line per package fetch so you can see it's alive.
  # Without this flag npm is silent for 2-5 minutes on this install.
  npm install -g @adobe/aio-cli --loglevel=http
  echo "→ aio telemetry + plugins"
  aio telemetry yes
  aio plugins:install @adobe/aio-cli-plugin-api-mesh
  aio plugins:install https://github.com/adobe-commerce/aio-cli-plugin-commerce
else
  echo "→ aio-cli already installed"
fi

echo "✅ setup complete"
