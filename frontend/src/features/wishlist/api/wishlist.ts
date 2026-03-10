/**
 * API calls for wishlist data.
 */
import api from '@/lib/api/client';
import type { Product } from '@/types';

export async function getWishlistProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/me/wishlist');
  return response.data;
}

export async function addWishlistItemToCart(productId: string) {
  const response = await api.post('/cart/items', { productId, quantity: 1 });
  return response.data;
}
