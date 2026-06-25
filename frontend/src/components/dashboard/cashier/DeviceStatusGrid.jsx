import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  available: {
    label: "Tersedia",
    dot: "bg-emerald-500",
    bg: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/15",
    hover: "hover:border-emerald-300 hover:shadow-emerald-100/50 dark:hover:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  in_use: {
    label: "Digunakan",
    dot: "bg-amber-500",
    bg: "border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/15",
    hover: "hover:border-amber-300 hover:shadow-amber-100/50 dark:hover:border-amber-700",
    text: "text-amber-700 dark:text-amber-400",
  },
  booked: {
    label: "Dibooking",
    dot: "bg-violet-500",
    bg: "border-violet-200 bg-violet-50/60 dark:border-violet-800/40 dark:bg-violet-900/15",
    hover: "hover:border-violet-300 hover:shadow-violet-100/50 dark:hover:border-violet-700",
    text: "text-violet-700 dark:text-violet-400",
  },
  maintenance: {
    label: "Perbaikan",
    dot: "bg-red-500",
    bg: "border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-900/15",
    hover: "hover:border-red-300 hover:shadow-red-100/50 dark:hover:border-red-700",
    text: "text-red-700 dark:text-red-400",
  },
};

export default function DeviceStatusGrid({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const { devices, device_counts } = data;
  const total = device_counts.total || 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold tracking-wide text-gray-700 dark:text-white/80">
            STATUS PERANGKAT
          </h4>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {total} perangkat terdaftar — real-time
          </p>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
            >
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              {cfg.label}: {device_counts[key] ?? 0}
            </span>
          ))}
        </div>
      </div>

      {/* Device Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {devices.map((device) => {
          const cfg = STATUS_CONFIG[device.status] || STATUS_CONFIG.available;
          const isClickable = device.status !== "maintenance";

          return (
            <button
              key={device.id}
              onClick={() => isClickable && navigate("/cashier/sessions")}
              disabled={!isClickable}
              className={`group relative flex flex-col items-center rounded-xl border p-4 transition-all duration-200 ${cfg.bg} ${
                isClickable
                  ? `cursor-pointer ${cfg.hover} hover:shadow-md`
                  : "cursor-not-allowed opacity-70"
              }`}
            >
              {/* Status dot (top-right) */}
              <span
                className={`absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full ${cfg.dot} ring-2 ring-white dark:ring-gray-900`}
              />

              {/* Device icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-sm dark:bg-gray-800/80">
                <svg
                  className="size-5 text-gray-600 dark:text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Name & type */}
              <p className="mt-2.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                {device.name}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {device.ps_type}
              </p>

              {/* Status badge */}
              <span
                className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.text} bg-white/60 dark:bg-gray-800/60`}
              >
                {cfg.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
