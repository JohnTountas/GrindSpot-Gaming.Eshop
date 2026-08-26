/**
 * Persists guest order receipts locally so anonymous customers can view confirmation details.
 */
import type { Order } from '@/shared/types';

const guestOrderStorageKey = 'guestCheckoutOrders';

type GuestOrderLookup = Record<string, Order>;

// Guest-order receipts improve anonymous checkout UX, but they should never
// crash the confirmation page when storage is unavailable or locked down.
function readGuestOrderStorageValue(): string | null {
  try {
    return localStorage.getItem(guestOrderStorageKey);
  } catch {
    return null;
  }
}

function writeGuestOrderStorageValue(orders: GuestOrderLookup): void {
  try {
    localStorage.setItem(guestOrderStorageKey, JSON.stringify(orders));
  } catch {
    // Ignore persistence failures and let the current page render from runtime data.
  }
}

function removeGuestOrderStorageValue(): void {
  try {
    localStorage.removeItem(guestOrderStorageKey);
  } catch {
    // Ignore cleanup failures because storage is optional for guest receipts.
  }
}

function readGuestOrderLookup(): GuestOrderLookup {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = readGuestOrderStorageValue();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as GuestOrderLookup;
  } catch {
    removeGuestOrderStorageValue();
    return {};
  }
}

// Stores the latest guest order snapshot by id for the confirmation page.
export function persistGuestOrder(order: Order): void {
  if (typeof window === 'undefined') {
    return;
  }

  const orders = readGuestOrderLookup();
  orders[order.id] = order;
  writeGuestOrderStorageValue(orders);
}

// Reads a previously stored guest order snapshot by id.
export function readGuestOrder(orderId: string): Order | null {
  return readGuestOrderLookup()[orderId] ?? null;
}
