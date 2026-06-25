import PageMeta from "../../components/common/PageMeta";
import SummaryCards from "../../components/dashboard/owner/SummaryCards";
import RevenueBreakdown from "../../components/dashboard/owner/RevenueBreakdown";
import DeviceStatusChart from "../../components/dashboard/owner/DeviceStatusChart";
import RevenueChart from "../../components/dashboard/owner/RevenueChart";
import ActivityAlerts from "../../components/dashboard/owner/ActivityAlerts";
import FnbSummary from "../../components/dashboard/owner/FnbSummary";
import QuickLinks from "../../components/dashboard/owner/QuickLinks";
import { useOwnerDashboard } from "../../hooks/useOwnerDashboard";
import { useAuthStore } from "../../store/authStore";

export default function Dashboard() {
  const { data, loading, error, refetch } = useOwnerDashboard();
  const user = useAuthStore((s) => s.user);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <span className="text-4xl">⚠️</span>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
          <button
            onClick={refetch}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Dashboard Owner | IziReps"
        description="Dashboard monitoring pendapatan, sesi, booking, dan status perangkat untuk owner."
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Dashboard Owner
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Selamat datang,{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {user?.name ?? "Owner"}
            </span>
          </p>
        </div>

        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.379 2.671l-1.06 1.06A7 7 0 0017.25 10H15.5a.75.75 0 010-1.5h3a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-1.826zM4.688 8.576a5.5 5.5 0 019.379-2.671l1.06-1.06A7 7 0 002.75 10H4.5a.75.75 0 010 1.5h-3A.75.75 0 01.75 10.75v-3a.75.75 0 011.5 0v1.826z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Dashboard Grid ──────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Row 1: Summary cards */}
        <SummaryCards data={data} />

        {/* Row 2: Breakdown + Performa | Status Perangkat */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <div className="col-span-12 xl:col-span-7">
            <RevenueBreakdown data={data} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <DeviceStatusChart data={data} />
          </div>
        </div>

        {/* Row 3: Grafik Pendapatan 7 Hari */}
        <RevenueChart data={data} />

        {/* Row 4: Aktivitas Alerts */}
        <ActivityAlerts data={data} />

        {/* Row 5: FnB Summary | Quick Links */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <div className="col-span-12 md:col-span-6 xl:col-span-5">
            <FnbSummary data={data} />
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-4 xl:col-start-9">
            <QuickLinks />
          </div>
        </div>
      </div>
    </>
  );
}
