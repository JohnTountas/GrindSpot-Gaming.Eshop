/**
 * Launches Prisma Studio against the production Fly database without persisting secrets locally.
 */
const { spawn, spawnSync } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const prismaCliPath = path.join(backendRoot, "node_modules", "prisma", "build", "index.js");
const defaultAppName = process.env.FLY_APP_NAME || "grindspot-fly-app";
const defaultPort = process.env.PRISMA_STUDIO_PORT || "5555";
const defaultBrowser = process.env.PRISMA_STUDIO_BROWSER || "none";
const defaultProxyPort = process.env.FLY_DB_PROXY_PORT || "15432";

/**
 * Runs a command and returns stdout, treating non-zero exits as failures.
 */
function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || backendRoot,
    env: options.env || process.env,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
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

/**
 * Waits until a local TCP port accepts connections.
 */
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

/**
 * Resolves the first started Fly machine for the target app.
 */
function resolveStartedMachineId(appName) {
  const machineListRaw = runCommand("flyctl", ["machine", "list", "-a", appName, "-j"]);
  const machines = JSON.parse(machineListRaw);
  const startedMachine = machines.find((machine) => machine.state === "started");

  if (!startedMachine?.id) {
    throw new Error(`No started Fly machine found for app "${appName}".`);
  }

  return startedMachine.id;
}

/**
 * Reads the DIRECT_URL secret value from the running Fly machine environment.
 */
function resolveDirectUrl(appName, machineId) {
  const directUrl = runCommand("flyctl", [
    "machine",
    "exec",
    "--app",
    appName,
    machineId,
    "printenv DIRECT_URL",
  ]);

  if (!directUrl) {
    throw new Error("DIRECT_URL was empty on the running Fly machine.");
  }

  return directUrl;
}

/**
 * Rewrites the production Fly URL to use a local proxy port.
 */
function buildLocalProxyUrl(directUrl, localProxyPort) {
  const parsed = new URL(directUrl);
  parsed.hostname = "127.0.0.1";
  parsed.port = String(localProxyPort);
  return parsed.toString();
}

/**
 * Launches Prisma Studio with the supplied direct connection URL.
 */
function buildStudioArgs(directUrl, port, browser) {
  const args = [
    prismaCliPath,
    "studio",
    "--config",
    "prisma.config.ts",
    "--url",
    directUrl,
    "--port",
    port,
  ];
  const normalizedBrowser = (browser || "").trim().toLowerCase();

  if (normalizedBrowser && normalizedBrowser !== "default" && normalizedBrowser !== "open") {
    args.push("--browser", browser);
  }

  return args;
}

/**
 * Checks whether Prisma Studio can bind to the supplied local port.
 */
function canListenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(Number(port));
  });
}

/**
 * Picks the first available local port, starting from the preferred one.
 */
async function resolveStudioPort(preferredPort) {
  const basePort = Number(preferredPort);

  if (!Number.isInteger(basePort) || basePort <= 0) {
    throw new Error(`Invalid Prisma Studio port: ${preferredPort}`);
  }

  for (let offset = 0; offset < 10; offset += 1) {
    const candidatePort = String(basePort + offset);

    if (await canListenOnPort(candidatePort)) {
      if (offset > 0) {
        console.log(`Port ${preferredPort} is busy. Falling back to ${candidatePort}.`);
      }

      return candidatePort;
    }
  }

  throw new Error(`Unable to find a free local Prisma Studio port starting at ${preferredPort}.`);
}

/**
 * Starts a Fly TCP proxy to the private Postgres host and waits for it to accept connections.
 */
async function startDatabaseProxy(appName, directUrl, preferredProxyPort) {
  const parsed = new URL(directUrl);
  const remoteHost = parsed.hostname;
  const remotePort = parsed.port || "5432";
  const localProxyPort = await resolveStudioPort(preferredProxyPort);
  const proxyProcess = spawn(
    "flyctl",
    ["proxy", `${localProxyPort}:${remotePort}`, remoteHost, "-a", appName],
    {
      cwd: backendRoot,
      env: process.env,
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    }
  );

  let proxyErrorOutput = "";
  proxyProcess.stderr.on("data", (chunk) => {
    proxyErrorOutput += chunk.toString();
  });

  const stopProxy = () => {
    if (!proxyProcess.killed) {
      proxyProcess.kill();
    }
  };

  process.once("exit", stopProxy);
  process.once("SIGINT", () => {
    stopProxy();
    process.exit(130);
  });
  process.once("SIGTERM", () => {
    stopProxy();
    process.exit(143);
  });

  proxyProcess.once("error", (error) => {
    proxyErrorOutput += error.message;
  });

  try {
    await waitForListeningPort(localProxyPort);
  } catch (error) {
    stopProxy();
    const details = proxyErrorOutput.trim();
    throw new Error(details || error.message);
  }

  return {
    localProxyPort,
    stopProxy,
  };
}

/**
 * Launches Prisma Studio with the supplied direct connection URL.
 */
function launchStudio(directUrl, port, browser) {
  const result = spawnSync(
    process.execPath,
    buildStudioArgs(directUrl, port, browser),
    {
      cwd: backendRoot,
      env: process.env,
      stdio: "inherit",
    }
  );

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}

async function main() {
  const appName = process.argv[2] || defaultAppName;
  const preferredPort = process.argv[3] || defaultPort;
  const browser = process.argv[4] || defaultBrowser;
  const preferredProxyPort = process.argv[5] || defaultProxyPort;

  console.log(`Resolving Fly machine for ${appName}...`);
  const machineId = resolveStartedMachineId(appName);

  console.log(`Fetching DIRECT_URL from machine ${machineId}...`);
  const directUrl = resolveDirectUrl(appName, machineId);
  console.log("Starting Fly database proxy...");
  const { localProxyPort, stopProxy } = await startDatabaseProxy(
    appName,
    directUrl,
    preferredProxyPort
  );
  const port = await resolveStudioPort(preferredPort);
  const localProxyUrl = buildLocalProxyUrl(directUrl, localProxyPort);

  console.log(`Starting Prisma Studio on http://localhost:${port}`);
  try {
    launchStudio(localProxyUrl, port, browser);
  } finally {
    stopProxy();
  }
}

main().catch((error) => {
  console.error("[prisma-studio-production] Failed:", error.message);
  process.exit(1);
});
