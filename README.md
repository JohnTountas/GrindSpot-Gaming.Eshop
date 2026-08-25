# GrindSpot: Gaming Eshop

A Full-stack gaming e-commerce monorepo built with React, Express, Prisma, and PostgreSQL.

The repository is structured like a production-style application rather than a tutorial sandbox: the backend owns domain logic and data access, the frontend is feature-oriented, and deployment is handled through Docker and Fly.io.

## -------------- THE PROJECT IS LIVE HERE: -----------|

### - https://grindspot-fly-app.fly.dev/

## ---------------------------------------------------------|

#

## Default Account!

## You can try to log-in with:

### user@grindspot.com

### Pass: useruser123

#

## What The Project Includes:

### Storefront features

- Account registration and login
- JWT access token plus refresh-cookie flow
- Catalog browsing with search, category, sorting, stock, and price filtering
- Product detail pages with specifications and review summaries
- Cart, checkout, order history, wishlist, and compare

### Admin features

- Protected admin route tree
- Order status management
- Product specification and review content management

### DevOps and quality

- TypeScript across frontend and backend
- Prisma ORM with PostgreSQL
- Docker Compose for local orchestration
- Fly.io single-container production deployment
- GitHub Actions CI for lint, type-check, build, migrations, and tests

## Technology Stack:

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

### Backend

- Node.js 20
- Express 4
- TypeScript
- Prisma ORM
- PostgreSQL 16
- Zod validation
- JWT authentication
- Helmet, CORS, cookie-parser, express-rate-limit
- Swagger via `swagger-jsdoc` and `swagger-ui-express`

### Infrastructure

- Docker and Docker Compose
- Fly.io
- GitHub Actions

## Repository Layout

```text
grindspot/
|- backend/
|  |- prisma/
|  |- scripts/
|  |- src/
|  |  |- appSetup/
|  |  |- config/
|  |  |- middleware/
|  |  |- features/
|  |  |  |- catalogManagement/
|  |  |  |- auth/
|  |  |  |- cart/
|  |  |  |- categories/
|  |  |  |- orders/
|  |  |  |- products/
|  |  |  |- shoppingState/
|  |  |- utils/
|  |  |- app.ts
|  |  |- server.ts
|  |- tests/
|  |- uploads/
|- frontend/
|  |- public/
|  |- src/
|  |  |- app/
|  |  |  |- providers/
|  |  |  |- router/
|  |  |  |- App.tsx
|  |  |- features/
|  |  |  |- admin/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- constants.ts
|  |  |  |  |- queryKeys.ts
|  |  |  |  |- types.ts
|  |  |  |- auth/
|  |  |  |  |- api/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |- cart/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |  |- auth/
|  |  |  |  |  |- guest/
|  |  |  |  |- pages/
|  |  |  |  |- queryKeys.ts
|  |  |  |- checkout/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |  |- forms/
|  |  |  |  |  |- payment/
|  |  |  |  |  |- steps/
|  |  |  |  |  |- fallbacks/
|  |  |  |  |  |- orderReview/
|  |  |  |  |- config/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |  |- constants.ts
|  |  |  |  |- types.ts
|  |  |  |- orders/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |  |- constants.ts
|  |  |  |  |- queryKeys.ts
|  |  |  |- products/
|  |  |  |  |- api/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- constants.ts
|  |  |  |  |- queryKeys.ts
|  |  |  |  |- types.ts
|  |  |  |- wishlist/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- queryKeys.ts
|  |  |- shared/
|  |  |  |- api/
|  |  |  |- auth/
|  |  |  |- brand/
|  |  |  |- cart/
|  |  |  |  |- api/
|  |  |  |  |- auth/
|  |  |  |  |  |- api/
|  |  |  |  |  |- hooks/
|  |  |  |  |- guest/
|  |  |  |  |- utils/
|  |  |  |  |- constants.ts
|  |  |  |  |- guestCart.ts
|  |  |  |  |- types.ts
|  |  |  |- components/
|  |  |  |  |- feedback/
|  |  |  |  |- layout/
|  |  |  |  |  |- components/
|  |  |  |  |  |- hooks/
|  |  |  |  |- routing/
|  |  |  |- shopping/
|  |  |  |  |- api/
|  |  |  |  |- auth/
|  |  |  |  |  |- hooks/
|  |  |  |  |- guest/
|  |  |  |  |  |- hooks/
|  |  |  |  |  |- utils/
|  |  |  |  |- hooks/
|  |  |  |  |- utils/
|  |  |  |  |- constants.ts
|  |  |  |  |- queryKeys.ts
|  |  |  |  |- index.ts
|  |  |  |  |- types.ts
|  |  |- types/
|  |  |- ui/
|  |  |- utils/
|  |  |- index.css
|  |  |- main.tsx
|  |  |- vite-env.d.ts
|- .github/workflows/
|- backend/docker-entrypoint.sh
|- docker-compose.yml
|- Dockerfile
|- fly.toml
|- README.md
```

Generated directories like `node_modules/` and build outputs like `dist/` are intentionally omitted
from the tree above.

## Local Development

Best full-project local run:

```powershell
docker compose up --build
```

Or:

```powershell
npm run docker:up
```

That starts:

- the full app on `http://localhost:3000`
- Swagger docs on `http://localhost:3000/docs`
- the health endpoint on `http://localhost:3000/health`
- PostgreSQL on `localhost:5432`

This is the recommended setup because it matches production more closely:

- one Postgres container
- one full-stack app container built from the root [Dockerfile](Dockerfile)
- same-origin frontend and API traffic through one app port

Fastest code-iteration workflow:

```powershell
npm install
npm run dev:db
npm run db:prepare
npm run dev
```

That starts:

