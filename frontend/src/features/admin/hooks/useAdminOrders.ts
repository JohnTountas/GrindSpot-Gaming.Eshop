/**
 * Query hook for admin orders.
 */
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '../api/adminOrders';
import { adminOrdersKey } from '../queryKeys';

// React Query hook to fetch admin order lists.
export function useAdminOrders() {
  return useQuery({
    queryKey: adminOrdersKey,
    queryFn: getAdminOrders,
  });
}
