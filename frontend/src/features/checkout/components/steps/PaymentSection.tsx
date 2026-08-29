/**
 * Payment-step section composed from smaller payment components.
 */
import type { MouseEvent } from "react";
import type { CardPaymentDetails, PaymentMethod } from "../../types";
import { PaymentConfirmationPanel } from "../payment/PaymentConfirmationPanel";
import { PaymentMethodFields } from "../payment/PaymentMethodFields";
import { PaymentMethodSelector } from "../payment/PaymentMethodSelector";

interface PaymentSectionProps {
  selectedPaymentMethod: PaymentMethod;
  selectedPaymentLabel: string;
  cardDetails: CardPaymentDetails;
  walletEmail: string;
  bankTransferReference: string;
  errorMessage: string;
  paymentPreview: string;
  totalEstimate: number;
  isShippingComplete: boolean;
  paymentInputsLocked: boolean;
  hasAuthorizedPayment: boolean;
  hasAcceptedPolicies: boolean;
  isSubmitting: boolean;
  isMissingValue: (value: string) => boolean;
  getInputClass: (value: string, highlightMissing?: boolean) => string;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  onCardHolderNameChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCvvChange: (value: string) => void;
  onWalletEmailChange: (value: string) => void;
  onBankTransferReferenceChange: (value: string) => void;
  onAuthorizedChange: (checked: boolean) => void;
  onAcceptedPoliciesChange: (checked: boolean) => void;
  onOpenTerms: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenPrivacy: (event: MouseEvent<HTMLButtonElement>) => void;
}

// Keeps the confirmation step isolated from page-level cart and route concerns.
export function PaymentSection({
  selectedPaymentMethod,
  selectedPaymentLabel,
  cardDetails,
  walletEmail,
  bankTransferReference,
  errorMessage,
  paymentPreview,
  totalEstimate,
  isShippingComplete,
  paymentInputsLocked,
  hasAuthorizedPayment,
  hasAcceptedPolicies,
  isSubmitting,
  isMissingValue,
  getInputClass,
  onSelectPaymentMethod,
  onCardHolderNameChange,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvvChange,
  onWalletEmailChange,
  onBankTransferReferenceChange,
  onAuthorizedChange,
  onAcceptedPoliciesChange,
  onOpenTerms,
  onOpenPrivacy,
}: PaymentSectionProps) {
  return (
    <fieldset className="mt-6 space-y-4 border-t border-primary-300/55 pt-6">
      <legend className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700 ">
        2. Confirmation
      </legend>

      <p className="max-w-3xl text-sm leading-relaxed text-primary-700">
        Select how you want to pay. This flow sends only a tokenized payment intent reference to the
        order API, never raw card security values. All types of payment are fully encrypted.
      </p>

      {!isShippingComplete && (
        <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-50">
          You must complete all shipping fields to unlock payment confirmation.
        </p>
      )}

      <PaymentMethodSelector
        paymentInputsLocked={paymentInputsLocked}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={onSelectPaymentMethod}
      />

      <PaymentMethodFields
        selectedPaymentMethod={selectedPaymentMethod}
        selectedPaymentLabel={selectedPaymentLabel}
        cardDetails={cardDetails}
        walletEmail={walletEmail}
        bankTransferReference={bankTransferReference}
        paymentInputsLocked={paymentInputsLocked}
        isMissingValue={isMissingValue}
        getInputClass={getInputClass}
        onCardHolderNameChange={onCardHolderNameChange}
        onCardNumberChange={onCardNumberChange}
        onCardExpiryChange={onCardExpiryChange}
        onCardCvvChange={onCardCvvChange}
        onWalletEmailChange={onWalletEmailChange}
        onBankTransferReferenceChange={onBankTransferReferenceChange}
      />

      <PaymentConfirmationPanel
        totalEstimate={totalEstimate}
        selectedPaymentLabel={selectedPaymentLabel}
        paymentPreview={paymentPreview}
        errorMessage={errorMessage}
        hasAuthorizedPayment={hasAuthorizedPayment}
        hasAcceptedPolicies={hasAcceptedPolicies}
        paymentInputsLocked={paymentInputsLocked}
        isSubmitting={isSubmitting}
        onAuthorizedChange={onAuthorizedChange}
        onAcceptedPoliciesChange={onAcceptedPoliciesChange}
        onOpenTerms={onOpenTerms}
        onOpenPrivacy={onOpenPrivacy}
      />
    </fieldset>
  );
}