- frontend Vite dev server on `http://localhost:3000`
- backend API on `http://localhost:5000`
- Swagger docs on `http://localhost:5000/docs`
- PostgreSQL on `localhost:5432`

Recommended local dev sequence:

```powershell
npm install
npm run dev:db
npm run db:prepare
npm run dev
```

If an older local session is still running, `npm run dev` now fails fast with a
clear port-conflict message instead of silently colliding with stale processes.
In that case run:

```powershell
npm run dev:stop
npm run dev
```

Useful root commands:

- `npm run dev:stop`
- `npm run docker:up`
- `npm run docker:down`
- `npm run docker:logs`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run dev:db`
- `npm run db:prepare`
- `npm run dev`

What each root script does:

- `npm run dev:db`: starts or reuses the local Postgres Docker container
- `npm run db:prepare`: generates Prisma Client, applies migrations, and seeds when needed
- `npm run dev`: starts backend plus Vite frontend for daily development
- `npm run dev:stop`: stops stale GrindSpot local dev processes on ports `3000` and `5000`
- `npm run docker:up`: builds and starts the full Docker stack
- `npm run docker:down`: stops the Docker stack
- `npm run docker:logs`: tails Docker app logs

## Deployment Paths

Current live production is still documented on Fly.io:

- `https://grindspot-fly-app.fly.dev/`

The repository is also prepared for a split-host migration path:

- Vercel for the frontend
- Render for the backend
- Supabase for PostgreSQL

See the full migration guide here:

- [MIGRATE_TO_VERCEL_RENDER_SUPABASE.md](MIGRATE_TO_VERCEL_RENDER_SUPABASE.md)

That guide covers:

- exporting the Fly/Postgres database
- restoring it into Supabase
- deploying the backend to Render
- deploying the frontend to Vercel
- configuring cross-origin cookies and CORS correctly
- enabling the branded cold-start overlay for Render free-tier wakeups

## Architecture Summary

### Backend runtime

- [backend/src/server.ts](backend/src/server.ts) bootstraps database connectivity and starts the HTTP server.
- [backend/src/app.ts](backend/src/app.ts) wires middleware, API routes, Swagger, health checks, static assets, and SPA fallback behavior.
- Backend features live under `backend/src/features/*` and follow a controller/service/dto/routes split.

### Frontend runtime

- [frontend/src/main.tsx](frontend/src/main.tsx) mounts the React application.
- [frontend/src/app/App.tsx](frontend/src/app/App.tsx) composes application providers and the route tree.
- [frontend/src/app/router/AppRouter.tsx](frontend/src/app/router/AppRouter.tsx) owns top-level routing.
- Feature code lives under `frontend/src/features/*`. Folder shapes vary by domain, but each feature keeps its own `api/`, `hooks/`, `pages/`, optional `components/`, `utils/`, `config/`, and feature-local `constants.ts`, `queryKeys.ts`, and `types.ts` where needed.
- Cross-feature code lives under `frontend/src/shared/*`. Shared cart and shopping logic are split into `auth/` and `guest/` subfolders so authenticated and anonymous flows stay isolated.

### Production shape

- The root [Dockerfile](Dockerfile) builds frontend and backend together.
- In production, the backend serves the compiled SPA from `FRONTEND_DIST_PATH`.
- Frontend and backend intentionally share the same origin so refresh-token cookies work correctly.
- Local Docker Compose follows the same shape with one app container plus Postgres.
- The repository also supports a split-host deployment model for `Vercel + Render + Supabase`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Catalog and commerce

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

### Operational endpoints

- `GET /health`
- `GET /docs`

## Data Model Highlights

Primary Prisma models:

- `User`
- `Category`
- `Product`
- `ProductSpecification`
- `ProductReview`
- `Cart` and `CartItem`
- `Order` and `OrderItem`
- `WishlistItem`
- `CompareItem`
- `LoyaltyProfile`

## Database Seeding Rules

Supported environment controls:

- `AUTO_SEED=true`: run the seed script from container startup when products are missing
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`: create or update an admin account
- `SEED_USER_EMAIL` and `SEED_USER_PASSWORD`: optionally create a demo customer account
- `SEED_RESET=true`: clear catalog-related data before reseeding
- `SEED_RESET_USERS=true`: also delete users during a reset run

## Quality Commands

### Files used in production

- [Dockerfile](Dockerfile)
- [fly.toml](fly.toml)
- [backend/docker-entrypoint.sh](backend/docker-entrypoint.sh)

### Current Fly runtime behavior

- release command runs `npm run migrate:deploy`
- runtime startup skips migrations because `RUN_MIGRATIONS_ON_STARTUP=false`
- `AUTO_SEED=true` seeds the catalog only when products are missing
- frontend is served by the backend from `/app/frontend-dist`

### Verify the deployment

- `https://grindspot-fly-app.fly.dev/`
- `https://grindspot-fly-app.fly.dev/health`
- `https://grindspot-fly-app.fly.dev/docs`
- `https://grindspot-fly-app.fly.dev/api/products`

## Security Notes

- Refresh tokens are stored as `httpOnly` cookies.
- The backend trusts a single proxy layer in production for Fly.
- On Fly MPG, use the pooled `DATABASE_URL` for app traffic and the direct `DIRECT_URL` for migrations.
- Production database credentials must never point to the Compose hostname `postgres:5432`.
- For split frontend/backend hosting, configure `CORS_ORIGIN`, `AUTH_COOKIE_SAME_SITE=none`, and `AUTH_COOKIE_SECURE=true`.

## Current Limitations

- Checkout currently sends a simulated `paymentIntentId`; a real payment provider orchestration flow is NOT implemented yet.

## Author

Created by John Tountas.
