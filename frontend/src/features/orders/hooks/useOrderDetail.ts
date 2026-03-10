/**
 * Query hook for a single order detail.
 */
import { useQuery } from '@tanstack/react-query';
import { getOrderDetail } from '../api/orders';
import { orderDetailKey } from '../queryKeys';

export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: orderDetailKey(orderId),
    queryFn: () => getOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
}
