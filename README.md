# GrindSpot

Gaming e-shop monorepo with:

- `frontend`: React + TypeScript + Vite
- `backend`: Express + TypeScript + Prisma
- `production`: Fly.io app with Supabase Postgres

## Production URL

- `https://grindspot-fly-app.fly.dev`

## Architecture

```text
Users
  |
  v
https://grindspot-fly-app.fly.dev
  |
  v
Fly.io app: grindspot-fly-app
  |
  |-- Frontend SPA build served by Express
  |-- Backend API on the same origin
  |-- Prisma ORM
  |
  v
Supabase Postgres
```

Operational details live in `OPERATIONS.md`.

Path examples in this document use `C:\folder-path\` as a sample location only.

## Repo Layout

```text
GrindSpot-Gaming.Eshop/
|- frontend/
|- backend/
|- scripts/
|- backups/
|- Dockerfile
|- fly.toml
|- package.json
|- README.md
|- OPERATIONS.md
```

## Local Development

From the project root:

```powershell
cd "C:\folder-path\"
npm install
npm run dev:db
npm run db:prepare
npm run dev
```

Useful local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- Docs: `http://localhost:5000/docs`

If something is already running:

```powershell
cd "C:\folder-path\"
npm run dev:stop
```

## Production Deploy

Standard deploy flow:

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

Post-deploy verification:

```powershell
cd "C:\folder-path\"
curl.exe -i https://grindspot-fly-app.fly.dev/health
```

## Fly Notes

- App name: `grindspot-fly-app`
- Main config file: `fly.toml`
- The root `Dockerfile` builds frontend and backend together
- Fly runs Prisma migrations through the `release_command`
- The frontend calls the backend through relative `/api` paths
- The live health endpoint is `/health`

## Root Scripts

- `npm run dev`: start frontend and backend together
- `npm run dev:db`: start local PostgreSQL container
- `npm run db:prepare`: Prisma generate, migrations, and seed
- `npm run dev:frontend`: start frontend only
- `npm run dev:backend`: start backend only
- `npm run dev:stop`: stop local dev processes
- `npm run docker:up`: start the full local Docker stack
- `npm run docker:down`: stop the Docker stack
- `npm run docker:logs`: show Docker logs
- `npm run deploy:fly`: deploy to Fly.io
- `npm run fly:status`: show Fly app status
- `npm run fly:logs`: show Fly app logs

## Required Fly Secrets

The production app expects these secrets in Fly:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## Verification Status

The current production state was verified on `2026-08-29`:

- Fly deploy completed successfully
- `https://grindspot-fly-app.fly.dev/health` returned `200 OK`
- Database connectivity is working
- Catalog is seeded with `50` products

## Current Limitation

Checkout is still simulated and is not connected to a real payment gateway.
