# Multi-stage Docker build for the frontend SPA and backend API.
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Frontend dependencies are isolated so Docker can cache them between builds.
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/. .

# Build-time variables are baked into the static SPA bundle.
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLIC_KEY=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}

RUN npm run build


FROM node:20 AS backend-builder

WORKDIR /app/backend

# Backend install includes Prisma CLI because runtime migrations use it.
COPY backend/package*.json ./
RUN npm ci

COPY backend/. .

RUN npx prisma generate
RUN npm run build


FROM node:20-slim AS runtime

WORKDIR /app

# Prisma on slim images requires OpenSSL to resolve the correct engine binary.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Ship only the compiled backend, Prisma assets, and built frontend bundle.
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

RUN chmod +x ./docker-entrypoint.sh && mkdir -p ./uploads ./logs

# Backend serves both API traffic and the pre-built SPA from the same process.
ENV NODE_ENV=production
ENV PORT=8080
ENV FRONTEND_DIST_PATH=/app/frontend-dist

EXPOSE 8080

CMD ["sh", "./docker-entrypoint.sh"]
