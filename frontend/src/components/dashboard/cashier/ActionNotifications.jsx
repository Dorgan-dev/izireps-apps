import { useNavigate } from "react-router-dom";

/**
 * Notifikasi yang butuh tindakan segera:
 * 1. Booking pending yang perlu diverifikasi
 * 2. Sesi time-up yang menunggu extend/checkout
 * 3. Booking mendekati no-show (15-20 menit sejak jam booking)
 */
export default function ActionNotifications({ data }) {
  const navigate = useNavigate();

  if (!data?.notifications) return null;

  const { pending_bookings, time_up_count, time_up_sessions, no_show_bookings } =
    data.notifications;

  const totalAlerts = pending_bookings + time_up_count + (no_show_bookings?.length ?? 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <svg className="size-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </span>
          <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
            PERLU TINDAKAN
          </h4>
        </div>
        {totalAlerts > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white animate-pulse">
            {totalAlerts}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {/* ── Booking Pending ─────────────────────────────────────────── */}
        <button
          onClick={() => navigate("/cashier/bookings")}
          className={`group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-md ${
            pending_bookings > 0
              ? "border-amber-200 bg-amber-50/60 hover:border-amber-300 dark:border-amber-800/40 dark:bg-amber-900/15"
              : "border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20"
          }`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              pending_bookings > 0
                ? "bg-amber-500 text-white shadow-sm shadow-amber-200"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700"
            }`}
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Booking Pending
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Perlu diverifikasi
            </p>
          </div>
          <span
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold ${
              pending_bookings > 0
                ? "bg-amber-200/60 text-amber-800 dark:bg-amber-800/40 dark:text-amber-300"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {pending_bookings}
          </span>
          <svg
            className="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        {/* ── Sesi Time-Up ────────────────────────────────────────────── */}
        <div
          className={`rounded-xl border p-3.5 ${
            time_up_count > 0
              ? "border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-900/15"
              : "border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                time_up_count > 0
                  ? "bg-red-500 text-white shadow-sm shadow-red-200"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700"
              }`}
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Sesi Time-Up
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Menunggu extend / checkout
              </p>
            </div>
            <span
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold ${
                time_up_count > 0
                  ? "bg-red-200/60 text-red-800 dark:bg-red-800/40 dark:text-red-300"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {time_up_count}
            </span>
          </div>

          {/* Time-up session details */}
          {time_up_sessions?.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-red-100 pt-3 dark:border-red-800/30">
              {time_up_sessions.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/cashier/sessions/${s.id}/checkout`)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-red-100/60 dark:hover:bg-red-900/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {s.device_name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {s.customer_name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    +{s.overtime_minutes}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── No-Show Warning ─────────────────────────────────────────── */}
        {no_show_bookings?.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 dark:border-orange-800/40 dark:bg-orange-900/15">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white">
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                MENDEKATI NO-SHOW
              </span>
            </div>
            <div className="space-y-1.5">
              {no_show_bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-orange-100/60 px-3 py-2 dark:bg-orange-900/20"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {b.customer_name} — {b.device_name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Booking {b.start_time}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    +{b.minutes_overdue}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalAlerts === 0 && (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="text-3xl">✅</span>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Tidak ada notifikasi mendesak
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
