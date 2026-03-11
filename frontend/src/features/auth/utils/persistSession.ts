/**
 * Persists session details for authenticated users.
 */
import type { AuthResponse } from '@/shared/types';

// Stores auth tokens and user metadata for later requests.
export function persistSession(response: AuthResponse) {
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('user', JSON.stringify(response.user));
}

