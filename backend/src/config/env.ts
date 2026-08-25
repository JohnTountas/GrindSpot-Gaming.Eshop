/**
 * Loads, validates, and exposes environment variables used by the backend.
 */
import dotenv from "dotenv";

dotenv.config();

type CookieSameSite = "strict" | "lax" | "none";

// Ignores placeholder connection strings copied from docs or dashboards.
function isPlaceholderDatabaseUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim();
  return (
    normalizedValue === "postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" ||
    normalizedValue === "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
  );
}

// Resolves the runtime database URL, preferring the pooled app connection.
function resolveRuntimeDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();

  if (databaseUrl && !isPlaceholderDatabaseUrl(databaseUrl)) {
    return databaseUrl;
  }

  if (directUrl && !isPlaceholderDatabaseUrl(directUrl)) {
    return directUrl;
  }

  return "";
}

// Supports a comma-separated allowlist for split frontend/backend deployments.
function resolveCorsOrigins(): string[] {
  const rawOrigins = process.env.CORS_ORIGIN?.trim();

  if (!rawOrigins) {
    return ["http://localhost:3000"];
  }

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Keeps cookie policy configurable so same-origin and cross-origin deployments
// can use the same backend without code edits.
function resolveCookieSameSite(): CookieSameSite {
  const configuredValue = process.env.AUTH_COOKIE_SAME_SITE?.trim().toLowerCase();

  if (
    configuredValue === "strict" ||
    configuredValue === "lax" ||
    configuredValue === "none"
  ) {
    return configuredValue;
  }

  return "strict";
}

// Browsers require Secure cookies whenever SameSite=None is used.
function resolveCookieSecure(sameSite: CookieSameSite): boolean {
  const configuredValue = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();

  if (configuredValue === "true") {
    return true;
  }

  if (configuredValue === "false") {
    return false;
  }

  return sameSite === "none" || (process.env.NODE_ENV || "development") === "production";
}

const cookieSameSite = resolveCookieSameSite();

// Exposes normalized environment configuration for the backend runtime.
export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: resolveRuntimeDatabaseUrl(),

  jwt: {
    secret: process.env.JWT_SECRET || "grindspot-dev-access-token-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "grindspot-dev-refresh-token-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  corsOrigins: resolveCorsOrigins(),

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },

  authCookies: {
    sameSite: cookieSameSite,
    secure: resolveCookieSecure(cookieSameSite),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },
};
