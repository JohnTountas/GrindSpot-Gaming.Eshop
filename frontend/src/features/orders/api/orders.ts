/**
 * API calls for customer orders.
 */
import api from '@/shared/api/client';
import type { Order } from '@/shared/types';
import type { CreateOrderData } from '@/shared/types';

// Fetches the current user's order list.
export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders');
  return response.data;
}

// Fetches details for a single order by id.
export async function getOrderDetail(orderId: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
}

// Creates a new order with the provided payload.
export async function createOrder(payload: CreateOrderData) {
  const response = await api.post('/orders', payload);
  return response.data as { id: string };
}

