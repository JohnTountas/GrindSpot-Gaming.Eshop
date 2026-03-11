/**
 * Query hook for the main products catalog.
 */
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import { productsKey } from '../queryKeys';

// React Query hook that loads the product catalog list.
export function useProductsCatalog() {
  return useQuery({
    queryKey: productsKey,
    queryFn: () => getProducts({ limit: 200 }),
  });
}
