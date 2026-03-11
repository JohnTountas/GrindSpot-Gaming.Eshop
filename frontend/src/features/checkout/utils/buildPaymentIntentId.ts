/**
 * Builds a deterministic simulated payment intent id.
 */
import type { PaymentMethod } from '../types';

// Creates a simulated payment intent id for non-live checkout flows.
export function buildPaymentIntentId(method: PaymentMethod, fingerprintSource: string) {
  const fingerprint =
    fingerprintSource
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(-8) || 'anon';
  const timestamp = Date.now().toString(36);
  return `sim_${method.toLowerCase()}_${fingerprint}_${timestamp}`;
}
