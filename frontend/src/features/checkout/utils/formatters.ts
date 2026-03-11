/**
 * Formatting helpers for checkout inputs and prices.
 */
export { formatCurrency } from '@/shared/utils/formatCurrency';

// Strips non-digit characters from input strings.
export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

// Formats a card number into 4-digit groups.
export function formatCardNumber(value: string) {
  const sanitized = digitsOnly(value).slice(0, 19);
  return sanitized.match(/.{1,4}/g)?.join(' ') ?? '';
}

// Formats expiry input into MM/YY display.
export function formatCardExpiry(value: string) {
  const sanitized = digitsOnly(value).slice(0, 4);
  if (sanitized.length <= 2) {
    return sanitized;
  }
  return `${sanitized.slice(0, 2)}/${sanitized.slice(2)}`;
}

// Extracts the last four digits from a card input.
export function getCardLastFour(value: string) {
  const sanitized = digitsOnly(value);
  return sanitized.length >= 4 ? sanitized.slice(-4) : '';
}
