const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const backendRoot = path.join(repoRoot, "backend");

const defaultEnv = {
  DATABASE_URL: "postgresql://grindspot:grindspot_password@localhost:5432/grindspot_DB",
  DIRECT_URL: "postgresql://grindspot:grindspot_password@localhost:5432/grindspot_DB",
  JWT_SECRET: "grindspot-access-token-signing-key-change-me",
  JWT_REFRESH_SECRET: "grindspot-refresh-token-signing-key-change-me",
  JWT_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  PORT: "5000",
  NODE_ENV: "development",
  AUTO_SEED: "true",
  SEED_ADMIN_EMAIL: "admin@grindspot.com",
  SEED_ADMIN_PASSWORD: "Adminadmin123",
  SEED_USER_EMAIL: "user@grindspot.com",
  SEED_USER_PASSWORD: "user123",
  CORS_ORIGIN: "http://localhost:3000",
  STRIPE_SECRET_KEY: "sk_test_grindspot_secret_key_change_me",
  STRIPE_WEBHOOK_SECRET: "whsec_grindspot_webhook_secret_change_me",
};

const child = spawn("npm", ["run", "dev:tsx"], {
  cwd: backendRoot,
  stdio: "inherit",
  shell: true,
  env: {
    ...defaultEnv,
    ...process.env,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

