/**
 * Backend process entrypoint that starts the HTTP server and logs startup metadata.
 */
import { Express } from "express";
import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";

const DEFAULT_PORT = 5000;
const LOCAL_BASE_URL = "http://localhost";
const DOCS_PATH = "/docs";
const DEFAULT_PORT_RETRY_ATTEMPTS = 1;

// Resolves the effective startup port using configuration and fallback values.
function resolveServerPort(configuredPort: number | undefined, fallbackPort: number): number {
  return configuredPort || fallbackPort;
}

// Builds startup status lines for operational visibility.
function buildStartupMessages(serverPort: number, environmentName: string): string[] {
  return [
    `Server running on port: ${serverPort}`,
    `API docs: ${LOCAL_BASE_URL}:${serverPort}${DOCS_PATH}`,
    `Environment: ${environmentName}`,
  ];
}

// Logs startup diagnostics after successful server bootstrap.
function logStartupMessages(messages: string[]): void {
  messages.forEach((message) => {
    console.log(message);
  });
}

// Resolves and sanitizes how many port retry attempts are allowed.
function resolvePortRetryAttempts(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

// Attempts to bind the HTTP server to a single candidate port.
function tryStartServerOnPort(
  expressApp: Express,
  serverPort: number,
  environmentName: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = expressApp.listen(serverPort, () => {
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

// Starts the HTTP server with retry handling across candidate ports.
async function startServer(
  expressApp: Express,
  preferredPort: number,
  environmentName: string
): Promise<number> {
  const maxAttempts = resolvePortRetryAttempts(
    process.env.PORT_RETRY_ATTEMPTS,
    DEFAULT_PORT_RETRY_ATTEMPTS
  );

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidatePort = preferredPort + attempt;
    const started = await tryStartServerOnPort(expressApp, candidatePort, environmentName);
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

const serverPort = resolveServerPort(config.port, DEFAULT_PORT);
const DB_CONNECT_MAX_RETRIES = parseInt(process.env.DB_CONNECT_MAX_RETRIES || "10", 10);
const DB_CONNECT_RETRY_DELAY_MS = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || "2000", 10);

// Delays execution for the requested retry interval.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Redacts sensitive database URL credentials before logging.
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

// Retries database connectivity until success or retry budget exhaustion.
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

// Coordinates database readiness and HTTP server startup.
async function bootstrap(): Promise<void> {
  await ensureDatabaseConnection();
  await startServer(app, serverPort, config.nodeEnv);
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed:", error);
  process.exit(1);
});
