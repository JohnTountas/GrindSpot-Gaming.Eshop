/**
 * Centralized query keys for admin dashboard data fetching.
 */
export const adminOrdersKey = ['admin-orders'] as const;

export const adminProductsKey = (search: string) =>
  ['admin-products', search] as const;

export const adminProductContentKey = (productId: string) =>
  ['admin-product-content', productId] as const;
