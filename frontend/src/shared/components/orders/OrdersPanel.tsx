/**
 * Shared orders summary panel used by both customer and admin screens.
 */
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import type { Order, OrderStatus } from '@/shared/types';

type OrdersPanelOrder = Order & {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

// Props required to render the admin orders panel.
interface OrdersPanelProps {
  orders: OrdersPanelOrder[];
  orderStatusStyles: Record<OrderStatus, string>;
  availableStatuses?: OrderStatus[];
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  title?: string;
  description?: string;
  highlightOrderId?: string;
  emptyMessage?: string;
}

// Renders a summary list of recent orders with status updates.
export function OrdersPanel({
  orders,
  orderStatusStyles,
  availableStatuses = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
  onUpdateStatus,
  title = 'Recent Orders',
  description,
  highlightOrderId,
  emptyMessage = 'No orders to display yet.',
}: OrdersPanelProps) {
  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-primary-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-primary-600">{description}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-4 text-sm text-primary-600">
            {emptyMessage}
          </div>
        ) : (
          orders.slice(0, 10).map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const isHighlighted = order.id === highlightOrderId;

            return (
              <article
                key={order.id}
                className={`rounded-2xl border p-3 transition-colors ${
                  isHighlighted
                    ? 'border-accent-700/55 bg-accent-700/10'
                    : 'border-primary-300/70 bg-primary-100/70'
                }`}
              >
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">#{order.id.slice(0, 8)}</p>
                    <p className="break-words text-xs text-primary-600">
                      {order.user?.email ?? formatDate(order.createdAt)} |{' '}
                      {formatCurrency(Number(order.total))}
                    </p>
                    {!order.user && (
                      <p className="mt-1 text-xs text-primary-500">
                        {itemCount} item{itemCount === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          orderStatusStyles[order.status]
                        }`}
                      >
                        {order.status}
                    </span>
                    {onUpdateStatus ? (
                      <select
                        value={order.status}
                        onChange={(event) =>
                          onUpdateStatus(order.id, event.target.value as OrderStatus)
                        }
                        className="w-full rounded-lg border border-primary-300/70 bg-primary-100/75 px-2 py-2 text-xs font-semibold text-primary-900 md:w-auto"
                      >
                        {availableStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Link
                        to={`/orders/${order.id}`}
                        className="w-full rounded-lg border border-primary-300/70 bg-primary-100/75 px-3 py-2 text-center text-xs font-semibold text-primary-900 hover:border-accent-700 md:w-auto"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

