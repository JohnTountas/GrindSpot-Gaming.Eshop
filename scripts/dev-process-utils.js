const { execSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..").toLowerCase();

function readCommand(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
  } catch {
    return "";
  }
}

function getWindowsPidsForPort(port) {
  // Query the OS directly instead of probing the port with a bind attempt,
  // because Windows can report the listener on IPv6 (`::`) while the startup
  // script checks IPv4 (`0.0.0.0`).
  const script = [
    `$conn = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue`,
    'if ($conn) { $conn | Select-Object -ExpandProperty OwningProcess -Unique }',
  ].join("; ");

  const output = readCommand(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "${script}"`
  );

  return output
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function getWindowsCommandLine(pid) {
  const output = readCommand(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \\"ProcessId = ${pid}\\" | Select-Object -ExpandProperty CommandLine"`
  );

  return output.toLowerCase();
}

function isSafeGrindSpotDevProcess(commandLine) {
  // Only auto-stop processes that clearly belong to this repo. That keeps the
  // helper safe when developers already use the same ports for unrelated apps.
  return (
    commandLine.includes(repoRoot) &&
    (commandLine.includes("\\vite\\bin\\vite.js") ||
      commandLine.includes("backend\\node_modules") ||
      commandLine.includes("src\\server.ts"))
  );
}

function describeWindowsPortBlockers(ports) {
  const blockers = [];

  for (const port of ports) {
    const pids = getWindowsPidsForPort(port);

    for (const pid of pids) {
      const commandLine = getWindowsCommandLine(pid);
      blockers.push({
        pid,
        port,
        commandLine,
        safeToStop: Boolean(commandLine) && isSafeGrindSpotDevProcess(commandLine),
      });
    }
  }

  return blockers;
}

function stopWindowsPid(pid) {
  execSync(`taskkill /PID ${pid} /F`, {
    stdio: "ignore",
    windowsHide: true,
  });
}

function stopWindowsProcesses(entries) {
  const stoppedPids = new Set();
  const stopped = [];

  for (const entry of entries) {
    // One process can own multiple watched ports, so de-duplicate by PID before
    // calling taskkill to keep the shutdown path deterministic.
    if (stoppedPids.has(entry.pid)) {
      continue;
    }

    stopWindowsPid(entry.pid);
    stoppedPids.add(entry.pid);
    stopped.push(entry);
  }

  return stopped;
}

module.exports = {
  describeWindowsPortBlockers,
  isSafeGrindSpotDevProcess,
  stopWindowsProcesses,
};
