const BACKEND_REACHABLE_EVENT = "grindspot:backend-reachable";
const BACKEND_REACHABLE_SESSION_KEY = "grindspot:backend-reachable";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

// Remembers successful backend reachability for the current tab so the warmup
// overlay does not keep replaying after the API has already answered once.
export function hasBackendBeenReachable(): boolean {
  if (!canUseBrowserStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(BACKEND_REACHABLE_SESSION_KEY) === "true";
}

// Broadcasts a single shared signal for any code path that confirms the backend
// is answering requests, regardless of the specific endpoint or status code.
export function markBackendReachable(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (canUseBrowserStorage()) {
    window.sessionStorage.setItem(BACKEND_REACHABLE_SESSION_KEY, "true");
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
