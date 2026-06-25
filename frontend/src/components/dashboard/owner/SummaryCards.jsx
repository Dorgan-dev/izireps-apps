import { formatRupiah } from "../../../utils";
import {
  DollarLineIcon,
  BoxIconLine,
  ShootingStarIcon,
  CalenderIcon,
} from "../../../icons";

const cards = [
  {
    id: "revenue",
    label: "TOTAL PENDAPATAN HARI INI",
    sub: "(GAMING + F&B)",
    icon: DollarLineIcon,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    getValue: (d) => formatRupiah(d.revenue_today),
  },
  {
    id: "transactions",
    label: "JUMLAH TRANSAKSI HARI INI",
    sub: "TRANSAKSI",
    icon: BoxIconLine,
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    getValue: (d) => d.transactions_today,
  },
  {
    id: "sessions",
    label: "JUMLAH SESI AKTIF SAAT INI",
    sub: "SESI AKTIF",
    icon: ShootingStarIcon,
    color: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    getValue: (d) => d.active_sessions,
  },
  {
    id: "bookings",
    label: "JUMLAH BOOKING PENDING",
    sub: "MENUNGGU VERIFIKASI",
    icon: CalenderIcon,
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    getValue: (d) => d.pending_bookings,
  },
];

export default function SummaryCards({ data }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:shadow-gray-900/30"
          >
            {/* Gradient accent bar */}
            <div
              className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${card.color} opacity-80`}
            />

            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="size-5 sm:size-6 card.iconColor" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              {/* PERBAIKAN: text-xl pada mobile agar nominal Rupiah yang panjang tidak patah/overflow */}
              <h3 className="mt-1 sm:mt-2 text-xl font-bold text-gray-800 dark:text-white/90 sm:text-2xl">
                {card.getValue(data)}
              </h3>
              <p className="mt-0.5 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}