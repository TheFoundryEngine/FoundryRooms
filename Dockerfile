# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY modules/*/package.json ./modules/
COPY contracts/package.json ./contracts/
COPY worker/package.json ./worker/

RUN npm ci

COPY tsconfig.json tsconfig.base.json ./
COPY src/ ./src/
COPY modules/ ./modules/
COPY contracts/ ./contracts/
COPY worker/ ./worker/

# Build the API (root tsc --build → /app/dist) and the worker (→ /app/worker/dist)
RUN npm run build && npm run build:worker

# ── API runtime ────────────────────────────────────────────────────────────
FROM node:20-alpine AS api

WORKDIR /app

COPY package*.json ./
COPY modules/*/package.json ./modules/
COPY contracts/package.json ./contracts/
COPY worker/package.json ./worker/

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

# ── Worker runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS worker

WORKDIR /app

COPY package*.json ./
COPY modules/*/package.json ./modules/
COPY contracts/package.json ./contracts/
COPY worker/package.json ./worker/

RUN npm ci --omit=dev

COPY --from=build /app/worker/dist ./worker/dist

ENV WORKER_HEALTH_PORT=9090
EXPOSE 9090

CMD ["node", "worker/dist/index.js"]
