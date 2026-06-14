import { useState, useEffect } from 'react'
import { Booking } from '../../types'
import { formatRupiah } from '../../utils'
import { Badge } from '../../components/common'
import Button from '../../components/ui/button/Button'

// ─── Countdown untuk booking yang telat ──────────────────────────────────────
function BookingLateCountdown({ targetDate }: { targetDate: number }) {
  const calc = () => Math.max(0, Math.floor((targetDate - Date.now()) / 1000));
  const [rem, setRem] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setRem(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (rem <= 0) return <span className="text-red-600 font-medium text-sm">Kadaluarsa</span>;
  const m = Math.floor(rem / 60);
  const s = rem % 60;
  return <span className="text-red-500 font-medium text-sm tabular-nums">Sisa grace period: {m}:{s.toString().padStart(2, '0')}</span>;
}

export default function WaitingBookingCard({ booking, onStart, isStarting }: { booking: Booking, onStart: (b: Booking) => void, isStarting: boolean }) {
  // datetime of the booking
  const bDateStr = `${booking.booking_date}T${booking.start_time}`;
  const bTime = new Date(bDateStr).getTime();
  const now = Date.now();
  const diffMinutes = (now - bTime) / 60000;

  const isLate = diffMinutes >= 15;
  const isExpired = diffMinutes >= 20;

  // target date for grace period = bTime + 20 minutes
  const graceTarget = bTime + 20 * 60000;

  return (
    <div className={`bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 
        ${isLate && !isExpired ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-gray-300'} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-blue-500`} />
          <div>
            <p className="font-medium text-gray-900 text-sm">{booking.device?.name ?? '—'}</p>
            <p className="text-xs text-gray-400">{booking.device?.ps_type}</p>
          </div>
        </div>
        <Badge label="Booking" className="bg-blue-100 text-blue-700 text-xs" />
      </div>

      {/* Info pelanggan */}
      <p className="text-xs text-gray-500 font-medium">
        {booking.customer?.name ?? 'Customer'} 
        <span className="ml-1 font-normal text-gray-400">• {booking.customer?.phone}</span>
      </p>

      {/* Detail Waktu & DP */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Waktu</p>
          <p className="text-sm font-medium text-gray-800">
             {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">DP Dibayar</p>
          <p className="text-sm font-medium text-green-600">{formatRupiah(booking.dp_amount)}</p>
        </div>
      </div>

      {/* Late Notification */}
      {isLate && !isExpired && (
        <div className="bg-red-100 rounded-xl px-3 py-2 flex flex-col mt-1">
          <p className="text-xs text-red-700 font-medium mb-1">⚠️ Pelanggan terlambat {'>'}15 menit</p>
          <BookingLateCountdown targetDate={graceTarget} />
        </div>
      )}
      {isExpired && (
        <div className="bg-red-100 rounded-xl px-3 py-2 flex flex-col mt-1">
          <p className="text-xs text-red-700 font-medium">❌ Booking Kadaluarsa ({'>'}20 menit)</p>
        </div>
      )}

      {/* Action */}
      <div className="flex gap-2 mt-1 border-t border-gray-50 pt-3">
        <Button 
           variant="primary" 
           size="sm" 
           className="flex-1" 
           disabled={isExpired || isStarting}
           loading={isStarting}
           onClick={() => onStart(booking)}
        >
          ▶ Mulai Sesi
        </Button>
      </div>
    </div>
  )
}