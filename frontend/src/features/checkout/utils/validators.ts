/**
 * Validation helpers for checkout input fields.
 */
import { digitsOnly } from './formatters';

// Validates card numbers using length checks and the Luhn algorithm.
export function isValidCardNumber(value: string) {
  const sanitized = digitsOnly(value);
  if (sanitized.length < 12 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = sanitized.length - 1; index >= 0; index -= 1) {
    let digit = Number(sanitized[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Validates card expiry input in MM/YY format.
export function isValidExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]) + 2000;
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

// Validates basic email format for checkout fields.
export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
