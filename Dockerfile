FROM node:18.12.1-slim AS base

# Required to run Prisma on ARM64 machines
# https://github.com/prisma/prisma/issues/861#issuecomment-881992292
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY . .

RUN npm install

RUN npm run setup:dev

# Expected that docker-compose.dev
RUN npm run db:migrate:deploy

RUN npm run serve:all

ENTRYPOINT ["node", "./main.js"]
