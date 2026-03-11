/**
 * API calls for wishlist data.
 */
import api from '@/lib/api/client';
import type { Product } from '@/types';

// Fetches all wishlist products for the current user.
export async function getWishlistProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/me/wishlist');
  return response.data;
}

// Adds a wishlist product to the cart with quantity 1.
export async function addWishlistItemToCart(productId: string) {
  const response = await api.post('/cart/items', { productId, quantity: 1 });
  return response.data;
}
