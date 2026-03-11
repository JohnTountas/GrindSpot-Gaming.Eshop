/**
 * Bootstraps a local Prisma/Postgres database before launching Prisma Studio.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const dotenv = require("dotenv");
const { Client } = require("pg");

const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");
const composeFilePath = path.join(repoRoot, "docker-compose.yml");
const enginesDir = path.join(projectRoot, "node_modules", "@prisma", "engines");
const prismaCliPath = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const requiredTables = ["User", "Category", "Product"];
const databaseWaitAttempts = 20;
const databaseWaitDelayMs = 1500;

dotenv.config({ path: path.join(projectRoot, ".env") });
normalizeDatasourceUrls();

/**
 * Copies a single datasource URL across both Prisma env variables when only one is present.
 */
function normalizeDatasourceUrls() {
  const directUrl = process.env.DIRECT_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl && directUrl) {
    process.env.DATABASE_URL = directUrl;
  }

  if (!directUrl && databaseUrl) {
    process.env.DIRECT_URL = databaseUrl;
  }
}

/**
 * Returns the datasource URL Prisma Studio should use.
 */
function resolveDatasourceUrl() {
  return process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || "";
}

/**
 * Builds a consistent child-process environment for Prisma CLI commands.
 */
function buildChildEnv() {
  const env = {
    ...process.env,
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING:
      process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING || "1",
  };
  const schemaEngineBinary = resolveSchemaEngineBinary();

  if (schemaEngineBinary) {
    env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEngineBinary;
  }

  return env;
}

/**
 * Finds the local schema engine binary shipped by Prisma, if present.
 */
function resolveSchemaEngineBinary() {
  if (!fs.existsSync(enginesDir)) {
    return null;
  }

  const candidates = fs
    .readdirSync(enginesDir)
    .filter((name) => name.startsWith("schema-engine"))
    .filter((name) => !name.endsWith(".gz") && !name.endsWith(".sha256"));

  for (const candidate of candidates) {
    const fullPath = path.join(enginesDir, candidate);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Executes a command and treats any non-zero exit status as a hard failure.
 */
function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || projectRoot,
    env: options.env || buildChildEnv(),
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

/**
 * Executes the local Prisma CLI with the resolved engine binary.
 */
function runPrismaCommand(args) {
  runCommand(process.execPath, [prismaCliPath, ...args]);
}

/**
 * Runs an npm script in a cross-platform way.
 */
function runNpmScript(scriptName) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  runCommand(npmCommand, ["run", scriptName], { env: process.env });
}

/**
 * Opens a short-lived Postgres connection for readiness checks and metadata queries.
 */
async function withDatabaseClient(fn) {
  const client = new Client({
    connectionString: resolveDatasourceUrl(),
    connectionTimeoutMillis: 2000,
  });

  await client.connect();

  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/**
 * Returns whether the configured datasource is reachable.
 */
async function canConnectToDatabase() {
  try {
    await withDatabaseClient(async () => {
      return undefined;
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Determines whether the configured datasource points at local Postgres.
 */
function usesLocalDatabaseHost() {
  try {
    const parsedUrl = new URL(resolveDatasourceUrl());
    return localDatabaseHosts.has(parsedUrl.hostname);
  } catch {
    return false;
  }
}

/**
 * Starts the repo's local Postgres container if Docker Compose is available.
 */
function startLocalComposePostgres() {
  if (!fs.existsSync(composeFilePath)) {
    return false;
  }

  console.log("Local PostgreSQL is not reachable. Starting docker compose postgres...");

  try {
    runCommand("docker", ["compose", "-f", composeFilePath, "up", "-d", "postgres"], {
      cwd: repoRoot,
      env: process.env,
    });
    return true;
  } catch (error) {
    console.error("Failed to start docker compose postgres:", error.message);
    return false;
  }
}

/**
 * Waits until Postgres accepts connections or the retry budget is exhausted.
 */
async function waitForDatabaseReadiness() {
  for (let attempt = 1; attempt <= databaseWaitAttempts; attempt += 1) {
    if (await canConnectToDatabase()) {
      console.log("Database connection established.");
      return true;
    }

    await delay(databaseWaitDelayMs);
  }

  return false;
}

/**
 * Ensures Prisma Studio has a reachable Postgres datasource to work with.
 */
async function ensureDatabaseReady() {
  const datasourceUrl = resolveDatasourceUrl();

  if (!datasourceUrl) {
    console.error("DATABASE_URL or DIRECT_URL must be set before running Prisma Studio.");
    process.exit(1);
  }

  if (await canConnectToDatabase()) {
    return;
  }

  if (usesLocalDatabaseHost() && startLocalComposePostgres() && (await waitForDatabaseReadiness())) {
    return;
  }

  console.error("Unable to connect Prisma Studio to PostgreSQL.");
  console.error("Start PostgreSQL or Docker Desktop, then rerun `npm run studio`.");
  process.exit(1);
}

/**
 * Returns the set of existing public tables in the configured database.
 */
async function getExistingTables() {
  return withDatabaseClient(async (client) => {
    const result = await client.query(
      "select table_name from information_schema.tables where table_schema = 'public'"
    );
    return new Set(result.rows.map((row) => row.table_name));
  });
}

/**
 * Creates the Prisma schema in local Postgres when the expected tables do not exist yet.
 */
async function ensureSchemaExists() {
  const tables = await getExistingTables();
  const missingTables = requiredTables.filter((tableName) => !tables.has(tableName));

  if (missingTables.length === 0) {
    return;
  }

  console.log(`Missing Prisma tables: ${missingTables.join(", ")}. Running \`prisma db push\`...`);
  runPrismaCommand(["db", "push", "--skip-generate"]);
}

/**
 * Counts products so Studio can auto-seed the local demo catalog when empty.
 */
async function getProductCount() {
  return withDatabaseClient(async (client) => {
    const result = await client.query('select count(*)::int as count from "Product"');
    return Number(result.rows[0]?.count ?? 0);
  });
}

/**
 * Mirrors the container behavior by seeding demo data when the local catalog is empty.
 */
async function ensureSeedData() {
  const productCount = await getProductCount();

  if (productCount > 0) {
    return;
  }

  console.log("No products found. Running the local seed script...");
  runNpmScript("database");
}

/**
 * Launches Prisma Studio after local bootstrap has completed.
 */
function launchStudio() {
  const result = spawnSync(process.execPath, [prismaCliPath, "studio", ...process.argv.slice(2)], {
    cwd: projectRoot,
    env: buildChildEnv(),
    stdio: "inherit",
  });

  if (result.error) {
    console.error("[prisma-studio] Failed to start Prisma Studio:", result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

async function main() {
  await ensureDatabaseReady();
  await ensureSchemaExists();
  await ensureSeedData();
  launchStudio();
}

main().catch((error) => {
  console.error("[prisma-studio] Failed to prepare Prisma Studio:", error.message);
  process.exit(1);
});
