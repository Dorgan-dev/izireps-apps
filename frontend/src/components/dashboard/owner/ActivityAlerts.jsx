/**
 * Komponen Aktivitas Perlu Perhatian — menampilkan:
 * 1. Booking pending > 30 menit
 * 2. Sesi time-up belum checkout
 */
export default function ActivityAlerts({ data }) {
  if (!data?.alerts) return null;

  const { long_pending_bookings, time_up_sessions } = data.alerts;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {/* ── Booking Pending > 30 Menit ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <svg className="size-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </span>
          <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
            BOOKING PENDING &gt;30 MENIT
          </h4>
        </div>

        <div className="mt-4 space-y-2">
          {long_pending_bookings?.length > 0 ? (
            long_pending_bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-2.5 transition-colors hover:bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/10 dark:hover:bg-amber-900/20"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-800/40">
                  <svg className="size-3.5 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    [ID-B{b.id}] {b.customer_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {b.device_name}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-200/60 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-800/40 dark:text-amber-300">
                  {b.waiting_minutes}m
                </span>
              </div>
            ))
          ) : (
            <EmptyState message="Tidak ada booking pending lama" icon="✅" />
          )}
        </div>
      </div>

      {/* ── Sesi Time-Up Belum Checkout ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <svg className="size-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </span>
          <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
            SESI TIME-UP BELUM CHECKOUT
          </h4>
        </div>

        <div className="mt-4 space-y-2">
          {time_up_sessions?.length > 0 ? (
            time_up_sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-2.5 transition-colors hover:bg-red-50 dark:border-red-800/30 dark:bg-red-900/10 dark:hover:bg-red-900/20"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200/60 dark:bg-red-800/40">
                  <svg className="size-3.5 text-red-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    [ID-S{s.id}] {s.device_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {s.customer_name}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-red-200/60 px-2.5 py-1 text-xs font-bold text-red-800 dark:bg-red-800/40 dark:text-red-300">
                  OT: {s.overtime_minutes}m
                </span>
              </div>
            ))
          ) : (
            <EmptyState message="Tidak ada sesi time-up" icon="✅" />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  );
}
