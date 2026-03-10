/**
 * Query hook for admin product catalog list.
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminProducts } from '../api/adminCatalog';
import { adminProductsKey } from '../queryKeys';

export function useAdminProducts(search: string) {
  return useQuery({
    queryKey: adminProductsKey(search),
    queryFn: () => getAdminProducts(search),
  });
}
