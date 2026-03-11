/**
 * UI constants for admin dashboard visuals.
 */
import type { OrderStatus } from './types';

// Supported order status list for admin filters.
export const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];

// Visual style classes mapped to each order status.
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'border-amber-300/70 bg-amber-900/30 text-amber-200',
  PAID: 'border-sky-300/70 bg-sky-900/30 text-sky-200',
  SHIPPED: 'border-emerald-300/70 bg-emerald-900/30 text-emerald-200',
  CANCELLED: 'border-red-300/70 bg-red-900/30 text-red-200',
};
