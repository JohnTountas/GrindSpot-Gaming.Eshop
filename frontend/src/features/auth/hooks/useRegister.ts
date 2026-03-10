/**
 * Mutation hook for registration.
 */
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api/error';
import type { AuthResponse, RegisterData } from '@/types';
import { register } from '../api/auth';

interface UseRegisterOptions {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (message: string) => void;
}

export function useRegister(options: UseRegisterOptions = {}) {
  return useMutation({
    mutationFn: (payload: RegisterData) => register(payload),
    onSuccess: (response) => {
      options.onSuccess?.(response);
    },
    onError: (error) => {
      options.onError?.(getApiErrorMessage(error, 'Registration failed'));
    },
  });
}
