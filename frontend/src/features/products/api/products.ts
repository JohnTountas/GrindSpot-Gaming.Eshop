/**
 * API calls for product catalog.
 */
import api from '@/lib/api/client';
import type { Category } from '@/types';
import type { CategoryWithCount, ProductsResponse } from '../types';
import type { Product } from '@/types';

// Fetches a filtered/paginated product list.
export async function getProducts(params: Record<string, unknown>) {
  const response = await api.get<ProductsResponse>('/products', { params });
  return response.data;
}

// Fetches a single product by id.
export async function getProduct(productId: string) {
  const response = await api.get<Product>(`/products/${productId}`);
  return response.data;
}

// Fetches category data with product counts where available.
export async function getCategories() {
  const response = await api.get<CategoryWithCount[] | Category[]>('/categories');
  return response.data as CategoryWithCount[];
}
