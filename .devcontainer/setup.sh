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

if ! command -v aio >/dev/null 2>&1; then
  echo "→ installing @adobe/aio-cli (first run)"
  npm install -g @adobe/aio-cli
  aio telemetry yes
  aio plugins:install @adobe/aio-cli-plugin-api-mesh
  aio plugins:install https://github.com/adobe-commerce/aio-cli-plugin-commerce
else
  echo "→ aio-cli already installed"
fi

echo "✅ setup complete"
