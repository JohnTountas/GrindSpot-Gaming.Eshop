/**
 * API calls for customer orders.
 */
import api from '@/lib/api/client';
import type { Order } from '@/types';
import type { CreateOrderData } from '@/types';

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders');
  return response.data;
}

export async function getOrderDetail(orderId: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function createOrder(payload: CreateOrderData) {
  const response = await api.post('/orders', payload);
  return response.data as { id: string };
}
