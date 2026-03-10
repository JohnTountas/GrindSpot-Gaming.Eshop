/**
 * Query keys for product catalog data.
 */
export const productsKey = ['products', 'premium-catalog'] as const;

export const categoriesKey = ['categories'] as const;

export const productKey = (productId: string | undefined) => ['product', productId] as const;

export const relatedProductsKey = (productId: string | undefined, categorySlang?: string) =>
  ['related-products', productId, categorySlang] as const;
