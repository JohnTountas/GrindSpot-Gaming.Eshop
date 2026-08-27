const net = require("node:net");
const { describeWindowsPortBlockers, stopWindowsProcesses } = require("./dev-process-utils");

const requiredPorts = [
  { port: 3000, label: "frontend (Vite)" },
  { port: 5000, label: "backend API" },
];

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function main() {
  let blockedPorts = await getBlockedPorts();

  if (blockedPorts.length === 0) {
    process.exit(0);
  }

  if (process.platform === "win32") {
    // Prefer self-healing for known stale GrindSpot sessions. We still fail
    // fast for anything else so we do not unexpectedly kill unrelated apps.
    const stopCandidates = describeWindowsPortBlockers(blockedPorts.map((entry) => entry.port)).filter(
      (entry) => entry.safeToStop
    );

    if (stopCandidates.length > 0) {
      const stopped = stopWindowsProcesses(stopCandidates);
      if (stopped.length > 0) {
        console.log("Stopped stale GrindSpot local dev processes before startup:");
        stopped.forEach((entry) => {
          console.log(`- PID ${entry.pid} on port ${entry.port}`);
        });
        console.log("");
      }

      blockedPorts = await getBlockedPorts();
      if (blockedPorts.length === 0) {
        process.exit(0);
      }
    }
  }

  console.error("Local dev cannot start because required ports are already in use:\n");
  blockedPorts.forEach((entry) => {
    console.error(`- Port ${entry.port}: ${entry.label}`);
  });

  console.error(
    "\nStop the existing local session first, or run `npm run dev:stop` to clear GrindSpot dev processes."
  );
  process.exit(1);
}

async function getBlockedPorts() {
  if (process.platform === "win32") {
    // Windows dual-stack listeners can make bind checks look available even
    // though Vite or the backend is already bound on `::`.
    const blockedPortSet = new Set(
      describeWindowsPortBlockers(requiredPorts.map((entry) => entry.port)).map((entry) => entry.port)
    );

    return requiredPorts.filter((entry) => blockedPortSet.has(entry.port));
  }

  const blockedPorts = [];

  for (const entry of requiredPorts) {
    // Sequential checks keep console output stable and readable when a future
    // maintainer adds more ports or extra diagnostics around the bind probe.
    const available = await canBind(entry.port);
    if (!available) {
      blockedPorts.push(entry);
    }
  }

  return blockedPorts;
}

void main();
