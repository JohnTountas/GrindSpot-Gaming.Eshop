# GamerSpot - Setup Guide

This document focuses on how to run GamerSpot locally (Docker and non-Docker), configure environment variables, and troubleshoot common startup issues.

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+ (for local non-Docker setup)
- Docker Desktop + Docker Compose (for containerized setup)

## Option A: Docker Compose (Recommended)

From project root:

```bash
docker-compose up --build
```

When containers are up, run migrations and seed:

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run database
```

### Access URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5050`
- Swagger docs: `http://localhost:5050/docs`

## Option B: Local Development (Without Docker)

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` values if needed, then:

```bash
npx prisma migrate deploy
npm run database
npm run dev
```

Backend default URL: `http://localhost:5000`

### 2) Frontend

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

## Seeded Credentials

After running `npm run database`:

- Admin: `admin@gamerspot.com` / `admin123`
- User: `user@gamerspot.com` / `user123`

## Environment Variables

### Backend (`backend/.env`)

Required and important keys:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `PORT` (default `5000`)
- `NODE_ENV`
- `CORS_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAX_FILE_SIZE`
- `UPLOAD_DIR`

Optional runtime retry tuning:

- `PORT_RETRY_ATTEMPTS`
- `DB_CONNECT_MAX_RETRIES`
- `DB_CONNECT_RETRY_DELAY_MS`

### Frontend (`frontend/.env`)

- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`

## Useful Commands

### Backend

```bash
cd backend
npm run dev
npm run build
npm run lint
npm run type-check
npm test
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run type-check
npm test
```

## Troubleshooting

### Backend cannot connect to DB

- Confirm PostgreSQL is running.
- Verify `DATABASE_URL`.
- Run migrations again: `npx prisma migrate deploy`.

### Docker backend starts but app fails

- Check container logs:

```bash
docker-compose logs -f backend
```

- Then rerun:

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run database
```

### Port conflicts

If ports are occupied, stop the conflicting process or adjust compose/env ports.

## Documentation Sync Note

`README.md` is the canonical project overview.  
`SETUP.md` is the operational setup reference.
