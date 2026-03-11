/**
 * Shared frontend domain types aligned with backend API contracts.
 */
// User and authentication contracts mirrored from the backend auth module.
/** Represents an authenticated user profile. */
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt?: string;
}

// Auth types
/** Credentials required to log in. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Registration payload extending basic login credentials. */
export interface RegisterData extends LoginCredentials {
  firstName?: string;
  lastName?: string;
}

/** Auth response returned after successful login/registration. */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Catalog entities used by list/detail pages and admin-facing product editing.
/** Specification line item attached to a product. */
export interface ProductSpecification {
  id: string;
  productId: string;
  label: string;
  value: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

/** Customer review attached to a product. */
export interface ProductReview {
  id: string;
  productId: string;
  userId?: string | null;
  authorName: string;
  title?: string | null;
  comment: string;
  rating: number;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Product catalog entity used across storefront and admin views. */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  category?: Category;
  specifications?: ProductSpecification[];
  reviews?: ProductReview[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Filter and pagination options for product listings. */
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
  featured?: boolean;
}

/** Paginated response for product list queries. */
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Category metadata powers filtering and navigation labels.
/** Product category entity. */
export interface Category {
  id: string;
  name: string;
  slang: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cart contracts back cart pages, checkout summaries, and quick-add interactions.
/** Line item stored in a cart. */
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

/** Shopping cart aggregate with item list and totals. */
export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  total?: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload for adding a product to the cart. */
export interface AddToCartData {
  productId: string;
  quantity: number;
}

/** Payload for updating a cart item quantity. */
export interface UpdateCartItemData {
  quantity: number;
}

// Order contracts map directly to checkout, history, and detail experiences.
/** Allowed order lifecycle statuses. */
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

/** Shipping address captured during checkout. */
export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

/** Line item stored within an order. */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  priceAtPurchase: number;
  quantity: number;
}

/** Order aggregate returned by the API. */
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new order. */
export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentIntentId?: string;
}

/** Paginated response for order list queries. */
export interface OrdersResponse {
  orders: Order[];
  total: number;
}

// Common API error envelope used by error helpers and mutation failure states.
/** Error envelope returned by API failures. */
export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
