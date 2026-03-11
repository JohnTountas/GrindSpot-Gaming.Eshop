/**
 * Order detail page showing shipping info, line items, and totals.
 */
import { Link, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '@/shared/api/error';
import { LoadingOrderDetail } from '../components/LoadingOrderDetail';
import { ORDER_STATUS_STYLES } from '../constants';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

// Presents a full order breakdown including shipping, line items, and totals.
function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch full order payload for the selected order id.
  const orderQuery = useOrderDetail(id);

  if (orderQuery.isLoading) {
    return <LoadingOrderDetail />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to load this order</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(orderQuery.error, 'Failed to load order')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => orderQuery.refetch()}
            className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
          <Link
            to="/orders"
            className="rounded-full border border-primary-300/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800 hover:border-accent-700 hover:text-primary-900"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;

  // Derived summary values reused across detail and summary cards.
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
    0,
  );

  return (
    <section className="space-y-5">
      <header className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              to="/orders"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500 hover:text-primary-700"
            >
              Back to orders
            </Link>
            <h1 className="mt-2 text-3xl font-semibold text-primary-900">Order #{order.id.slice(0, 8)}</h1>
            <p className="mt-2 text-sm text-primary-600">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="text-right">
            <p
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${ORDER_STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">
              {formatCurrency(Number(order.total))}
            </p>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <article className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-primary-900">Shipping address</h2>
            <div className="mt-3 space-y-1.5 text-sm text-primary-700">
              <p className="font-semibold text-primary-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </article>

          <article className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-primary-900">Order items</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary-300/70 bg-primary-100/72 p-3"
                >
                  <div className="product-image-frame h-14 w-14 rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100">
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
                    <p className="font-semibold text-primary-900">{item.product.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
                      Qty {item.quantity} x {formatCurrency(Number(item.priceAtPurchase))}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-primary-900">
                    {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
          <div className="surface-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-primary-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-primary-700">
              <div className="flex items-center justify-between">
                <p>Items</p>
                <p className="font-semibold text-primary-900">
                  {itemCount} item{itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p>Items subtotal</p>
                <p className="font-semibold text-primary-900">{formatCurrency(itemSubtotal)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-700">Total paid</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatCurrency(Number(order.total))}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-primary-300/70 bg-primary-100/72 px-4 py-3 text-sm font-semibold text-primary-800 hover:border-accent-700 hover:text-primary-900"
            >
              Shop again
            </Link>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
              Order protection
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Secure payment
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Verified shipping
              </p>
              <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
                Easy returns
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default OrderDetail;


