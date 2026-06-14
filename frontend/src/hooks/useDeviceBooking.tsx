import { useState, useEffect } from 'react';
import { deviceApi, customerApi, bookingApi } from '../api'; // sesuaikan path import Anda

export function useDeviceBooking(id: string | undefined, user: any, navigate: any) {
    const [device, setDevice] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', phone: '', booking_date: getTodayDateString(), start_time: '', end_time: '', time_type: 'per_hour'
    });
    const [dpProof, setDpProof] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // Fetch data perangkat
    useEffect(() => {
        deviceApi.publicList()
            .then((res) => {
                const found = res.data.data?.find((d: any) => d.id === Number(id));
                found ? setDevice(found) : setError('Perangkat tidak ditemukan.');
            })
            .catch(() => setError('Gagal memuat data perangkat.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBookingClick = () => {
        if (!user) {
            alert('Anda harus login terlebih dahulu untuk melakukan booking.');
            navigate('/login');
            return;
        }
        const today = getTodayDateString();
        const now = getCurrentTime();
        setFormData(prev => ({
            ...prev,
            name: user.name ?? '',
            phone: user.phone ?? '',
            booking_date: today,
            start_time: now,
            end_time: calculateEndTime(now, 1), // default durasi 1 jam
        }));
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const updateEndTime = (startTime: string, dur: number) => {
        setFormData(prev => ({
            ...prev,
            start_time: startTime,
            end_time: calculateEndTime(startTime, dur)
        }));
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.booking_date) {
            setBookingError('Tanggal booking wajib dipilih.');
            return;
        }
        if (!dpProof) {
            setBookingError('Bukti transfer DP wajib diupload.');
            return;
        }

        setIsSubmitting(true);
        setBookingError(null);

        try {
            let customerId = user?.customer_id || user?.id;
            // 👆 PERBAIKAN: Ambil ID dari user login (sesuaikan dengan struktur object user di store Anda, misal user.id atau user.customer_id)
            if (!customerId) {
                const custRes = await customerApi.publicRegister({
                    name: formData.name,
                    phone: formData.phone,
                });
                customerId = custRes.data.data.id;
            }

            // 2. Submit Booking langsung menggunakan customerId yang sudah ada
            const payload = new FormData();
            payload.append('device_id', String(device?.id));
            payload.append('customer_id', String(customerId));
            payload.append('booking_date', formData.booking_date);
            payload.append('start_time', formData.start_time);
            payload.append('time_type', formData.time_type);
            if (formData.time_type === 'per_hour') {
                payload.append('end_time', formData.end_time);
            }
            payload.append('dp_proof', dpProof);

            await bookingApi.publicCreate(payload);

            // Reset Form
            setFormData({
                name: '',
                phone: '',
                time_type: 'per_hour',
                booking_date: '',
                start_time: '',
                end_time: '',
            });
            setDpProof(null);

            alert('Booking berhasil dikirim dan menunggu konfirmasi kasir.');
            setIsModalOpen(false);
            navigate('/device');
        } catch (err: any) {
            // Log error untuk mempermudah debugging di console browser
            console.error("Detail Error Booking:", err);
            setBookingError(err.response?.data?.message || 'Gagal membuat booking.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        device, loading, error, duration, setDuration,
        isModalOpen, setIsModalOpen, formData, setFormData,
        setDpProof, isSubmitting, bookingError,
        handleBookingClick, handleInputChange, handleBookingSubmit, updateEndTime
    };
}

// Helper Functions dipindah ke luar agar tidak memperberat re-render komponen
export const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
    ).padStart(2, '0')}`;
};
export const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// export const calculateEndTime = (startTime: string, duration: number) => {
//     if (!startTime) return '';
//     const [hours, minutes] = startTime.split(':').map(Number);
//     const start = new Date();
//     start.setHours(hours, minutes);
//     const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
//     return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
// };

/** Calculate end time string given start "HH:mm" and duration in hours */
export function calculateEndTime(startTime: string, durationHours: number): string {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationHours * 60;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/** Returns minTime for ClockTimePicker: today → current time, future → no limit */
export function getMinTime(bookingDate: string): string | undefined {
    const today = getTodayDateString();
    if (bookingDate === today || !bookingDate) {
        return getCurrentTime();
    }
    return undefined; // future date — no restriction
}

/** Calculate current time + X minutes in HH:mm format */
export function getFutureTime(addMinutes = 30) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + addMinutes);

    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    return `${h}:${m}`;
}