# GrindSpot

Full-stack gaming e-commerce monorepo with:

- `frontend`: React + TypeScript + Vite
- `backend`: Express + TypeScript + Prisma
- `database`: PostgreSQL

## Live Production

- Frontend: `https://grindspot.vercel.app`
- Backend: `https://grindspot-backend.onrender.com`
- Health check: `https://grindspot-backend.onrender.com/health`
- API docs: `https://grindspot-backend.onrender.com/docs`

## Current Hosting Setup

- `Vercel` hosts the frontend
- `Render` hosts the backend
- `Supabase` hosts PostgreSQL
- GitHub pushes do `not` deploy automatically to production
- Production deploys are `manual`

## Demo Accounts

- User: `user@grindspot.com` / `user123`
- Admin: `admin@grindspot.com` / `Adminadmin123`

Use these only for local/dev seeded environments unless you intentionally seeded the same accounts in production.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT auth
- Swagger

### Infrastructure

- Docker / Docker Compose for local database and optional full-stack local container run
- Vercel for frontend production
- Render for backend production
- Supabase for production database

## Repository Layout

```text
GrindSpot-Gaming.Eshop/
|- frontend/
|- backend/
|- scripts/
|- docker-compose.yml
|- Dockerfile
|- render.yaml
|- README.md
```

## Local Development

Recommended daily workflow:

```powershell
npm install
npm run dev:db
npm run db:prepare
npm run dev
```

This starts:

- frontend Vite dev server on `http://localhost:3000`
- backend API on `http://localhost:5000`
- Swagger docs on `http://localhost:5000/docs`
- backend health endpoint on `http://localhost:5000/health`
- local PostgreSQL on `localhost:5432`

### If `npm run dev` says something is already running

```powershell
npm run dev:stop
npm run dev
```

### Root scripts

- `npm run dev:db`: starts or reuses the local PostgreSQL Docker container
- `npm run db:prepare`: generates Prisma client, applies migrations, and runs the seed script
- `npm run dev`: starts backend and frontend together
- `npm run dev:frontend`: starts only the Vite frontend
- `npm run dev:backend`: starts only the backend
- `npm run dev:stop`: stops stale local dev processes on ports `3000` and `5000`
- `npm run docker:up`: starts the full Docker stack
- `npm run docker:down`: stops the full Docker stack
- `npm run docker:logs`: tails Docker app logs

### Full Docker local run

If you want to run the app closer to a production-style single container shape:

```powershell
npm run docker:up
```

This exposes the app at:

- `http://localhost:3000`

In this mode, the backend serves the built frontend through the app container.

## Local Environment Defaults

The local helper scripts already provide working defaults for development:

- PostgreSQL database on `postgresql://grindspot:grindspot_password@localhost:5432/grindspot_DB`
- Backend port `5000`
- Frontend port `3000`
- `CORS_ORIGIN=http://localhost:3000`
- local seed/demo users

So for normal local work, you usually do not need to create extra env files first.

## Recommended Production Workflow

Best practice for this project:

1. Make and test changes locally
2. Commit and push to GitHub
3. Deploy frontend manually to Vercel only when ready
4. Deploy backend manually to Render only when ready
5. Re-test production after each deploy

Important rule:

- `push` is not the same as `deploy`

This is intentional so production does not change on every GitHub push.

## Manual Deploy Workflow

### 1. Verify locally

```powershell
npm run dev:db
npm run db:prepare
npm run dev
```

Then test the app in the browser and test the main API flows you changed.

### 2. Commit and push

```powershell
git status
git add .
git commit -m "Describe your change"
git push origin main
```

### 3. Deploy frontend to Vercel

```powershell
cd /NAME-OF-THE-PROJECT_FOLDER
vercel --prod
```

### 4. Deploy backend to Render

Use one of these:

- Render dashboard -> `Manual Deploy`
- Render CLI -> deploy the `grindspot-backend` service manually

### 5. Verify production

Check:

- `https://grindspot.vercel.app`
- `https://grindspot-backend.onrender.com/health`
- `https://grindspot-backend.onrender.com/api/products`

## Frontend Notes

- Vite is the local frontend workflow
- The frontend production project is configured for manual deploys
- `frontend/vercel.json` includes SPA rewrites
- `frontend/vercel.json` also disables Git-triggered deployments with:

```json
"git": {
  "deploymentEnabled": false
}
```

## Backend Notes

- The backend exposes the API under `/api`
- Swagger docs are available at `/docs`
- Health check is available at `/health`
- In split hosting, CORS is configured to allow the live Vercel frontend
- Cookies are configured for cross-origin auth when needed in production

## Main API Areas

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Catalog and shopping

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### Admin

- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/catalog/products`
- `GET /api/admin/catalog/products/:productId/content`
- `POST /api/admin/catalog/products/:productId/specifications`
- `PATCH /api/admin/catalog/specifications/:specificationId`
- `DELETE /api/admin/catalog/specifications/:specificationId`
- `POST /api/admin/catalog/products/:productId/reviews`
- `PATCH /api/admin/catalog/reviews/:reviewId`
- `DELETE /api/admin/catalog/reviews/:reviewId`

### Storefront state

- `GET /api/me/storefront`
- `GET /api/me/wishlist`
- `POST /api/me/wishlist/toggle`
- `POST /api/me/compare/toggle`
- `DELETE /api/me/compare`

## Database Notes

Main Prisma models include:

- `User`
- `Category`
- `Product`
- `ProductSpecification`
- `ProductReview`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `WishlistItem`
- `CompareItem`
- `LoyaltyProfile`

## Quality Checks

Frontend:

```powershell
cd frontend
npm run lint
npm run type-check
npm run test
```

Backend:

```powershell
cd backend
npm run lint
npm run type-check
npm run test
```

## Known Limitation

Checkout still uses a simulated payment flow. A real payment provider orchestration flow is not fully implemented yet.
