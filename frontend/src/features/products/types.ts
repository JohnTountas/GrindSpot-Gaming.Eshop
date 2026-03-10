/**
 * Types for product catalog feature.
 */
import type { Category, Product } from '@/types';

export interface ProductsResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export type CategoryWithCount = Category & { _count?: { products: number } };

export type SortOption = 'featured' | 'rating' | 'price-asc' | 'price-desc' | 'newest';

export interface ShowcaseCategory {
  name: string;
  detail: string;
  slang: string;
}
