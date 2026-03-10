/**
 * Query hook for related products list.
 */
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import { relatedProductsKey } from '../queryKeys';

export function useRelatedProducts(productId: string | undefined, categorySlang?: string) {
  return useQuery({
    queryKey: relatedProductsKey(productId, categorySlang),
    queryFn: () => {
      const params = categorySlang ? { category: categorySlang, limit: 10 } : { limit: 10 };
      return getProducts(params).then((data) => data.products);
    },
    enabled: Boolean(productId),
  });
}
