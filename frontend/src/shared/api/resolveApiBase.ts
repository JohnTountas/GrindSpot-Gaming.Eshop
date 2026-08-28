const DEFAULT_API_BASE = "/api";

// Keep browser requests on relative API paths by default so local Vite proxying
// and the single-host Fly deployment use the same URL contract.
export function resolveApiBaseUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  return DEFAULT_API_BASE;
}
