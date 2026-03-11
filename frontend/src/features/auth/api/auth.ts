/**
 * API calls for authentication.
 */
import api from '@/lib/api/client';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';

// Sends login credentials and returns an auth response.
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

// Sends registration data and returns an auth response.
export async function register(payload: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
}
