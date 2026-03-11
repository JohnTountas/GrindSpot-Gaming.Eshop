/**
 * Helpers that normalize API failures into user-friendly messages.
 */
import { AxiosError } from 'axios';

// Normalizes unknown API errors into user-safe, display-ready messages.
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
