/**
 * Query hook for wishlist products.
 */
import { useQuery } from '@tanstack/react-query';
import { getWishlistProducts } from '../api/wishlist';
import { wishlistProductsKey } from '../queryKeys';

export function useWishlistProducts() {
  return useQuery({
    queryKey: wishlistProductsKey,
    queryFn: getWishlistProducts,
  });
}
