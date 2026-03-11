/**
 * Launches Prisma Studio with a resolved schema engine binary when available.
 */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const enginesDir = path.join(projectRoot, "node_modules", "@prisma", "engines");
const prismaCliPath = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");

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

const env = { ...process.env };
const schemaEngineBinary = resolveSchemaEngineBinary();

if (schemaEngineBinary) {
  env.PRISMA_SCHEMA_ENGINE_BINARY = schemaEngineBinary;
}

const result = spawnSync(
  process.execPath,
  [prismaCliPath, "studio", ...process.argv.slice(2)],
  {
    cwd: projectRoot,
    env,
    stdio: "inherit",
  }
);

if (result.error) {
  console.error("[prisma-studio] Failed to start Prisma Studio:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
