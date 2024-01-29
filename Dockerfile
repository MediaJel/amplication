FROM node:18.18.0-slim AS base

# Required to run Prisma on ARM64 machines
# https://github.com/prisma/prisma/issues/861#issuecomment-881992292
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY . .

RUN npm install

RUN npm run setup:dev

RUN npm run db:migrate:deploy


ENTRYPOINT ["npm", "run", "serve:all"]
