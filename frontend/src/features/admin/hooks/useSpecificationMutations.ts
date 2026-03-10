/**
 * Mutations for admin specification CRUD operations.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api/error';
import {
  createSpecification,
  deleteSpecification,
  updateSpecification,
} from '../api/adminCatalog';
import { adminProductContentKey } from '../queryKeys';
import type { SpecificationPayload, SpecificationUpdatePayload } from '../types';

interface UseSpecificationMutationsOptions {
  onStatusMessage?: (message: string) => void;
  onCreated?: () => void;
}

export function useSpecificationMutations(
  productId: string,
  options: UseSpecificationMutationsOptions = {}
) {
  const queryClient = useQueryClient();

  async function refreshContent() {
    if (!productId) {
      return;
    }
    await queryClient.invalidateQueries({ queryKey: adminProductContentKey(productId) });
  }

  const createSpecMutation = useMutation({
    mutationFn: (payload: SpecificationPayload) => createSpecification(productId, payload),
    onSuccess: async () => {
      options.onStatusMessage?.('Specification created.');
      options.onCreated?.();
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to create specification'));
    },
  });

  const updateSpecMutation = useMutation({
    mutationFn: (payload: SpecificationUpdatePayload) => updateSpecification(payload),
    onSuccess: async () => {
      options.onStatusMessage?.('Specification updated.');
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to update specification'));
    },
  });

  const deleteSpecMutation = useMutation({
    mutationFn: (specificationId: string) => deleteSpecification(specificationId),
    onSuccess: async () => {
      options.onStatusMessage?.('Specification deleted.');
      await refreshContent();
    },
    onError: (error) => {
      options.onStatusMessage?.(getApiErrorMessage(error, 'Failed to delete specification'));
    },
  });

  return {
    createSpecMutation,
    updateSpecMutation,
    deleteSpecMutation,
  };
}
