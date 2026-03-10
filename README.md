# GrindSpot: Gaming Eshop

A Full-stack gaming e-commerce monorepo built with React, Express, Prisma, and PostgreSQL.

The repository is structured like a production-style application rather than a tutorial sandbox: the backend owns domain logic and data access, the frontend is feature-oriented, and deployment is handled through Docker and Fly.io.

## -------------- THE PROJECT IS LIVE HERE: -----------|

### - https://grindspot-fly-app.fly.dev/

## ---------------------------------------------------------|

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
|  |  |- config/
|  |  |- middleware/
|  |  |- modules/
|  |  |- utils/
|- frontend/
|  |- public/
|  |- src/
|  |  |- components/
|  |  |- features/
|  |  |  |- admin/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
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
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |  |- queryKeys.ts
|  |  |  |- checkout/
|  |  |  |  |- api/
|  |  |  |  |- components/
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
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |  |- constants.ts
|  |  |  |  |- queryKeys.ts
|  |  |  |  |- types.ts
|  |  |  |- wishlist/
|  |  |  |  |- api/
|  |  |  |  |- components/
|  |  |  |  |- hooks/
|  |  |  |  |- pages/
|  |  |  |  |- utils/
|  |  |  |  |- queryKeys.ts
|  |  |- lib/
|  |  |- types/
|  |  |- App.tsx
|  |  |- index.css
|  |  |- main.tsx
|  |  |- vite-env.d.ts
|- .github/workflows/
|- docker-compose.yml
|- Dockerfile
|- fly.toml
```

## Architecture Summary

### Backend runtime

- [backend/src/server.ts](backend/src/server.ts) bootstraps database connectivity and starts the HTTP server.
- [backend/src/app.ts](backend/src/app.ts) wires middleware, API routes, Swagger, health checks, static assets, and SPA fallback behavior.
- Feature modules live under `backend/src/modules/*` and follow a controller/service/dto/routes split.

### Frontend runtime

- [frontend/src/main.tsx](frontend/src/main.tsx) mounts the React application.
- [frontend/src/App.tsx](frontend/src/App.tsx) defines routing and shared providers.
- Feature pages live under `frontend/src/features/*`, organized by `api/`, `hooks/`, `components/`, `utils/`, and `pages/` with feature-local `constants.ts`, `queryKeys.ts`, and `types.ts` where needed.
- Shared API/session/storefront helpers live under `frontend/src/lib/*`.

### Production shape

- The root [Dockerfile](Dockerfile) builds frontend and backend together.
- In production, the backend serves the compiled SPA from `FRONTEND_DIST_PATH`.
- Frontend and backend intentionally share the same origin so refresh-token cookies work correctly.

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
- Prisma requires both `DATABASE_URL` and `DIRECT_URL`.
- Production database credentials must never point to the Compose hostname `postgres:5432`.

## Current Limitations

- Checkout currently sends a simulated `paymentIntentId`; a real payment provider orchestration flow is NOT implemented yet.

## Author

Created by John Tountas.
