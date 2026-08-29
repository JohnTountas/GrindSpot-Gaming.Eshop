/**
 * Payment option selector used by the confirmation step.
 */
import { PAYMENT_OPTIONS } from "../../constants";
import type { PaymentMethod } from "../../types";

interface PaymentMethodSelectorProps {
  paymentInputsLocked: boolean;
  selectedPaymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
}

// Renders the selectable payment methods with consistent card styling.
export function PaymentMethodSelector({
  paymentInputsLocked,
  selectedPaymentMethod,
  onSelectPaymentMethod,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PAYMENT_OPTIONS.map((option) => {
        const selected = option.id === selectedPaymentMethod;

        return (
          <label
            key={option.id}
            className={`block h-full rounded-2xl border p-3 transition ${
              selected
                ? "border-accent-700/60 bg-accent-700/8"
                : "border-primary-300/70 bg-primary-100/72"
            } ${paymentInputsLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
          >
            <span className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={selected}
                onChange={() => onSelectPaymentMethod(option.id)}
                className="mt-1 h-4 w-4 accent-primary-800"
                disabled={paymentInputsLocked}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-stone-300">{option.label}</span>
                <span className="mt-0.5 block text-xs text-primary-700">{option.description}</span>
                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-500">
                  {option.complianceNote}
                </span>
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
