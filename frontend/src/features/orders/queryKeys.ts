/**
 * Query keys for order-related data.
 */
export const ordersKey = ['orders'] as const;

export const orderDetailKey = (orderId: string | undefined) =>
  ['order', orderId] as const;
