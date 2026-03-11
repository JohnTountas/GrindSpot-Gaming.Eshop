/**
 * Shared React Query client configuration for the storefront.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache query results briefly to avoid aggressive refetching during navigation.
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});
