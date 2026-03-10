/**
 * Constants for checkout payment experiences.
 */
import type { PaymentOption } from './types';

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'CARD',
    label: 'Credit or debit card',
    description: 'Visa, Mastercard, and major cards with 3D Secure support.',
    complianceNote: 'PCI-ready tokenized processing',
  },
  {
    id: 'PAYPAL',
    label: 'PayPal',
    description: 'Fast checkout with PayPal account authentication.',
    complianceNote: 'SCA-compliant wallet redirect',
  },
  {
    id: 'APPLE_PAY',
    label: 'Apple Pay',
    description: 'Biometric wallet payment on supported Apple devices.',
    complianceNote: 'Device-level cryptographic approval',
  },
  {
    id: 'GOOGLE_PAY',
    label: 'Google Pay',
    description: 'Secure wallet authorization on supported browsers and Android.',
    complianceNote: 'Tokenized wallet transaction',
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Bank transfer',
    description: 'Place the order now and settle by verified bank transfer reference.',
    complianceNote: 'Regulated remittance reference controls',
  },
];

export const FOOTER_MESSAGE_EVENT = 'grindspot:open-footer-message';
