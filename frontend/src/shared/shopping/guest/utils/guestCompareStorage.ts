import { guestCompareStorageKey, guestCompareUpdatedEvent } from '../../constants';

// Storage access can throw in hardened privacy modes even when `window` exists.
// Centralizing the guard keeps guest-compare behavior deterministic across browsers.
function readGuestCompareStorageValue(): string | null {
  try {
    return localStorage.getItem(guestCompareStorageKey);
  } catch {
    return null;
  }
}

function removeGuestCompareStorageValue(): void {
  try {
    localStorage.removeItem(guestCompareStorageKey);
  } catch {
    // Ignore storage cleanup failures and fall back to in-memory UI state.
  }
}

function writeGuestCompareStorageValue(ids: string[]): void {
  try {
    localStorage.setItem(guestCompareStorageKey, JSON.stringify(ids));
  } catch {
    // Ignore persistence failures so compare interactions still work for the tab session.
  }
}

function dispatchGuestCompareUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(guestCompareUpdatedEvent));
}

export function readGuestCompareIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = readGuestCompareStorageValue();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string');
    }

    removeGuestCompareStorageValue();
    return [];
  } catch {
    removeGuestCompareStorageValue();
    return [];
  }
}

export function persistGuestCompareIds(ids: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  writeGuestCompareStorageValue(ids);
  dispatchGuestCompareUpdated();
}

export function clearGuestCompareIds() {
  if (typeof window === 'undefined') {
    return;
  }

  removeGuestCompareStorageValue();
  dispatchGuestCompareUpdated();
}
