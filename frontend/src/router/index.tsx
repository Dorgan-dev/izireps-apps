import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RequireAuth, RequireRole } from './guards';
import { useAuthStore } from '../store/authStore';
import PageLoader from '../components/ui/PageLoader';

const PublicLayout = lazy(() => import('../layouts/public/PublicLayout'));
const PublicLanding = lazy(() => import('../pages/PublicPages/LandingPage'));
const PublicLogin = lazy(() => import('../pages/AuthPages/Login'));
const PublicRegister = lazy(() => import('../pages/AuthPages/Register'));
const PublicAbout = lazy(() => import('../pages/PublicPages/About'));
const PublicContact = lazy(() => import('../pages/PublicPages/Contact'));
const PublicDeviceList = lazy(() => import('../pages/PublicPages/DeviceList'));
const PublicDeviceDetail = lazy(() => import('../pages/PublicPages/DeviceDetail'));
const UserProfile = lazy(() => import('../pages/PublicPages/UserProfiles'));
const DeviceSchedule = lazy(() => import('../pages/PublicPages/DeviceSchedule'));

const OwnerLayout = lazy(() => import('../layouts/owner/OwnerLayout'));
const OwnerDashboard = lazy(() => import('../pages/OwnerPages/Dashboard'));
const OwnerDevices = lazy(() => import('../pages/OwnerPages/Devices'));
const OwnerDeviceRates = lazy(() => import('../pages/OwnerPages/DeviceRates'));
const OwnerCashiers = lazy(() => import('../pages/OwnerPages/Cashiers'));
const OwnerBookings = lazy(() => import('../pages/OwnerPages/Bookings'));
const OwnerFnb = lazy(() => import('../pages/OwnerPages/Fnb'));
const OwnerReports = lazy(() => import('../pages/OwnerPages/Reports'));
const OwnerRevenue = lazy(() => import('../pages/OwnerPages/Revenue'));

const CashierLayout = lazy(() => import('../layouts/cashier/CashierLayout'));
const CashierDashboard = lazy(() => import('../pages/CashierPages/Dashboard'));
const CashierBookings = lazy(() => import('../pages/CashierPages/Bookings'));
const CashierSessions = lazy(() => import('../pages/CashierPages/Sessions'));
const CashierCheckout = lazy(() => import('../pages/CashierPages/SessionDetail'));
const CashierFnb = lazy(() => import('../pages/CashierPages/Fnb'));
const CashierTransactions = lazy(() => import('../pages/CashierPages/Transactions'));
const CashierDevices = lazy(() => import('../pages/CashierPages/Devices'));

const NotFound = lazy(() => import('../pages/NotFound'));

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Helper: tentukan halaman tujuan sesuai role */
function dashboardPath(role?: string): string {
  if (role === 'owner') return '/owner';
  if (role === 'cashier') return '/cashier';
  return '/';
}

function LoginRoute() {
  const { user, token } = useAuthStore();
  // Redirect jika sudah login
  if (user && token) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }
  return <S><PublicLogin /></S>;
}

function RegisterRoute() {
  // Tidak redirect user yang sudah login — customer perlu akses
  // halaman ini bahkan jika sudah punya token (untuk banner already_registered)
  return <S><PublicRegister /></S>;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  { path: '/register', element: <RegisterRoute /> },
  // { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    children: [
      {
        path: '/',
        element: <S><PublicLayout /></S>,
        children: [
          { index: true, element: <S><PublicLanding /></S> },
          { path: 'about', element: <S><PublicAbout /></S> },
          { path: 'contact', element: <S><PublicContact /></S> },
          { path: 'devices', element: <S><PublicDeviceList /></S> },
          { path: 'device/detail/:id', element: <S><PublicDeviceDetail /></S> },
          { path: 'profile', element: <S><UserProfile /></S> },
          { path: 'schedule', element: <S><DeviceSchedule /></S> },
          // { path: '/booking', element: <S><CustomerLandingPage /></S> },
        ],
      }
    ]
  },
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
              { path: 'revenue', element: <S><OwnerRevenue /></S> },
              { path: 'settings', element: <S><div className="p-6">Settings Page (Coming Soon)</div></S> },
              { path: 'profile', element: <S><UserProfile /></S> },
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
              { path: 'sessions', element: <S><CashierSessions /></S> },
              { path: 'sessions/:id', element: <S><CashierSessions /></S> },
              { path: 'sessions/:id/checkout', element: <S><CashierCheckout /></S> },
              { path: 'transactions', element: <S><CashierTransactions /></S> },
              { path: 'fnb', element: <S><CashierFnb /></S> },
              { path: 'devices', element: <S><CashierDevices /></S> },
              { path: 'profile', element: <S><UserProfile /></S> },
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
