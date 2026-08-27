const STOREFRONT_WARMUP_READY_EVENT = "grindspot:storefront-warmup-ready";

let storefrontWarmupReady = false;

export function hasStorefrontWarmupReady(): boolean {
  return storefrontWarmupReady;
}

export function resetStorefrontWarmupReady(): void {
  storefrontWarmupReady = false;
}

export function markStorefrontWarmupReady(): void {
  storefrontWarmupReady = true;

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STOREFRONT_WARMUP_READY_EVENT));
}

export function subscribeToStorefrontWarmupReady(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(STOREFRONT_WARMUP_READY_EVENT, callback);
  return () => {
    window.removeEventListener(STOREFRONT_WARMUP_READY_EVENT, callback);
  };
}
