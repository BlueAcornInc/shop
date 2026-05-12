#!/usr/bin/env bash
# Runs on every container attach — output is visible in the attached VS Code
# terminal, and re-running is cheap because each step is idempotent.
#
# - ssh-agent forwarding + github.com auth so npm git+ssh deps resolve and
#   the user can `git push` against ssh remotes with their host keys
# - npm install + install:dropins (theme files land in styles/ + scripts/)
# - aio-cli + plugins for aio/<app> development (one-time, skipped on reruns)
set -eo pipefail

# VS Code's Dev Containers feature copies the host's ~/.gitconfig into the
# container so user name/email carry over. On macOS hosts that config often
# includes `http.sslcainfo = /Users/.../combined-ca.pem` (a Mac path) and
# `core.sshcommand` pointing at 1Password-SSH — neither of which resolves
# inside Linux. Strip them; the container uses the system CA bundle and
# talks to the host ssh-agent via the bind-mounted socket (below).
for bad in http.sslcainfo http.sslCAInfo core.sshcommand core.sshCommand; do
  git config --global --unset-all "$bad" 2>/dev/null || true
done

# Avoid interactive SSH prompts from hanging git commands in the container.
# If auth is missing, fail fast with a clear error instead of waiting forever.
git config --global core.sshCommand "ssh -o BatchMode=yes -o ConnectTimeout=10"

# Host ssh-agent arrives via bind-mount (see docker-compose.yml). Socket is
# root-owned because Docker Desktop doesn't remap uids for bind-mounts, so
# the non-root `node` user needs a chmod. Once accessible, both `git push`
# against ssh remotes and npm's git+ssh deps (github:org/repo) work natively.
if [ -S /tmp/ssh-agent.sock ]; then
  sudo chmod 666 /tmp/ssh-agent.sock
  keys=$(ssh-add -l 2>/dev/null | grep -c SHA256 || true)
  if [ "$keys" -gt 0 ]; then
    echo "→ ssh-agent forwarded (${keys} keys loaded)"
    SSH_AUTH_OK=1
  fi
fi

# GITHUB_TOKEN + netrc is a fallback for when ssh-agent isn't forwarded
# (e.g. host without 1Password-SSH). With both available, prefer SSH so
# user's `git push` hits the org the key authorizes. Don't use `insteadOf`
# to rewrite ssh→https; that normalizes user remotes and defeats the point.
if [ -z "${SSH_AUTH_OK:-}" ] && [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "→ no ssh-agent — falling back to GITHUB_TOKEN via netrc"
  git config --global --unset-all url."https://github.com/".insteadOf 2>/dev/null || true
  git config --global --add url."https://github.com/".insteadOf "git@github.com:"
  git config --global --add url."https://github.com/".insteadOf "ssh://git@github.com/"
  umask 077
  # Write netrc without -x tracing so the token doesn't hit the log.
  cat > "$HOME/.netrc" <<EOF
machine github.com login x-access-token password ${GITHUB_TOKEN}
EOF
elif [ -z "${SSH_AUTH_OK:-}" ]; then
  echo "⚠️  no ssh-agent forwarded and no GITHUB_TOKEN — github: npm deps and git push will fail"
  if [[ "${HOST_SSH_AUTH_SOCK:-}" == /var/run/com.apple.launchd/* ]]; then
    echo "   macOS launchd agent is mounted but has no keys in this session."
    echo "   For 1Password SSH Agent, export SSH_AUTH_SOCK to the 1Password socket on host"
    echo "   before opening VS Code/devcontainer, then rebuild the container."
  fi
fi

echo "→ npm install"
npm install

echo "→ npm run install:dropins (copies @dropins + theme files into served paths)"
npm run install:dropins

# aio-cli + plugins are pre-installed into /opt/aio by the Dockerfile, using
# the overrides pattern from adobe-commerce to work around JFrog curation
# blocks on axios / baseline-browser-mapping / webpack-sources transitives.
# PATH already includes /opt/aio/node_modules/.bin via /etc/profile.d/aio.sh.
if command -v aio >/dev/null 2>&1; then
  echo "→ aio-cli ready ($(aio --version 2>&1 | head -1))"
else
  echo "⚠️  aio-cli not on PATH — image build may have failed; rebuild container." >&2
fi

echo "✅ setup complete"
