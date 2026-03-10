/**
 * Domain types for checkout flows.
 */
export type PaymentMethod =
  | 'CARD'
  | 'PAYPAL'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'BANK_TRANSFER';

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  complianceNote: string;
}

export interface CardPaymentDetails {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}
