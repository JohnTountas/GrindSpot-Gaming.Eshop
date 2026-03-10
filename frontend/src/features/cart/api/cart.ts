/**
 * API calls for cart operations.
 */
import api from '@/lib/api/client';
import type { Cart } from '@/types';

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>('/cart');
  return response.data;
}

export async function addCartItem(productId: string, quantity: number) {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const response = await api.patch(`/cart/items/${itemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(itemId: string) {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
}

export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data;
}
