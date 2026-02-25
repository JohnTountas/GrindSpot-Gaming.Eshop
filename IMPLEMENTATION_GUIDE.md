# GamerSpot Implementation Guide

This guide documents how GamerSpot is implemented today, by module and runtime layer.

## System Architecture

GamerSpot is a monorepo with:

- `backend/` Node.js + Express + TypeScript API
- `frontend/` React + TypeScript SPA
- PostgreSQL via Prisma
- Docker compose for local orchestration

## Backend Implementation

## Entry and Core Wiring

### `backend/src/server.ts`

- Bootstraps process startup.
- Ensures database connectivity with retries before serving traffic.
- Starts Express app with port retry support.

### `backend/src/app.ts`

- Creates Express instance.
- Applies middleware:
  - `helmet`
  - `cors`
  - JSON/urlencoded parsers
  - `cookie-parser`
  - `morgan` (development)
- Serves static uploads from `/uploads`.
- Exposes:
  - `/` root metadata
  - `/health`
  - `/docs` (Swagger UI)
- Mounts feature routes under `/api`.
- Applies centralized error handler.

## Configuration and Infrastructure

### `backend/src/config/env.ts`

- Loads env variables.
- Normalizes runtime config:
  - server
  - JWT
  - CORS
  - Stripe keys
  - upload settings

### `backend/src/config/database.ts`

- Prisma client initialization shared across modules.

## Middleware

### `auth.middleware.ts`

- `authenticate`: validates Bearer access token and injects user context.
- `authorize`: role-based guard (`USER`/`ADMIN`).

### `validate.middleware.ts`

- Generic Zod request validation wrapper.

### `error.middleware.ts`

- `AppError` for operational errors.
- Prisma-specific error mapping.
- standard JSON error response format.
- `asyncHandler` wrapper for async controllers.

### `rateLimit.middleware.ts`

- `authLimiter` for auth endpoints.
- `apiLimiter` defined for broader API throttling policy.

## Backend Feature Modules

## Auth (`modules/auth`)

- Register/login/refresh/logout/me.
- Password hashing via bcrypt.
- Access token + refresh token flow.
- Refresh token returned in httpOnly cookie from controller.

Routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Products (`modules/products`)

- Product list with query filters and pagination.
- Product detail with category/specifications/reviews.
- Admin product create/update/delete.

Routes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PATCH /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

## Categories (`modules/categories`)

- Read-only category list endpoint.

Route:

- `GET /api/categories`

## Cart (`modules/cart`)

- Authenticated cart retrieval.
- Add/update/remove item.
- Clear cart.

Routes:

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`

## Orders (`modules/orders`)

- Create order from cart in transaction.
- User order list/detail.
- Admin order list and status updates.
- Validates shipping payload and accepts optional `paymentIntentId` field.

Routes:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/admin/orders` (admin)
- `PATCH /api/admin/orders/:id/status` (admin)

## Admin Catalog (`modules/adminCatalog`)

- Admin product content management:
  - specs
  - reviews
- Includes list and content-read endpoints for admin dashboard.

Routes:

- `GET /api/admin/catalog/products`
- `GET /api/admin/catalog/products/:productId/content`
- `POST /api/admin/catalog/products/:productId/specifications`
- `PATCH /api/admin/catalog/specifications/:specificationId`
- `DELETE /api/admin/catalog/specifications/:specificationId`
- `POST /api/admin/catalog/products/:productId/reviews`
- `PATCH /api/admin/catalog/reviews/:reviewId`
- `DELETE /api/admin/catalog/reviews/:reviewId`

## Me / Storefront (`modules/me`)

- Returns wishlist/compare state.
- Wishlist toggle.
- Compare toggle and clear.

Routes:

- `GET /api/me/storefront`
- `GET /api/me/wishlist`
- `POST /api/me/wishlist/toggle`
- `POST /api/me/compare/toggle`
- `DELETE /api/me/compare`

