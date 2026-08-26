const LOCAL_API_FALLBACK = "/api";
const PRODUCTION_API_FALLBACK = "https://grindspot-backend.onrender.com/api";

// Resolves the frontend API base in one place so local Vite development can
// keep using the `/api` proxy while production always targets the deployed
// backend origin. This prevents the Vercel SPA from requesting `/api` from its
// own host, which would otherwise be rewritten back to `index.html`.
export function resolveApiBaseUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return PRODUCTION_API_FALLBACK;
  }

  const isLocalHost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  return isLocalHost ? LOCAL_API_FALLBACK : PRODUCTION_API_FALLBACK;
}

// The health endpoint follows the same environment split as the main API base,
// but still allows an explicit override when operators need a custom health URL.
export function resolveHealthUrl(): string {
  const explicitHealthUrl = import.meta.env.VITE_API_HEALTH_URL?.trim();

  if (explicitHealthUrl) {
    return explicitHealthUrl.replace(/\/$/, "");
  }

  const apiBaseUrl = resolveApiBaseUrl();

  if (apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")) {
    return apiBaseUrl.replace(/\/api$/, "/health");
  }

  return "/health";
}
