# GamerSpot - Gaming eShop

GamerSpot is a full-stack gaming e-commerce platform built as a monorepo with:

- React + TypeScript frontend -
- Express + TypeScript backend -
- PostgreSQL database via Prisma ORM -

The project includes customer shopping flows (catalog, cart, checkout, orders) and admin operations (order status and catalog content management).

---

## Default Accounts

After `npm run database`:

### YOU CAN LOGIN WITH THE CREDENTIALS BELOW:

- Admin: `admin@gamerspot.com` / `admin123`
- User: `user@gamerspot.com` / `user123`

---

## Project Scope

### Customer-facing features

- Account registration/login with JWT access tokens and refresh-token cookies
- Product catalog with search, filtering, sorting, and pagination
- Product detail pages with specifications and reviews
- Cart management (add/update/remove/clear)
- Checkout with shipping form and multi-option payment confirmation UI
- Order history and order detail views
- Wishlist and product comparison flows

### Admin-facing features

- Admin dashboard route protection
- Product CRUD (create, update, delete)
- Order status management (`PENDING`, `PAID`, `SHIPPED`, `CANCELLED`)
- Product specification and review management via admin catalog endpoints

## Technologies Used

### Frontend

- React 18
- TypeScript
- Vite 5
- React Router v6
- TanStack React Query v5
- Axios
- Tailwind CSS

### Backend

- Node.js 20
- Express 4
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- JWT auth (`jsonwebtoken`)
- Security middleware: `helmet`, `cors`, `cookie-parser`
- Rate limiting with `express-rate-limit`
- Swagger docs with `swagger-jsdoc` + `swagger-ui-express`
- Logging with `morgan` and `winston`

### Tooling and DevOps

- Docker + Docker Compose
- GitHub Actions CI (`.github/workflows/ci.yml`)
- ESLint
- Jest (backend), Vitest (frontend) toolchains configured

## Architecture Overview

```text
gamerspot/
|- backend/
|  |- prisma/                 # Prisma schema + seed script
|  |- src/
|  |  |- config/              # env and db config
|  |  |- middleware/          # auth, validation, error, rate limiting
|  |  |- modules/
|  |  |  |- auth/
|  |  |  |- products/
|  |  |  |- categories/
|  |  |  |- cart/
|  |  |  |- orders/
|  |  |  |- adminCatalog/
|  |  |  |- me/               # wishlist/compare storefront state
|  |  |- app.ts               # express app wiring
|  |  |- server.ts            # bootstrap + db connection retry
|- frontend/
|  |- public/                 # product images
|  |- src/
|  |  |- components/
|  |  |- features/
|  |  |- lib/
|  |  |- types/
|  |- vite.config.ts
|- docker-compose.yml
|- README.md
```

## API Surface (High-Level)

Base path: `/api`

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /products`
- `GET /products/:id`
- `POST /products` (admin)
- `PATCH /products/:id` (admin)
- `DELETE /products/:id` (admin)
- `GET /categories`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /admin/orders` (admin)
- `PATCH /admin/orders/:id/status` (admin)
- `GET /admin/catalog/products` (admin)
- `GET /admin/catalog/products/:productId/content` (admin)
- `POST /admin/catalog/products/:productId/specifications` (admin)
- `PATCH /admin/catalog/specifications/:specificationId` (admin)
- `DELETE /admin/catalog/specifications/:specificationId` (admin)
- `POST /admin/catalog/products/:productId/reviews` (admin)
- `PATCH /admin/catalog/reviews/:reviewId` (admin)
- `DELETE /admin/catalog/reviews/:reviewId` (admin)
- `GET /me/storefront`
- `GET /me/wishlist`
- `POST /me/wishlist/toggle`
- `POST /me/compare/toggle`
- `DELETE /me/compare`

Swagger UI: `/docs`

## Data Model (Core)

Prisma models include:

- `User` (roles: `USER`, `ADMIN`)
- `Category`
- `Product`
- `ProductSpecification`
- `ProductReview`
- `Cart`, `CartItem`
- `Order`, `OrderItem`
- `WishlistItem`, `CompareItem`
- `LoyaltyProfile`

## Setup and Run

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for Docker flow)
- PostgreSQL 16+ (for local non-Docker flow)

### Option A: Docker Compose (Recommended)

From project root:

```bash
docker-compose up --build
```

In another terminal, run migrations and seed:

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run database
```

Access:

- Frontend: `http://localhost:3000`
- Backend API (docker mapping): `http://localhost:5050`
- API docs: `http://localhost:5050/docs`

### Option B: Local Development

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` as needed, then:

```bash
npx prisma migrate deploy
npm run database
npm run dev
```

Backend local URL: `http://localhost:5000`

### 2) Frontend

Create `frontend/.env` (if missing) with:

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

Frontend local URL: `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env`)

Required/important keys:

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

Optional runtime tuning from `server.ts`:

- `PORT_RETRY_ATTEMPTS`
- `DB_CONNECT_MAX_RETRIES`
- `DB_CONNECT_RETRY_DELAY_MS`

### Frontend (`frontend/.env`)

- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`

## NPM Scripts

### Backend (`backend/package.json`)

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run migrate`
- `npm run migrate:deploy`
- `npm run database`
- `npm run studio`
- `npm run lint`
- `npm run type-check`
- `npm test`

### Frontend (`frontend/package.json`)

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run type-check`
- `npm test`

## Quality Notes

- CI is configured for backend and frontend in GitHub Actions.
- Linting/type-check/build workflows are in place.
- Test toolchains are configured; currently, this repository may contain zero backend test files.

## Payment Note

The checkout UI supports multiple payment options and sends a `paymentIntentId`-style token field.  
Backend Stripe wiring is partially prepared (env keys + DTO field), but full server-side Stripe payment processing is NOT fully implemented yet.!
