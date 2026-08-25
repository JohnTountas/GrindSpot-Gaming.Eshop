const { execSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..").toLowerCase();
const ports = [3000, 5000];

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

function getWindowsPidForPort(port) {
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
  return (
    commandLine.includes(repoRoot) &&
    (commandLine.includes("\\vite\\bin\\vite.js") ||
      commandLine.includes("backend\\node_modules") ||
      commandLine.includes("src\\server.ts"))
  );
}

function stopWindowsPid(pid) {
  execSync(`taskkill /PID ${pid} /F`, {
    stdio: "ignore",
    windowsHide: true,
  });
}

function stopProcessesOnWindows() {
  const stopped = [];

  for (const port of ports) {
    const pids = getWindowsPidForPort(port);

    for (const pid of pids) {
      const commandLine = getWindowsCommandLine(pid);
      if (!commandLine || !isSafeGrindSpotDevProcess(commandLine)) {
        continue;
      }

      stopWindowsPid(pid);
      stopped.push({ pid, port });
    }
  }

  if (stopped.length === 0) {
    console.log("No running GrindSpot local dev processes were found on ports 3000 or 5000.");
    return;
  }

  console.log("Stopped GrindSpot local dev processes:");
  stopped.forEach((entry) => {
    console.log(`- PID ${entry.pid} on port ${entry.port}`);
  });
}

function main() {
  if (process.platform !== "win32") {
    console.error("`npm run dev:stop` is currently implemented for Windows only.");
    process.exit(1);
  }

  stopProcessesOnWindows();
}

main();
