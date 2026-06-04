import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/index';

// Redirect to login if not authenticated
export function RequireAuth() {
  const { user, token } = useAuthStore();
  if (!user || !token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Redirect if already authenticated (for /login)
export function GuestOnly() {
  const { user, token } = useAuthStore();
  if (user && token) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/cashier'} replace />;
  }
  return <Outlet />;
}

// Restrict by role — customer diarahkan ke landing page
export function RequireRole({ role }: { role: UserRole }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/cashier'} replace />;
  }
  return <Outlet />;
}
