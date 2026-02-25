# GamerSpot Quick Start

This guide provides the fastest reliable setup path for GamerSpot.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for PostgreSQL container)

If PowerShell blocks npm scripts, use `npm.cmd` instead of `npm`.

## Option A: Full Docker Setup

From project root:

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot
docker-compose up --build
```

Then run migrations and seed:

```powershell
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run database
```

Access:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5050`
- API docs: `http://localhost:5050/docs`

## Option B: Local App + Docker Postgres (Recommended for development)

### 1) Install dependencies

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot\backend
npm.cmd install

cd ..\frontend
npm.cmd install
```

### 2) Configure environment files

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot
Copy-Item backend\.env.example backend\.env
```

Create `frontend\.env` with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3) Start PostgreSQL container

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot
docker-compose up -d postgres
docker-compose ps
```

### 4) Run migrations and seed

```powershell
cd backend
npx prisma migrate deploy
npm.cmd run database
```

### 5) Start backend

```powershell
cd backend
npm.cmd run dev
```

Backend runs at `http://localhost:5000`.

### 6) Start frontend

Open a second terminal:

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot\frontend
npm.cmd run dev
```

Frontend runs at `http://localhost:3000`.

### 7) Verify

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/health`
- API docs: `http://localhost:5000/docs`

## Seeded Credentials

After `npm run database`:

- Admin: `admin@gamerspot.com` / `admin123`
- User: `user@gamerspot.com` / `user123`

## Quick Quality Checks

### Frontend

```powershell
cd frontend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build
```

### Backend

```powershell
cd backend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build
```

## Troubleshooting

### Port is already in use

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### PostgreSQL container not healthy

```powershell
docker-compose logs postgres
docker-compose down
docker-compose up -d postgres
```

### Clean reset

```powershell
cd C:\Users\tmacj\Desktop\gamerspot-complete\gamerspot
docker-compose down -v
```
