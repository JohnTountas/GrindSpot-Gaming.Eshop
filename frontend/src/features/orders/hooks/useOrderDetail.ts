/**
 * Query hook for a single order detail.
 */
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '../api/orders';
import { orderDetailKey } from '../queryKeys';

// React Query hook to fetch a single order by id.
export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: orderDetailKey(orderId),
    queryFn: () => getOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
}
