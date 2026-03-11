/**
 * Checkout page that captures shipping details and submits orders.
 */
import { FormEvent, MouseEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShippingAddress } from '@/shared/types';
import { getApiErrorMessage } from '@/shared/api/error';
import { showSuccessMessage } from '@/shared/ui/toast';
import { CheckoutLoading } from '../components/CheckoutLoading';
import { FOOTER_MESSAGE_EVENT, PAYMENT_OPTIONS } from '../constants';
import { useCreateOrder } from '../hooks/useCreateOrder';
import type { CardPaymentDetails, PaymentMethod } from '../types';
import { buildPaymentIntentId } from '../utils/buildPaymentIntentId';
import {
  digitsOnly,
  formatCardExpiry,
  formatCardNumber,
  formatCurrency,
  getCardLastFour,
} from '../utils/formatters';
import { isValidCardNumber, isValidEmail, isValidExpiry } from '../utils/validators';
import { useCartData } from '@/features/cart/hooks/useCartData';

// Manages checkout state, payment validation, and final order creation workflow.
function Checkout() {
  const navigate = useNavigate();
  const { authed, cart, isLoading, isError, error, refetch } = useCartData();

  // Shipping, payment, and compliance acknowledgement state.
  const [form, setForm] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [cardDetails, setCardDetails] = useState<CardPaymentDetails>({
    holderName: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [walletEmail, setWalletEmail] = useState('');
  const [bankTransferReference, setBankTransferReference] = useState('');
  const [hasAuthorizedPayment, setHasAuthorizedPayment] = useState(false);
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Gate step progression until all shipping fields are populated.
  const isShippingComplete = Object.values(form).every((value) => value.trim().length > 0);
  const selectedPaymentOption =
    PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentMethod) ?? PAYMENT_OPTIONS[0];

  // Submits final order with shipping details and a simulated payment-intent reference.
  const createOrderMutation = useCreateOrder({
    onSuccess: (orderId) => {
      showSuccessMessage({
        title: 'Order placed successfully',
        message: (
          <>
            Thank you for choosing <strong>GrindSpot</strong>. Your order is confirmed and our team
            is preparing it for fast dispatch. Payment authorized with:&nbsp;
            <strong>{selectedPaymentOption.label}</strong>.
          </>
        ),
        tone: 'success',
        placement: 'center',
        durationMs: 8000,
      });
      navigate(`/orders/${orderId}`);
    },
    onError: (message) => {
      setErrorMessage(message);
    },
  });

  // Centralizes checkout validation rules for shipping, consent, and payment fields.
  function validatePaymentStep() {
    if (!isShippingComplete) {
      return 'Complete all shipping fields before payment confirmation.';
    }

    if (!hasAuthorizedPayment) {
      return 'Authorize the payment amount to continue.';
    }

    if (!hasAcceptedPolicies) {
      return 'Accept the Terms of Service and Privacy Policy to continue.';
    }

    if (selectedPaymentMethod === 'CARD') {
      if (!cardDetails.holderName.trim()) {
        return 'Cardholder name is required.';
      }
      if (!isValidCardNumber(cardDetails.number)) {
        return 'Enter a valid card number.';
      }
      if (!isValidExpiry(cardDetails.expiry)) {
        return 'Enter a valid card expiry in MM/YY format.';
      }
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        return 'Enter a valid card security code.';
      }
      return '';
    }

    if (selectedPaymentMethod === 'BANK_TRANSFER') {
      if (bankTransferReference.trim().length < 6) {
        return 'Bank transfer reference must be at least 6 characters.';
      }
      return '';
    }

    if (!isValidEmail(walletEmail)) {
      return 'Enter a valid wallet email address.';
    }

    return '';
  }

  // Prevents default submit, validates checkout state, and triggers order creation.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (!authed) {
      setErrorMessage('Sign in or create an account to place your order.');
      return;
    }

    const paymentValidationError = validatePaymentStep();
    if (paymentValidationError) {
      setErrorMessage(paymentValidationError);
      return;
    }

    const fingerprintSource =
      selectedPaymentMethod === 'CARD'
        ? cardDetails.number
        : selectedPaymentMethod === 'BANK_TRANSFER'
          ? bankTransferReference
          : walletEmail;

    const paymentIntentId = buildPaymentIntentId(selectedPaymentMethod, fingerprintSource);
    setCardDetails((current) => ({ ...current, cvv: '' }));
    createOrderMutation.mutate({ shippingAddress: form, paymentIntentId });
  }

  // Updates a shipping field and clears stale validation errors.
  function updateField<item extends keyof ShippingAddress>(
    key: item,
    value: ShippingAddress[item]
  ) {
    setErrorMessage('');
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Updates a card field and clears stale validation errors.
  function updateCardField<i extends keyof CardPaymentDetails>(
    key: i,
    value: CardPaymentDetails[i]
  ) {
    setErrorMessage('');
    setCardDetails((current) => ({ ...current, [key]: value }));
  }

  if (authed && isLoading) {
    return <CheckoutLoading />;
  }

  if (authed && isError) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to prepare checkout</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(error, 'Failed to load cart for checkout')}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <section className="surface-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-primary-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-primary-600">
          Add products before checking out. Your shipping form will appear once items are in cart.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Browse catalog
          </Link>
          <Link
            to="/cart"
            className="rounded-full border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 hover:border-primary-400 hover:text-primary-900"
          >
            Back to cart
          </Link>
        </div>
      </section>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shippingEstimate = subtotal >= 100 ? 0 : 3.5;
  const taxEstimate = subtotal * 0.24;
  const totalEstimate = subtotal + shippingEstimate + taxEstimate;

  // Shared class presets keep form visuals consistent across payment variants.
  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-600 focus:border-accent-700 focus:outline-none';
  const checkboxClass = 'mt-0.5 h-4 w-4 shrink-0 accent-primary-800';
  const activeStepClass =
    'rounded-full border border-accent-700/45 bg-accent-700/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-700';
  const completedStepClass =
    'rounded-full border border-emerald-300/70 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700';
  const pendingStepClass =
    'rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600';
  const cardLastFour = getCardLastFour(cardDetails.number);
  const paymentPreview =
    selectedPaymentMethod === 'CARD'
      ? cardLastFour
        ? `Card ending in ${cardLastFour}`
        : 'Card details pending'
      : selectedPaymentMethod === 'BANK_TRANSFER'
        ? bankTransferReference.trim()
          ? `Reference ${bankTransferReference.trim()}`
          : 'Reference pending'
        : walletEmail.trim()
          ? `Wallet ${walletEmail.trim()}`
          : 'Wallet email pending';
  const paymentInputsLocked = !isShippingComplete || createOrderMutation.isPending;

  // Publishes an event to open the Terms of Service modal from checkout.
  function openTermsOfServiceMessage(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent(FOOTER_MESSAGE_EVENT, {
        detail: 'termsOfService',
      })
    );
  }

  // Publishes an event to open the Privacy Policy modal from checkout.
  function openPrivacyPolicyMessage(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent(FOOTER_MESSAGE_EVENT, {
        detail: 'privacySecurity',
      })
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-card p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
          Secure checkout
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-primary-900">Shipping details</h1>
        <p className="mt-2 text-sm text-primary-600">
          Enter delivery details, choose a payment method, and confirm authorization.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <p className={isShippingComplete ? completedStepClass : activeStepClass}>1. Shipping</p>
          <p className={isShippingComplete ? activeStepClass : pendingStepClass}>2. Confirmation</p>
          <p className={pendingStepClass}>3. Completed</p>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-6 lg:col-span-8">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Delivery address
            </legend>

            <label htmlFor="fullName" className="block text-sm font-semibold text-primary-800">
              Full name
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                className={inputClass}
              />
            </label>

            <label htmlFor="address" className="block text-sm font-semibold text-primary-800">
              Street address
              <input
                id="address"
                name="address"
                autoComplete="address-line1"
                required
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label htmlFor="city" className="block text-sm font-semibold text-primary-800">
                City
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  className={inputClass}
                />
              </label>

              <label htmlFor="state" className="block text-sm font-semibold text-primary-800">
                State
                <input
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  required
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label htmlFor="zipCode" className="block text-sm font-semibold text-primary-800">
                ZIP code
                <input
                  id="zipCode"
                  name="zipCode"
                  autoComplete="postal-code"
                  required
                  value={form.zipCode}
                  onChange={(event) => updateField('zipCode', event.target.value)}
                  className={inputClass}
                />
              </label>

              <label htmlFor="country" className="block text-sm font-semibold text-primary-800">
                Country
                <input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  required
                  value={form.country}
                  onChange={(event) => updateField('country', event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label htmlFor="phone" className="block text-sm font-semibold text-primary-800">
              Phone number
              <input
                id="phone"
                name="phone"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className={inputClass}
              />
            </label>
          </fieldset>
          <fieldset className="mt-6 space-y-4 border-t border-primary-300/55 pt-6">
            <legend className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              2. Confirmation
            </legend>

            <p className="text-sm text-primary-600">
              Select how you want to pay. This flow sends only a tokenized payment intent reference
              to the order API, never raw card security values. All types of payment are full
              encrypted.
            </p>

            {!isShippingComplete && (
              <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
                Complete all shipping fields to unlock payment confirmation.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = option.id === selectedPaymentMethod;

                return (
                  <label
                    key={option.id}
                    className={`block rounded-2xl border p-3 transition ${
                      selected
                        ? 'border-accent-700/60 bg-accent-700/8'
                        : 'border-primary-300/70 bg-primary-100/72'
                    } ${paymentInputsLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={selected}
                        onChange={() => {
                          setErrorMessage('');
                          setSelectedPaymentMethod(option.id);
                          if (option.id !== 'CARD') {
                            setCardDetails((current) => ({ ...current, cvv: '' }));
                          }
                        }}
                        className="mt-1 h-4 w-4 accent-primary-800"
                        disabled={paymentInputsLocked}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-primary-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-primary-600">
                          {option.description}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-500">
                          {option.complianceNote}
                        </span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedPaymentMethod === 'CARD' && (
              <div className="grid gap-4 rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4 sm:grid-cols-2">
                <label
                  htmlFor="cardHolderName"
                  className="block text-sm font-semibold text-primary-800 sm:col-span-2"
                >
                  Cardholder name
                  <input
                    id="cardHolderName"
                    name="cardHolderName"
                    autoComplete="cc-name"
                    value={cardDetails.holderName}
                    onChange={(event) => updateCardField('holderName', event.target.value)}
                    required
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>

                <label
                  htmlFor="cardNumber"
                  className="block text-sm font-semibold text-primary-800 sm:col-span-2"
                >
                  Card number
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    maxLength={23}
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(event) =>
                      updateCardField('number', formatCardNumber(event.target.value))
                    }
                    required
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>

                <label
                  htmlFor="cardExpiry"
                  className="block text-sm font-semibold text-primary-800"
                >
                  Expiry (MM/YY)
                  <input
                    id="cardExpiry"
                    name="cardExpiry"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(event) =>
                      updateCardField('expiry', formatCardExpiry(event.target.value))
                    }
                    required
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>

                <label htmlFor="cardCvv" className="block text-sm font-semibold text-primary-800">
                  Security code
                  <input
                    id="cardCvv"
                    name="cardCvv"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    type="password"
                    maxLength={4}
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(event) =>
                      updateCardField('cvv', digitsOnly(event.target.value).slice(0, 4))
                    }
                    required
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>
              </div>
            )}

            {selectedPaymentMethod !== 'CARD' && selectedPaymentMethod !== 'BANK_TRANSFER' && (
              <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
                <label
                  htmlFor="walletEmail"
                  className="block text-sm font-semibold text-primary-800"
                >
                  Wallet email
                  <input
                    id="walletEmail"
                    name="walletEmail"
                    autoComplete="email"
                    type="email"
                    value={walletEmail}
                    onChange={(event) => {
                      setErrorMessage('');
                      setWalletEmail(event.target.value);
                    }}
                    required
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>
                <p className="mt-2 text-xs text-primary-600">
                  You will be redirected to {selectedPaymentOption.label} for final wallet
                  authentication before capture.
                </p>
              </div>
            )}

            {selectedPaymentMethod === 'BANK_TRANSFER' && (
              <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
                <label
                  htmlFor="bankTransferReference"
                  className="block text-sm font-semibold text-primary-800"
                >
                  Transfer reference
                  <input
                    id="bankTransferReference"
                    name="bankTransferReference"
                    value={bankTransferReference}
                    onChange={(event) => {
                      setErrorMessage('');
                      setBankTransferReference(event.target.value.toUpperCase());
                    }}
                    required
                    minLength={6}
                    maxLength={18}
                    placeholder="Example: GS-2041A"
                    disabled={paymentInputsLocked}
                    className={inputClass}
                  />
                </label>
                <p className="mt-2 text-xs text-primary-600">
                  After order creation, we provide beneficiary account details for this reference.
                  Dispatch starts after funds settle.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Security and compliance confirmation
              </p>
              <div className="mt-2 space-y-2">
                <label className="flex items-start gap-2 text-sm text-primary-800">
                  <input
                    type="checkbox"
                    checked={hasAuthorizedPayment}
                    onChange={(event) => {
                      setErrorMessage('');
                      setHasAuthorizedPayment(event.target.checked);
                    }}
                    disabled={paymentInputsLocked}
                    className={checkboxClass}
                  />
                  <span>
                    I authorize GrindSpot to charge <strong>{formatCurrency(totalEstimate)}</strong>{' '}
                    using <strong>{selectedPaymentOption.label}</strong>.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-primary-800">
                  <input
                    type="checkbox"
                    checked={hasAcceptedPolicies}
                    onChange={(event) => {
                      setErrorMessage('');
                      setHasAcceptedPolicies(event.target.checked);
                    }}
                    disabled={paymentInputsLocked}
                    className={checkboxClass}
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={openTermsOfServiceMessage}
                      className="font-semibold text-accent-700 underline underline-offset-2 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
                    >
                      Terms of Service
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={openPrivacyPolicyMessage}
                      className="font-semibold text-accent-700 underline underline-offset-2 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
                    >
                      Privacy Policy
                    </button>
                    , and applicable payment
                    regulations, including SCA requirements where enforced.
                  </span>
                </label>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
                Method: {selectedPaymentOption.label}
              </p>
              <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
                Estimated charge: {formatCurrency(totalEstimate)}
              </p>
              <p className="rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2 text-sm font-semibold text-primary-900">
                Confirmation: {paymentPreview}
              </p>
            </div>
          </fieldset>
          {errorMessage && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="inline-flex items-center justify-center rounded-xl bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {createOrderMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  />
                  Authorizing payment
                </span>
              ) : (
                'Confirm payment and place order'
              )}
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900"
            >
              Back to cart
            </Link>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:col-span-4">
          <div className="surface-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-primary-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-primary-700">
              <div className="flex items-center justify-between">
                <p>Subtotal</p>
                <p className="font-semibold text-primary-900">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Estimated shipping</p>
                <p className="font-semibold text-primary-900">{formatCurrency(shippingEstimate)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Estimated tax: 24%</p>
                <p className="font-semibold text-primary-900">{formatCurrency(taxEstimate)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-700">Estimated total</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatCurrency(totalEstimate)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                  Accepted payment methods
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-900">
                  Visa • Mastercard • PayPal • Apple Pay • Google Pay
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                  Secure payment
                </p>
                <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                  Encrypted data
                </p>
                <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                  30-day returns
                </p>
              </div>
              <p className="text-xs text-primary-600">
                Shipping policy: dispatch in 24h. Return policy: 30-day no-hassle returns for unused
                items.
              </p>
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Items in this order
            </h2>
            <div className="mt-3 space-y-2">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <p className="line-clamp-1 text-primary-800">
                    {item.quantity} x {item.product.title}
                  </p>
                  <p className="font-semibold text-primary-900">
                    {formatCurrency(Number(item.product.price) * item.quantity)}
                  </p>
                </div>
              ))}
              {items.length > 4 && (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
                  + {items.length - 4} more item(s)
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;

