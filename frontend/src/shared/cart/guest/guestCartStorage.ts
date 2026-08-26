/**
 * Guest-cart storage helpers isolated from authenticated cart behavior.
 */
import type { Cart, CartItem, Product } from '@/shared/types';
import { guestCartId, guestCartStorageKey, guestCartUpdatedEvent } from '../constants';
import type { StoredGuestCart } from '../types';

// Some browsers or privacy modes allow the page to load but reject storage
// access at runtime. These wrappers keep guest-cart reads and writes fail-safe.
function readGuestCartStorageValue(): string | null {
  try {
    return localStorage.getItem(guestCartStorageKey);
  } catch {
    return null;
  }
}

function writeGuestCartStorageValue(cart: StoredGuestCart): void {
  try {
    localStorage.setItem(guestCartStorageKey, JSON.stringify(cart));
  } catch {
    // Ignore persistence failures so the current tab can keep operating in memory.
  }
}

function removeGuestCartStorageValue(): void {
  try {
    localStorage.removeItem(guestCartStorageKey);
  } catch {
    // Ignore cleanup failures because an unusable storage backend is already non-critical.
  }
}

// Builds the empty guest-cart shell used when no persisted cart exists yet.
function createEmptyGuestCart(): StoredGuestCart {
  const timestamp = new Date().toISOString();

  return {
    id: guestCartId,
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// Validates a stored cart line before it is rehydrated into runtime cart state.
function isStoredCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<CartItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.quantity === 'number' &&
    Boolean(item.product) &&
    typeof item.product?.id === 'string'
  );
}

// Projects a stored guest cart into the public cart shape with a computed total.
export function toGuestCart(cart: StoredGuestCart): Cart {
  const total = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return {
    ...cart,
    total,
  };
}

// Notifies active tabs and listeners that guest-cart storage changed.
function dispatchGuestCartUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(guestCartUpdatedEvent));
}

// Writes guest-cart storage and returns the normalized public cart representation.
export function persistStoredGuestCart(cart: StoredGuestCart): Cart {
  if (typeof window === 'undefined') {
    return toGuestCart(cart);
  }

  writeGuestCartStorageValue(cart);
  dispatchGuestCartUpdated();
  return toGuestCart(cart);
}

// Reads guest-cart storage and normalizes malformed or stale values.
export function readStoredGuestCart(): StoredGuestCart {
  if (typeof window === 'undefined') {
    return createEmptyGuestCart();
  }

  const raw = readGuestCartStorageValue();
  if (!raw) {
    return createEmptyGuestCart();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredGuestCart>;
    const fallbackCart = createEmptyGuestCart();
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(isStoredCartItem).map((item) => ({
          ...item,
          id: `guest-${item.productId}`,
          cartId: guestCartId,
          quantity: Math.max(1, Math.trunc(item.quantity)),
        }))
      : [];

    return {
      id: guestCartId,
      items,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : fallbackCart.createdAt,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : fallbackCart.updatedAt,
    };
  } catch {
    removeGuestCartStorageValue();
    return createEmptyGuestCart();
  }
}

// Creates the canonical cart-item record used inside guest-cart storage.
export function buildGuestCartItem(
  product: Product,
  quantity: number,
  existingItem?: CartItem
): CartItem {
  const timestamp = new Date().toISOString();

  return {
    id: `guest-${product.id}`,
    cartId: guestCartId,
    productId: product.id,
    product,
    quantity,
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

// Clears persisted guest-cart storage and publishes the change to listeners.
export function clearStoredGuestCart() {
  if (typeof window === 'undefined') {
    return;
  }

  removeGuestCartStorageValue();
  dispatchGuestCartUpdated();
}

// Subscribes a listener to guest-cart change events from the current or another tab.
export function subscribeToGuestCartUpdates(handler: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(guestCartUpdatedEvent, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(guestCartUpdatedEvent, handler);
    window.removeEventListener('storage', handler);
  };
}
