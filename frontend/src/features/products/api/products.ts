/**
 * API calls for product catalog.
 */
import api from '@/shared/api/client';
import type { Category } from '@/shared/types';
import type { CategoryWithCount, ProductsResponse } from '../types';
import type { Product } from '@/shared/types';

// Catalog browsing is intentionally public. Overriding credentials here keeps
// product discovery independent from cross-site cookie policies that can vary
// between browsers, privacy modes, and embedded webviews.
const publicCatalogRequestConfig = {
  withCredentials: false,
} as const;

// Fetches a filtered/paginated product list.
export async function getProducts(params: Record<string, unknown>) {
  const response = await api.get<ProductsResponse>('/products', {
    ...publicCatalogRequestConfig,
    params,
  });
  return response.data;
}

// Fetches a single product by id.
export async function getProduct(productId: string) {
  const response = await api.get<Product>(`/products/${productId}`, publicCatalogRequestConfig);
  return response.data;
}

// Fetches category data with product counts where available.
export async function getCategories() {
  const response = await api.get<CategoryWithCount[] | Category[]>('/categories', publicCatalogRequestConfig);
  return response.data as CategoryWithCount[];
}

