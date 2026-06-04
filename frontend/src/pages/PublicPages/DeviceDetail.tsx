import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tv2, Gamepad2, Monitor, Loader2, WifiOff, CalendarCheck } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { useAuthStore } from '../../store/authStore';
import Modal from '../../components/ui/modal';
import InputField from '../../components/form/input/InputField';
import FileInput from '../../components/form/input/FileInput';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker';
import ClockTimePicker from '../../components/form/ClockTimePicker';
import { useEffect, useState, useCallback } from 'react';

// Import custom hook dan helper
import { useDeviceBooking, getTodayDateString, getCurrentTime } from '../../hooks/useDeviceBooking';

const statusConfig: Record<string, { label: string; color: string; border: string; badgeBg: string }> = {
    available: { label: 'Tersedia', color: 'text-success-600 dark:text-success-400', border: 'border-success-200', badgeBg: 'bg-success-50 dark:bg-success-950/50' },
    booked: { label: 'Dibooking', color: 'text-brand-600 dark:text-brand-400', border: 'border-brand-200', badgeBg: 'bg-brand-50 dark:bg-brand-950/50' },
    in_use: { label: 'Digunakan', color: 'text-warning-600 dark:text-warning-400', border: 'border-warning-200', badgeBg: 'bg-warning-50 dark:bg-warning-950/50' },
    maintenance: { label: 'Maintenance', color: 'text-error-600 dark:text-error-400', border: 'border-error-200', badgeBg: 'bg-error-50 dark:bg-error-950/50' },
};

