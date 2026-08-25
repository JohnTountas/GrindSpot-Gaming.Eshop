const net = require("node:net");

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
  const blockedPorts = [];

  for (const entry of requiredPorts) {
    // Sequential checks keep console output stable and readable.
    const available = await canBind(entry.port);
    if (!available) {
      blockedPorts.push(entry);
    }
  }

  if (blockedPorts.length === 0) {
    process.exit(0);
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

void main();
