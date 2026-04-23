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

# github.com known_hosts for the node user — aio-cli pulls some transitive
# deps from git+ssh://github.com/... URLs (e.g. devx-services/...), and
# without a pre-populated entry the non-interactive build hits a host-key
# prompt and hangs. Line 63 populated /root/.ssh/known_hosts; mirror that
# for /home/node/.ssh/known_hosts.
RUN mkdir -p ~/.ssh && chmod 700 ~/.ssh && \
    curl -sL https://api.github.com/meta | jq -r '.ssh_keys | .[]' | sed -e 's/^/github.com /' >> ~/.ssh/known_hosts && \
    chmod 600 ~/.ssh/known_hosts

# aio-cli + plugins installed into /opt/aio using the adobe-commerce pattern:
# a dedicated package.json with `overrides` pins transitive versions that
# JFrog's bac-npm-remote blocks under its security policy. These defaults are
# the newest versions currently *allowed* — bump when the block moves. Any
# new JFrog block surfaces as an npm 403; add the package name + the
# newest-allowed version as a new override below.
ARG AIO_CLI_VERSION=11.0.2
ARG AIO_CLI_PLUGIN_API_MESH_VERSION=5.6.4
ARG AIO_CLI_PLUGIN_COMMERCE_REF=main
ARG AXIOS_OVERRIDE_VERSION=1.14.0
ARG BASELINE_BROWSER_MAPPING_OVERRIDE_VERSION=2.10.20
ARG WEBPACK_SOURCES_OVERRIDE_VERSION=3.3.3
ARG AJV_OVERRIDE_VERSION=6.12.6

# /opt needs root to create; chown to node so the npm install runs as node
# with /home/node/.npmrc (JFrog auth).
RUN sudo mkdir -p /opt/aio && sudo chown node:node /opt/aio

# Write a tiny aio-local package.json with deps + overrides, then install.
# JFROG_TOKEN comes from a BuildKit secret at install time — npm reads
# ~/.npmrc which expands ${JFROG_TOKEN} from process env, so the token is
# never baked into the image. The BuildKit cache mount on /home/node/.npm
# persists tarballs across image rebuilds.
RUN printf '{"name":"aio-local","version":"0.0.0","dependencies":{"@adobe/aio-cli":"%s","@adobe/aio-cli-plugin-api-mesh":"%s"},"overrides":{"axios":"%s","baseline-browser-mapping":"%s","webpack-sources":"%s","ajv":"%s"}}' \
      "${AIO_CLI_VERSION}" "${AIO_CLI_PLUGIN_API_MESH_VERSION}" \
      "${AXIOS_OVERRIDE_VERSION}" "${BASELINE_BROWSER_MAPPING_OVERRIDE_VERSION}" "${WEBPACK_SOURCES_OVERRIDE_VERSION}" "${AJV_OVERRIDE_VERSION}" \
      > /opt/aio/package.json

RUN --mount=type=cache,target=/home/node/.npm,sharing=locked,uid=1000,gid=1000 \
    --mount=type=secret,id=jfrog_token,uid=1000 \
    --mount=type=ssh,uid=1000 \
    JFROG_TOKEN="$(cat /run/secrets/jfrog_token)" \
    npm --prefix /opt/aio install --loglevel=http --no-audit --no-fund

# PATH wiring + telemetry opt-in + plugin link for api-mesh.
RUN echo 'export PATH="/opt/aio/node_modules/.bin:$PATH"' | sudo tee /etc/profile.d/aio.sh > /dev/null && \
    echo 'export PATH="/opt/aio/node_modules/.bin:$PATH"' >> ~/.bashrc && \
    export PATH="/opt/aio/node_modules/.bin:$PATH" && \
    aio telemetry yes && \
    aio plugins:link /opt/aio/node_modules/@adobe/aio-cli-plugin-api-mesh

# aio-cli-plugin-commerce isn't published to npm (only GitHub). We deliberately
# do NOT use `aio plugins:install <git-url>` — oclif's plugin-plugins always
# runs npm with --include=dev which pulls electron-to-chromium@latest, another
# JFrog-blocked package. Instead: clone + `npm install --omit=dev` ourselves,
# then `aio plugins:link` to register. Same cache mount as above.
RUN --mount=type=cache,target=/home/node/.npm,sharing=locked,uid=1000,gid=1000 \
    --mount=type=secret,id=jfrog_token,uid=1000 \
    --mount=type=ssh,uid=1000 \
    sudo mkdir -p /opt/aio-cli-plugin-commerce && \
    sudo chown node:node /opt/aio-cli-plugin-commerce && \
    JFROG_TOKEN="$(cat /run/secrets/jfrog_token)" \
    git clone --depth 1 --branch "${AIO_CLI_PLUGIN_COMMERCE_REF}" \
      https://github.com/adobe-commerce/aio-cli-plugin-commerce /opt/aio-cli-plugin-commerce && \
    JFROG_TOKEN="$(cat /run/secrets/jfrog_token)" \
    npm --prefix /opt/aio-cli-plugin-commerce install \
      --loglevel=http --no-audit --no-fund --omit=dev --legacy-peer-deps && \
    export PATH="/opt/aio/node_modules/.bin:$PATH" && \
    aio plugins:link /opt/aio-cli-plugin-commerce

RUN echo 'export PATH="$(pwd)/.devcontainer/bin:$PATH"' >> ~/.bashrc
RUN echo 'export PATH="$(pwd)/aio/bin:$PATH"' >> ~/.bashrc

RUN echo 'export WORKSPACE_DIR=$(pwd)' >> ~/.bashrc

RUN sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y && sudo apt clean
