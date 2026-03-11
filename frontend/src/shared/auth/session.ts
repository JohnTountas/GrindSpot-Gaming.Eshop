/**
 * Client-side session persistence helpers for tokens and user metadata.
 */
import { User } from '@/shared/types';

// Reads and safely parses the persisted user payload from local storage.
export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

// Checks whether an access token exists for guarded route decisions.
export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('accessToken'));
}

// Clears all persisted auth artifacts during logout or token failure flows.
export function clearSession(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

