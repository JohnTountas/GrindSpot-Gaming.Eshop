/**
 * Process entrypoint for the API.
 *
 * Keep startup concerns here: connect to Postgres, bind the HTTP server, and
 * leave the Express composition itself to `app.ts`.
 */
import { Express } from "express";
import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";

const DEFAULT_PORT = 5000;
const DEFAULT_HOST = "0.0.0.0";
const LOCAL_BASE_URL = "http://localhost";
const DOCS_PATH = "/docs";
const DEFAULT_PORT_RETRY_ATTEMPTS = 1;

// Prefer configured runtime values, but keep one predictable fallback for local recovery.
function resolveServerPort(configuredPort: number | undefined, fallbackPort: number): number {
  return configuredPort || fallbackPort;
}

// Centralize startup logging so every successful boot prints the same footprint.
function buildStartupMessages(serverPort: number, environmentName: string): string[] {
  return [
    `Server running on port: ${serverPort}`,
    `API docs: ${LOCAL_BASE_URL}:${serverPort}${DOCS_PATH}`,
    `Environment: ${environmentName}`,
  ];
}

// Emit startup lines together once we know the process is actually serving traffic.
function logStartupMessages(messages: string[]): void {
  messages.forEach((message) => {
    console.log(message);
  });
}

// The retry count is env-driven so local dev can recover from stale listeners without code changes.
function resolvePortRetryAttempts(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

// Try one candidate port at a time so we can recover from "port already in use"
// without masking other boot failures.
function tryStartServerOnPort(
  expressApp: Express,
  serverPort: number,
  environmentName: string,
  listenHost: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = expressApp.listen(serverPort, listenHost, () => {
      const startupMessages = buildStartupMessages(serverPort, environmentName);
      logStartupMessages(startupMessages);
      resolve(true);
    });

    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${serverPort} is already in use.`);
        resolve(false);
        return;
      }

      reject(error);
    });
  });
}

// Walk the configured retry window linearly. Keeping this simple makes startup
// behavior easier to reason about in dev and in container logs.
async function startServer(
  expressApp: Express,
  preferredPort: number,
  environmentName: string,
  listenHost: string
): Promise<number> {
  const maxAttempts = resolvePortRetryAttempts(
    process.env.PORT_RETRY_ATTEMPTS,
    DEFAULT_PORT_RETRY_ATTEMPTS
  );

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidatePort = preferredPort + attempt;
    const started = await tryStartServerOnPort(
      expressApp,
      candidatePort,
      environmentName,
      listenHost
    );
    if (started) {
      if (candidatePort !== preferredPort) {
        console.warn(
          `Preferred port ${preferredPort} was unavailable. Running on fallback port ${candidatePort}.`
        );
      }
      return candidatePort;
    }
  }

  const maxCheckedPort = preferredPort + maxAttempts - 1;
  throw new Error(
    `Unable to start server. Ports ${preferredPort}-${maxCheckedPort} are unavailable.`
  );
}

// These values are read once at process start. If they are wrong, we want a loud
// boot failure rather than partial runtime drift.
const serverPort = resolveServerPort(config.port, DEFAULT_PORT);
const serverHost = DEFAULT_HOST;
const DB_CONNECT_MAX_RETRIES = parseInt(process.env.DB_CONNECT_MAX_RETRIES || "10", 10);
const DB_CONNECT_RETRY_DELAY_MS = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || "2000", 10);

// Small wrapper to keep retry code readable.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// If startup fails, logs should still help us diagnose the target host without
// leaking credentials into CI or provider logs.
function redactDatabaseUrl(url: string): string {
  if (!url) {
    return "(missing DATABASE_URL)";
  }

  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return "(invalid DATABASE_URL format)";
  }
}

// Containers can come up before Postgres is ready. Retrying here avoids turning
// a short-lived infrastructure race into a failed release.
async function ensureDatabaseConnection(): Promise<void> {
  for (let attempt = 1; attempt <= DB_CONNECT_MAX_RETRIES; attempt += 1) {
    try {
      await prisma.$connect();
      console.log("Database connection established !\n");
      return;
    } catch (error) {
      const isLastAttempt = attempt === DB_CONNECT_MAX_RETRIES;
      console.error(`Database connection attempt ${attempt}/${DB_CONNECT_MAX_RETRIES} failed.`);

      if (isLastAttempt) {
        console.error("Unable to connect to the database at startup.");
        console.error(`Database URL: ${redactDatabaseUrl(config.databaseUrl)}`);
        console.error(
          "Start PostgreSQL (or Docker Desktop), verify DATABASE_URL, then run migrations and `npm run database`."
        );
        throw error;
      }

      await wait(DB_CONNECT_RETRY_DELAY_MS);
    }
  }
}

// Boot order matters: if the database is unavailable, fail before binding the
// port so health checks never see a half-ready API.
async function bootstrap(): Promise<void> {
  await ensureDatabaseConnection();
  await startServer(app, serverPort, config.nodeEnv, serverHost);
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed:", error);
  process.exit(1);
});
