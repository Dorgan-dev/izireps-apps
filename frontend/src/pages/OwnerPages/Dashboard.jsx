import { useEffect, useState } from "react";
import { reportsApi } from "../../services/api";
import { formatRupiah } from "../../components/ui/badge/Badge";
import { Monitor, DollarSign, CalendarCheck, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </span>
        <Icon size={16} className="text-gray-600" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    reportsApi
      .summary({ from: today, to: today })
      .then((res) => setSummary(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Pendapatan Hari Ini"
          value={formatRupiah(summary?.revenue_today ?? 0)}
        />

        <StatCard
          icon={Monitor}
          label="Perangkat Aktif"
          value={String(summary?.active_devices ?? 0)}
          sub="dari total perangkat"
        />

        <StatCard
          icon={TrendingUp}
          label="Sesi Hari Ini"
          value={String(summary?.sessions_today ?? 0)}
        />

        <StatCard
          icon={CalendarCheck}
          label="Total Booking"
          value={String(summary?.total_bookings ?? 0)}
          sub="bulan ini"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">
          Grafik Pendapatan
        </h2>
        <p className="text-sm text-gray-500 text-center py-12">
          Grafik akan tersedia setelah backend terhubung
        </p>
      </div>
    </div>
  );
}
