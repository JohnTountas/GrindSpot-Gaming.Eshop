/**
 * Mutations for admin review CRUD operations.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api/error';
import { createReview, deleteReview, updateReview } from '../api/adminCatalog';
import { adminProductContentKey } from '../queryKeys';
import type { ReviewPayload, ReviewUpdatePayload } from '../types';

interface UseReviewMutationsOptions {
  onStatusMessage?: (message: string) => void;
  onCreated?: () => void;
}

export function useReviewMutations(productId: string, options: UseReviewMutationsOptions = {}) {
  const queryClient = useQueryClient();

  async function refreshContent() {
    if (!productId) {
      return;
    }
    await queryClient.invalidateQueries({ queryKey: adminProductContentKey(productId) });
  }

  const createReviewMutation = useMutation({
    mutationFn: (payload: ReviewPayload) => createReview(productId, payload),
    onSuccess: async () => {
      options.onStatusMessage?.('Review created.');
      options.onCreated?.();
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to create review'));
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: (payload: ReviewUpdatePayload) => updateReview(payload),
    onSuccess: async () => {
      options.onStatusMessage?.('Review updated.');
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to update review'));
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: async () => {
      options.onStatusMessage?.('Review deleted.');
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to delete review'));
    },
  });

  return {
    createReviewMutation,
    updateReviewMutation,
    deleteReviewMutation,
  };
}
