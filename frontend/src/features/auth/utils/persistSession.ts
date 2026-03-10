/**
 * Persists session details for authenticated users.
 */
import type { AuthResponse } from '@/types';

export function persistSession(response: AuthResponse) {
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('user', JSON.stringify(response.user));
}
