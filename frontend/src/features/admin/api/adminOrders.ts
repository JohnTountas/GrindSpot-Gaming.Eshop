/**
 * API calls for admin order management.
 */
import api from '@/shared/api/client';
import type { AdminOrder, OrderStatus } from '../types';

// Fetches all orders for admin monitoring.
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await api.get<AdminOrder[]>('/admin/orders');
  return response.data;
}

// Updates the status of an order in the admin view.
export async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data;
}

