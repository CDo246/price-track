FROM node:22

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

ENV CHROME_BIN=/usr/bin/google-chrome

WORKDIR /app

COPY . . 

RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 pnpm install

RUN pnpm run client build
RUN pnpm run server prisma generate

CMD pnpm run server prisma migrate deploy && pnpm concurrently "pnpm run server dev" "pnpm run client start"


