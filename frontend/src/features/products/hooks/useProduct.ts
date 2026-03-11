/**
 * Query hook for a single product.
 */
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/products';
import { productKey } from '../queryKeys';

// React Query hook to fetch a single product by id.
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productKey(productId),
    queryFn: () => getProduct(productId as string),
    enabled: Boolean(productId),
  });
}
