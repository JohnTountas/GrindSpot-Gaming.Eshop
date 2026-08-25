const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const containerName = "grindspot-Database";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    ...options,
  });
}

function inspectContainerState() {
  const result = run("docker", [
    "container",
    "inspect",
    containerName,
    "--format",
    "{{.State.Status}}",
  ]);

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

function ensurePostgres() {
  const currentState = inspectContainerState();

  if (currentState === "running") {
    console.log(`${containerName} is already running.`);
    return;
  }

  if (currentState) {
    const startResult = run("docker", ["start", containerName], { stdio: "inherit" });
    process.exit(startResult.status ?? 1);
  }

  const composeResult = run("docker", ["compose", "up", "-d", "postgres"], {
    stdio: "inherit",
  });
  process.exit(composeResult.status ?? 1);
}

ensurePostgres();
