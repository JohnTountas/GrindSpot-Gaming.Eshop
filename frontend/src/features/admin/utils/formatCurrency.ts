/**
 * Formats numeric values into EUR currency output for consistent UI pricing.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value);
}
