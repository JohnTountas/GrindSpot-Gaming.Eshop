import { useAuthSession } from '@/shared/auth/session';
import { useAuthenticatedCompare } from '../auth/hooks/useAuthenticatedCompare';
import { useGuestCompare } from '../guest/hooks/useGuestCompare';
import { useCompareSessionCleanup } from './useCompareSessionCleanup';

// Presents one compare API to the UI while switching storage strategy based on
// whether the user is authenticated. Components should not need to care where
// compare state lives; they only need ids plus toggle/clear actions.
export function useCompare() {
  const { authed } = useAuthSession();
  const authenticatedCompare = useAuthenticatedCompare(authed);
  const guestCompare = useGuestCompare(!authed);
  const activeCompare = authed ? authenticatedCompare : guestCompare;

  // Cleanup behavior differs by source: guest state lives in browser storage,
  // while authenticated state lives on the server. The hook keeps those rules
  // together so product pages stay focused on rendering.
  useCompareSessionCleanup({
    authed,
    ids: activeCompare.ids,
    clearGuestCompare: guestCompare.clearOnWindowClose,
    clearAuthenticatedCompare: authenticatedCompare.clearOnWindowClose,
  });

  return {
    ids: activeCompare.ids,
    isLoading: activeCompare.isLoading,
    toggle: activeCompare.toggle,
    clear: activeCompare.clear,
  };
}
