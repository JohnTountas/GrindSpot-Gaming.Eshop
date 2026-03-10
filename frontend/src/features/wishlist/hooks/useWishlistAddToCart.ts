/**
 * Mutation hook for adding wishlist items to cart.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addWishlistItemToCart } from '../api/wishlist';
import { wishlistProductsKey } from '../queryKeys';
import { cartKey } from '@/features/cart/queryKeys';

interface UseWishlistAddToCartOptions {
  onMutate?: (productId: string) => void;
  onSuccess?: (productId: string) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

export function useWishlistAddToCart(options: UseWishlistAddToCartOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addWishlistItemToCart(productId),
    onMutate: (productId) => {
      options.onMutate?.(productId);
    },
    onSuccess: async (_response, productId) => {
      await queryClient.invalidateQueries({ queryKey: cartKey });
      await queryClient.invalidateQueries({ queryKey: wishlistProductsKey });
      options.onSuccess?.(productId);
    },
    onError: (error) => {
      options.onError?.(error);
    },
    onSettled: () => {
      options.onSettled?.();
    },
  });
}
