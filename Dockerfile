FROM node:18.18.0-slim AS base

# Required to run Prisma on ARM64 machines
# https://github.com/prisma/prisma/issues/861#issuecomment-881992292
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY . .

RUN npm install

# Required for running all microservices
RUN npm install concurrently

RUN npm run setup:dev

RUN npm run db:migrate:deploy

RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT ./docker-entrypoint.sh