/**
 * Mutation hook for login.
 */
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api/error';
import type { AuthResponse, LoginCredentials } from '@/types';
import { login } from '../api/auth';

// Optional callbacks for login mutation behavior.
interface UseLoginOptions {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (message: string) => void;
}

// React Query mutation hook for logging in a user.
export function useLogin(options: UseLoginOptions = {}) {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (response) => {
      options.onSuccess?.(response);
    },
    onError: (error) => {
      options.onError?.(getApiErrorMessage(error, 'Login failed'));
    },
  });
}
