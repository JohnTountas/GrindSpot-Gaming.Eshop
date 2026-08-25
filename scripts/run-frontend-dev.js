const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const frontendRoot = path.join(repoRoot, "frontend");

const child = spawn("npm", ["run", "dev"], {
  cwd: frontendRoot,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
