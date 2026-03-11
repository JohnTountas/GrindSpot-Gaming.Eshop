/**
 * Query keys for product catalog data.
 */
// React Query key for product catalog listings.
export const productsKey = ['products', 'premium-catalog'] as const;

// React Query key for category listings.
export const categoriesKey = ['categories'] as const;

// React Query key factory for a single product.
export const productKey = (productId: string | undefined) => ['product', productId] as const;

// React Query key factory for related products.
export const relatedProductsKey = (productId: string | undefined, categorySlang?: string) =>
  ['related-products', productId, categorySlang] as const;
