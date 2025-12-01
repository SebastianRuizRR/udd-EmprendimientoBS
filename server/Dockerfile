FROM node:20-alpine
# Build del server

# OpenSSL para prisma engines
RUN apk add --no-cache openssl

WORKDIR /app

# Instala deps primero (layer cache)
COPY package*.json ./
RUN npm ci

# Copia prisma y genera el cliente en build
COPY prisma ./prisma
RUN npx prisma generate

# Copia el resto del código
COPY . .

ENV PORT=4000
EXPOSE 4000

# En desarrollo: ts-node-dev
CMD ["npm","run","dev"]
