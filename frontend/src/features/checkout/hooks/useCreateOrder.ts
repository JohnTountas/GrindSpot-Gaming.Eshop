/**
 * Mutation hook for submitting checkout orders.
 */
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api/error';
import { createOrder } from '@/features/orders/api/orders';
import type { CreateOrderData } from '@/types';

interface UseCreateOrderOptions {
  onSuccess?: (orderId: string) => void;
  onError?: (message: string) => void;
}

export function useCreateOrder(options: UseCreateOrderOptions = {}) {
  return useMutation({
    mutationFn: (payload: CreateOrderData) => createOrder(payload),
    onSuccess: (order) => {
      options.onSuccess?.(order.id);
    },
    onError: (error) => {
      options.onError?.(getApiErrorMessage(error, 'Failed to create order'));
    },
  });
}
