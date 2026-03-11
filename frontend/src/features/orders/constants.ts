/**
 * Visual mapping for order statuses.
 */
import type { Order } from '@/shared/types';

// Maps order statuses to UI class names.
export const ORDER_STATUS_STYLES: Record<Order['status'], string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  PAID: 'border-sky-200 bg-sky-50 text-sky-700',
  SHIPPED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700',
};

