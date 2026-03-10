/**
 * Builds a readable account name for auth success messaging.
 */
import type { AuthResponse } from '@/types';

export function getUserDisplayName(user: AuthResponse['user']): string {
  const fullName = [user.firstName, user.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  const emailPrefix = user.email.split('@')[0]?.trim();
  return emailPrefix || user.email;
}
