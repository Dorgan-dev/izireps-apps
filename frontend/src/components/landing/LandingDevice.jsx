import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Tv2,
  Gamepad2,
  Monitor,
  ArrowRight,
  Loader2,
  WifiOff,
} from "lucide-react";
import { deviceApi } from "../../api";
import SectionHeader from "./SectionHeader";

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

/* ── Helper: icon & warna berdasarkan ps_type ──────────────────── */
function getTypeConfig(psType) {
  switch (psType) {
    case "PS3":
      return {
        icon: Monitor,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        emoji: "🕹️",
      };
    case "PS5":
      return {
        icon: Tv2,
        color: "text-success",
        bg: "bg-success/10",
        emoji: "🎮",
      };
    case "PS4":
    default:
      return {
        icon: Gamepad2,
        color: "text-primary",
        bg: "bg-primary/10",
        emoji: "🕹️",
      };
  }
}

/* ── Skeleton card loading ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-base-200" />
      <div className="mx-auto mb-2 h-3 w-16 rounded-full bg-base-200" />
      <div className="mx-auto mb-1.5 h-4 w-24 rounded bg-base-200" />
      <div className="mx-auto mb-3 h-3 w-20 rounded bg-base-200" />
      <div className="mx-auto h-6 w-16 rounded-full bg-base-200" />
    </div>
  );
}

/* ── Komponen utama ────────────────────────────────────────────── */
export default function LandingDevice() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    deviceApi
      .publicList()
      .then((res) => {
        setDevices(res.data.data ?? []);
      })
      .catch(() => {
        setError("Gagal memuat data perangkat.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="jadwal" className="bg-base-200 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <SectionHeader
          label="Status Perangkat"
          title="Ketersediaan unit real-time"
          sub="Cek ketersediaan unit secara langsung sebelum datang ke tempat."
        />

        {/* ── Loading state ──────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <WifiOff size={36} className="text-base-content/40" />
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
              className="mt-1 btn btn-sm btn-primary"
            >
              <Loader2 size={14} className="animate-spin" />
              Coba lagi
            </button>
          </div>
        )}

        {/* ── Device cards ───────────────────────────────────── */}
        {!loading && !error && devices.length > 0 && (
          <>
            {/*
             Mobile  : 2 kolom, tampilkan hanya 2 card
             Desktop : 4 kolom, tampilkan hanya 4 card
            */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {devices.slice(0, 4).map((d) => {
                const cfg = statusConfig[d.status] ?? defaultStatus;
                const typeConfig = getTypeConfig(d.ps_type);
                const Icon = typeConfig.icon;

                return (
                  <Link
                    key={d.id}
                    to={`/device/detail/${d.id}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-base-100 p-5 text-center shadow-theme-xs transition-all hover:-translate-y-1 hover:shadow-theme-md ${cfg.border}`}
                  >
                    {/* Icon perangkat */}
                    <div
                      className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${typeConfig.bg}`}
                    >
                      <Icon size={20} className={typeConfig.color} />
                    </div>

                    {/* Badge tipe konsol */}
                    <span
                      className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeConfig.bg} ${typeConfig.color}`}
                    >
                      {d.ps_type}
                    </span>

                    {/* Nama perangkat */}
                    <p className="mb-1 text-xs font-semibold text-base-content">
                      {d.name}
                    </p>

                    {/* Harga per jam */}
                    {d.rate != null && (
                      <p className="mb-2 text-[10px] text-base-content/60">
                        Rp {d.rate.toLocaleString("id-ID")} / jam
                      </p>
                    )}

                    {/* Status badge */}
                    <span
                      className={`badge badge-sm border-none font-medium ${cfg.badgeBg}`}
                    >
                      {cfg.label}
                    </span>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/5 dark:group-hover:bg-white/5" />
                  </Link>
                );
              })}

              {/* Sembunyikan card ke-3 dan ke-4 di mobile */}
              <style>{`
                @media (max-width: 639px) {
                  #jadwal .grid > a:nth-child(n+3) {
                    display: none;
                  }
                }
              `}</style>
            </div>

            {/* Link "Lihat Semua" */}
            <div className="mt-8 text-center">
              <Link
                to="/devices"
                className="btn btn-outline"
              >
                Lihat Semua Perangkat
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </>
        )}

        {/* ── Empty state ────────────────────────────────────── */}
        {!loading && !error && devices.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-base-content/60">
              Belum ada perangkat terdaftar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
