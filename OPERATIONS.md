# GrindSpot Operations

## Production Topology

```text
Browser
  |
  | HTTPS
  v
grindspot-fly-app.fly.dev
  |
  v
Fly.io single app
  |
  |-- Express server
  |-- Vite frontend build served as static assets
  |-- API routes under /api
  |-- Docs under /docs
  |-- Health endpoint under /health
  |
  v
Prisma
  |
  v
Supabase Postgres
```

## Components

- `frontend/`: React storefront and admin UI
- `backend/`: Express API, auth, product catalog, cart, orders, admin routes
- `fly.toml`: Fly app definition
- `Dockerfile`: production image build for both frontend and backend
- `backups/production-export.json`: backup used to restore production data

## Production Environment

- Public app URL: `https://grindspot-fly-app.fly.dev`
- Fly app name: `grindspot-fly-app`
- Hosting: Fly.io
- Database: Supabase Postgres
- ORM: Prisma

Path examples in this document use `C:\folder-path\` as a sample location only.

## Database Configuration

Current production behavior:

- `DATABASE_URL` points to the working production database connection
- `DIRECT_URL` points to the same working direct Supabase connection

This was done to keep Fly runtime and Prisma release migrations on the same known-good connection path.

If you later want to split them again:

- `DATABASE_URL`: pooled app connection
- `DIRECT_URL`: direct connection for migrations

Only do that after confirming both Supabase connection strings work correctly from Fly.

## Standard Deploy Routine

Run this from the project root:

```powershell
cd "C:\folder-path\"
cd frontend
npm run lint
npm run type-check
npm run test
npm run build
cd ..\backend
npm run lint
npm run type-check
npm run test
npm run build
cd ..
$env:FLY_ACCESS_TOKEN="MY_PERSONAL_ACCESS_TOKEN"
npm run deploy:fly
```

## Database Restore Routine

Use this only when you need to restore the saved production dataset into a fresh database.

```powershell
cd "C:\folder-path\backend"
npm run migrate:deploy
npm run restore:production -- --force-reset
```

The restore reads from:

- `backups/production-export.json`

## Health Checks

Production:

```powershell
cd "C:\folder-path\"
curl.exe -i https://grindspot-fly-app.fly.dev/health
```

Local:

```powershell
cd "C:\folder-path\"
curl.exe -i http://localhost:5000/health
```

Healthy production response:

```json
{
  "status": "ok",
  "database": "connected",
  "catalogSeeded": true
}
```

## Fly Commands

Deploy:

```powershell
cd "C:\folder-path\"
$env:FLY_ACCESS_TOKEN="MY_PERSONAL_ACCESS_TOKEN"
npm run deploy:fly
```

Status:

```powershell
cd "C:\folder-path\"
$env:FLY_ACCESS_TOKEN="MY_PERSONAL_TOKEN"
flyctl status -a grindspot-fly-app
```

Logs:

```powershell
cd "C:\folder-path\"
$env:FLY_ACCESS_TOKEN="MY_PERSONAL_TOKEN"
flyctl logs -a grindspot-fly-app
```

Update secrets:

```powershell
cd "C:\your-path\\"
$env:FLY_ACCESS_TOKEN="MY_PERSONAL_TOKEN"
flyctl secrets set -a grindspot-fly-app KEY=value
```

## Troubleshooting

- If `release_command failed`, check `DIRECT_URL` first.
- If `/health` returns database errors, check Fly secrets and Supabase credentials.
- If the app deploys but catalog is empty, re-run the restore routine.
- If the machine autostops, that is expected because Fly is configured to scale to zero on inactivity.

## Verified State

Verified on `2026-08-29`:

- Fly deployment succeeded
- Release command succeeded
- Runtime database connection succeeded
- Production health endpoint returned `200 OK`
- Restored catalog contains `50` products
