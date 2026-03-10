/**
 * Domain models for the admin dashboard feature.
 */
import type { Order, Product, ProductReview, ProductSpecification } from '@/types';

export interface AdminOrder extends Order {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AdminProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminProductContent extends Product {
  specifications: ProductSpecification[];
  reviews: ProductReview[];
}

export type OrderStatus = Order['status'];

export interface SpecificationPayload {
  label: string;
  value: string;
  position: number;
}

export interface SpecificationUpdatePayload extends SpecificationPayload {
  specificationId: string;
}

export interface ReviewPayload {
  authorName: string;
  title?: string;
  comment: string;
  rating: number;
  verifiedPurchase: boolean;
}

export interface ReviewUpdatePayload extends ReviewPayload {
  reviewId: string;
}
