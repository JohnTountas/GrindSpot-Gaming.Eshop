/**
 * Final confirmation controls for payment authorization and policy acceptance.
 */
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";

const CHECKBOX_CLASS = "mt-0.5 h-4 w-4 shrink-0 accent-primary-800";

interface PaymentConfirmationPanelProps {
  totalEstimate: number;
  selectedPaymentLabel: string;
  paymentPreview: string;
  errorMessage: string;
  hasAuthorizedPayment: boolean;
  hasAcceptedPolicies: boolean;
  paymentInputsLocked: boolean;
  isSubmitting: boolean;
  onAuthorizedChange: (checked: boolean) => void;
  onAcceptedPoliciesChange: (checked: boolean) => void;
  onOpenTerms: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenPrivacy: (event: MouseEvent<HTMLButtonElement>) => void;
}

// Groups the compliance checkboxes, preview chips, and submit actions.
export function PaymentConfirmationPanel({
  totalEstimate,
  selectedPaymentLabel,
  paymentPreview,
  errorMessage,
  hasAuthorizedPayment,
  hasAcceptedPolicies,
  paymentInputsLocked,
  isSubmitting,
  onAuthorizedChange,
  onAcceptedPoliciesChange,
  onOpenTerms,
  onOpenPrivacy,
}: PaymentConfirmationPanelProps) {
  return (
    <>
      <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
          Security and compliance confirmation
        </p>
        <div className="mt-2 space-y-2">
          <label className="flex items-start gap-2 text-sm text-primary-800">
            <input
              type="checkbox"
              checked={hasAuthorizedPayment}
              onChange={(event) => onAuthorizedChange(event.target.checked)}
              disabled={paymentInputsLocked}
              className={CHECKBOX_CLASS}
            />
            <span>
              I authorize <strong>GrindSpot</strong> to charge{" "}
              <strong>{formatCurrency(totalEstimate)}</strong> using{" "}
              <strong>{selectedPaymentLabel}</strong>.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-primary-800">
            <input
              type="checkbox"
              checked={hasAcceptedPolicies}
              onChange={(event) => onAcceptedPoliciesChange(event.target.checked)}
              disabled={paymentInputsLocked}
              className={CHECKBOX_CLASS}
            />
            <span>
              I agree to the{" "}
              <button
                type="button"
                onClick={onOpenTerms}
                className="font-semibold text-accent-700 underline underline-offset-2 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
              >
                Terms of Service
              </button>
              ,{" "}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="font-semibold text-accent-700 underline underline-offset-2 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
              >
                Privacy Policy
              </button>{" "}
              and applicable payment regulations, including SCA requirements where enforced.
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
          Method: {selectedPaymentLabel}
        </p>
        <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
          Estimated charge: {formatCurrency(totalEstimate)}
        </p>
        <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
          Confirmation: {paymentPreview}
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 disabled:cursor-not-allowed disabled:bg-primary-300 sm:w-auto"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Authorizing payment...
            </span>
          ) : (
            "Confirm payment and place order"
          )}
        </button>
        <Link
          to="/cart"
          className="inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900 sm:w-auto"
        >
          Back to cart
        </Link>
      </div>
    </>
  );
}
