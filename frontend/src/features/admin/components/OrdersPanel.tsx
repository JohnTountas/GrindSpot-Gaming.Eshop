/**
 * Orders summary panel for admin operations.
 */
import { ORDER_STATUSES, ORDER_STATUS_STYLES } from '../constants';
import { formatCurrency } from '../utils/formatCurrency';
import type { AdminOrder, OrderStatus } from '../types';

// Props required to render the admin orders panel.
interface OrdersPanelProps {
  orders: AdminOrder[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

// Renders a summary list of recent orders with status updates.
export function OrdersPanel({ orders, onUpdateStatus }: OrdersPanelProps) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-xl font-semibold text-primary-900">Recent Orders</h2>
      <div className="mt-4 space-y-2">
        {orders.slice(0, 10).map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-primary-300/70 bg-primary-100/70 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary-900">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-primary-600">
                  {order.user?.email ?? 'Customer'} | {formatCurrency(Number(order.total))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    ORDER_STATUS_STYLES[order.status as OrderStatus]
                  }`}
                >
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(event) =>
                    onUpdateStatus(order.id, event.target.value as OrderStatus)
                  }
                  className="rounded-lg border border-primary-300/70 bg-primary-100/75 px-2 py-1 text-xs font-semibold text-primary-900"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
