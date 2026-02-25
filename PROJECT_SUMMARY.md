# GamerSpot - Project Summary

## Overview

GamerSpot is a full-stack gaming e-commerce platform built with:

- React + TypeScript frontend
- Express + TypeScript backend
- PostgreSQL database via Prisma

The project is organized as a monorepo and includes both customer storefront flows and admin management flows.

## Delivered Features

### Customer

- User registration/login
- JWT access token flow with refresh-token cookie endpoint
- Product catalog browsing with search/filter/sort/pagination
- Product details with specifications and reviews
- Cart management and checkout
- Multi-option payment confirmation UI in checkout
- Order history and order details
- Wishlist and compare functionality

### Admin

- Admin route protection
- Product CRUD endpoints
- Order lifecycle updates (`PENDING`, `PAID`, `SHIPPED`, `CANCELLED`)
- Catalog content management (specifications and reviews)

## Technical Implementation

### Backend

- Modular feature routing under `/api`
- Middleware pipeline for auth, validation, errors, and security
- Input validation with Zod
- ORM/data layer with Prisma + PostgreSQL
- Swagger documentation endpoint (`/docs`)
- Rate limiting for auth endpoints
- Health endpoint (`/health`)

### Frontend

- Route-based app composition with React Router
- Server-state and caching with TanStack React Query
- Axios client with auth token injection and refresh retry behavior
- Responsive Tailwind-based UI
- Feature-oriented page organization (auth, products, cart, checkout, orders, wishlist, admin)

## Data Layer

Core models include:

- User, Role
- Category
- Product
- ProductSpecification
- ProductReview
- Cart, CartItem
- Order, OrderItem, OrderStatus
- WishlistItem, CompareItem
- LoyaltyProfile

## DevOps and Tooling

- Docker Compose for local orchestration (`postgres`, `backend`, `frontend`)
- GitHub Actions CI pipeline for lint/type-check/build/test workflow
- ESLint and TypeScript checks for both apps
- Jest (backend) and Vitest (frontend) test toolchains configured

## Operational Notes

- Docker-exposed backend port is `5050` (container internal port `5000`).
- Local non-Docker backend runs on `5000`.
- Seed script (`backend/prisma/database.ts`) creates default users and catalog data.

Default seeded credentials:

- Admin: `admin@gamerspot.com` / `admin123`
- User: `user@gamerspot.com` / `user123`

## Current Status and Gaps

- Checkout sends a `paymentIntentId`-style token from the UI.
- Backend includes payment-related env fields and DTO support, but full server-side Stripe orchestration is not fully implemented.
- Test frameworks are configured; repository may currently contain zero backend test files.

## Documentation Map

- `README.md`: canonical project overview
- `SETUP.md`: setup and troubleshooting guide
- `QUICK_START.md`: fast execution path
- `COMPLETE_README.md`: expanded technical reference
