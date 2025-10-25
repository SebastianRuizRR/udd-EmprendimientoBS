# ---------- build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npx tsc

# ---------- runtime ----------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

RUN npx prisma generate

EXPOSE 4000
CMD ["node", "dist/index.js"]
