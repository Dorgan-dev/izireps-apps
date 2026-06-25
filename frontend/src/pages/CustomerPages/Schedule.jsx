import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Clock,
  RefreshCw,
  Gamepad2,
  Monitor,
  Tv2,
  WifiOff,
  Play,
  CalendarCheck,
  Hourglass,
  CircleDot,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { devicesApi } from "../../services/api";
import ComponentCard from "../../components/common/ComponentCard";
import DatePicker from "../../components/form/DatePicker";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// PERBAIKAN: Menggunakan waktu lokal agar tidak terjadi pergeseran tanggal (timezone bug)
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMinutes(time) {
  if (!time) return 0; 
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** "14:00:00" → "14:00" */
function formatTime(time) {
  if (!time) return "—";
  const parts = time.split(":");
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Hitung sisa waktu dari sekarang ke end_time */
function getRemainingTime(endTime, now) {
  const [h, m] = endTime.split(":").map(Number);
  const endMin = h * 60 + m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diff = endMin - nowMin;
  if (diff <= 0) return null;
  if (diff < 60) return `~${diff} menit`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (mins === 0) return `~${hours} jam`;
  return `~${hours}j ${mins}m`;
}

/** Config status untuk tabel */
const STATUS_MAP = {
  in_use: {
    label: "Digunakan",
    dotClass: "bg-orange-500",
    textClass: "text-orange-500 dark:text-orange-400",
    Icon: Play,
  },
  confirmed: {
    label: "Dibooking",
    dotClass: "bg-blue-500",
    textClass: "text-blue-500 dark:text-blue-400",
    Icon: CalendarCheck,
  },
};

/** Config ikon perangkat berdasar tipe PS */
function getDeviceIcon(psType) {
  switch (psType) {
    case "PS3":
      return Monitor;
    case "PS5":
      return Tv2;
    default:
      return Gamepad2;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonTable() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="h-11 bg-gray-50 dark:bg-gray-800/50" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeviceSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [devices, setDevices] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tick, setTick] = useState(new Date());

  // ── Tick setiap 30 detik untuk update "Sisa Waktu" secara live ──
  useEffect(() => {
    const interval = setInterval(() => setTick(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch data ──
  const fetchData = useCallback(async (date, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const devRes = await devicesApi.publicList();
      const devList = devRes.data?.data ?? devRes.data ?? [];
      setDevices(devList);

      const dateStr = formatDate(date);
      const schedMap = {};

      await Promise.all(
        devList.map(async (dev) => {
          try {
            const res = await devicesApi.schedule(dev.id, dateStr);
            const slots = res.data?.data ?? res.data ?? [];
            schedMap[dev.id] = slots;
          } catch {
            schedMap[dev.id] = [];
          }
        }),
      );

      setSchedules(schedMap);
      setLastUpdated(new Date());
      setTick(new Date());
    } catch {
      setError("Gagal memuat data jadwal. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  // Auto-refresh setiap 60 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(selectedDate, true);
    }, 60_000);
    return () => clearInterval(interval);
  }, [selectedDate, fetchData]);

  // ── Proses data: flatten, filter slot lewat, sort terdekat ──
  const tableRows = useMemo(() => {
    const now = tick;
    const isToday = isSameDay(selectedDate, now);
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const rows = [];

    devices.forEach((device) => {
      const slots = schedules[device.id] ?? [];
      slots.forEach((slot, idx) => {
        const endMin = toMinutes(slot.end_time);
        const startMin = toMinutes(slot.start_time);

        // Hanya untuk hari ini: skip slot yang sudah selesai
        if (isToday && endMin <= currentMin) return;

        const isActive =
          isToday &&
          slot.status === "in_use" &&
          startMin <= currentMin &&
          endMin > currentMin;

        rows.push({
          key: `${device.id}-${slot.id ?? idx}`,
          deviceName: device.name,
          psType: device.ps_type,
          startTime: slot.start_time,
          endTime: slot.end_time,
          status: slot.status,
          isActive,
          remainingTime: isActive ? getRemainingTime(slot.end_time, now) : null,
        });
      });
    });

    // Sort: sedang digunakan dulu, lalu berdasar jam mulai terdekat
    rows.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });

    return rows;
  }, [devices, schedules, selectedDate, tick]);

  // ── Statistik ringkasan ──
  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const available = devices.filter((d) => d.status === "available").length;
    const inUse = tableRows.filter((r) => r.status === "in_use").length;
    const booked = tableRows.filter((r) => r.status === "confirmed").length;
    return { totalDevices, available, inUse, booked };
  }, [devices, tableRows]);

  return (
    <>
      <PageMeta
        title="IZIReps | Jadwal Perangkat"
        description="Jadwal penggunaan perangkat secara realtime"
      />
      <PageBreadcrumb
        items={[{ label: "Jadwal Perangkat", path: "/device-schedule" }]}
      />

      <ComponentCard
        title="Jadwal Penggunaan"
        headerAction={
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            <button
              onClick={() => fetchData(selectedDate, true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <div className="w-36 sm:w-44">
              <DatePicker
                id="schedule-datepicker"
                value={formatDate(selectedDate)}
                onChange={(dates) => {
                  if (dates && dates[0]) setSelectedDate(dates[0]);
                }}
                placeholder="Pilih Tanggal"
              />
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* ── Legend + Last Updated ── */}
          <div className="flex flex-wrap items-center gap-4 px-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Keterangan:
            </span>
            {[
              {
                dotClass: "bg-orange-500",
                label: "Digunakan",
                IconComp: Play,
              },
              {
                dotClass: "bg-blue-500",
                label: "Dibooking",
                IconComp: CalendarCheck,
              },
            ].map(({ dotClass, label, IconComp }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`}
                />
                <IconComp size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Diperbarui{" "}
                {lastUpdated.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* ── Error State ── */}
          {error && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 py-12 text-center dark:border-red-900/30 dark:bg-red-950/20">
              <WifiOff size={36} className="text-red-400" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={() => fetchData(selectedDate)}
                className="mt-1 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* ── Loading State ── */}
          {loading && !error && <SkeletonTable />}

          {/* ── Summary Cards ── */}
          {!loading && !error && devices.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Total Perangkat",
                  value: stats.totalDevices,
                  color: "text-gray-800 dark:text-white",
                },
                {
                  label: "Tersedia",
                  value: stats.available,
                  color: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Sedang Digunakan",
                  value: stats.inUse,
                  color: "text-orange-600 dark:text-orange-400",
                },
                {
                  label: "Dibooking",
                  value: stats.booked,
                  color: "text-blue-600 dark:text-blue-400",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Schedule Table ── */}
          {!loading && !error && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              {/* Table Header */}
              <div className="hidden sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1.4fr_1fr] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                {["Perangkat", "Jam Mulai", "Jam Selesai", "Status", "Sisa Waktu"].map(
                  (col) => (
                    <span
                      key={col}
                      className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      {col}
                    </span>
                  ),
                )}
              </div>

              {/* Table Body */}
              {tableRows.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <CircleDot
                    size={36}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {isSameDay(selectedDate, new Date())
                      ? "Tidak ada jadwal aktif atau mendatang saat ini."
                      : "Tidak ada jadwal pada tanggal ini."}
                  </p>
                </div>
              ) : (
                tableRows.map((row) => {
                  const statusCfg = STATUS_MAP[row.status] ?? STATUS_MAP.confirmed;
                  const DevIcon = getDeviceIcon(row.psType);

                  return (
                    <div
                      key={row.key}
                      className={`grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1.4fr_1fr] gap-2 sm:gap-4 px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02] ${
                        row.isActive
                          ? "bg-orange-50/40 dark:bg-orange-950/10"
                          : ""
                      }`}
                    >
                      {/* Perangkat */}
                      <div className="flex items-center gap-2.5">
                        <DevIcon
                          size={16}
                          className="shrink-0 text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {row.deviceName}
                        </span>
                      </div>

                      {/* Jam Mulai */}
                      <div className="flex items-center gap-2 sm:gap-0">
                        <span className="text-xs text-gray-400 sm:hidden">
                          Mulai:
                        </span>
                        <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                          {formatTime(row.startTime)}
                        </span>
                      </div>

                      {/* Jam Selesai */}
                      <div className="flex items-center gap-2 sm:gap-0">
                        <span className="text-xs text-gray-400 sm:hidden">
                          Selesai:
                        </span>
                        <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                          {formatTime(row.endTime)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${statusCfg.dotClass}`}
                          role="img"
                          aria-label={statusCfg.label}
                        />
                        <statusCfg.Icon
                          size={13}
                          className={statusCfg.textClass}
                          aria-hidden="true"
                        />
                        <span
                          className={`text-sm font-medium ${statusCfg.textClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Sisa Waktu */}
                      <div className="flex items-center gap-1.5">
                        {row.isActive && row.remainingTime ? (
                          <>
                            <Hourglass
                              size={13}
                              className="text-orange-500 dark:text-orange-400 animate-pulse"
                              aria-hidden="true"
                            />
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {row.remainingTime}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </ComponentCard>
    </>
  );
}
