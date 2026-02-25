# GamerSpot - Complete Project Reference

This file is the extended documentation companion for GamerSpot and is synchronized with `README.md`.

## Project Summary

GamerSpot is a full-stack gaming e-commerce platform built with:

- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Express + TypeScript + Prisma
- Database: PostgreSQL

It supports both customer and admin workflows for a gaming-focused online store.!!

## Functional Coverage

### Customer

- Authentication and session refresh flow
- Product browsing with filters/search/sorting
- Product detail pages with technical specs and reviews
- Cart management and checkout
- Order history and detail pages
- Wishlist and compare features

### Admin

- Protected admin dashboard
- Product create/update/delete
- Order status lifecycle updates
- Product specification/review management

## Technology Stack

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
- Zod
- JWT auth (`jsonwebtoken`)
- Helmet, CORS, cookie-parser
- express-rate-limit
- Swagger UI / OpenAPI
- Morgan + Winston

### Tooling

- Docker / Docker Compose
- GitHub Actions CI
- ESLint
- Jest + Vitest toolchains

## Repository Structure

```text
gamerspot/
|- backend/
|  |- prisma/
|  |- src/
|  |  |- config/
|  |  |- middleware/
|  |  |- modules/
|  |  |  |- auth/
|  |  |  |- products/
|  |  |  |- categories/
|  |  |  |- cart/
|  |  |  |- orders/
|  |  |  |- adminCatalog/
|  |  |  |- me/
|  |  |- app.ts
|  |  |- server.ts
|- frontend/
|  |- public/
|  |- src/
|  |  |- components/
|  |  |- features/
|  |  |- lib/
|  |  |- types/
|- .github/workflows/ci.yml
|- docker-compose.yml
|- README.md
|- SETUP.md
|- COMPLETE_README.md
```

## API Modules (Backend)

Base path: `/api`

- `auth` module
  - register, login, refresh, logout, me
- `products` module
  - list, details, admin CRUD
- `categories` module
  - list categories
- `cart` module
  - get cart, add/update/remove/clear items
- `orders` module
  - create order, list my orders, order detail
- `admin/orders` module
  - list all orders, patch status
- `admin/catalog` module
  - product content/specification/review management
- `me` module
  - storefront state, wishlist/compare toggles and clear

Swagger docs endpoint: `/docs`

## Database Domain Model

Key Prisma models:

- `User`, `Role`
- `Category`
- `Product`
- `ProductSpecification`
- `ProductReview`
- `Cart`, `CartItem`
- `Order`, `OrderItem`, `OrderStatus`
- `WishlistItem`, `CompareItem`
- `LoyaltyProfile`

## Setup Summary

Use one of:

1. Docker flow in `SETUP.md` (recommended)
2. Local Node/Postgres flow in `SETUP.md`

Canonical setup steps are maintained in `SETUP.md` and `README.md`.

## Seed Data and Default Accounts

The seed script is `backend/prisma/database.ts`.

## 🔑 Default credentials:

- Admin: `admin@gamerspot.com` / `admin123`
- User: `user@gamerspot.com` / `user123`

## Script Reference

### Backend

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

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run type-check`
- `npm test`

## Environment Variables

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAX_FILE_SIZE`
- `UPLOAD_DIR`
- `PORT_RETRY_ATTEMPTS` (optional)
- `DB_CONNECT_MAX_RETRIES` (optional)
- `DB_CONNECT_RETRY_DELAY_MS` (optional)

### Frontend

- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`

## Quality and Current Status

- CI workflow exists for backend and frontend lint/type-check/build/test.
- Test frameworks are configured.
- The repository currently may have zero backend test files.
- Checkout currently sends a `paymentIntentId`-style token to orders.
- Full server-side Stripe payment orchestration is not fully implemented.

## License

MIT

## Sync Policy

To avoid drift:

- `README.md`: canonical overview
- `SETUP.md`: execution/setup guide
- `COMPLETE_README.md`: expanded technical reference
