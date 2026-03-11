# Backend Dockerfile for building and running the API service.
# ---------- Build Stage ----------
FROM node:20 AS builder

WORKDIR /app

# Install full backend dependencies because Prisma CLI is needed later.
COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript → dist
RUN npm run build


# ---------- Production Stage ----------
FROM node:20-slim

WORKDIR /app

# Prisma on slim images needs OpenSSL available at runtime.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Ship the compiled app plus the full node_modules directory for runtime Prisma commands.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && mkdir -p ./uploads ./logs

ENV NODE_ENV=production

EXPOSE 5000

CMD ["sh", "./docker-entrypoint.sh"]
