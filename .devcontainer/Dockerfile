FROM mcr.microsoft.com/devcontainers/base:bullseye
# Install php-fpm
# RUN curl -sS https://packages.sury.org/php/apt.gpg | apt-key add - \
#     && echo "deb https://packages.sury.org/php/ bullseye main" | tee /etc/apt/sources.list.d/php.list

RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg && \
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | \
  sudo tee /etc/apt/sources.list.d/1password.list && \
  sudo mkdir -p /etc/debsig/policies/AC2D62742012EA22/ && \
  curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | \
  sudo tee /etc/debsig/policies/AC2D62742012EA22/1password.pol && \
  sudo mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22 && \
  curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg

RUN apt-get update && apt-get install -y \
    libzip-dev \
    git \
    unzip \
    wget \
    sudo \
    \
    libnss3-tools\
    inotify-tools \
    \
    1password-cli \
     \
    && apt clean

#installs mkcert
# RUN curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
# RUN chmod +x mkcert-v*-linux-amd64
# RUN sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert

RUN mkdir -p ~/.ssh/
RUN curl -L https://api.github.com/meta | jq -r '.ssh_keys | .[]' | sed -e 's/^/github.com /' >> ~/.ssh/known_hosts
RUN curl https://bitbucket.org/site/ssh >> ~/.ssh/known_hosts


USER vscode

ARG NODE_VERSION=--lts

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    export NVM_DIR="$HOME/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    npm install -g npm@latest

ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH

RUN export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && \
    npm install -g @adobe/aio-cli

RUN export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && \
    aio telemetry yes && \
    aio plugins:install @adobe/aio-cli-plugin-api-mesh

RUN export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && \
    aio telemetry yes && \
    aio plugins:install @adobe/aio-cli-plugin-api-mesh && \
    aio plugins:install https://github.com/adobe-commerce/aio-cli-plugin-commerce


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