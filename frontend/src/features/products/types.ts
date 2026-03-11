/**
 * Types for product catalog feature.
 */
import type { Category, Product } from '@/types';

// Response shape for product list API calls.
export interface ProductsResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}

// Category extended with a product count snapshot.
export type CategoryWithCount = Category & { _count?: { products: number } };

// Sort options supported by product catalog filters.
export type SortOption = 'featured' | 'rating' | 'price-asc' | 'price-desc' | 'newest';

// Metadata used to render featured category cards.
export interface ShowcaseCategory {
  name: string;
  detail: string;
  slang: string;
}
