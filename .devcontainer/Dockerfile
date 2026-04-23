# Base image selected via build arg. Defaults in docker-compose.yml to the
# BAC JFrog mirror of devcontainers/javascript-node (Node + npm + nvm
# preinstalled, user `node`).
ARG BASE_IMAGE=mcr.microsoft.com/devcontainers/javascript-node:20-bullseye
FROM ${BASE_IMAGE}

# JFrog proxy — rewrite apt sources BEFORE any apt-get call so Debian package
# pulls route through the BAC JFrog mirror (deb.debian.org is Zscaler-blocked).
# JFROG_TOKEN comes in via a BuildKit secret so it doesn't land in build-args
# / image history. The auth.conf file still persists in the final image (apt
# needs it at install time); rotate tokens regularly.
ARG USE_JFROG=false
ARG JFROG_HOST=groupinfosys.jfrog.io
ARG JFROG_USER
RUN --mount=type=secret,id=jfrog_token,target=/run/secrets/jfrog_token \
    if [ "$USE_JFROG" = "true" ]; then \
      if [ -z "$JFROG_USER" ] || [ ! -s /run/secrets/jfrog_token ]; then \
        echo "USE_JFROG=true requires JFROG_USER and JFROG_TOKEN (export both in ~/.env)" >&2; exit 1; \
      fi; \
      JFROG_TOKEN="$(cat /run/secrets/jfrog_token)"; \
      if [ -f /etc/apt/sources.list ] && grep -q 'deb.debian.org' /etc/apt/sources.list; then \
        sed -i "s|http://deb.debian.org/debian-security|https://${JFROG_HOST}/artifactory/bls-deb-debian-remote/debian-security|g" /etc/apt/sources.list && \
        sed -i "s|http://deb.debian.org/debian|https://${JFROG_HOST}/artifactory/bls-deb-org-debian-remote|g" /etc/apt/sources.list && \
        sed -i "s|http://security.debian.org|https://${JFROG_HOST}/artifactory/bls-deb-debian-remote/debian-security|g" /etc/apt/sources.list; \
      fi && \
      for f in /etc/apt/sources.list.d/*.sources; do \
        [ -f "$f" ] && \
        sed -i "s|http://deb.debian.org/debian-security|https://${JFROG_HOST}/artifactory/bls-deb-debian-remote/debian-security|g" "$f" && \
        sed -i "s|http://deb.debian.org/debian|https://${JFROG_HOST}/artifactory/bls-deb-org-debian-remote|g" "$f" && \
        sed -i "s|http://security.debian.org|https://${JFROG_HOST}/artifactory/bls-deb-debian-remote/debian-security|g" "$f"; \
      done || true; \
      echo "machine ${JFROG_HOST} login ${JFROG_USER} password ${JFROG_TOKEN}" > /etc/apt/auth.conf && \
      chmod 600 /etc/apt/auth.conf; \
    fi

# Optional Zscaler CA. Copy the host system bundle into place so the Dockerfile
# picks it up at build time:
#
#   cp -L ~/.ssl/combined-ca.pem .devcontainer/zscaler.crt
#
# (Symlinks don't work — Docker build context won't follow them.)
# The bracket glob makes the COPY a no-op if the file is absent.
COPY ./zscaler.cr[t] /tmp/
RUN if [ -f /tmp/zscaler.crt ]; then \
      cp /tmp/zscaler.crt /usr/local/share/ca-certificates/zscaler.crt && \
      update-ca-certificates; \
    fi

# Node/npm trust the system CA bundle (including Zscaler if installed above).
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN apt-get update && apt-get install -y \
    libzip-dev \
    git \
    unzip \
    wget \
    sudo \
    libnss3-tools \
    inotify-tools \
    && apt clean

RUN mkdir -p ~/.ssh/
RUN curl -L https://api.github.com/meta | jq -r '.ssh_keys | .[]' | sed -e 's/^/github.com /' >> ~/.ssh/known_hosts
RUN curl https://bitbucket.org/site/ssh >> ~/.ssh/known_hosts

# javascript-node image ships `node` as the non-root user (not `vscode`).
USER node

# JFrog .npmrc — uses ${JFROG_TOKEN} so npm resolves the token from the
# runtime env at read time; no build-time substitution, nothing sensitive
# baked in. Always installed; if JFROG_TOKEN is empty at npm-install time,
# the registry returns 401 — loud failure, not a silent one.
COPY --chown=node:node .npmrc.jfrog /home/node/.npmrc
RUN chmod 600 /home/node/.npmrc

# aio-cli is NOT installed at build time — it would need JFROG_TOKEN baked in
# (or smuggled via a secret mount for every global npm). Easier to let devs
# install aio via postCreateCommand or on demand:
#
#   npm install -g @adobe/aio-cli
#   aio plugins:install @adobe/aio-cli-plugin-api-mesh
#   aio plugins:install https://github.com/adobe-commerce/aio-cli-plugin-commerce
#
# JFROG_TOKEN is already in the runtime container env, so these just work.

RUN echo 'export PATH="$(pwd)/.devcontainer/bin:$PATH"' >> ~/.bashrc
RUN echo 'export PATH="$(pwd)/aio/bin:$PATH"' >> ~/.bashrc
RUN echo 'export PATH="$(pwd)/bin:$PATH"' >> ~/.bashrc

RUN echo 'export WORKSPACE_DIR=$(pwd)' >> ~/.bashrc

RUN sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y && sudo apt clean
