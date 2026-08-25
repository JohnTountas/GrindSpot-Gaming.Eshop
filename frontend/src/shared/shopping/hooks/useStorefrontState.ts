import { useAuthSession } from '@/shared/auth/session';
import { defaultStorefrontState } from '../constants';
import { useAuthenticatedStorefrontState } from '../auth/hooks/useAuthenticatedStorefrontState';

// Authenticated users hydrate wishlist/compare state from the backend. Guests
// receive a stable empty/default shape so callers can render one consistent UI
// contract without null checks or auth branching in every component.
export function useStorefrontState() {
  const { authed } = useAuthSession();
  const storefrontQuery = useAuthenticatedStorefrontState(authed);

  return {
    ...storefrontQuery,
    data: authed ? storefrontQuery.data : defaultStorefrontState,
    isLoading: authed ? storefrontQuery.isLoading : false,
    isError: authed ? storefrontQuery.isError : false,
  };
}
