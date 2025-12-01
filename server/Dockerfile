FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV PORT=4000
EXPOSE 4000

# Compilar TypeScript
RUN npm run build

# Producción: ejecutar JS compilado
CMD ["npm","run","start"]
