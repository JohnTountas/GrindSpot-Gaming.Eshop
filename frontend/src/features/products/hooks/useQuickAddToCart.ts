/**
 * Mutation hook for quick add-to-cart actions.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem } from '@/features/cart/api/cart';
import { cartKey } from '@/features/cart/queryKeys';
import { getApiErrorMessage } from '@/lib/api/error';

interface UseQuickAddToCartOptions {
  onMutate?: (productId: string) => void;
  onSuccess?: (productId: string) => void;
  onError?: (message: string) => void;
  onSettled?: () => void;
}

export function useQuickAddToCart(options: UseQuickAddToCartOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addCartItem(productId, 1),
    onMutate: (productId) => {
      options.onMutate?.(productId);
    },
    onSuccess: async (_response, productId) => {
      await queryClient.invalidateQueries({ queryKey: cartKey });
      await queryClient.invalidateQueries({ queryKey: ['storefront-state'] });
      options.onSuccess?.(productId);
    },
    onError: (error) => {
      options.onError?.(getApiErrorMessage(error, 'Unable to add item to cart'));
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });
}
