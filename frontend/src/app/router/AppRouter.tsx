/**
 * Frontend route map.
 *
 * Keep this file boring: it should answer "what pages exist?" at a glance and
 * leave page-specific behavior inside the features themselves.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import Cart from '@/features/cart/pages/Cart';
import Checkout from '@/features/checkout/pages/Checkout';
import GuestOrderConfirmation from '@/features/orders/pages/GuestOrderConfirmation';
import Orders from '@/features/orders/pages/Orders';
import OrderDetail from '@/features/orders/pages/OrderDetail';
import Home from '@/features/products/pages/Home';
import ProductDetail from '@/features/products/pages/ProductDetail';
import Wishlist from '@/features/wishlist/pages/Wishlist';
import Layout from '@/shared/components/layout/Layout';
import ProtectedRoute from '@/shared/components/routing/ProtectedRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public storefront routes. */}
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success/:id" element={<GuestOrderConfirmation />} />

          {/* Signed-in customer routes. */}
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          {/* Admin-only tooling stays under its own branch. */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Unknown client routes collapse back to the storefront entry point. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
