/**
 * Mutation hook for updating cart item quantities.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCartItem as updateCartItemApi } from '../api/cart';
import { cartKey } from '../queryKeys';
import { readGuestCart, updateGuestCartItem } from '@/lib/cart/guestCart';
import { getApiErrorMessage } from '@/lib/api/error';
import type { Cart } from '@/types';

interface UseUpdateCartItemOptions {
  authed: boolean;
  onGuestCartUpdated?: (cart: Cart) => void;
  onMutate?: (itemId: string) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onSettled?: () => void;
}

export function useUpdateCartItem({
  authed,
  onGuestCartUpdated,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: UseUpdateCartItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { itemId: string; quantity: number }) => {
      if (!authed) {
        return updateGuestCartItem(payload.itemId, payload.quantity);
      }
      return updateCartItemApi(payload.itemId, payload.quantity);
    },
    onMutate: (payload) => {
      onMutate?.(payload.itemId);
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
      onError?.(getApiErrorMessage(error, 'Unable to update cart item'));
    },
    onSettled: () => {
      onSettled?.();
    },
  });
}
