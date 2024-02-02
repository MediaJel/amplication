# Use a base image with Docker installed
FROM node:18.18.0-slim AS builder

# Required to run Prisma on ARM64 machines
# https://github.com/prisma/prisma/issues/861#issuecomment-881992292
RUN apt-get update && \
    apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run setup:dev

RUN npm run db:migrate:deploy

RUN chmod +x ./docker-entrypoint.sh

# Install Docker CLI and Docker Compose
RUN apt-get install -y curl && \
    curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm get-docker.sh


# Your application startup command
ENTRYPOINT ["./docker-entrypoint.sh"]
