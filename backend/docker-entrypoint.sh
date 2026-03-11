#!/bin/sh
# Container entrypoint that applies migrations, optionally seeds data, and starts the API.
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Application cannot start."
  exit 1
fi

if [ -z "${DIRECT_URL:-}" ]; then
  echo "DIRECT_URL is not set. Falling back to DATABASE_URL."
  export DIRECT_URL="${DATABASE_URL}"
fi

# Retry migrations because fresh databases or newly attached Postgres instances
# may need a few seconds before accepting schema operations.
MIGRATE_MAX_RETRIES="${MIGRATE_MAX_RETRIES:-10}"
MIGRATE_RETRY_DELAY_SECONDS="${MIGRATE_RETRY_DELAY_SECONDS:-3}"
MIGRATE_ATTEMPT=1

if [ "${RUN_MIGRATIONS_ON_STARTUP:-true}" = "true" ]; then
  while [ "$MIGRATE_ATTEMPT" -le "$MIGRATE_MAX_RETRIES" ]; do
    echo "Applying database migrations (attempt ${MIGRATE_ATTEMPT}/${MIGRATE_MAX_RETRIES})..."

    if npm run migrate:deploy; then
      echo "Database migrations applied successfully."
      break
    fi

    if [ "$MIGRATE_ATTEMPT" -eq "$MIGRATE_MAX_RETRIES" ]; then
      echo "Failed to apply database migrations after ${MIGRATE_MAX_RETRIES} attempts."
      exit 1
    fi

    echo "Migration attempt failed. Retrying in ${MIGRATE_RETRY_DELAY_SECONDS}s..."
    sleep "$MIGRATE_RETRY_DELAY_SECONDS"
    MIGRATE_ATTEMPT=$((MIGRATE_ATTEMPT + 1))
  done
else
  # Fly uses a release command for migrations, so startup should stay lightweight.
  echo "RUN_MIGRATIONS_ON_STARTUP is false. Skipping startup migrations."
fi

if [ "${AUTO_SEED:-false}" = "true" ]; then
  echo "AUTO_SEED is enabled. Checking whether seed data is required..."
  PRODUCT_COUNT=$(node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); prisma.product.count().then((count) => { console.log(count); }).catch(() => { console.log("0"); }).finally(() => prisma.$disconnect());')

  if [ "$PRODUCT_COUNT" = "0" ]; then
    echo "No products found. Running seed script..."
    npm run database
  else
    echo "Seed data already exists (products: $PRODUCT_COUNT). Skipping seed."
  fi
fi

echo "Starting API server..."
exec node dist/server.js
