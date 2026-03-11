/**
 * Mutation hook for registration.
 */
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/api/error';
import type { AuthResponse, RegisterData } from '@/shared/types';
import { register } from '../api/auth';

// Optional callbacks for registration mutation behavior.
interface UseRegisterOptions {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (message: string) => void;
}

// React Query mutation hook for registering a new user.
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

