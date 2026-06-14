import { useEffect, useState, useCallback } from 'react';
import { Clock, RefreshCw, Gamepad2, Monitor, Tv2, WifiOff } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { devicesApi } from '../../services/api';
import ComponentCard from '../../components/common/ComponentCard';
import DatePicker from '../../components/form/DatePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicDevice {
    id: number;
    name: string;
    ps_type: string;
    status: string;
    status_label: string;
    rate: number | null;
}

interface ScheduleSlot {
    id: number;
    customer_name: string;
    start_time: string;
    end_time: string;
    type: 'booking' | 'session';
    status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTypeConfig(psType: string) {
    switch (psType) {
        case 'PS3': return { Icon: Monitor, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950/40' };
        case 'PS5': return { Icon: Tv2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/40' };
        default: return { Icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/40' };
    }
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    available: { label: 'Tersedia', dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
    booked: { label: 'Dibooking', dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
    in_use: { label: 'Digunakan', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
    maintenance: { label: 'Maintenance', dot: 'bg-red-400', badge: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
};

const SLOT_COLOR: Record<string, string> = {
    booking: 'bg-blue-500',
    session: 'bg-amber-500',
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 – 23:00

function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function slotPosition(start: string, end: string) {
    const ORIGIN = 8 * 60;
    const RANGE = 16 * 60;
    const s = Math.max(toMinutes(start), ORIGIN);
    const e = Math.min(toMinutes(end), ORIGIN + RANGE);
    const left = ((s - ORIGIN) / RANGE) * 100;
    const width = Math.max(((e - s) / RANGE) * 100, 0.5);
    return { left: `${left}%`, width: `${width}%` };
}

// PERBAIKAN: Menggunakan waktu lokal agar tidak terjadi pergeseran tanggal (timezone bug)
function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <div className="animate-pulse flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-[3] h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeviceSchedule() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [devices, setDevices] = useState<PublicDevice[]>([]);
    const [schedules, setSchedules] = useState<Record<number, ScheduleSlot[]>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const today = new Date();

    const fetchData = useCallback(async (date: Date, silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            const devRes = await devicesApi.publicList();
            const devList: PublicDevice[] = devRes.data?.data ?? devRes.data ?? [];
            setDevices(devList);

            const dateStr = formatDate(date);
            const schedMap: Record<number, ScheduleSlot[]> = {};

            await Promise.all(
                devList.map(async (dev) => {
                    try {
                        const res = await devicesApi.schedule(dev.id, dateStr);
                        const slots: ScheduleSlot[] = res.data?.data ?? res.data ?? [];
                        schedMap[dev.id] = slots;
                    } catch {
                        schedMap[dev.id] = [];
                    }
                })
            );

            setSchedules(schedMap);
            setLastUpdated(new Date());
        } catch {
            setError('Gagal memuat data jadwal. Periksa koneksi Anda.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate, fetchData]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(selectedDate, true);
        }, 60000);
        return () => clearInterval(interval);
    }, [selectedDate, fetchData]);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    return (
        <>
            <PageMeta title="IZIReps | Device Schedule" description="Jadwal penggunaan perangkat secara realtime" />
            <PageBreadcrumb items={[{ label: 'Device Schedule', path: '/device-schedule' }]} />

            <ComponentCard
                title="Daftar jadwal"
                headerAction={
                    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                        <button
                            onClick={() => fetchData(selectedDate, true)}
                            disabled={loading || refreshing}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
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
                    {/* ── Legend ── */}
                    <div className="flex flex-wrap items-center gap-4 px-1">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Keterangan:</span>
                        {[
                            { color: 'bg-blue-500', label: 'Booking' },
                            { color: 'bg-amber-500', label: 'Sesi Aktif' },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-5 rounded-sm ${color}`} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:block">
                                Diperbarui {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-400 dark:text-gray-500">Tampil jam 08:00 – 24:00</span>
                        </div>
                    </div>

                    {/* ── Error State ── */}
                    {error && (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 py-12 text-center dark:border-red-900/30 dark:bg-red-950/20">
                            <WifiOff size={36} className="text-red-400" />
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                            <button
                                onClick={() => fetchData(selectedDate)}
                                className="mt-1 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* ── Loading State ── */}
                    {loading && !error && (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                        </div>
                    )}

                    {/* ── Timeline Table ── */}
                    {!loading && !error && (
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                            {/* Hour header */}
                            <div className="flex border-b border-gray-100 dark:border-gray-800">
                                <div className="w-40 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Perangkat</span>
                                </div>
                                <div className="flex flex-1 overflow-x-auto">
                                    <div className="relative flex min-w-[640px] flex-1">
                                        {HOURS.map((h) => (
                                            <div key={h} className="flex-1 border-r border-gray-100 py-3 text-center dark:border-gray-800/60 last:border-r-0">
                                                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                                    {String(h).padStart(2, '0')}:00
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Device rows */}
                            {devices.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="text-sm text-gray-400">Tidak ada perangkat terdaftar.</p>
                                </div>
                            ) : (
                                devices.map((device) => {
                                    const { Icon, color, bg } = getTypeConfig(device.ps_type);
                                    const statusCfg = STATUS_CONFIG[device.status] ?? STATUS_CONFIG.available;
                                    const slots = schedules[device.id] ?? [];

                                    return (
                                        <div
                                            key={device.id}
                                            className="flex border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                                        >
                                            {/* Device info */}
                                            <div className="w-40 shrink-0 border-r border-gray-100 dark:border-gray-800 px-4 py-4 flex flex-col justify-center gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                                                        <Icon size={14} className={color} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-gray-800 dark:text-white/90">
                                                            {device.name}
                                                        </p>
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusCfg.badge}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                                            {statusCfg.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                {device.rate != null && (
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 pl-9">
                                                        Rp {device.rate.toLocaleString('id-ID')}/jam
                                                    </p>
                                                )}
                                            </div>

                                            {/* Timeline Area */}
                                            <div className="flex-1 overflow-x-auto">
                                                <div className="relative min-w-[640px] h-full" style={{ minHeight: '60px' }}>
                                                    {/* Grid lines */}
                                                    <div className="absolute inset-0 flex pointer-events-none">
                                                        {HOURS.map((h) => (
                                                            <div key={h} className="flex-1 border-r border-gray-100 dark:border-gray-800/60 last:border-r-0" />
                                                        ))}
                                                    </div>

                                                    {/* Current time indicator */}
                                                    {isSameDay(selectedDate, today) && (() => {
                                                        const now = new Date();
                                                        const nowMin = now.getHours() * 60 + now.getMinutes();
                                                        const ORIGIN = 8 * 60;
                                                        const RANGE = 16 * 60;
                                                        if (nowMin >= ORIGIN && nowMin <= ORIGIN + RANGE) {
                                                            const left = ((nowMin - ORIGIN) / RANGE) * 100;
                                                            return (
                                                                <div className="absolute top-0 bottom-0 z-20 w-0.5 bg-red-400" style={{ left: `${left}%` }}>
                                                                    <span className="absolute -top-1 -translate-x-1/2 text-[8px] font-bold text-red-400 bg-white dark:bg-gray-900 px-0.5 rounded">
                                                                        NOW
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {/* Slots */}
                                                    {slots.map((slot) => {
                                                        const pos = slotPosition(slot.start_time, slot.end_time);
                                                        const slotColor = SLOT_COLOR[slot.type] ?? 'bg-gray-400';
                                                        return (
                                                            <div
                                                                key={slot.id}
                                                                title={`${slot.customer_name} | ${slot.start_time} – ${slot.end_time}`}
                                                                className={`absolute top-3 bottom-3 rounded-md ${slotColor} opacity-90 hover:opacity-100 cursor-pointer shadow-sm z-10 overflow-hidden transition-opacity`}
                                                                style={{ left: pos.left, width: pos.width }}
                                                            >
                                                                <div className="px-1.5 py-1 h-full flex flex-col justify-center">
                                                                    <p className="text-white text-[9px] font-semibold truncate leading-tight">
                                                                        {slot.customer_name}
                                                                    </p>
                                                                    <p className="text-white/80 text-[8px] truncate leading-tight">
                                                                        {slot.start_time} – {slot.end_time}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Empty state per row */}
                                                    {slots.length === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <span className="text-[10px] text-gray-300 dark:text-gray-600 italic">Tidak ada jadwal</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── Summary Cards ── */}
                    {!loading && !error && devices.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { label: 'Total Perangkat', value: devices.length, color: 'text-gray-800 dark:text-white' },
                                { label: 'Tersedia', value: devices.filter(d => d.status === 'available').length, color: 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Digunakan', value: devices.filter(d => d.status === 'in_use' || d.status === 'booked').length, color: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Total Jadwal', value: Object.values(schedules).reduce((acc, s) => acc + s.length, 0), color: 'text-blue-600 dark:text-blue-400' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ComponentCard>
        </>
    );
}