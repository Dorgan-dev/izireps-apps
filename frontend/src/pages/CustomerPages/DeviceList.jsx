import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Tv2,
  Gamepad2,
  Monitor,
  Loader2,
  WifiOff,
  ArrowLeft,
} from "lucide-react";
import { deviceApi } from "../../api";

/* ── Konfigurasi warna status ──────────────────────────────────── */
const statusConfig = {
  available: {
    label: "Tersedia",
    color: "text-success",
    border: "border-success",
    badgeBg: "badge-success",
  },
  booked: {
    label: "Dibooking",
    color: "text-primary",
    border: "border-primary",
    badgeBg: "badge-primary",
  },
  in_use: {
    label: "Digunakan",
    color: "text-warning",
    border: "border-warning",
    badgeBg: "badge-warning",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-error",
    border: "border-error",
    badgeBg: "badge-error",
  },
};

const defaultStatus = statusConfig.available;

/* ── Filter tabs ───────────────────────────────────────────────── */
const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "PS3", label: "PS3" },
  { key: "PS4", label: "PS4" },
  { key: "PS5", label: "PS5" },
];

/* ── Helper: icon & warna berdasarkan ps_type ──────────────────── */
function getTypeConfig(psType) {
  switch (psType) {
    case "PS3":
      return {
        icon: Monitor,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      };
    case "PS5":
      return {
        icon: Tv2,
        color: "text-success",
        bg: "bg-success/10",
      };
    case "PS4":
    default:
      return {
        icon: Gamepad2,
        color: "text-primary",
        bg: "bg-primary/10",
      };
  }
}

/* ── Skeleton card ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-base-300 bg-base-100 p-6">
      <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-base-200" />
      <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-base-200" />
      <div className="mx-auto mb-2 h-5 w-28 rounded bg-base-200" />
      <div className="mx-auto mb-3 h-3 w-24 rounded bg-base-200" />
      <div className="mx-auto h-6 w-20 rounded-full bg-base-200" />
    </div>
  );
}

/* ── Komponen halaman DeviceList ────────────────────────────────── */
export default function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    deviceApi
      .publicList()
      .then((res) => setDevices(res.data.data ?? []))
      .catch(() => setError("Gagal memuat data perangkat."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? devices : devices.filter((d) => d.ps_type === filter);

  const counts = {
    all: devices.length,
    available: devices.filter((d) => d.status === "available").length,
    in_use: devices.filter((d) => d.status === "in_use").length,
    maintenance: devices.filter((d) => d.status === "maintenance").length,
  };

  return (
    <section className="min-h-screen bg-base-200 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Daftar Perangkat
          </p>
          <h1 className="mb-3 text-2xl font-bold text-base-content sm:text-3xl">
            Semua unit yang tersedia
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-base-content/70">
            Lihat ketersediaan seluruh unit konsol PlayStation kami secara
            real-time.
          </p>
        </div>

        {/* Stats summary */}
        {!loading && !error && devices.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total Unit",
                value: counts.all,
                color: "text-base-content",
              },
              {
                label: "Tersedia",
                value: counts.available,
                color: "text-success",
              },
              {
                label: "Digunakan",
                value: counts.in_use,
                color: "text-warning",
              },
              {
                label: "Maintenance",
                value: counts.maintenance,
                color: "text-error",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border border-base-300 bg-base-100 p-4 text-center"
              >
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-base-content/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && !error && devices.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === key
                    ? "bg-primary text-primary-content shadow-sm"
                    : "bg-base-100 text-base-content/70 hover:bg-base-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <WifiOff size={40} className="text-base-content/40" />
            <p className="text-sm text-base-content/60">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                deviceApi
                  .publicList()
                  .then((res) => setDevices(res.data.data ?? []))
                  .catch(() => setError("Gagal memuat data perangkat."))
                  .finally(() => setLoading(false));
              }}
              className="mt-2 btn btn-sm btn-primary"
            >
              <Loader2 size={14} className="animate-spin" />
              Coba lagi
            </button>
          </div>
        )}

        {/* ── Device cards ───────────────────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d) => {
              const cfg = statusConfig[d.status] ?? defaultStatus;
              const typeConfig = getTypeConfig(d.ps_type);
              const Icon = typeConfig.icon;

              return (
                <Link
                  key={d.id}
                  to={`/device/detail/${d.id}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-base-100 p-6 text-center shadow-theme-xs transition-all hover:-translate-y-1 hover:shadow-theme-md ${cfg.border}`}
                >
                  {/* Icon perangkat */}
                  <div
                    className={`mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${typeConfig.bg}`}
                  >
                    <Icon size={22} className={typeConfig.color} />
                  </div>

                  {/* Badge tipe konsol */}
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeConfig.bg} ${typeConfig.color}`}
                  >
                    {d.ps_type}
                  </span>

                  {/* Nama perangkat */}
                  <p className="mb-1.5 text-sm font-semibold text-base-content">
                    {d.name}
                  </p>

                  {/* Harga per jam */}
                  {d.rate != null && (
                    <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
                      Rp {d.rate.toLocaleString("id-ID")} / jam
                    </p>
                  )}

                  {/* Status badge */}
                  <span
                    className={`badge badge-sm border-none font-medium ${cfg.badgeBg}`}
                  >
                    {cfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Empty filtered ─────────────────────────────────── */}
        {!loading && !error && filtered.length === 0 && devices.length > 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-base-content/60">
              Tidak ada perangkat {filter} ditemukan.
            </p>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────── */}
        {!loading && !error && devices.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-base-content/60">
              Belum ada perangkat terdaftar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
