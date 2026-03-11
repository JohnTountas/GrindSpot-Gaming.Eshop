/**
 * Domain types for checkout flows.
 */
// Supported payment method identifiers.
export type PaymentMethod =
  | 'CARD'
  | 'PAYPAL'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'BANK_TRANSFER';

// Renderable payment option metadata used by checkout.
export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  complianceNote: string;
}

// Card input fields captured for card payment flows.
export interface CardPaymentDetails {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}