function getTypeConfig(psType: string) {
    if (psType === 'PS3') return { icon: Monitor, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' };
    if (psType === 'PS5') return { icon: Tv2, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-950/40' };
    return { icon: Gamepad2, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/40' };
}

/** Calculate end time string given start "HH:mm" and duration in hours */
function calculateEndTime(startTime: string, durationHours: number): string {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationHours * 60;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/** Returns minTime for ClockTimePicker: today → current time, future → no limit */
function getMinTime(bookingDate: string): string | undefined {
    const today = getTodayDateString();
    if (bookingDate === today || !bookingDate) {
        return getCurrentTime();
    }
    return undefined; // future date — no restriction
}

export default function DeviceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const {
        device, loading, error, duration, setDuration, isModalOpen, setIsModalOpen,
        formData, setFormData, setDpProof, isSubmitting, bookingError,
        handleBookingClick: _handleBookingClick, handleInputChange, handleBookingSubmit
    } = useDeviceBooking(id, user, navigate);

    // Track apakah user sudah mengubah jam secara manual
    const [isTimeEdited, setIsTimeEdited] = useState<boolean>(false);
    // Track selected booking date to determine if time restriction applies
    const [selectedBookingDate, setSelectedBookingDate] = useState<string>(getTodayDateString());

    // Sinkronisasi data awal saat tombol booking pertama kali diklik
    const handleBookingClick = useCallback(() => {
        const today = getTodayDateString();
        const nowTime = getCurrentTime();
        
        setSelectedBookingDate(today);
        setIsTimeEdited(false); // Reset status edit jam pelangan
        
        // Isi form data awal secara eksplisit agar tanggal dan jam langsung sinkron di sistem
        setFormData(prev => ({
            ...prev,
            booking_date: today,
            start_time: nowTime,
            end_time: calculateEndTime(nowTime, duration),
        }));
        
        _handleBookingClick(); 
    }, [_handleBookingClick, duration, setFormData]);

    // Handle saat user memilih jam manual dari ClockTimePicker
    const handleTimeChange = useCallback((newTime: string) => {
        setIsTimeEdited(true); // Tandai bahwa user sudah interaksi pilih jam sendiri
        setFormData(prev => ({
            ...prev,
            start_time: newTime,
            end_time: calculateEndTime(newTime, duration),
        }));
    }, [duration, setFormData]);

    // Efek Ticking Clock: Update jam otomatis setiap 10 detik jika rute hari ini dan belum diedit manual
    useEffect(() => {
        if (!isModalOpen || selectedBookingDate !== getTodayDateString() || isTimeEdited) return;

        const interval = setInterval(() => {
            const nowTime = getCurrentTime();
            setFormData(prev => ({
                ...prev,
                start_time: nowTime,
                end_time: calculateEndTime(nowTime, duration),
            }));
        }, 10000); // interval 10 detik memastikan menit selalu up-to-date

        return () => clearInterval(interval);
    }, [isModalOpen, selectedBookingDate, isTimeEdited, duration, setFormData]);

    // Hitung ulang end_time otomatis hanya saat durasi (Select Option) diubah oleh user
    useEffect(() => {
        if (formData.start_time) {
            setFormData(prev => ({
                ...prev,
                end_time: calculateEndTime(prev.start_time, duration),
            }));
        }
    }, [duration]);

    // minTime: hanya batasi jika booking hari ini
    const minTime = getMinTime(selectedBookingDate);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="animate-spin text-brand-500" size={32} />
            </div>
        );
    }

    if (error || !device) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center dark:bg-gray-950">
                <WifiOff size={40} className="mb-4 text-gray-400" />
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Oops!</h2>
                <p className="mb-6 text-gray-500 dark:text-gray-400">{error}</p>
                <Link to="/device" className="text-brand-500 hover:underline">Kembali ke daftar perangkat</Link>
            </div>
        );
    }

    const typeConfig = getTypeConfig(device.ps_type);
    const Icon = typeConfig.icon;
    const cfg = statusConfig[device.status] ?? statusConfig.available;

    return (
        <>
            <PageBreadcrumb
                pageDescription='Lihat informasi detail sesi bermain'
                items={[{ label: 'Perangkat', path: '/device' }, { label: 'Detail', path: `/device/${id}` }]}
            />
            <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-950">
                <PageMeta title={`Detail ${device.name} - IZIREPS`} description={`Detail perangkat ${device.name}`} />
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex flex-col md:flex-row">
                            <div className={`flex flex-1 flex-col items-center justify-center p-10 ${typeConfig.bg}`}>
                                <Icon size={120} className={typeConfig.color} />
                                <span className={`mt-6 inline-block rounded-full px-4 py-1 text-sm font-bold ${typeConfig.bg} ${typeConfig.color} border border-current`}>
                                    {device.ps_type}
                                </span>
                            </div>

                            <div className="flex-1 p-8">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{device.name}</h1>
                                    <div className="mt-3 flex items-center gap-3">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${cfg.badgeBg} ${cfg.color}`}>
                                            {cfg.label}
                                        </span>
                                        {device.rate && (
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Rp {device.rate.toLocaleString('id-ID')} / jam
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-8 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Deskripsi</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {device.ps_type === 'PS5' ? 'Nikmati pengalaman bermain game generasi terbaru dengan resolusi 4K dan loading super cepat.' : 'Mainkan berbagai game seru dengan teman-teman Anda.'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={handleBookingClick} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-600">
                                    <CalendarCheck size={18} /> Booking Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Formulir Booking" size="md">
                    {/* Style override global internal untuk memaksa semua modal popover jam berada di depan frame bootstrap/tailwind modal */}
                    <style>{`
                        .flatpickr-calendar, .clockpicker-popover, .rc-time-picker-panel, [role="dialog"] + div {
                            z-index: 99999 !important;
                        }
                    `}</style>

                    <div className="flex flex-col gap-4 p-1 sm:p-2">
                        {bookingError && (
                            <div className="rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                                {bookingError}
                            </div>
                        )}
                        
                        {/* Nama & WhatsApp */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label>Nama Pelanggan</Label>
                                <InputField name="name" value={formData.name || ''} onChange={handleInputChange} required placeholder="Masukkan nama" className="w-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>No. WhatsApp</Label>
                                <InputField type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} required placeholder="Contoh: 0812345678" className="w-full" />
                            </div>
                        </div>

                        {/* Tanggal Bermain */}
                        <div className="flex flex-col gap-1.5">
                            <DatePicker
                                key={`datepicker-${isModalOpen}-${formData.booking_date}`}
                                id="booking-date-picker"
                                label="Tanggal Bermain"
                                minDate={new Date()}
                                placeholder="Pilih tanggal"
                                defaultDate={formData.booking_date || getTodayDateString()}
                                onChange={(dates) => {
                                    if (dates.length === 0) return;
                                    const d = dates[0];
                                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                    setSelectedBookingDate(dateStr);
                                    setFormData(p => ({ ...p, booking_date: dateStr }));
                                }}
                            />
                        </div>

                        {/* Durasi */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Durasi Bermain</Label>
                            <Select
                                value={String(duration)}
                                onChange={(val) => {
                                    const newDur = Number(val);
                                    setDuration(newDur);
                                }}
                                options={[1, 2, 3, 4, 5, 6].map(h => ({ value: String(h), label: `${h} jam` }))}
                                placeholder="Pilih durasi"
                                className="w-full"
                            />
                        </div>

                        {/* Jam Mulai & Selesai */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative">
                            <div className="flex flex-col gap-1.5 relative z-[60]">
                                <ClockTimePicker
                                    id="start_time"
                                    label="Jam Mulai"
                                    value={formData.start_time || getCurrentTime()}
                                    onChange={handleTimeChange}
                                    minTime={minTime}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Jam Selesai (by system)</Label>
                                <div className="h-11 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-mono text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 select-none w-full">
                                    {formData.end_time || (
                                        <span className="text-gray-400 dark:text-gray-500">Otomatis</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bukti Transfer */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Bukti Transfer DP (Max 2MB)</Label>
                            <FileInput onChange={(e) => setDpProof(e.target.files?.[0] || null)} className="w-full" />
                            <p className="mt-0.5 text-xs text-gray-500">Format: JPG, PNG, PDF</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 w-1/2 sm:w-auto">
                                Batal
                            </button>
                            <button type="button" onClick={handleBookingSubmit} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 w-1/2 sm:w-auto">
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                {isSubmitting ? 'Mengirim...' : 'Kirim Booking'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}