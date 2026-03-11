/**
 * Guest cart persistence and merge helpers for unauthenticated shopping flows.
 */
import api from "@/lib/api/client";
import type { Cart, CartItem, Product } from "@/types";

// LocalStorage key used to persist guest cart data.
const GUEST_CART_STORAGE_KEY = "grindspot:guest-cart";
// Custom browser event name fired when guest cart data changes.
const GUEST_CART_EVENT = "grindspot:guest-cart-updated";
// Synthetic cart id used for guest carts before login.
const GUEST_CART_ID = "guest-cart";

// Stored guest cart shape without computed totals.
type StoredGuestCart = Omit<Cart, "total">;

// Builds a blank guest cart record with timestamps.
function createEmptyGuestCart(): StoredGuestCart {
  const timestamp = new Date().toISOString();

  return {
    id: GUEST_CART_ID,
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// Type guard to validate stored cart items before hydration.
function isStoredCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.quantity === "number" &&
    Boolean(item.product) &&
    typeof item.product?.id === "string"
  );
}

// Computes cart totals and returns a full cart shape.
function toGuestCart(cart: StoredGuestCart): Cart {
  const total = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  return {
    ...cart,
    total,
  };
}

// Emits a browser event to notify listeners of guest cart changes.
function dispatchGuestCartUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(GUEST_CART_EVENT));
}

// Persists guest cart data to storage and returns the computed cart.
function persistStoredGuestCart(cart: StoredGuestCart): Cart {
  if (typeof window === "undefined") {
    return toGuestCart(cart);
  }

  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
  dispatchGuestCartUpdated();
  return toGuestCart(cart);
}

// Reads and sanitizes the guest cart stored in the browser.
function readStoredGuestCart(): StoredGuestCart {
  if (typeof window === "undefined") {
    return createEmptyGuestCart();
  }

  const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
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
          cartId: GUEST_CART_ID,
          quantity: Math.max(1, Math.trunc(item.quantity)),
        }))
      : [];

    return {
      id: GUEST_CART_ID,
      items,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : fallbackCart.createdAt,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallbackCart.updatedAt,
    };
  } catch {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    return createEmptyGuestCart();
  }
}

// Creates a cart item record for a guest cart entry.
function buildGuestCartItem(
  product: Product,
  quantity: number,
  existingItem?: CartItem
): CartItem {
  const timestamp = new Date().toISOString();

  return {
    id: `guest-${product.id}`,
    cartId: GUEST_CART_ID,
    productId: product.id,
    product,
    quantity,
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

// Throws if the provided quantity is invalid or below 1.
function ensureValidQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }
}

// Throws when requested quantity exceeds product stock.
function ensureStockAvailable(product: Product, quantity: number) {
  if (product.stock < quantity) {
    throw new Error("Insufficient stock");
  }
}

// Returns the current guest cart with totals computed.
export function readGuestCart(): Cart {
  return toGuestCart(readStoredGuestCart());
}

// Checks whether the guest cart contains any items.
export function guestCartHasItems(): boolean {
  return readStoredGuestCart().items.length > 0;
}

// Adds an item to the guest cart, merging quantities when needed.
export function addGuestCartItem(product: Product, quantity: number): Cart {
  ensureValidQuantity(quantity);

  const cart = readStoredGuestCart();
  const existingItem = cart.items.find((item) => item.productId === product.id);
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  ensureStockAvailable(product, nextQuantity);

  const items = existingItem
    ? cart.items.map((item) =>
        item.productId === product.id ? buildGuestCartItem(product, nextQuantity, item) : item
      )
    : [...cart.items, buildGuestCartItem(product, quantity)];

  return persistStoredGuestCart({
    ...cart,
    items,
    updatedAt: new Date().toISOString(),
  });
}

// Updates the quantity of an existing guest cart item.
export function updateGuestCartItem(itemId: string, quantity: number): Cart {
  ensureValidQuantity(quantity);

  const cart = readStoredGuestCart();
  const existingItem = cart.items.find((item) => item.id === itemId);

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  ensureStockAvailable(existingItem.product, quantity);

  return persistStoredGuestCart({
    ...cart,
    items: cart.items.map((item) =>
      item.id === itemId ? buildGuestCartItem(existingItem.product, quantity, existingItem) : item
    ),
    updatedAt: new Date().toISOString(),
  });
}

// Removes an item from the guest cart by id.
export function removeGuestCartItem(itemId: string): Cart {
  const cart = readStoredGuestCart();

  return persistStoredGuestCart({
    ...cart,
    items: cart.items.filter((item) => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  });
}

// Clears all guest cart data and returns an empty cart.
export function clearGuestCart(): Cart {
  const emptyCart = createEmptyGuestCart();

  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    dispatchGuestCartUpdated();
  }

  return toGuestCart(emptyCart);
}

// Subscribes to guest cart updates and returns an unsubscribe function.
export function subscribeToGuestCart(handler: (cart: Cart) => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const sync = () => handler(readGuestCart());

  window.addEventListener(GUEST_CART_EVENT, sync);
  window.addEventListener("storage", sync);

  return () => {
    window.removeEventListener(GUEST_CART_EVENT, sync);
    window.removeEventListener("storage", sync);
  };
}

// Pushes guest cart items to the server after login and reports counts.
export async function syncGuestCartToServer(): Promise<{ syncedCount: number; remainingCount: number }> {
  const items = [...readStoredGuestCart().items];
  let syncedCount = 0;

  for (const item of items) {
    try {
      await api.post("/cart/items", {
        productId: item.productId,
        quantity: item.quantity,
      });
      removeGuestCartItem(item.id);
      syncedCount += 1;
    } catch {
      // Leave unsynced items in guest storage so the user does not lose them.
    }
  }

  return {
    syncedCount,
    remainingCount: readStoredGuestCart().items.length,
  };
}
