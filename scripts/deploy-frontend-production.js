const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const vercelScope = "john-s-team5";
const vercelProject = "grindspot";
const publicProductionAlias = "grindspot.vercel.app";
const deploymentHostPattern = /https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app)/i;

function normalizeDeploymentHost(url) {
  return url.replace(/^https?:\/\//, "").trim();
}

function parseJsonCandidate(output) {
  const trimmedOutput = output.trim();

  if (!trimmedOutput) {
    return null;
  }

  try {
    return JSON.parse(trimmedOutput);
  } catch {
    const lines = trimmedOutput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (let index = lines.length - 1; index >= 0; index -= 1) {
      try {
        return JSON.parse(lines[index]);
      } catch {
        // Ignore non-JSON lines and continue scanning backwards.
      }
    }
  }

  return null;
}

function extractDeploymentHost(commandResult) {
  const combinedOutput = [commandResult.stdout, commandResult.stderr].filter(Boolean).join("\n").trim();
  const jsonPayload = parseJsonCandidate(combinedOutput);
  const deploymentUrl =
    jsonPayload?.url ?? jsonPayload?.deployment?.url ?? jsonPayload?.inspectorUrl ?? jsonPayload?.deploymentUrl;

  if (deploymentUrl) {
    return normalizeDeploymentHost(deploymentUrl);
  }

  const hostMatch = combinedOutput.match(deploymentHostPattern);

  if (hostMatch?.[1]) {
    return hostMatch[1];
  }

  throw new Error(`Unable to resolve the deployment URL from Vercel output:\n${combinedOutput}`);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: options.captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    if (options.captureOutput) {
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
      if (output) {
        console.error(output);
      }
    }

    process.exit(result.status ?? 1);
  }

  return result;
}

function deployProduction() {
  // Be explicit about the Vercel scope/project so local link drift cannot send
  // deployments to the wrong target as the repo or team setup evolves.
  const result = runCommand(
    "vercel",
    ["deploy", "--prod", "--yes", "--json", "--scope", vercelScope, "--project", vercelProject],
    { captureOutput: true }
  );

  const deploymentHost = extractDeploymentHost(result);

  console.log(`Production deployment ready: https://${deploymentHost}`);
  return deploymentHost;
}

function assignPublicAlias(deploymentHost) {
  // `grindspot.vercel.app` is a shared vercel.app alias rather than a project
  // domain, so we promote it explicitly after each production deployment.
  runCommand("vercel", ["alias", "set", deploymentHost, publicProductionAlias, "--scope", vercelScope]);
  console.log(`Public production alias updated: https://${publicProductionAlias}`);
}

function main() {
  const deploymentHost = deployProduction();
  assignPublicAlias(deploymentHost);
}

main();
