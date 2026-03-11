/**
 * Lightweight UI event helpers for app-level toast notifications.
 */
import { ReactNode } from "react";

// Supported semantic tones for toast notifications.
export type ToastTone = "success" | "error";
// Supported placements for toast rendering.
export type FinalOrderMessage = "top-right" | "center";

// Payload delivered with toast notification events.
export interface ToastPayload {
  title: string;
  message?: ReactNode;
  tone: ToastTone;
  placement?: FinalOrderMessage;
  durationMs?: number;
  actionLabel?: string;
  actionTo?: string;
}

// Custom browser event name used to broadcast toasts.
const TOAST_EVENT = "grindspot:toast";

// Dispatches a typed toast event that can be consumed anywhere in the app shell.
export function showSuccessMessage(payload: ToastPayload): void {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

// Subscribes a listener to toast events and returns an unsubscribe cleanup callback.
export function subscribeToToasts(handler: (payload: ToastPayload) => void): () => void {
  const listener: EventListener = (event) => {
    const toastEvent = event as CustomEvent<ToastPayload>;
    handler(toastEvent.detail);
  };

  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}

// Publishes a standardized success toast when an item is added to the cart.
export function showCartAddedToast(productTitle: string): void {
  showSuccessMessage({
    title: "Added to cart",
    message: productTitle,
    tone: "success",
    durationMs: 3000,
    actionLabel: "View cart",
    actionTo: "/cart",
  });
}

// Publishes a standardized success toast when an item is added to wishlist.
export function showWishlistAddedToast(productTitle: string): void {
  showSuccessMessage({
    title: "Added to Wishlist",
    message: productTitle,
    tone: "success",
    durationMs: 3000,
    actionLabel: "View wishlist",
    actionTo: "/wishlist",
  });
}

// Publishes a standardized success toast when an item is added to compare.
export function showCompareAddedToast(productTitle: string): void {
  showSuccessMessage({
    title: "Added to compare",
    message: productTitle,
    tone: "success",
    durationMs: 4000,
    actionLabel: "Open compare",
    actionTo: "/#compare-panel",
  });
}
