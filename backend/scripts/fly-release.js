'use strict';

const { spawnSync } = require('node:child_process');

function parseConnectionUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function redactDatabaseUrl(url) {
  if (!url) {
    return '(missing)';
  }

  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '(invalid connection string)';
  }
}

function isSupabasePoolerHostname(hostname) {
  return hostname.includes('.pooler.supabase.com');
}

function resolveMigrationEnvironment() {
  const databaseUrl = process.env.DATABASE_URL?.trim() || '';
  const directUrl = process.env.DIRECT_URL?.trim() || '';

  if (!databaseUrl && !directUrl) {
    throw new Error('DATABASE_URL or DIRECT_URL must be set for the Fly release command.');
  }

  const parsedDatabaseUrl = parseConnectionUrl(databaseUrl);
  const parsedDirectUrl = parseConnectionUrl(directUrl);

  if (directUrl && !parsedDirectUrl) {
    throw new Error('DIRECT_URL is not a valid PostgreSQL connection string.');
  }

  if (databaseUrl && !parsedDatabaseUrl) {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection string.');
  }

  if (parsedDirectUrl && isSupabasePoolerHostname(parsedDirectUrl.hostname)) {
    throw new Error(
      'DIRECT_URL points to a Supabase pooler host. Prisma migrations on Fly require the direct database host, usually `db.<project-ref>.supabase.co:5432` with user `postgres`.'
    );
  }

  // Prisma schema operations are more reliable on the direct connection, so
  // prefer it for `migrate deploy` while still tolerating single-URL setups.
  const migrationUrl = directUrl || databaseUrl;

  return {
    ...process.env,
    DATABASE_URL: migrationUrl,
    DIRECT_URL: directUrl || migrationUrl,
  };
}

function runReleaseMigration() {
  const env = resolveMigrationEnvironment();

  console.log('[fly-release] Starting Prisma migrate deploy');
  console.log(`[fly-release] DATABASE_URL: ${redactDatabaseUrl(env.DATABASE_URL)}`);
  console.log(`[fly-release] DIRECT_URL: ${redactDatabaseUrl(env.DIRECT_URL)}`);

  const result = spawnSync('node', ['scripts/prisma-cli.js', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error('[fly-release] Failed to start Prisma migrate deploy:', result.error);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

try {
  runReleaseMigration();
} catch (error) {
  console.error('[fly-release] Release command aborted:', error.message);
  process.exit(1);
}
