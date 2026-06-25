import { useNavigate } from "react-router-dom";

/**
 * Shortcut cepat kasir:
 * - Mulai Sesi Baru → ke halaman devices/sessions
 * - Daftar Booking → ke halaman bookings
 * - Daftar Transaksi → ke halaman transaksi
 */
export default function CashierQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Mulai Sesi Baru",
      description: "Buat sesi walk-in baru",
      path: "/cashier/devices",
      color: "from-emerald-500 to-teal-600",
      hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Daftar Booking",
      description: "Verifikasi & kelola booking",
      path: "/cashier/bookings",
      color: "from-blue-500 to-indigo-600",
      hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Riwayat Transaksi",
      description: "Lihat transaksi hari ini",
      path: "/cashier/transactions",
      color: "from-violet-500 to-purple-600",
      hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <svg className="size-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
        </span>
        <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
          SHORTCUT CEPAT
        </h4>
      </div>

      <div className="mt-4 space-y-2.5">
        {actions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={`group flex w-full items-center gap-3.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-white/[0.02] ${action.hoverBorder}`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}
            >
              {action.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white">
                {action.label}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {action.description}
              </p>
            </div>
            <svg
              className="size-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
