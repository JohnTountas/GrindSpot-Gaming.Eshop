/**
 * API calls for cart operations.
 */
import api from '@/shared/api/client';
import type { Cart } from '@/shared/types';

// Fetches the current user's cart from the API.
export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>('/cart');
  return response.data;
}

// Adds a product to the cart with a requested quantity.
export async function addCartItem(productId: string, quantity: number) {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
}

// Updates an existing cart item's quantity.
export async function updateCartItem(itemId: string, quantity: number) {
  const response = await api.patch(`/cart/items/${itemId}`, { quantity });
  return response.data;
}

// Removes a cart item by id.
export async function removeCartItem(itemId: string) {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
}

// Clears all items from the cart.
export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data;
}

