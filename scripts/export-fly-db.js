const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const backupsDirectory = path.join(repoRoot, "backups");
const defaultOutputFile = path.join(backupsDirectory, "fly-production.sql");
const defaultAppName = process.env.FLY_APP_NAME || "grindspot-fly-app";
const sourceDatabaseUrl =
  process.env.SOURCE_DATABASE_URL?.trim() || process.env.FLY_DATABASE_URL?.trim() || "";
const requestedOutputFile = process.argv[2]?.trim() || process.env.DB_DUMP_FILE?.trim() || defaultOutputFile;
const dumpSchema = process.env.DB_DUMP_SCHEMA?.trim() || "";
const defaultProxyPort = process.env.FLY_PROXY_LOCAL_PORT?.trim() || "15432";

function resolveCommand(binary) {
  return binary;
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: options.env || process.env,
    encoding: "utf8",
    stdio: options.captureOutput ? ["inherit", "pipe", "pipe"] : "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(stderr || `Command failed: ${command} ${args.join(" ")}`);
  }

  return (result.stdout || "").trim();
}

function ensureDirectoryForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function waitForListeningPort(port, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    function attemptConnection() {
      const socket = net.createConnection({ host: "127.0.0.1", port: Number(port) });

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for local port ${port} to become available.`));
          return;
        }

        setTimeout(attemptConnection, 200);
      });
    }

    attemptConnection();
  });
}

function resolveStartedMachineId(appName) {
  const output = runCommand("flyctl", ["machine", "list", "-a", appName, "-j"], {
    captureOutput: true,
  });
  const machines = JSON.parse(output);
  const startedMachine = machines.find((machine) => machine.state === "started");

  if (!startedMachine?.id) {
    throw new Error(`No started Fly machine found for app "${appName}".`);
  }

  return startedMachine.id;
}

function resolveFlyDatabaseUrl(appName) {
  const explicitMachineId = process.env.FLY_MACHINE_ID?.trim();
  const machineId = explicitMachineId || resolveStartedMachineId(appName);

  const directUrl = runCommand(
    "flyctl",
    ["ssh", "console", "-a", appName, "--machine", machineId, "-C", "printenv DIRECT_URL"],
    { captureOutput: true }
  );

  if (directUrl) {
    return directUrl;
  }

  const databaseUrl = runCommand(
    "flyctl",
    ["ssh", "console", "-a", appName, "--machine", machineId, "-C", "printenv DATABASE_URL"],
    { captureOutput: true }
  );

  if (!databaseUrl) {
    throw new Error("DIRECT_URL and DATABASE_URL were both empty on the running Fly machine.");
  }

  return databaseUrl;
}

function dumpDatabase(databaseUrl, outputFile) {
  const args = ["supabase", "db", "dump", "--db-url", databaseUrl, "--file", outputFile];

  if (dumpSchema) {
    args.push("--schema", dumpSchema);
  }

  console.log(`Writing SQL dump to ${outputFile}`);
  runCommand(resolveCommand("npx"), args);
}

function shouldProxyThroughFly(databaseUrl) {
  const forceProxy = process.env.FLY_PROXY_FORCE?.trim() === "true";

  if (forceProxy) {
    return true;
  }

  try {
    const parsed = new URL(databaseUrl);
    return parsed.hostname.endsWith(".flympg.net");
  } catch {
    return false;
  }
}

function buildLocalProxyUrl(databaseUrl, localProxyPort) {
  const parsed = new URL(databaseUrl);
  parsed.hostname = "host.docker.internal";
  parsed.port = String(localProxyPort);
  return parsed.toString();
}

async function startFlyProxy(appName, databaseUrl, preferredLocalPort) {
  const parsed = new URL(databaseUrl);
  const remoteHost = parsed.hostname;
  const remotePort = parsed.port || "5432";
  const proxyProcess = spawn("flyctl", ["proxy", `${preferredLocalPort}:${remotePort}`, remoteHost, "-a", appName], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "ignore", "pipe"],
    shell: process.platform === "win32",
    windowsHide: true,
  });

  let proxyErrorOutput = "";
  proxyProcess.stderr.on("data", (chunk) => {
    proxyErrorOutput += chunk.toString();
  });

  const stopProxy = () => {
    if (!proxyProcess.killed) {
      proxyProcess.kill();
    }
  };

  proxyProcess.once("error", (error) => {
    proxyErrorOutput += error.message;
  });

  try {
    await waitForListeningPort(preferredLocalPort);
  } catch (error) {
    stopProxy();
    const details = proxyErrorOutput.trim();
    throw new Error(details || error.message);
  }

  return {
    localProxyPort: preferredLocalPort,
    stopProxy,
  };
}

async function main() {
  ensureDirectoryForFile(requestedOutputFile);

  const databaseUrl = sourceDatabaseUrl || resolveFlyDatabaseUrl(defaultAppName);

  if (!shouldProxyThroughFly(databaseUrl)) {
    dumpDatabase(databaseUrl, requestedOutputFile);
    console.log("");
    console.log("Fly export completed.");
    console.log(`Output file: ${requestedOutputFile}`);
    console.log("Next step: set TARGET_DATABASE_URL or SUPABASE_DATABASE_URL and run npm run migrate:db:import");
    return;
  }

  console.log(`Starting Fly database proxy on localhost:${defaultProxyPort}...`);
  const { localProxyPort, stopProxy } = await startFlyProxy(defaultAppName, databaseUrl, defaultProxyPort);

  try {
    const proxiedUrl = buildLocalProxyUrl(databaseUrl, localProxyPort);
    dumpDatabase(proxiedUrl, requestedOutputFile);
  } finally {
    stopProxy();
  }

  console.log("");
  console.log("Fly export completed.");
  console.log(`Output file: ${requestedOutputFile}`);
  console.log("Next step: set TARGET_DATABASE_URL or SUPABASE_DATABASE_URL and run npm run migrate:db:import");
}

main().catch((error) => {
  console.error("[export-fly-db] Failed:", error.message);
  process.exit(1);
});
