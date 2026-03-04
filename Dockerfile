# IMPORTANT Dockerfile for importint the entire project LIVE on internet through out "Render.com"

FROM node:20-bookworm-slim AS backend-build

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/. ./

RUN npm run build




FROM node:20-bookworm-slim AS backend-prod-deps

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev


FROM node:20-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/. ./
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build


FROM node:20-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

WORKDIR /app/backend

COPY backend/package*.json ./
COPY --from=backend-prod-deps /app/backend/node_modules ./node_modules

# Include Prisma CLI + engines for migrate deploy at runtime.
COPY --from=backend-build /app/backend/node_modules/prisma ./node_modules/prisma
COPY --from=backend-build /app/backend/node_modules/@prisma ./node_modules/@prisma

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

RUN mkdir -p /app/backend/uploads

RUN cat <<'EOF' > /app/start.sh
#!/bin/sh
set -e

: "${PORT:=10000}"

cd /app/backend
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi
PORT=5000 node dist/server.js &

cat > /etc/nginx/conf.d/default.conf <<NGINX
server {
  listen ${PORT};
  listen [::]:${PORT};
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /docs {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /health {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /uploads {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
NGINX

nginx -g 'daemon off;'
EOF
RUN chmod +x /app/start.sh

ENV NODE_ENV=production
EXPOSE 10000

CMD ["/app/start.sh"]
