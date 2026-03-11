/**
 * Top-level frontend route tree.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import Cart from '@/features/cart/pages/Cart';
import Checkout from '@/features/checkout/pages/Checkout';
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
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<Checkout />} />
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
          <Route
            path="admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
