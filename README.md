# GrindSpot

Gaming e-shop monorepo with:

- `frontend`: React + TypeScript + Vite
- `backend`: Express + TypeScript + Prisma
- `production`: Fly.io single-host deployment

## Production URL

- `https://grindspot-fly-app.fly.dev`

## Repo Layout

```text
GrindSpot-Gaming.Eshop/
|- frontend/
|- backend/
|- scripts/
|- Dockerfile
|- fly.toml
|- package.json
|- README.md
```

## Local Development

From the project root:

```powershell
cd "Directory-path"
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
npm run dev:stop
```

## Deploy Commands

Use these commands every time you want to deploy new changes to Fly.io:

```powershell
cd "Directory-path"
$env:FLY_ACCESS_TOKEN="MY-PERSONAL-TOKEN"
npm run deploy:fly
```

After the deploy finishes, verify it with:

```powershell
npm run fly:status
npm run fly:logs
```

## Recommended Deploy Routine

Run this full routine before a production deploy:

```powershell
cd "Directory-path"
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
$env:FLY_ACCESS_TOKEN="MY-PERSONAL-TOKEN"
npm run deploy:fly
```

## Fly Notes

- App name: `grindspot-fly-app`
- Main config file: `fly.toml`
- Deploys build both frontend and backend from the root `Dockerfile`
- Database migrations run automatically through Fly `release_command`
- Frontend requests use relative `/api` paths

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

The production app expects these secrets to exist in Fly:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`

## Current Verification Status

The current cleanup state has already passed local verification:

- Frontend: `lint`, `type-check`, `test`, `build`
- Backend: `lint`, `type-check`, `test`, `build`

## Current Limitation

Checkout is still simulated and is not connected to a real payment gateway.
