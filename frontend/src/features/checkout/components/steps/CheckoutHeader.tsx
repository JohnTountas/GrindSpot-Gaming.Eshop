/**
 * Page header and progress indicator for checkout.
 */
import { CHECKOUT_PROGRESS_STEPS } from '../../config/checkoutContent';

const ACTIVE_STEP_CLASS =
  'rounded-full border border-accent-700/45 bg-accent-700/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-700';
const COMPLETED_STEP_CLASS =
  'rounded-full border border-emerald-300/70 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700';
const PENDING_STEP_CLASS =
  'rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600';

interface CheckoutHeaderProps {
  isShippingComplete: boolean;
}

// Communicates the current checkout step without mixing with form state logic.
export function CheckoutHeader({ isShippingComplete }: CheckoutHeaderProps) {
  return (
    <header className="surface-card p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
        Secure checkout
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-primary-900 sm:text-3xl">
        Shipping details
      </h1>
      <p className="mt-2 text-sm text-primary-600">
        Enter delivery details, choose a payment method, and confirm authorization.
      </p>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <p className={isShippingComplete ? COMPLETED_STEP_CLASS : ACTIVE_STEP_CLASS}>
          {CHECKOUT_PROGRESS_STEPS.shipping}
        </p>
        <p className={isShippingComplete ? ACTIVE_STEP_CLASS : PENDING_STEP_CLASS}>
          {CHECKOUT_PROGRESS_STEPS.confirmation}
        </p>
        <p className={PENDING_STEP_CLASS}>{CHECKOUT_PROGRESS_STEPS.completed}</p>
      </div>
    </header>
  );
}
