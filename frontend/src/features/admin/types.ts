/**
 * Domain models for the admin dashboard feature.
 */
import type { Order, Product, ProductReview, ProductSpecification } from '@/shared/types';

// Order model enriched with user details for admin screens.
export interface AdminOrder extends Order {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Paginated response for admin product listing.
export interface AdminProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product model enriched with specifications and reviews for editing.
export interface AdminProductContent extends Product {
  specifications: ProductSpecification[];
  reviews: ProductReview[];
}

// Order status enum derived from the shared Order type.
export type OrderStatus = Order['status'];

// Payload used to create a product specification.
export interface SpecificationPayload {
  label: string;
  value: string;
  position: number;
}

// Payload used to update an existing specification.
export interface SpecificationUpdatePayload extends SpecificationPayload {
  specificationId: string;
}

// Payload used to create a product review.
export interface ReviewPayload {
  authorName: string;
  title?: string;
  comment: string;
  rating: number;
  verifiedPurchase: boolean;
}

// Payload used to update an existing review.
export interface ReviewUpdatePayload extends ReviewPayload {
  reviewId: string;
}

