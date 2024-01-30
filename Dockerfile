FROM node:18.18.0-slim AS base

# Required to run Prisma on ARM64 machines
# https://github.com/prisma/prisma/issues/861#issuecomment-881992292
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run setup:dev

RUN npm run db:migrate:deploy

RUN chmod +x ./docker-entrypoint.sh

# Install Docker buildx
RUN curl -L https://github.com/docker/buildx/releases/download/v0.12.1/buildx-v0.12.1.linux-amd64 -o /usr/local/bin/buildx \
  && chmod a+x /usr/local/bin/buildx \
  && buildx create --use
  
ENTRYPOINT ./docker-entrypoint.sh