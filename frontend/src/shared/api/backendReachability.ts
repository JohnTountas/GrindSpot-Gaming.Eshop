const BACKEND_REACHABLE_EVENT = "grindspot:backend-reachable";
const BACKEND_REACHABLE_STORAGE_KEY = "grindspot:backend-reachable-at";
const BACKEND_REACHABLE_TTL_MS = 15 * 60 * 1000;

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readBackendReachableTimestamp(): number | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(BACKEND_REACHABLE_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    window.localStorage.removeItem(BACKEND_REACHABLE_STORAGE_KEY);
    return null;
  }

  return parsedValue;
}

// Remembers recent backend reachability for a short window so reloads and new
// tabs in the same browser do not flash the warmup overlay once the API is
// already demonstrably awake.
export function hasBackendBeenReachable(): boolean {
  const lastReachableAt = readBackendReachableTimestamp();
  if (!lastReachableAt) {
    return false;
  }

  const isFresh = Date.now() - lastReachableAt < BACKEND_REACHABLE_TTL_MS;
  if (!isFresh && canUseBrowserStorage()) {
    window.localStorage.removeItem(BACKEND_REACHABLE_STORAGE_KEY);
  }

  return isFresh;
}

// Broadcasts a single shared signal for any code path that confirms the backend
// is answering requests, regardless of the specific endpoint or status code.
export function markBackendReachable(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (canUseBrowserStorage()) {
    window.localStorage.setItem(BACKEND_REACHABLE_STORAGE_KEY, String(Date.now()));
  }

  window.dispatchEvent(new Event(BACKEND_REACHABLE_EVENT));
}

export function subscribeToBackendReachable(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(BACKEND_REACHABLE_EVENT, callback);
  return () => {
    window.removeEventListener(BACKEND_REACHABLE_EVENT, callback);
  };
}
