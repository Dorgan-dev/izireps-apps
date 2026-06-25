import { formatRupiah } from "../../../utils";

/**
 * Ringkasan shift kasir yang sedang login:
 * - Jumlah transaksi hari ini
 * - Total nilai transaksi
 * - Breakdown gaming vs F&B
 * - Jumlah sesi yang dimulai
 */
export default function ShiftSummary({ data, userName }) {
  if (!data?.shift) return null;

  const { shift } = data;
  const total = shift.transaction_total || 0;
  const gamingPercent =
    total > 0 ? Math.round((shift.gaming_total / total) * 100) : 0;
  const fnbPercent =
    total > 0 ? Math.round((shift.fnb_total / total) * 100) : 0;

  const metrics = [
    {
      label: "Transaksi Diproses",
      value: shift.transaction_count,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(total),
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Sesi Dimulai",
      value: shift.sessions_started,
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <svg className="size-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </span>
        <div>
          <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
            RINGKASAN SHIFT HARI INI
          </h4>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {userName ?? "Kasir"}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl p-3.5 ${m.bgLight} text-center transition-all duration-200 hover:shadow-sm`}
          >
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${m.color} text-white shadow-sm`}>
              {m.icon}
            </div>
            <p className="mt-2.5 text-lg font-bold text-gray-800 dark:text-white/90">
              {m.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdown bar */}
      {total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Gaming {gamingPercent}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              F&B {fnbPercent}%
            </span>
          </div>
          <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="rounded-l-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${gamingPercent}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${fnbPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
            <span>{formatRupiah(shift.gaming_total)}</span>
            <span>{formatRupiah(shift.fnb_total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
