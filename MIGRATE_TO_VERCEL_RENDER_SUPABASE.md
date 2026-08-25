# GrindSpot Migration Guide

This guide moves the project from the current Fly.io single-container setup to:

- Vercel for the frontend
- Render for the backend
- Supabase for PostgreSQL

That split fits this repository well because the frontend is already a Vite app, the backend is a standalone Express service, and the database is standard Postgres via Prisma.

## What changed in the codebase

The repository now includes migration-friendly changes:

- Cross-origin cookie support for split frontend/backend hosting
- Comma-separated CORS origin support
- A branded backend warmup overlay for Render cold starts
- Vercel SPA rewrite support in [frontend/vercel.json](/frontend/vercel.json)

Files involved:

- [backend/src/config/env.ts](/backend/src/config/env.ts)
- [backend/src/appSetup/middleware.ts](/backend/src/appSetup/middleware.ts)
- [backend/src/features/auth/auth.controller.ts](/backend/src/features/auth/auth.controller.ts)
- [frontend/src/shared/components/feedback/BackendWarmupOverlay.tsx](/frontend/src/shared/components/feedback/BackendWarmupOverlay.tsx)
- [frontend/src/shared/api/health.ts](/frontend/src/shared/api/health.ts)

## 1. Create the Supabase project

1. Create a new Supabase project.
2. Open `Connect` in the Supabase dashboard.
3. Copy the Session pooler connection string on port `5432`.

For this stack, use the Session pooler string for both:

- `DATABASE_URL`
- `DIRECT_URL`

This is the safest default for Render-hosted backends on IPv4-only networks.

## 2. Export the database from Fly.io

Get your current Fly database connection string from your Fly app secrets or dashboard.

PowerShell example:

```powershell
$env:SOURCE_DATABASE_URL="postgresql://..."
pg_dump --format=custom --no-owner --no-privileges --dbname=$env:SOURCE_DATABASE_URL --file=grindspot.dump
```

If you want a smaller first pass for testing, export schema only first:

```powershell
pg_dump --schema-only --no-owner --no-privileges --dbname=$env:SOURCE_DATABASE_URL --file=grindspot-schema.sql
```

This repository now also includes an export helper that can read the running Fly machine's
`DIRECT_URL` automatically and write a SQL dump to `backups/fly-production.sql`:

```powershell
npm run migrate:fly:export
```

Optional overrides:

- `FLY_APP_NAME`
- `FLY_MACHINE_ID`
- `SOURCE_DATABASE_URL`
- `DB_DUMP_FILE`
- `DB_DUMP_SCHEMA`

## 3. Restore the dump into Supabase

If your local machine can reach the Supabase direct endpoint over IPv6, use the direct
connection string for import and migration tooling. If not, use the Session pooler string
on port `5432` as a practical fallback.

Use the restore target in one of these env vars:

- `TARGET_DATABASE_URL`
- `SUPABASE_DATABASE_URL`
- `DATABASE_URL`

Repository helper:

```powershell
$env:TARGET_DATABASE_URL="postgresql://..."
npm run migrate:db:import
```

Classic PostgreSQL tooling example:

```powershell
$env:SUPABASE_DATABASE_URL="postgresql://..."
pg_restore --no-owner --no-privileges --dbname=$env:SUPABASE_DATABASE_URL grindspot.dump
```

After the restore:

1. Verify your tables and data.
2. Run `select count(*) from "Product";` or equivalent checks.
3. Confirm Prisma migrations still reflect the live schema.

## 4. Deploy the backend to Render

Create a new Render Web Service connected to this GitHub repository.

The repository now includes a root [render.yaml](/render.yaml) Blueprint for the backend service.
It is designed to keep secrets out of git and let Render generate JWT secrets automatically.

Use these settings:

- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm ci --include=dev && npx prisma generate && npm run build`
- Start Command: `sh docker-entrypoint.sh`
- Health Check Path: `/health`

Recommended environment variables:

```text
DATABASE_URL=<Supabase session pooler on port 5432>
DIRECT_URL=<Supabase session pooler on port 5432>
NODE_ENV=production
PORT=10000
JWT_SECRET=<strong random value>
JWT_REFRESH_SECRET=<strong random value>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-project.vercel.app
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
STRIPE_SECRET_KEY=<your Stripe secret>
STRIPE_WEBHOOK_SECRET=<your Stripe webhook secret>
AUTO_SEED=false
UPLOAD_DIR=uploads
```

Notes:

- Keep `AUTO_SEED=false` after a real database migration so imported data is not replaced.
- If you deploy before restoring production data, you can temporarily set `AUTO_SEED=true` for a demo catalog.
- Render free web services spin down after idle time, so the first request can be slow.
- The included `render.yaml` sets `JWT_SECRET` and `JWT_REFRESH_SECRET` with generated values and leaves
  `DATABASE_URL`, `DIRECT_URL`, `CORS_ORIGIN`, and Stripe secrets as dashboard-supplied variables.

## 5. Deploy the frontend to Vercel

Import the same GitHub repository into Vercel.

Use these settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set these environment variables in Vercel:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_API_HEALTH_URL=https://your-render-service.onrender.com/health
VITE_ENABLE_BACKEND_WARMUP_OVERLAY=true
VITE_STRIPE_PUBLIC_KEY=<your Stripe publishable key>
```

The repository already includes [frontend/vercel.json](/frontend/vercel.json) so client-side routes fall back to `index.html`.

## 6. Automatic deploys from GitHub

Once both services are connected to the repo:

- Vercel will auto-deploy the frontend on pushes and merges
- Render will auto-deploy the backend on pushes and merges to the linked branch

If both projects track `main`, then a push to `main` updates production on both platforms.

## 7. Cold-start UX on the frontend

The repo now includes a global branded backend warmup overlay for Render cold starts.

It appears only when:

- `VITE_ENABLE_BACKEND_WARMUP_OVERLAY=true`
- the backend health endpoint is still unavailable after a short delay

The message shown to users is intentionally explicit:

- "Loading... This may take a few seconds while the backend wakes up."

This keeps the experience professional instead of looking broken during Render wake-ups.

## 8. Recommended rollout order

1. Create Supabase project
2. Restore the Fly database into Supabase
3. Deploy backend to Render
4. Test Render API and `/health`
5. Deploy frontend to Vercel
6. Test login, refresh-token flow, cart, checkout, admin
7. Update your production domain if needed
8. Only then decommission Fly

## 9. Post-migration test checklist

- `GET /health` returns `200`
- `GET /api/products` returns catalog data
- Login works
- Refresh cookie works after page reload
- Logout clears the refresh cookie
- Admin pages still load
- Checkout flow still creates orders
- Image paths and uploads still resolve correctly

## 10. Local development after the move

You should still use local Vite for day-to-day work:

```powershell
npm install
npm run dev:db
npm run db:prepare
npm run dev
```

That gives you:

- frontend on `http://localhost:3000`
- backend on `http://localhost:5000`
- docs on `http://localhost:5000/docs`

Use hosted Vercel + Render only for shared testing and live production.
