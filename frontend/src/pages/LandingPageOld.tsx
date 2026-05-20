import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Device, Booking } from '../../types'
import { deviceApi, bookingApi } from '../../api'
import {
  deviceStatusLabel, deviceStatusBadge, deviceStatusCard,
  formatRupiah, formatDate, formatTime, bookingStatusLabel, bookingStatusBadge
} from '../../utils'
import { Button, Field, Input, Select, Badge, Spinner, EmptyState } from '../../components/common'

// ─── Public Layout ────────────────────────────────────────────────────────────
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <span className="font-medium text-gray-900 text-sm">Rental PlayStation</span>
        </div>
        <nav className="flex gap-1">
          {[
            { label: 'Ketersediaan', path: '/' },
            { label: 'Jadwal', path: '/jadwal' },
            { label: 'Booking', path: '/booking/baru' },
          ].map(n => (
            <a key={n.path} href={n.path}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
    <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    <footer className="text-center py-6 text-xs text-gray-400">
      © {new Date().getFullYear()} Rental PlayStation · Hubungi kami jika ada pertanyaan
    </footer>
  </div>
)

// ─── Halaman Ketersediaan Perangkat ───────────────────────────────────────────
export function PublicAvailabilityPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')

  const { data: devices, isLoading } = useQuery({
    queryKey: ['public-devices'],
    queryFn: () => deviceApi.publicList().then(r => r.data.data as Device[]),
    refetchInterval: 10000,
  })

  const filtered = filter === 'all' ? (devices ?? []) : (devices ?? []).filter(d => d.status === filter)
  const counts = {
    all: devices?.length ?? 0,
    available: devices?.filter(d => d.status === 'available').length ?? 0,
    booked: devices?.filter(d => d.status === 'booked').length ?? 0,
    in_use: devices?.filter(d => d.status === 'in_use').length ?? 0,
  }

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Ketersediaan perangkat</h1>
          <p className="text-gray-500 text-sm">Status diperbarui otomatis setiap 10 detik</p>
        </div>

        {/* Summary pills */}
        <div className="flex justify-center gap-3 flex-wrap">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-medium text-green-700">{counts.available}</p>
            <p className="text-xs text-green-600">Tersedia</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-medium text-amber-700">{counts.in_use}</p>
            <p className="text-xs text-amber-600">Digunakan</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-medium text-blue-700">{counts.booked}</p>
            <p className="text-xs text-blue-600">Dibooking</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap justify-center">
          {(['all', 'available', 'in_use', 'booked'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}>
              {s === 'all' ? `Semua (${counts.all})` : `${deviceStatusLabel[s]} (${counts[s]})`}
            </button>
          ))}
        </div>

        {isLoading ? <Spinner className="py-20" /> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(device => (
              <div key={device.id} className={`rounded-2xl border-2 p-4 flex flex-col gap-3 ${deviceStatusCard[device.status]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.ps_type}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ring-1 ${deviceStatusBadge[device.status]}`}>
                    {deviceStatusLabel[device.status]}
                  </span>
                </div>
                {device.current_rate && (
                  <p className="text-xs text-gray-600">{formatRupiah(device.current_rate.price_per_hour)} / jam</p>
                )}
                {device.status === 'available' && (
                  <Button size="sm" variant="primary" className="w-full"
                    onClick={() => navigate(`/booking/baru?device=${device.id}`)}>
                    Booking sekarang
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Button variant="secondary" onClick={() => navigate('/booking/baru')}>
            Lihat jadwal & booking →
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}

// ─── Halaman Jadwal ───────────────────────────────────────────────────────────
export function PublicSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  const { data: devices } = useQuery({
    queryKey: ['public-devices'],
    queryFn: () => deviceApi.publicList().then(r => r.data.data as Device[]),
  })

  // Jadwal per perangkat
  const DeviceSchedule = ({ device }: { device: Device }) => {
    const { data: schedule } = useQuery({
      queryKey: ['schedule', device.id, selectedDate],
      queryFn: () => deviceApi.schedule(device.id, selectedDate).then(r => r.data.data as { start_time: string; end_time: string; status: string }[]),
    })

    // Generate slot 08:00 – 23:00
    const slots = Array.from({ length: 15 }, (_, i) => {
      const hour = i + 8
      const timeStr = `${String(hour).padStart(2, '0')}:00`
      const isBooked = schedule?.some(s =>
        formatTime(s.start_time) <= timeStr && formatTime(s.end_time) > timeStr
      )
      return { hour, timeStr, isBooked }
    })

    return (
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 text-sm">{device.name}</p>
            <p className="text-xs text-gray-400">{device.ps_type}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ring-1 ${deviceStatusBadge[device.status]}`}>
            {deviceStatusLabel[device.status]}
          </span>
        </div>
        <div className="p-3 flex flex-wrap gap-1.5">
          {slots.map(slot => (
            <div key={slot.hour}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${slot.isBooked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-700'
                }`}>
              {slot.timeStr}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 inline-block"></span>Tersedia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 inline-block"></span>Dibooking
          </span>
        </div>
      </div>
    )
  }

  return (
    <PublicLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Jadwal perangkat</h1>
          <p className="text-sm text-gray-500">Lihat slot yang sudah dibooking sebelum melakukan reservasi</p>
        </div>

        <div className="flex justify-center">
          <Field label="Pilih tanggal">
            <Input type="date" value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices?.map(d => <DeviceSchedule key={d.id} device={d} />)}
        </div>
      </div>
    </PublicLayout>
  )
}

// ─── Halaman Form Booking ─────────────────────────────────────────────────────
export function PublicBookingFormPage() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const preselectedDevice = params.get('device')

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [deviceId, setDeviceId] = useState(preselectedDevice ?? '')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dpProof, setDpProof] = useState<File | null>(null)
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')

  const { data: devices } = useQuery({
    queryKey: ['public-devices'],
    queryFn: () => deviceApi.publicList().then(r => r.data.data as Device[]),
  })

  const selectedDevice = devices?.find(d => d.id === Number(deviceId))

  // Hitung estimasi biaya
  const durationMinutes = startTime && endTime
    ? Math.max(0, (new Date(`2000-01-01 ${endTime}`).getTime() - new Date(`2000-01-01 ${startTime}`).getTime()) / 60000)
    : 0
  const estimatedCost = selectedDevice?.current_rate
    ? Math.round((durationMinutes / 60) * selectedDevice.current_rate.price_per_hour)
    : 0
  const dpAmount = Math.round(estimatedCost / 2)

  const mutation = useMutation({
    mutationFn: async () => {
      // Buat atau cari customer dulu (simplified — di implementasi nyata ada endpoint register customer)
      const formData = new FormData()
      formData.append('device_id', deviceId)
      formData.append('customer_id', '1') // TODO: replace dengan customer yang login/dibuat
      formData.append('booking_date', bookingDate)
      formData.append('start_time', startTime)
      formData.append('end_time', endTime)
      if (dpProof) formData.append('dp_proof', dpProof)
      // Gunakan axios dengan multipart
      const { default: api } = await import('../../api')
      return api.post('/public/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res) => {
      setCreatedBooking(res.data.data)
      setStep(3)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Terjadi kesalahan, coba lagi.')
    }
  })

  // Step 3 - Sukses
  if (step === 3 && createdBooking) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
          <div>
            <h1 className="text-xl font-medium text-gray-900 mb-2">Booking berhasil dikirim!</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bukti DP kamu sudah diterima. Kasir akan memverifikasi dalam <strong>1 jam</strong>.
              Kamu akan mendapat konfirmasi setelah DP terverifikasi.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 w-full text-sm text-left flex flex-col gap-2">
            <div className="flex justify-between text-gray-600">
              <span>ID Booking</span><span className="font-medium">#{createdBooking.id}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Perangkat</span><span className="font-medium">{selectedDevice?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tanggal</span><span className="font-medium">{formatDate(createdBooking.booking_date)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Waktu</span>
              <span className="font-medium">{formatTime(createdBooking.start_time)} – {formatTime(createdBooking.end_time)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>DP yang dibayar</span>
              <span className="font-medium text-green-700">{formatRupiah(createdBooking.dp_amount)}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/booking/${createdBooking.id}`)}>
            Pantau status booking →
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900 mb-1">Booking perangkat</h1>
          <p className="text-sm text-gray-500">Isi form di bawah untuk melakukan reservasi</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step >= s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
              <span className={`text-xs ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Pilih waktu' : 'Data & pembayaran'}
              </span>
              {s < 2 && <span className="text-gray-200 mx-1">──</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Pilih perangkat">
              <Select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
                <option value="">— Pilih perangkat —</option>
                {devices?.filter(d => d.status === 'available' || d.status === 'booked').map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.ps_type}) — {d.current_rate ? formatRupiah(d.current_rate.price_per_hour) + '/jam' : 'Tarif tidak tersedia'}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Tanggal bermain">
              <Input type="date" value={bookingDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setBookingDate(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jam mulai">
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </Field>
              <Field label="Jam selesai">
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} min={startTime} />
              </Field>
            </div>

            {durationMinutes > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                <div className="flex justify-between text-blue-700 mb-1">
                  <span>Durasi</span>
                  <span className="font-medium">{Math.floor(durationMinutes / 60)} jam {durationMinutes % 60} menit</span>
                </div>
                <div className="flex justify-between text-blue-700 mb-1">
                  <span>Est. total</span>
                  <span className="font-medium">{formatRupiah(estimatedCost)}</span>
                </div>
                <div className="flex justify-between text-blue-900 font-medium border-t border-blue-200 pt-1 mt-1">
                  <span>DP yang harus dibayar (50%)</span>
                  <span>{formatRupiah(dpAmount)}</span>
                </div>
              </div>
            )}

            <Button
              variant="primary" size="lg" className="w-full"
              disabled={!deviceId || !bookingDate || !startTime || !endTime || durationMinutes <= 0}
              onClick={() => setStep(2)}
            >
              Lanjutkan →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 flex flex-col gap-1">
              <p className="font-medium text-gray-900">{selectedDevice?.name}</p>
              <p>{formatDate(bookingDate)}, {startTime} – {endTime}</p>
              <p className="text-green-700 font-medium">DP: {formatRupiah(dpAmount)}</p>
            </div>

            <Field label="Nama lengkap">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama sesuai identitas" />
            </Field>
            <Field label="Nomor HP">
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
            </Field>
            <Field label="Email (opsional)" hint="Untuk menerima konfirmasi booking">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            </Field>

            <Field
              label={`Bukti transfer DP (${formatRupiah(dpAmount)})`}
              hint="Format JPG, PNG, atau PDF. Maks 2MB."
            >
              <input
                type="file" accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setDpProof(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-xs file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50 cursor-pointer"
              />
            </Field>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>← Kembali</Button>
              <Button
                variant="primary" className="flex-1"
                disabled={!name || !phone || !dpProof}
                loading={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Kirim booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

// ─── Halaman Status Booking ───────────────────────────────────────────────────
export function PublicBookingStatusPage() {
  const { id } = useParams<{ id: string }>()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-public', id],
    queryFn: () => bookingApi.list({ id }).then(r => r.data.data?.[0] as Booking),
    enabled: !!id,
    refetchInterval: 30000,
  })

  if (isLoading) return <PublicLayout><Spinner className="py-20" /></PublicLayout>
  if (!booking) return (
    <PublicLayout>
      <EmptyState icon="❓" title="Booking tidak ditemukan" description="Periksa kembali ID booking kamu" />
    </PublicLayout>
  )

  const statusMessages: Record<string, string> = {
    pending: 'Bukti DP kamu sedang menunggu verifikasi dari kasir. Biasanya selesai dalam 1 jam.',
    confirmed: 'Booking dikonfirmasi! Datang sesuai jadwal ya.',
    in_use: 'Sesi sedang berlangsung.',
    completed: 'Sesi telah selesai. Terima kasih sudah bermain!',
    rejected: 'Booking ditolak oleh kasir.',
    cancelled: 'Booking dibatalkan.',
    expired: 'Booking kedaluwarsa karena DP tidak terverifikasi dalam 1 jam.',
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <h1 className="text-xl font-medium text-gray-900">Status booking #{booking.id}</h1>

        <div className={`rounded-2xl p-4 ${bookingStatusBadge[booking.status].replace('bg-', 'bg-').replace('text-', '')}`}>
          <Badge label={bookingStatusLabel[booking.status]} className={bookingStatusBadge[booking.status]} />
          <p className="text-sm mt-2 text-gray-600">{statusMessages[booking.status]}</p>
          {booking.cancel_reason && (
            <p className="text-sm mt-1 text-red-600">Alasan: {booking.cancel_reason}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Perangkat</span><span className="font-medium">{booking.device?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tanggal</span><span className="font-medium">{formatDate(booking.booking_date)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Waktu</span>
            <span className="font-medium">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Est. biaya</span><span className="font-medium">{formatRupiah(booking.estimated_cost)}</span>
          </div>
          <div className="flex justify-between text-green-700 border-t border-gray-200 pt-3">
            <span>DP dibayar</span><span className="font-medium">{formatRupiah(booking.dp_amount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Sisa yang dibayar saat datang</span>
            <span className="font-medium">{formatRupiah(Math.max(0, booking.estimated_cost - booking.dp_amount))}</span>
          </div>
        </div>

        {booking.status === 'confirmed' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            ⏰ <strong>Penting:</strong> Hadir tepat waktu. Jika kamu terlambat lebih dari 15 menit,
            booking akan dibatalkan otomatis dan DP tidak dikembalikan.
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export default PublicAvailabilityPage
