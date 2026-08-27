const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const frontendRoot = path.join(repoRoot, "frontend");

// Keep the root `npm run dev` workflow thin: frontend-specific tooling stays in
// `frontend/package.json`, while the monorepo entrypoint only decides location.
const child = spawn("npm", ["run", "dev"], {
  cwd: frontendRoot,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
