import { useState, useEffect } from 'react';
import { bookingsApi } from '../../services/api';

// ==========================================
// 1. SUB-KOMPONEN KHUSUS UNTUK ITEM BOOKING
// ==========================================
function BookingSesiItem({ booking, onMulaiSesi }) {
    const [timeLeft, setTimeLeft] = useState({ status: 'safe', minutesLeft: 0 });

    useEffect(() => {
        // Mengikuti status 'confirmed' sesuai sistem kamu
        if (booking.status !== 'confirmed') return;

        const checkTime = () => {
            const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - startDateTime.getTime()) / (1000 * 60));

            if (diffInMinutes >= 15 && diffInMinutes < 20) {
                setTimeLeft({ status: 'warning', minutesLeft: 20 - diffInMinutes });
            } else if (diffInMinutes >= 20) {
                setTimeLeft({ status: 'expired', minutesLeft: 0 });
            } else {
                setTimeLeft({ status: 'safe', minutesLeft: 0 });
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 15000); // Cek setiap 15 detik
        return () => clearInterval(interval);
    }, [booking]);

    return (
        <div className={`p-4 rounded-xl border ${timeLeft.status === 'warning' ? 'border-error-300 bg-error-50 dark:bg-error-950/20' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{booking.customer_name}</h4>
                    <p className="text-sm text-gray-500">Jam Mulai: {booking.start_time}</p>
                </div>
                
                {/* Tombol Mulai Sesi dari Kasir */}
                {timeLeft.status !== 'expired' && (
                    <button 
                        onClick={() => onMulaiSesi(booking)}
                        className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-lg font-medium"
                    >
                        Mulai Sesi
                    </button>
                )}
            </div>

            {/* Peringatan Grace Period */}
            {timeLeft.status === 'warning' && (
                <div className="mt-3 text-xs text-error-600 dark:text-error-400 font-medium animate-pulse">
                    ⚠️ Pelanggan terlambat! Otomatis batal & DP hangus dalam {timeLeft.minutesLeft} menit.
                </div>
            )}
        </div>
    );
}

// ==========================================
// 2. KOMPONEN UTAMA HALAMAN SESI KAMU
// ==========================================
export default function HalamanSesi() {
    // ... state data booking confirmed dari backend ...

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Daftar Booking Hari Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((item) => (
                    <BookingSesiItem 
                        key={item.id} 
                        booking={item} 
                        onMulaiSesi={(data) => handleStartSession(data)} 
                    />
                ))}
            </div>
        </div>
    );
}