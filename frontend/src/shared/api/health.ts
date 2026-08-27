import { resolveHealthUrl } from "./resolveApiBase";
import { markBackendReachable } from "./backendReachability";

// Reuse the same environment-aware URL resolver as the main API client so the
// warmup overlay probes the exact backend origin the storefront will call next.
export function resolveBackendHealthUrl(): string {
  return resolveHealthUrl();
}

// The health probe intentionally avoids credentials because readiness does not
// depend on the current user session. This keeps the warmup check resilient in
// browsers that apply stricter third-party cookie or tracking protections.
export async function pingBackendHealth(signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(resolveBackendHealthUrl(), {
    method: "GET",
    cache: "no-store",
    mode: "cors",
    credentials: "omit",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  // Any HTTP response proves that the backend origin is awake enough to answer
  // requests, even if the specific status code is not `200 OK`.
  markBackendReachable();
  return response.ok;
}
