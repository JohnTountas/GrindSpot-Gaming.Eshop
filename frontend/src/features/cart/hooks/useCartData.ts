/**
 * Shared cart data hook that supports authenticated and guest carts.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCart } from '../api/cart';
import { cartKey } from '../queryKeys';
import { readGuestCart, subscribeToGuestCart } from '@/lib/cart/guestCart';
import { isAuthenticated } from '@/lib/auth/session';
import type { Cart } from '@/types';

export function useCartData() {
  const authed = isAuthenticated();
  const [guestCart, setGuestCart] = useState<Cart>(() => readGuestCart());

  useEffect(() => {
    if (authed) {
      return;
    }

    setGuestCart(readGuestCart());
    return subscribeToGuestCart(setGuestCart);
  }, [authed]);

  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: getCart,
    enabled: authed,
  });

  return {
    authed,
    cart: authed ? cartQuery.data : guestCart,
    isLoading: authed ? cartQuery.isLoading : false,
    isError: authed ? cartQuery.isError : false,
    error: cartQuery.error,
    refetch: cartQuery.refetch,
  };
}
