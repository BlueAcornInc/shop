#!/usr/bin/env bash
# Runs once after the devcontainer is created.
# - Sets up GitHub HTTPS auth for private github: npm deps
# - Installs shop's dependencies
# - Runs install:dropins (shop disabled auto-postinstall; must be called manually)
# - Installs @adobe/aio-cli globally for aio/<app> development
set -euo pipefail

if [ -n "${GITHUB_TOKEN:-}" ]; then
  # Rewrite github SSH URLs to HTTPS so `github:Org/Repo` npm specs fetch over
  # HTTPS, where .netrc auth applies.
  git config --global url."https://github.com/".insteadOf "git@github.com:"
  git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
  umask 077
  cat > "$HOME/.netrc" <<EOF
machine github.com login x-access-token password ${GITHUB_TOKEN}
EOF
else
  echo "GITHUB_TOKEN not set — private GitHub-hosted npm deps will fail to resolve." >&2
fi

npm install
npm run install:dropins

# aio-cli + plugins for the aio/<app> projects. JFROG_TOKEN is in the runtime
# env so this resolves through BAC JFrog. Install once per container lifetime.
if ! command -v aio >/dev/null 2>&1; then
  npm install -g @adobe/aio-cli
  aio telemetry yes
  aio plugins:install @adobe/aio-cli-plugin-api-mesh
  aio plugins:install https://github.com/adobe-commerce/aio-cli-plugin-commerce
fi
