/**
 * Order history page listing customer purchases and statuses.
 */
import { CSSProperties, useMemo } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/error";
import { LoadingOrders } from "../components/LoadingOrders";
import { ORDER_STATUS_STYLES } from "../constants";
import { useOrders } from "../hooks/useOrders";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

// Shows order history, computed KPIs, and quick actions for each order.
function Orders() {
  // Pull authenticated user's order history.
  const ordersQuery = useOrders();

  // Derive dashboard stats once per query result.
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const revenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total), 0),
    [orders]
  );
  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders]
  );
  const paidCount = useMemo(
    () => orders.filter((order) => order.status === "PAID").length,
    [orders]
  );
  const shippedCount = useMemo(
    () => orders.filter((order) => order.status === "SHIPPED").length,
    [orders]
  );

  if (ordersQuery.isLoading) {
    return <LoadingOrders />;
  }

  if (ordersQuery.isError) {
    return (
      <div role="alert" className="surface-card border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Unable to load your orders</p>
        <p className="mt-1 text-sm">
          {getApiErrorMessage(ordersQuery.error, "Failed to load orders")}
        </p>
        <button
          type="button"
          onClick={() => ordersQuery.refetch()}
          className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
              Order history
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-primary-900">Your orders</h1>
            <p className="mt-2 text-sm text-primary-600">
              Track status updates and revisit past purchases from one place.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-primary-300/70 bg-primary-100/72 px-4 py-2 text-sm font-semibold text-primary-800 hover:-translate-y-0.5 hover:border-accent-700 hover:text-primary-900"
          >
            Continue shopping
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Total orders
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Pending
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Paid
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">{paidCount}</p>
          </div>
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Shipped
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">{shippedCount}</p>
          </div>
          <div className="rounded-2xl border border-primary-300/70 bg-primary-100/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
              Revenue
            </p>
            <p className="mt-2 text-2xl font-bold text-primary-900">{formatCurrency(revenue)}</p>
          </div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <h2 className="text-xl font-semibold text-primary-900">No orders yet</h2>
          <p className="mt-2 text-sm text-primary-600">
            Start your first order from the catalog to see status tracking and order details here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const motionStyle: CSSProperties = {
              animationDelay: `${Math.min(index * 45, 320)}ms`,
            };

            return (
              <article
                key={order.id}
                style={motionStyle}
                className="surface-card interactive-lift animate-slide-up p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-primary-700">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm text-primary-600">
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
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

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900"
                  >
                    View details
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex rounded-xl border border-primary-300/70 bg-primary-100/72 px-4 py-2.5 text-sm font-semibold text-primary-800 hover:border-accent-700 hover:text-primary-900"
                  >
                    Shop again
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {orders.length > 0 && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
          {shippedCount} shipped order{shippedCount === 1 ? "" : "s"} completed
        </p>
      )}
    </section>
  );
}

export default Orders;


