FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json tsconfig.base.json ./
COPY src/ ./src/
COPY modules/ ./modules/
COPY contracts/ ./contracts/
COPY worker/ ./worker/

RUN npm ci && npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
