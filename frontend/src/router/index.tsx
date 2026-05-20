import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RequireAuth, RequireRole } from './guards';
import { useAuthStore } from '../store/authStore';
import PageLoader from '../components/ui/PageLoader';
import { ActiveSessionList } from '../pages/CashierPages/ActiveSessionList';

const LandingPage = lazy(() => import('../pages/PublicPages/LandingPage'));
const CustomerLandingPage = lazy(() => import('../pages/CustomerLandingPage'));
const SignInPage = lazy(() => import('../pages/AuthPages/SignIn'));
const SignUpPage = lazy(() => import('../pages/AuthPages/SignUp'));
const OwnerLayout = lazy(() => import('../layouts/owner/OwnerLayout'));
const OwnerDashboard = lazy(() => import('../pages/OwnerPages/Dashboard'));
const OwnerDevices = lazy(() => import('../pages/OwnerPages/Devices'));
const OwnerDeviceRates = lazy(() => import('../pages/OwnerPages/DeviceRates'));
const OwnerCashiers = lazy(() => import('../pages/OwnerPages/Cashiers'));
const OwnerBookings = lazy(() => import('../pages/OwnerPages/Bookings'));
const OwnerFnb = lazy(() => import('../pages/OwnerPages/Fnb'));
const OwnerReports = lazy(() => import('../pages/OwnerPages/Reports'));
const CashierLayout = lazy(() => import('../layouts/cashier/CashierLayout'));
const CashierDashboard = lazy(() => import('../pages/CashierPages/Dashboard'));
const CashierBookings = lazy(() => import('../pages/CashierPages/Bookings'));
const CashierSessions = lazy(() => import('../pages/CashierPages/SessionPanel'));
const CashierCheckout = lazy(() => import('../pages/CashierPages/Checkout'));
const CashierFnb = lazy(() => import('../pages/CashierPages/FnbManager'));
const CashierTransactions = lazy(() => import('../pages/CashierPages/TransactionList'));
const CashierDevices = lazy(() => import('../pages/CashierPages/DeviceGrid'));
const NotFound = lazy(() => import('../pages/NotFound'));

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function RootPage() {
  const { user, token } = useAuthStore();
  if (user && token) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/cashier'} replace />;
  }
  return <S><LandingPage /></S>;
}

function LoginRoute() {
  const { user, token } = useAuthStore();
  if (user && token) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/cashier'} replace />;
  }
  return <S><SignInPage /></S>;
}

function RegisterRoute() {
  const { user, token } = useAuthStore();
  if (user && token) {
    return <Navigate to={user.role === 'owner' ? '/owner' : '/cashier'} replace />;
  }
  return <S><SignUpPage /></S>;
}

const router = createBrowserRouter([
  { path: '/', element: <RootPage /> },
  { path: '/booking', element: <S><CustomerLandingPage /></S> },
  { path: '/login', element: <LoginRoute /> },
  { path: '/register', element: <RegisterRoute /> },
  // { path: '/forgot-password', element: <ForgotPasswordPage /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole role="owner" />,
        children: [
          {
            path: '/owner',
            element: <S><OwnerLayout /></S>,
            children: [
              { index: true, element: <S><OwnerDashboard /></S> },
              { path: 'devices', element: <S><OwnerDevices /></S> },
              { path: 'devices/rates', element: <S><OwnerDeviceRates /></S> },
              { path: 'cashiers', element: <S><OwnerCashiers /></S> },
              { path: 'bookings', element: <S><OwnerBookings /></S> },
              { path: 'fnb', element: <S><OwnerFnb /></S> },
              { path: 'reports', element: <S><OwnerReports /></S> },
              { path: 'settings', element: <S><div className="p-6">Settings Page (Coming Soon)</div></S> },
            ],
          },
        ],
      },
      {
        element: <RequireRole role="cashier" />,
        children: [
          {
            path: '/cashier',
            element: <S><CashierLayout /></S>,
            children: [
              { index: true, element: <S><CashierDashboard /></S> },
              { path: 'bookings', element: <S><CashierBookings /></S> },
              { path: 'sessions', element: <S><ActiveSessionList /></S> },
              { path: 'sessions/:id', element: <S><CashierSessions /></S> },
              { path: 'sessions/:id/checkout', element: <S><CashierCheckout /></S> },
              { path: 'transactions', element: <S><CashierTransactions /></S> },
              { path: 'fnb', element: <S><CashierFnb /></S> },
              { path: 'devices', element: <S><CashierDevices /></S> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <S><NotFound /></S> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
