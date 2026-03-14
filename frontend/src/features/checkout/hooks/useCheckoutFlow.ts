/**
 * Checkout workflow hook.
 *
 * It keeps form state, payment validation, cache updates, and post-purchase
 * navigation in one place so the page component can stay mostly declarative.
 */
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartKey } from '@/features/cart/queryKeys';
import { orderDetailKey, ordersKey } from '@/features/orders/queryKeys';
import { persistGuestOrder } from '@/features/orders/utils/guestOrderStorage';
import { clearGuestCart } from '@/shared/cart/guestCart';
import { storefrontStateKey, wishlistProductsKey } from '@/shared/storefront/queryKeys';
import type { StorefrontState } from '@/shared/storefront/types';
import type { Cart, CartItem, Order, Product, ShippingAddress } from '@/shared/types';
import { showSuccessMessage } from '@/shared/ui/toast';
import { FOOTER_MESSAGE_EVENT, PAYMENT_OPTIONS } from '../constants';
import type { CardPaymentDetails, PaymentMethod } from '../types';
import { buildPaymentIntentId } from '../utils/buildPaymentIntentId';
import { digitsOnly, formatCardExpiry, formatCardNumber } from '../utils/formatters';
import {
  buildPaymentPreview,
  calculateCheckoutTotals,
  getPaymentFingerprintSource,
  isShippingAddressComplete,
} from '../utils/checkoutCalculations';
import { isValidCardNumber, isValidEmail, isValidExpiry } from '../utils/validators';
import { useCreateOrder } from './useCreateOrder';

const INITIAL_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
};

const INITIAL_CARD_DETAILS: CardPaymentDetails = {
  holderName: '',
  number: '',
  expiry: '',
  cvv: '',
};

const INPUT_BASE_CLASS =
  'mt-1.5 block w-full rounded-xl border px-3 py-2.5 text-sm text-primary-900 focus:outline-none';
const INPUT_DEFAULT_CLASS =
  'border-primary-300/70 bg-primary-100/72 placeholder:text-primary-600 focus:border-accent-700';
const INPUT_MISSING_CLASS =
  'border-red-300 bg-red-50 placeholder:text-red-500 focus:border-red-500';

interface UseCheckoutFlowOptions {
  authed: boolean;
  items: CartItem[];
}

type CheckoutFooterMessage = 'termsOfService' | 'privacySecurity';

