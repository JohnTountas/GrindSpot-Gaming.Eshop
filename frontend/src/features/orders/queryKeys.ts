/**
 * Query keys for order-related data.
 */
// React Query key for order lists.
export const ordersKey = ['orders'] as const;

// React Query key factory for a single order detail.
export const orderDetailKey = (orderId: string | undefined) =>
  ['order', orderId] as const;