## Database Implementation

## Prisma Schema

Defined in `backend/prisma/schema.prisma` with core models:

- User, Role
- Category
- Product
- ProductSpecification
- ProductReview
- Cart, CartItem
- Order, OrderItem, OrderStatus
- WishlistItem, CompareItem
- LoyaltyProfile

## Seed Script

`backend/prisma/database.ts`:

- Clears and repopulates core entities.
- Seeds users, categories, products, specs, and reviews.
- Creates default accounts:
  - `admin@gamerspot.com` / `admin123`
  - `user@gamerspot.com` / `user123`

## Frontend Implementation

## Entry and Providers

### `frontend/src/main.tsx`

- Mounts app root and global CSS.

### `frontend/src/App.tsx`

- Configures Query Client.
- Defines app routes and route guards.

## Frontend Module Map

## Shared Components

- `components/layout/Layout.tsx`:
  - global header/footer shell
  - policy/support modal
  - shared outlet
- `components/ProtectedRoute.tsx`:
  - auth and admin route protection
- `components/feedback/ToastHost.tsx`:
  - centralized toast rendering

## Feature Pages

- Auth: login/register
- Products: home/detail
- Cart: cart management
- Checkout: shipping + payment confirmation step
- Orders: history/detail
- Wishlist: user wishlist
- Admin: operations dashboard

## Frontend Libraries

### `lib/api/client.ts`

- Axios instance with:
  - base URL from `VITE_API_URL`
  - bearer token injection
  - 401 refresh and retry handling

### `lib/auth/session.ts`

- local storage helpers for token/user session handling.

### `lib/gaming/storefront.ts`

- client hooks for wishlist and compare behavior.
- guest/local-storage compare fallback.
- derived catalog metadata helpers.

### `lib/ui/toast.ts`

- toast creation helpers used across features.

## Type Contracts

`frontend/src/types/index.ts` holds shared domain types:

- auth and user
- product/category
- cart
- orders
- API error payloads

Current checkout/order contract includes optional `paymentIntentId`.

## API and UI Integration Flow

## Auth flow

1. User logs in via `/api/auth/login`.
2. Access token saved client-side.
3. Refresh cookie maintained by backend.
4. Axios interceptor refreshes token on 401 via `/api/auth/refresh`.

## Cart to Order flow

1. Cart page mutates `/api/cart/*`.
2. Checkout validates shipping/payment confirmation UI.
3. Checkout submits order payload to `/api/orders`.
4. Backend creates order transactionally and clears cart.
5. UI navigates to order detail.

## Admin flow

1. Protected admin route renders dashboard.
2. Dashboard reads `/api/admin/orders` and `/api/admin/catalog/*`.
3. Admin mutates order status/specs/reviews through corresponding endpoints.

## Runtime and Deployment

## Docker

`docker-compose.yml` runs:

- postgres (5432)
- backend mapped to host `5050` (container `5000`)
- frontend `3000`

## Local (non-Docker app processes)

- backend: `http://localhost:5000`
- frontend: `http://localhost:3000`
- docs: `/docs`

## Quality and CI

## Local checks

Backend:

```bash
cd backend
npm run lint
npm run type-check
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run type-check
npm run build
```

## CI

Defined in `.github/workflows/ci.yml`:

- backend job: lint, type-check, migrate, test
- frontend job: lint, type-check, build, test

Note: test frameworks are configured, but repository may currently contain zero backend test files.

## Known Implementation Status

- Checkout includes multi-option payment confirmation UX and sends `paymentIntentId`.
- Stripe env and DTO hooks exist.
- Full server-side payment intent/capture workflow is not yet fully implemented.

## Documentation References

- `README.md`: canonical overview
- `SETUP.md`: setup and troubleshooting
- `QUICK_START.md`: fastest startup path
- `COMPLETE_README.md`: extended technical reference
- `FRONTEND_CODE_BUNDLE.md`: frontend-only map
