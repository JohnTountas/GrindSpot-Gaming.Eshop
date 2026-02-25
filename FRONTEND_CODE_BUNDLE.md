# GamerSpot Frontend Code Bundle

--------> This file is a current frontend implementation map for GamerSpot.  
It is aligned with the actual code under `frontend/src`. <--------

## Stack

- React 18
- TypeScript
- Vite 5
- React Router v6
- TanStack React Query v5
- Axios
- Tailwind CSS

## Source Layout

```text
frontend/src/
|- App.tsx
|- main.tsx
|- index.css
|- components/
|  |- layout/Layout.tsx
|  |- feedback/ToastHost.tsx
|  |- ProtectedRoute.tsx
|- features/
|  |- auth/pages/Login.tsx
|  |- auth/pages/Register.tsx
|  |- products/pages/Home.tsx
|  |- products/pages/ProductDetail.tsx
|  |- cart/pages/Cart.tsx
|  |- checkout/pages/Checkout.tsx
|  |- orders/pages/Orders.tsx
|  |- orders/pages/OrderDetail.tsx
|  |- wishlist/pages/Wishlist.tsx
|  |- admin/pages/AdminDashboard.tsx
|- lib/
|  |- api/client.ts
|  |- api/error.ts
|  |- auth/session.ts
|  |- gaming/storefront.ts
|  |- ui/toast.ts
|  |- brand/identity.ts
|- types/index.ts
```

## Application Entry

### `main.tsx`

- Mounts React root and renders `<App />`.

### `App.tsx`

- Creates a shared `QueryClient`.
- Defines route tree:
  - `/` home
  - `/products/:id`
  - `/cart`
  - `/login`, `/register`
  - protected: `/checkout`, `/orders`, `/orders/:id`, `/wishlist`
  - admin-only: `/admin/*`

## API Layer

### `lib/api/client.ts`

- Exports Axios instance as `api`.
- Base URL from `VITE_API_URL` (fallback: `http://localhost:5000/api`).
- Sends cookies (`withCredentials: true`).
- Request interceptor attaches `Authorization: Bearer <accessToken>` from local storage.
- Response interceptor handles `401` by calling `/auth/refresh`, storing new token, and retrying once.

### `lib/api/error.ts`

- Normalizes backend and network failures into user-friendly error messages.

## Auth and Session

### `lib/auth/session.ts`

- Stores/reads access token and user metadata from local storage.
- Exposes helpers like `isAuthenticated`, `getStoredUser`, `clearSession`.

### `components/ProtectedRoute.tsx`

- Guards routes for authenticated users.
- Supports admin-only guard mode.

## Storefront State (Wishlist + Compare)

### `lib/gaming/storefront.ts`

- `useWishlist()`:
  - Authenticated wishlist toggle via `/me/wishlist/toggle`.
- `useCompare()`:
  - Authenticated compare toggle via `/me/compare/toggle`.
  - Guest compare fallback in local storage.
- Also includes derived metadata utilities:
  - brand extraction
  - compatibility tags
  - technical spec fallback builders
  - review snapshot builders

## Main Pages

### `features/products/pages/Home.tsx`

- Product catalog UI with:
  - filters/search/sort
  - add to cart
  - wishlist/compare
  - comparison panel

### `features/products/pages/ProductDetail.tsx`

- Product detail view with pricing, descriptions, specifications, and review display.

### `features/cart/pages/Cart.tsx`

- Cart read/update/remove/clear flows.
- Checkout redirect and order summary.

### `features/checkout/pages/Checkout.tsx`

- Shipping address form.

- Step-2 payment confirmation UI with multiple methods:
  - Card, PayPal, Apple Pay, Google Pay, Bank Transfer.
- Client-side validation:
  - card format/Luhn/expiry/CVV
  - wallet email
  - transfer reference
  - policy and payment authorization checkboxes
- Creates order via `POST /orders` with `shippingAddress` and `paymentIntentId`-style token.

### `features/orders/pages/Orders.tsx`

- Lists user orders and status.

### `features/orders/pages/OrderDetail.tsx`

- Single order breakdown with shipping and line-item totals.

### `features/wishlist/pages/Wishlist.tsx`

- Renders wishlist products for signed-in users.

### `features/admin/pages/AdminDashboard.tsx`

- Admin order status updates.
- Admin catalog content controls for:
  - product specifications
  - product reviews

## Layout and Global UI

### `components/layout/Layout.tsx`

- Global shell with:
  - sticky header navigation
  - route outlet
  - footer with policies/support
- Footer message modal system with global event bridge:
  - event: `gamerspot:open-footer-message`

### `components/feedback/ToastHost.tsx` and `lib/ui/toast.ts`

- Shared toast notification rendering and dispatch.

## Styling System

- Tailwind configured in `frontend/tailwind.config.js`.
- App-level utility classes and custom effects in `frontend/src/index.css`.
- Theme includes custom color tokens, shadows, animations, and gradients.

## Type Contracts

### `types/index.ts`

Defines frontend domain contracts for:

- auth/user
- product/catalog
- cart
- order
- API errors

Notable order payload:

- `CreateOrderData` includes `shippingAddress` and optional `paymentIntentId`.

## Local Frontend Commands

```bash
cd frontend
npm run dev
npm run lint
npm run type-check
npm run build
```
