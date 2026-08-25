const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const defaultInputFile = path.join(repoRoot, "backups", "fly-production.sql");
const inputFile = process.argv[2]?.trim() || process.env.DB_IMPORT_FILE?.trim() || defaultInputFile;
const targetDatabaseUrl =
  process.env.TARGET_DATABASE_URL?.trim() ||
  process.env.SUPABASE_DATABASE_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  "";

function resolveCommand(binary) {
  return binary;
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: options.env || process.env,
    encoding: "utf8",
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

function assertInputFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL import file not found: ${filePath}`);
  }
}

function assertTargetDatabaseUrl() {
  if (!targetDatabaseUrl) {
    throw new Error(
      "TARGET_DATABASE_URL, SUPABASE_DATABASE_URL, or DATABASE_URL must be set before running the import."
    );
  }
}

function main() {
  assertInputFileExists(inputFile);
  assertTargetDatabaseUrl();

  console.log(`Importing SQL from ${inputFile}`);
  runCommand(resolveCommand("npx"), [
    "supabase",
    "db",
    "query",
    "--db-url",
    targetDatabaseUrl,
    "--file",
    inputFile,
  ]);

  console.log("");
  console.log("Remote SQL import completed.");
  console.log("Recommended next step: verify the target database with a few SELECT COUNT(*) checks.");
}

main();
