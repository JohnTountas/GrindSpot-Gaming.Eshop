/**
 * Pricing summary card shown in the checkout sidebar.
 */
import { ACCEPTED_PAYMENT_METHODS_COPY, CHECKOUT_TRUST_BADGES } from "../../config/checkoutContent";
import type { CheckoutTotals } from "../../utils/checkoutCalculations";
import { formatCurrency } from "../../utils/formatters";

interface OrderSummaryCardProps {
  totals: CheckoutTotals;
}

// Presents the checkout (Order summary) pricing breakdown and trust messaging.
export function OrderSummaryCard({ totals }: OrderSummaryCardProps) {
  return (
    <div className="surface-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-primary-900">Order summary</h2>
      <div className="mt-4 space-y-2 text-sm text-primary-700">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Subtotal:</p>
          <p className="font-semibold text-primary-900">{formatCurrency(totals.subtotal)}</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Estimated Shipping:</p>
          <p className="font-semibold text-primary-900">
            {formatCurrency(totals.shippingEstimate)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Estimated Tax: 24%</p>
          <p className="font-semibold text-primary-900">{formatCurrency(totals.taxEstimate)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-3">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-primary-700">Estimated Total:</p>
          <p className="text-2xl font-bold text-primary-900">
            {formatCurrency(totals.totalEstimate)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Accepted payment methods
          </p>
          <p className="mt-1 text-sm font-semibold text-primary-900">
            {ACCEPTED_PAYMENT_METHODS_COPY}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHECKOUT_TRUST_BADGES.map((badge) => (
            <p key={badge} className="checkout-summary-pill">
              {badge}
            </p>
          ))}
        </div>
        <p className="text-sm text-primary-600 ">
          Shipping policy: dispatch in 24h. Return policy: 30-day no-hassle returns for unused
          items.
        </p>
      </div>
    </div>
  );
}
