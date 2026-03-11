/**
 * Shopping cart page for quantity edits, item removal, and totals.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '@/shared/types';
import { getApiErrorMessage } from '@/shared/api/error';
import { LoadingCart } from '../components/LoadingCart';
import { useCartData } from '../hooks/useCartData';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';
import { formatCurrency } from '@/shared/utils/formatCurrency';

// Coordinates cart data fetching, quantity mutations, removal actions, and order summary totals.
function Cart() {
  const { authed, cart, isLoading, isError, error, refetch } = useCartData();

  // UI feedback for asynchronous cart actions.
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [pendingUpdateItemId, setPendingUpdateItemId] = useState<string | null>(null);
  const [pendingRemoveItemId, setPendingRemoveItemId] = useState<string | null>(null);

  const updateItemMutation = useUpdateCartItem({
    authed,
    onMutate: (itemId) => {
      setStatusMessage('');
      setPendingUpdateItemId(itemId);
    },
    onSuccess: () => {
      setStatusTone('success');
      setStatusMessage('Cart updated');
    },
    onError: (message) => {
      setStatusTone('error');
      setStatusMessage(message);
    },
    onSettled: () => {
      setPendingUpdateItemId(null);
    },
  });

  const removeItemMutation = useRemoveCartItem({
    authed,
    onMutate: (itemId) => {
      setStatusMessage('');
      setPendingRemoveItemId(itemId);
    },
    onSuccess: () => {
      setStatusTone('success');
      setStatusMessage('Item removed from cart');
    },
    onError: (message) => {
      setStatusTone('error');
      setStatusMessage(message);
    },
    onSettled: () => {
      setPendingRemoveItemId(null);
    },
  });

  // Calculates the extended line total for a single cart item.
  function itemTotal(item: CartItem) {
    return Number(item.product.price) * item.quantity;
  }

  if (authed && isLoading) {
    return <LoadingCart />;
  }

  if (authed && isError) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to load your cart</p>
        <p className="mt-1 text-sm">{getApiErrorMessage(error, 'Failed to load cart')}</p>
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

  // Derived totals used by summary cards and checkout CTA context.
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + itemTotal(item), 0);
  const shippingEstimate = subtotal >= 100 || items.length === 0 ? 0 : 3.5;
  const taxEstimate = subtotal * 0.24;
  const orderTotal = subtotal + shippingEstimate + taxEstimate;

  return (
    <section className="space-y-5">
      <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
            Shopping cart
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-primary-900">Review your items</h1>
        </div>
        <p className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
          {itemCount} items
        </p>
      </header>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`surface-card border px-4 py-3 text-sm font-semibold ${
            statusTone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {statusMessage}
        </p>
      )}

      {!authed && (
        <p className="surface-card border border-accent-700/45 bg-accent-700/8 px-4 py-3 text-sm font-semibold text-primary-900">
          Guest cart mode is active. You can check out now or sign in to save items to your account.
        </p>
      )}

      {items.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-xl font-semibold text-primary-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-primary-600">
            Add products to your cart and return here to finalize checkout.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const isUpdating = pendingUpdateItemId === item.id;
              const isRemoving = pendingRemoveItemId === item.id;
              const isBusy = isUpdating || isRemoving;
              const canDecrease = item.quantity > 1 && !isBusy;
              const canIncrease = !isBusy;

              return (
                <article
                  key={item.id}
                  className="surface-card interactive-lift flex flex-wrap items-center gap-4 p-4 sm:p-5"
                >
                  <div className="product-image-frame h-16 w-16 rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        loading="lazy"
                        decoding="async"
                        className="product-image-zoom h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-600">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-[180px] flex-1">
                    <h2 className="font-semibold text-primary-900">{item.product.title}</h2>
                    <p className="mt-1 text-sm text-primary-600">
                      {formatCurrency(Number(item.product.price))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canDecrease}
                      aria-label={`Decrease quantity for ${item.product.title}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-primary-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canIncrease}
                      aria-label={`Increase quantity for ${item.product.title}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isBusy}
                    >
                      {isRemoving ? 'Removing' : 'Remove'}
                    </button>
                  </div>

                  <p className="ml-auto text-sm font-semibold text-primary-900">
                    {isUpdating ? 'Updating...' : formatCurrency(itemTotal(item))}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="surface-card h-fit p-5 sm:p-6 lg:sticky lg:top-28 lg:col-span-4">
            <h2 className="text-xl font-semibold text-primary-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-primary-700">
              <div className="flex items-center justify-between">
                <p>Subtotal:</p>
                <p className="font-semibold text-primary-900">{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Estimated shipping:</p>
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
                <p className="text-2xl font-bold text-primary-900">{formatCurrency(orderTotal)}</p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-900"
            >
              Continue to checkout
            </Link>
            <Link
              to="/"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm font-semibold text-primary-800 hover:border-primary-500 hover:text-primary-900"
            >
              Continue shopping
            </Link>

            <div className="mt-4 rounded-2xl border border-primary-300/70 bg-primary-100/72 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
                Accepted payment methods
              </p>
              <p className="mt-1 text-sm font-semibold text-primary-900">
                Visa • Mastercard • PayPal • Apple Pay • Google Pay
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Secure payment
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Fast delivery
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                30-day returns
              </p>
            </div>

            <p className="mt-2 text-xs text-primary-600">
              Shipping policy: same-day dispatch for paid orders before 14:00. Return policy: easy
              returns within 30 days.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;


