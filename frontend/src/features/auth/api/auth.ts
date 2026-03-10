/**
 * API calls for authentication.
 */
import api from '@/lib/api/client';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(payload: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
}
