/**
 * Premium admin dashboard for order control and product spec/review management.
 */
import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { getApiErrorMessage } from '@/lib/api/error';
import { OrdersPanel } from '../components/OrdersPanel';
import { ProductSelector } from '../components/ProductSelector';
import { ReviewsEditor } from '../components/ReviewsEditor';
import { SpecificationsEditor } from '../components/SpecificationsEditor';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useAdminProductContent } from '../hooks/useAdminProductContent';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus';
import type { AdminOrder } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

const EMPTY_ORDERS: AdminOrder[] = [];
const EMPTY_ADMIN_PRODUCTS: Product[] = [];

// Coordinates order operations and product-content management for administrators.
function AdminDashboard() {
  // Product targeting + operator feedback.
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Dashboard data queries.
  const ordersQuery = useAdminOrders();
  const productsQuery = useAdminProducts(productSearch);
  const productContentQuery = useAdminProductContent(selectedProductId);

  const updateOrderStatusMutation = useUpdateOrderStatus({
    onSuccess: () => setStatusMessage('Order status updated successfully.'),
    onError: (error) =>
      setStatusMessage(getApiErrorMessage(error, 'Failed to update order status')),
  });

  const orders = ordersQuery.data ?? EMPTY_ORDERS;
  const products = productsQuery.data?.products ?? EMPTY_ADMIN_PRODUCTS;
  const selectedProduct = productContentQuery.data;

  // Headline KPI cards.
  const pending = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders]
  );
  const paid = useMemo(() => orders.filter((order) => order.status === 'PAID').length, [orders]);
  const shipped = useMemo(
    () => orders.filter((order) => order.status === 'SHIPPED').length,
    [orders]
  );
  const revenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total), 0),
    [orders]
  );

  if (ordersQuery.isLoading || productsQuery.isLoading) {
    return <p className="text-sm text-primary-600">Loading admin data...</p>;
  }

  if (ordersQuery.isError || productsQuery.isError) {
    return (
      <div className="surface-card border border-red-300/70 bg-red-900/20 p-4 text-red-100">
        {getApiErrorMessage(
          ordersQuery.error || productsQuery.error,
          'Failed to load admin dashboard'
        )}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="surface-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Admin control center
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-primary-900">Storefront Operations</h1>
        <p className="mt-2 text-sm text-primary-600">
          Manage order statuses and maintain real product specifications/reviews from one
          dashboard.
        </p>
      </header>

      {statusMessage && (
        <p className="surface-card border border-accent-700/45 bg-accent-700/10 p-3 text-sm font-semibold text-primary-900">
          {statusMessage}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Pending
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{pending}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">Paid</p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{paid}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Shipped
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{shipped}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-900">{formatCurrency(revenue)}</p>
        </article>
      </section>

      <OrdersPanel
        orders={orders}
        onUpdateStatus={(orderId, status) =>
          updateOrderStatusMutation.mutate({ orderId, status })
        }
      />

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ProductSelector
          productSearch={productSearch}
          onSearchChange={setProductSearch}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
          products={products}
          totalProducts={productsQuery.data?.pagination.total ?? 0}
        />

        <div className="space-y-5">
          {!selectedProductId && (
            <div className="surface-card p-5 text-sm text-primary-600">
              Select a product to edit technical specifications and reviews.
            </div>
          )}

          {selectedProductId && productContentQuery.isLoading && (
            <div className="surface-card p-5 text-sm text-primary-600">
              Loading product content...
            </div>
          )}

          {selectedProductId && productContentQuery.isError && (
            <div className="surface-card border border-red-300/70 bg-red-900/20 p-5 text-red-100">
              {getApiErrorMessage(productContentQuery.error, 'Failed to load product content')}
            </div>
          )}

          {selectedProduct && (
            <>
              <section className="surface-card p-5">
                <h3 className="text-xl font-semibold text-primary-900">
                  {selectedProduct.title}
                </h3>
                <p className="mt-1 text-sm text-primary-600">
                  {selectedProduct.category?.name} |{' '}
                  {formatCurrency(Number(selectedProduct.price))}
                </p>
              </section>

              <SpecificationsEditor
                productId={selectedProductId}
                specifications={selectedProduct.specifications}
                onStatusMessage={setStatusMessage}
              />

              <ReviewsEditor
                productId={selectedProductId}
                reviews={selectedProduct.reviews}
                onStatusMessage={setStatusMessage}
              />
            </>
          )}
        </div>
      </section>
    </section>
  );
}

export default AdminDashboard;
