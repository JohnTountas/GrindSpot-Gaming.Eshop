/**
 * API calls for admin order management.
 */
import api from '@/lib/api/client';
import type { AdminOrder, OrderStatus } from '../types';

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await api.get<AdminOrder[]>('/admin/orders');
  return response.data;
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data;
}
