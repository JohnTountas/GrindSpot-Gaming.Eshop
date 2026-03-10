/**
 * Query hook for customer orders list.
 */
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/orders';
import { ordersKey } from '../queryKeys';

export function useOrders() {
  return useQuery({
    queryKey: ordersKey,
    queryFn: getOrders,
  });
}
