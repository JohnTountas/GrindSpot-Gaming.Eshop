/**
 * Formatting helpers for checkout inputs and prices.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string) {
  const sanitized = digitsOnly(value).slice(0, 19);
  return sanitized.match(/.{1,4}/g)?.join(' ') ?? '';
}

export function formatCardExpiry(value: string) {
  const sanitized = digitsOnly(value).slice(0, 4);
  if (sanitized.length <= 2) {
    return sanitized;
  }
  return `${sanitized.slice(0, 2)}/${sanitized.slice(2)}`;
}

export function getCardLastFour(value: string) {
  const sanitized = digitsOnly(value);
  return sanitized.length >= 4 ? sanitized.slice(-4) : '';
}
