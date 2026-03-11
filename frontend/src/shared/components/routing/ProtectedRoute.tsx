/**
 * Route guard component for auth-required and admin-only pages.
 */
import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser, isAuthenticated } from '@/shared/auth/session';

// Props supported by the ProtectedRoute guard.
interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

// Guards route access and redirects unauthorized users to safe entry points.
function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const authed = isAuthenticated();
  const user = getStoredUser();

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

