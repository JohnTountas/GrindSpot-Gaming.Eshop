/**
 * Mutation hook for admin order status updates.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminOrderStatus } from '../api/adminOrders';
import { adminOrdersKey } from '../queryKeys';
import type { OrderStatus } from '../types';

// Options for reacting to order status update events.
interface UseUpdateOrderStatusOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

// React Query mutation hook to update an order status.
export function useUpdateOrderStatus(options: UseUpdateOrderStatusOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { orderId: string; status: OrderStatus }) =>
      updateAdminOrderStatus(payload.orderId, payload.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminOrdersKey });
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
