const API_URL = import.meta.env.VITE_API_URL || '/api';
const EXPLICIT_HEALTH_URL = import.meta.env.VITE_API_HEALTH_URL?.trim();

// Resolves the backend health endpoint for local proxy, same-origin, and
// split-origin deployments.
export function resolveBackendHealthUrl(): string {
  if (EXPLICIT_HEALTH_URL) {
    return EXPLICIT_HEALTH_URL;
  }

  if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
    return API_URL.replace(/\/api\/?$/, '/health');
  }

  return '/health';
}

// Small fetch wrapper used by the global backend warmup overlay.
export async function pingBackendHealth(signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(resolveBackendHealthUrl(), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    signal,
  });

  return response.ok;
}
