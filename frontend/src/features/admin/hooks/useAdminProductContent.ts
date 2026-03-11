/**
 * Query hook for admin product content details.
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminProductContent } from '../api/adminCatalog';
import { adminProductContentKey } from '../queryKeys';

// React Query hook to fetch admin product content details.
export function useAdminProductContent(productId: string) {
  return useQuery({
    queryKey: adminProductContentKey(productId),
    queryFn: () => getAdminProductContent(productId),
    enabled: Boolean(productId),
  });
}
