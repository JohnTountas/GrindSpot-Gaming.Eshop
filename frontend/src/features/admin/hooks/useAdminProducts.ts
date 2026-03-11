/**
 * Query hook for admin product catalog list.
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminProducts } from '../api/adminCatalog';
import { adminProductsKey } from '../queryKeys';

// React Query hook to fetch admin product listings.
export function useAdminProducts(search: string) {
  return useQuery({
    queryKey: adminProductsKey(search),
    queryFn: () => getAdminProducts(search),
  });
}
