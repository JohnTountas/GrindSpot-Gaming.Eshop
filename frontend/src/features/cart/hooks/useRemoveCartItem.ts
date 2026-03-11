/**
 * Mutation hook for removing cart items.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCartItem as removeCartItemApi } from '../api/cart';
import { cartKey } from '../queryKeys';
import { readGuestCart, removeGuestCartItem } from '@/shared/cart/guestCart';
import { getApiErrorMessage } from '@/shared/api/error';
import type { Cart } from '@/shared/types';

// Options for reacting to cart-item removal lifecycle events.
interface UseRemoveCartItemOptions {
  authed: boolean;
  onGuestCartUpdated?: (cart: Cart) => void;
  onMutate?: (itemId: string) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onSettled?: () => void;
}

// React Query mutation hook to remove a cart item.
export function useRemoveCartItem({
  authed,
  onGuestCartUpdated,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: UseRemoveCartItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!authed) {
        return removeGuestCartItem(itemId);
      }
      return removeCartItemApi(itemId);
    },
    onMutate: (itemId) => {
      onMutate?.(itemId);
    },
    onSuccess: async () => {
      if (authed) {
        await queryClient.invalidateQueries({ queryKey: cartKey });
      } else {
        onGuestCartUpdated?.(readGuestCart());
      }
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(getApiErrorMessage(error, 'Unable to remove cart item'));
    },
    onSettled: () => {
      onSettled?.();
    },
  });
}

