/**
 * Centralized query keys for admin dashboard data fetching.
 */
// React Query key for admin order lists.
export const adminOrdersKey = ['admin-orders'] as const;

// React Query key factory for admin product list queries.
export const adminProductsKey = (search: string) =>
  ['admin-products', search] as const;

// React Query key factory for admin product content.
export const adminProductContentKey = (productId: string) =>
  ['admin-product-content', productId] as const;
