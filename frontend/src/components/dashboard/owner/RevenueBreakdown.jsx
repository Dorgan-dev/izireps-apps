import { formatRupiah } from "../../../utils";

/**
 * Komponen untuk menampilkan breakdown pendapatan Gaming vs F&B
 * dan perbandingan performa vs hari/minggu sebelumnya.
 */
export default function RevenueBreakdown({ data }) {
  if (!data) return null;

  const { gaming_today, fnb_today, revenue_today, performance } = data;
  const gamingPercent =
    revenue_today > 0 ? Math.round((gaming_today / revenue_today) * 100) : 0;
  const fnbPercent =
    revenue_today > 0 ? Math.round((fnb_today / revenue_today) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {/* ── Breakdown Pendapatan ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h4 className="text-sm font-bold tracking-wide text-gray-700 dark:text-white/80">
          BREAKDOWN PENDAPATAN
        </h4>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {/* Gaming */}
          <div className="group rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 transition-all duration-300 hover:shadow-md dark:border-emerald-800/40 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <svg className="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 12h4m-2-2v4m6-1h.01M17 11h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                GAMING
              </span>
            </div>
            <p className="mt-3 text-xl font-bold text-gray-800 dark:text-white/90">
              {formatRupiah(gaming_today)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-emerald-200 dark:bg-emerald-800/50">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${gamingPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {gamingPercent}%
              </span>
            </div>
          </div>

          {/* F&B */}
          <div className="group rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-all duration-300 hover:shadow-md dark:border-blue-800/40 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                <svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h8m-4 0v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                F&B
              </span>
            </div>
            <p className="mt-3 text-xl font-bold text-gray-800 dark:text-white/90">
              {formatRupiah(fnb_today)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-blue-200 dark:bg-blue-800/50">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${fnbPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {fnbPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Perbandingan Performa ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h4 className="text-sm font-bold tracking-wide text-gray-700 dark:text-white/80">
          PERBANDINGAN PERFORMA
        </h4>

        <div className="mt-5 space-y-4">
          <PerformanceItem
            label="Vs Hari Sebelumnya"
            percent={performance.vs_day_percent}
          />
          <PerformanceItem
            label="Vs Minggu Sebelumnya"
            percent={performance.vs_week_percent}
          />
        </div>
      </div>
    </div>
  );
}

function PerformanceItem({ label, percent }) {
  const isPositive = percent >= 0;
  const color = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
  const bgColor = isPositive
    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40"
    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/40";
  const icon = isPositive ? "↑" : "↓";

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:shadow-sm ${bgColor}`}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}:
      </span>
      <div className={`flex items-center gap-1.5 text-lg font-bold ${color}`}>
        <span>
          {isPositive ? "+" : ""}
          {percent}%
        </span>
        <span className="text-base">{icon}</span>
      </div>
    </div>
  );
}
