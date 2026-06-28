import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RequireAuth, RequireRole } from "./guards";
import { useAuthStore } from "../store/authStore";
import PageLoader from "../components/ui/PageLoader";

const PublicLayout = lazy(() => import("../layouts/customer/CustomerLayout"));
const PublicLanding = lazy(() => import("../pages/CustomerPages/Home"));
const PublicLogin = lazy(() => import("../pages/AuthPages/Login"));
const PublicRegister = lazy(() => import("../pages/AuthPages/Register"));
const PublicAbout = lazy(() => import("../pages/CustomerPages/About"));
const PublicContact = lazy(() => import("../pages/CustomerPages/Contact"));
const PublicDeviceList = lazy(() => import("../pages/CustomerPages/DeviceList"));
const PublicDeviceDetail = lazy(() => import("../pages/CustomerPages/DeviceDetail"));
const UserProfile = lazy(() => import("../pages/SharedPages/UserProfiles")); // 👈 Nama variabelnya UserProfile
const DeviceSchedule = lazy(() => import("../pages/CustomerPages/Schedule"));

const OwnerLayout = lazy(() => import("../layouts/owner/OwnerLayout"));
const OwnerDashboard = lazy(() => import("../pages/OwnerPages/Dashboard"));
const OwnerDevices = lazy(() => import("../pages/OwnerPages/Devices"));
const OwnerDeviceRates = lazy(() => import("../pages/OwnerPages/DeviceRates"));
const OwnerCashiers = lazy(() => import("../pages/OwnerPages/Cashiers"));
const OwnerBookings = lazy(() => import("../pages/OwnerPages/Bookings"));
const OwnerFnb = lazy(() => import("../pages/OwnerPages/Fnb"));
const OwnerReports = lazy(() => import("../pages/OwnerPages/Reports"));
const OwnerRevenue = lazy(() => import("../pages/OwnerPages/Revenue"));
const OwnerSettings = lazy(() => import("../pages/OwnerPages/Settings"));

const CashierLayout = lazy(() => import("../layouts/cashier/CashierLayout"));
const CashierDashboard = lazy(() => import("../pages/CashierPages/Dashboard"));
const CashierBookings = lazy(() => import("../pages/CashierPages/Bookings"));
const CashierSessions = lazy(() => import("../pages/CashierPages/Sessions"));
const CashierCheckout = lazy(() => import("../pages/CashierPages/SessionDetail"));
const CashierFnb = lazy(() => import("../pages/CashierPages/Fnb"));
const CashierTransactions = lazy(() => import("../pages/CashierPages/Transactions"));
const CashierDevices = lazy(() => import("../pages/CashierPages/Devices"));

const NotFound = lazy(() => import("../pages/NotFound"));

function S({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Helper: tentukan halaman tujuan sesuai role */
function dashboardPath(role) {
  if (role === "owner") return "/owner";
  if (role === "cashier") return "/cashier";
  return "/";
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
  return <S><PublicRegister /></S>;
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginRoute /> },
  { path: "/register", element: <RegisterRoute /> },
  // { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    children: [
      {
        path: "/",
        element: <S><PublicLayout /></S>,
        children: [
          { index: true, element: <S><PublicLanding /></S> },
          { path: "about", element: <S><PublicAbout /></S> },
          { path: "contact", element: <S><PublicContact /></S> },
          { path: "devices", element: <S><PublicDeviceList /></S> },
          { path: "device/detail/:id", element: <S><PublicDeviceDetail /></S> },
          {
            element: <RequireAuth />,
            children: [
              { path: "profile", element: <S><UserProfile /></S> }
            ]
          },
          { path: "schedule", element: <S><DeviceSchedule /></S> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole role="owner" />,
        children: [
          {
            path: "/owner",
            element: <S><OwnerLayout /></S>,
            children: [
              { index: true, element: <S><OwnerDashboard /></S> },
              { path: "devices", element: <S><OwnerDevices /></S> },
              { path: "devices/rates", element: <S><OwnerDeviceRates /></S> },
              { path: "cashiers", element: <S><OwnerCashiers /></S> },
              { path: "bookings", element: <S><OwnerBookings /></S> },
              { path: "fnb", element: <S><OwnerFnb /></S> },
              { path: "reports", element: <S><OwnerReports /></S> },
              { path: "revenue", element: <S><OwnerRevenue /></S> },
              { path: "settings", element: <S><OwnerSettings /></S> },
              { path: "profile", element: <S><UserProfile /></S> },
            ],
          },
        ],
      },
      {
        element: <RequireRole role="cashier" />,
        children: [
          {
            path: "/cashier",
            element: <S><CashierLayout /></S>,
            children: [
              { index: true, element: <S><CashierDashboard /></S> },
              { path: "bookings", element: <S><CashierBookings /></S> },
              { path: "sessions", element: <S><CashierSessions /></S> },
              { path: "sessions/:id", element: <S><CashierSessions /></S> },
              { path: "sessions/:id/checkout", element: <S><CashierCheckout /></S> },
              { path: "transactions", element: <S><CashierTransactions /></S> },
              { path: "fnb", element: <S><CashierFnb /></S> },
              { path: "devices", element: <S><CashierDevices /></S> },
              { path: "profile", element: <S><UserProfile /></S> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <S><NotFound /></S> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
