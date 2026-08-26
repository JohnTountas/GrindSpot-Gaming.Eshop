import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/shared/auth/session';
import {
  buildCompareClearUrl,
  clearCompareProducts,
  toggleCompareProduct,
} from '../../api/storefrontApi';
import { defaultStorefrontState } from '../../constants';
import { storefrontStateKey } from '../../queryKeys';
import type { StorefrontToggleResult } from '../../types';
import { useAuthenticatedStorefrontState } from './useAuthenticatedStorefrontState';

// Authenticated compare state and mutations backed by the API.
export function useAuthenticatedCompare(enabled: boolean) {
  const queryClient = useQueryClient();
  const storefrontQuery = useAuthenticatedStorefrontState(enabled);
  const ids = storefrontQuery.data?.compareProductIds ?? defaultStorefrontState.compareProductIds;

  const toggleMutation = useMutation({
    mutationFn: toggleCompareProduct,
    onSuccess: (data) => {
      queryClient.setQueryData(storefrontStateKey, data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCompareProducts,
    onSuccess: (data) => {
      queryClient.setQueryData(storefrontStateKey, data);
    },
  });

  return {
    ids,
    isLoading:
      enabled && (storefrontQuery.isLoading || toggleMutation.isPending || clearMutation.isPending),
    async toggle(productId: string): Promise<StorefrontToggleResult> {
      const response = await toggleMutation.mutateAsync(productId);

      return {
        added: response.added,
        ids: response.compareProductIds,
        reachedLimit: Boolean(response.reachedLimit),
      };
    },
    clear() {
      clearMutation.mutate();
    },
    clearOnWindowClose() {
      if (typeof window === 'undefined' || ids.length === 0) {
        return;
      }

      const compareClearUrl = buildCompareClearUrl();
      // Reuse the shared session helper so auth storage rules stay centralized.
      const token = getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      void fetch(compareClearUrl, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        keepalive: true,
      });
    },
  };
}
