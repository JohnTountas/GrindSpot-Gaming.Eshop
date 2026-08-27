const { describeWindowsPortBlockers, stopWindowsProcesses } = require("./dev-process-utils");
const ports = [3000, 5000];

function stopProcessesOnWindows() {
  // Reuse the same safety gate as startup so manual cleanup and automatic
  // cleanup stay aligned as the dev stack grows.
  const stopCandidates = describeWindowsPortBlockers(ports).filter((entry) => entry.safeToStop);
  const stopped = stopWindowsProcesses(stopCandidates);

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