export function useCheckoutFlow({ authed, items }: UseCheckoutFlowOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ShippingAddress>(INITIAL_SHIPPING_ADDRESS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [cardDetails, setCardDetails] = useState<CardPaymentDetails>(INITIAL_CARD_DETAILS);
  const [walletEmail, setWalletEmail] = useState('');
  const [bankTransferReference, setBankTransferReference] = useState('');
  const [hasAuthorizedPayment, setHasAuthorizedPayment] = useState(false);
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMissingFieldHints, setShowMissingFieldHints] = useState(false);

  const selectedPaymentOption =
    PAYMENT_OPTIONS.find((option) => option.id === selectedPaymentMethod) ?? PAYMENT_OPTIONS[0];

  const createOrderMutation = useCreateOrder({
    onSuccess: async (order) => {
      if (authed) {
        const purchasedProductIds = new Set(order.items.map((item) => item.productId));

        // Update the obvious client-side caches immediately so the checkout flow
        // feels completed before the background refetches finish.
        queryClient.setQueryData<Cart | undefined>(cartKey, (currentCart) => {
          if (!currentCart) {
            return currentCart;
          }

          return {
            ...currentCart,
            items: [],
            total: 0,
            updatedAt: new Date().toISOString(),
          };
        });

        queryClient.setQueryData<StorefrontState | undefined>(storefrontStateKey, (currentState) => {
          if (!currentState) {
            return currentState;
          }

          return {
            ...currentState,
            wishlistProductIds: currentState.wishlistProductIds.filter(
              (productId) => !purchasedProductIds.has(productId)
            ),
          };
        });

        queryClient.setQueryData<Product[] | undefined>(wishlistProductsKey, (currentProducts) => {
          if (!currentProducts) {
            return currentProducts;
          }

          return currentProducts.filter((product) => !purchasedProductIds.has(product.id));
        });

        queryClient.setQueryData<Order[] | undefined>(ordersKey, (currentOrders) => {
          if (!currentOrders) {
            return [order];
          }

          return [order, ...currentOrders.filter((currentOrder) => currentOrder.id !== order.id)];
        });

        queryClient.setQueryData(orderDetailKey(order.id), order);

        await queryClient.invalidateQueries({ queryKey: cartKey });
        await queryClient.invalidateQueries({ queryKey: storefrontStateKey });
        await queryClient.invalidateQueries({ queryKey: wishlistProductsKey });
        await queryClient.invalidateQueries({ queryKey: ordersKey });
      }

      // The toast gives both guest and signed-in flows the same success language,
      // even though they branch to different destinations afterward.
      showSuccessMessage({
        title: 'Order placed successfully',
        message: `Thank you for choosing GrindSpot. Your order is confirmed and our team is preparing it for fast dispatch. Payment authorized with ${selectedPaymentOption.label}.`,
        tone: 'success',
        placement: 'center',
        durationMs: 8000,
      });

      if (!authed) {
        persistGuestOrder(order);
        clearGuestCart();
        navigate(`/checkout/success/${order.id}`);
        return;
      }

      navigate('/orders', {
        state: {
          highlightOrderId: order.id,
        },
      });
    },
    onError: (message) => {
      setErrorMessage(message);
    },
  });

  const totals = calculateCheckoutTotals(items);
  const isShippingComplete = isShippingAddressComplete(form);
  const paymentInputsLocked = !isShippingComplete || createOrderMutation.isPending;
  const paymentPreview = buildPaymentPreview({
    selectedPaymentMethod,
    cardDetails,
    walletEmail,
    bankTransferReference,
  });

  function clearValidationMessage() {
    setErrorMessage('');
  }

  function validatePaymentStep() {
    // We validate in the same order the UI asks for input, so the first error
    // the customer sees is the next actionable thing to fix.
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearValidationMessage();
    setShowMissingFieldHints(true);

    const paymentValidationError = validatePaymentStep();
    if (paymentValidationError) {
      setErrorMessage(paymentValidationError);
      return;
    }

    // We generate a deterministic fake payment intent for this demo flow so
    // order creation still has a payment-shaped identifier attached to it.
    const paymentIntentId = buildPaymentIntentId(
      selectedPaymentMethod,
      getPaymentFingerprintSource({
        selectedPaymentMethod,
        cardDetails,
        walletEmail,
        bankTransferReference,
      })
    );

    // Drop CVV from local React state as soon as the form is submitted. Even in
    // a demo app, we should not keep sensitive fields around longer than needed.
    setCardDetails((current) => ({ ...current, cvv: '' }));
    createOrderMutation.mutate({
      shippingAddress: form,
      paymentIntentId,
      guestItems: authed
        ? undefined
        : items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
    });
  }

  function updateShippingField(key: keyof ShippingAddress, value: string) {
    clearValidationMessage();
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCardField(key: keyof CardPaymentDetails, value: string) {
    clearValidationMessage();
    setCardDetails((current) => ({ ...current, [key]: value }));
  }

  function updateSelectedPaymentMethod(nextMethod: PaymentMethod) {
    clearValidationMessage();
    setSelectedPaymentMethod(nextMethod);

    if (nextMethod !== 'CARD') {
      setCardDetails((current) => ({ ...current, cvv: '' }));
    }
  }

  function updateWalletEmail(value: string) {
    clearValidationMessage();
    setWalletEmail(value);
  }

  function updateBankTransferReference(value: string) {
    clearValidationMessage();
    setBankTransferReference(value.toUpperCase());
  }

  function updateAuthorizedPayment(checked: boolean) {
    clearValidationMessage();
    setHasAuthorizedPayment(checked);
  }

  function updateAcceptedPolicies(checked: boolean) {
    clearValidationMessage();
    setHasAcceptedPolicies(checked);
  }

  function isMissingValue(value: string) {
    return showMissingFieldHints && value.trim().length === 0;
  }

  function getInputClass(value: string, highlightMissing = false) {
    return `${INPUT_BASE_CLASS} ${
      highlightMissing && isMissingValue(value) ? INPUT_MISSING_CLASS : INPUT_DEFAULT_CLASS
    }`;
  }

  function openFooterMessage(
    event: MouseEvent<HTMLButtonElement>,
    message: CheckoutFooterMessage
  ) {
    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(
      new CustomEvent(FOOTER_MESSAGE_EVENT, {
        detail: message,
      })
    );
  }

  return {
    form,
    cardDetails,
    walletEmail,
    bankTransferReference,
    hasAuthorizedPayment,
    hasAcceptedPolicies,
    errorMessage,
    selectedPaymentMethod,
    selectedPaymentOption,
    paymentInputsLocked,
    paymentPreview,
    isShippingComplete,
    isSubmitting: createOrderMutation.isPending,
    totals,
    handleSubmit,
    updateShippingField,
    updateSelectedPaymentMethod,
    updateWalletEmail,
    updateBankTransferReference,
    updateAuthorizedPayment,
    updateAcceptedPolicies,
    updateCardHolderName: (value: string) => updateCardField('holderName', value),
    updateCardNumber: (value: string) => updateCardField('number', formatCardNumber(value)),
    updateCardExpiry: (value: string) => updateCardField('expiry', formatCardExpiry(value)),
    updateCardCvv: (value: string) => updateCardField('cvv', digitsOnly(value).slice(0, 4)),
    isMissingValue,
    getInputClass,
    openTermsOfServiceMessage: (event: MouseEvent<HTMLButtonElement>) =>
      openFooterMessage(event, 'termsOfService'),
    openPrivacyPolicyMessage: (event: MouseEvent<HTMLButtonElement>) =>
      openFooterMessage(event, 'privacySecurity'),
  };
}
