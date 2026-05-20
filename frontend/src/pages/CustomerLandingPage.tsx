import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, CalendarCheck, Search, Clock, ChevronDown,
  CheckCircle, XCircle, AlertCircle, Phone, Mail,
  ArrowRight, Menu, X, Monitor, Utensils, Zap
} from 'lucide-react';
import { bookingsApi, devicesApi, customersApi } from '../services/api';
import type { Booking, Device } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending:   { label: 'Menunggu konfirmasi', color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-50 dark:bg-warning-500/10', icon: AlertCircle },
  confirmed: { label: 'Dikonfirmasi',        color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-500/10', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan',          color: 'text-error-600 dark:text-error-400',   bg: 'bg-error-50 dark:bg-error-500/10',   icon: XCircle },
  completed: { label: 'Selesai',             color: 'text-gray-500 dark:text-gray-400',      bg: 'bg-gray-100 dark:bg-gray-700/30',    icon: CheckCircle },
  expired:   { label: 'Kedaluwarsa',         color: 'text-gray-500 dark:text-gray-400',      bg: 'bg-gray-100 dark:bg-gray-700/30',    icon: XCircle },
} as const;

// ─── Section: Navbar ──────────────────────────────────────────────────────────

function Navbar({ onBooking, onCekStatus }: { onBooking: () => void; onCekStatus: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-dark border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Gamepad2 size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">
              PS<span className="text-brand-500">Rental</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <a href="#perangkat" className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
              Perangkat
            </a>
            <a href="#cara-booking" className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
              Cara Booking
            </a>
            <button
              onClick={onCekStatus}
              className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cek Status
            </button>
            <button
              onClick={onBooking}
              className="ml-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              Booking Sekarang
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden py-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <a href="#perangkat" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">Perangkat</a>
            <a href="#cara-booking" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">Cara Booking</a>
            <button onClick={() => { setOpen(false); onCekStatus(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">Cek Status Booking</button>
            <button onClick={() => { setOpen(false); onBooking(); }} className="w-full mt-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium">Booking Sekarang</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

function Hero({ onBooking, onCekStatus }: { onBooking: () => void; onCekStatus: () => void }) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 text-center bg-white dark:bg-gray-dark">
      <div className="max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Buka setiap hari · 09.00 – 23.00
        </span>

        <h1 className="text-title-md sm:text-title-lg font-semibold text-gray-900 dark:text-white leading-tight mb-4 font-outfit">
          Booking PlayStation,{' '}
          <span className="text-brand-500">lebih mudah</span>
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto">
          Pesan sesi gaming PS3, PS4, atau PS5 favoritmu sekarang. Tanpa antri, langsung konfirmasi.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onBooking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors"
          >
            <CalendarCheck size={18} /> Booking Sekarang
          </button>
          <button
            onClick={onCekStatus}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors"
          >
            <Search size={18} /> Cek Status Booking
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Device list ─────────────────────────────────────────────────────

const STATUS_DEVICE: Record<string, { label: string; dot: string }> = {
  available:   { label: 'Tersedia',    dot: 'bg-success-500' },
  in_use:      { label: 'Digunakan',   dot: 'bg-brand-500' },
  processing:  { label: 'Diproses',    dot: 'bg-warning-500' },
  maintenance: { label: 'Maintenance', dot: 'bg-error-500' },
};

function DeviceSection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devicesApi.list()
      .then(r => setDevices(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="perangkat" className="py-14 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-brand-500 uppercase tracking-widest mb-2">Perangkat</p>
          <h2 className="text-title-sm font-semibold text-gray-900 dark:text-white font-outfit">Status perangkat saat ini</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Diperbarui secara otomatis</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {devices.map(d => {
              const st = STATUS_DEVICE[d.status] ?? STATUS_DEVICE.maintenance;
              const avail = d.status === 'available';
              return (
                <div
                  key={d.id}
                  className={`rounded-2xl p-4 border transition-colors
                    ${avail
                      ? 'bg-white dark:bg-gray-dark border-success-200 dark:border-success-500/20'
                      : 'bg-white dark:bg-gray-dark border-gray-200 dark:border-gray-800'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Monitor size={18} className={avail ? 'text-success-500' : 'text-gray-400 dark:text-gray-600'} />
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full
                      ${avail
                        ? 'bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{d.ps_type}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-5 mt-8">
          {Object.values(STATUS_DEVICE).map(s => (
            <div key={s.label} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: How to book ─────────────────────────────────────────────────────

const STEPS = [
  { icon: CalendarCheck, title: 'Isi form booking',   desc: 'Pilih perangkat, tanggal, jam, dan durasi yang kamu inginkan.' },
  { icon: Phone,         title: 'Bayar DP',           desc: 'Transfer setengah dari total biaya ke rekening kami, lalu upload bukti transfer.' },
  { icon: CheckCircle,   title: 'Tunggu konfirmasi',  desc: 'Kasir akan memverifikasi DP dan mengkonfirmasi booking kamu.' },
  { icon: Gamepad2,      title: 'Main!',              desc: 'Datang sesuai jadwal dan nikmati sesi gaming-mu.' },
];

function HowToBook({ onBooking }: { onBooking: () => void }) {
  return (
    <section id="cara-booking" className="py-14 px-4 sm:px-6 bg-white dark:bg-gray-dark border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium text-brand-500 uppercase tracking-widest mb-2">Cara Booking</p>
          <h2 className="text-title-sm font-semibold text-gray-900 dark:text-white font-outfit">4 langkah mudah</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="relative p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <s.icon size={18} className="text-brand-500" />
                </div>
                <span className="text-2xl font-bold text-gray-200 dark:text-gray-700">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBooking}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors text-sm"
          >
            Mulai booking <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Booking Form ────────────────────────────────────────────────────

interface BookingFormData {
  name: string; phone: string; email: string;
  device_id: string; booking_date: string;
  start_time: string; duration: string;
  dp_proof_file: File | null;
}

function BookingForm({ id }: { id: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<BookingFormData>({
    name: '', phone: '', email: '', device_id: '',
    booking_date: '', start_time: '09:00', duration: '60',
    dp_proof_file: null,
  });
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);

  useEffect(() => {
    devicesApi.list().then(r => setDevices(r.data.data.filter(d => d.status === 'available')));
  }, []);

  const set = (k: keyof BookingFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedDevice = devices.find(d => String(d.id) === form.device_id);

  // Estimate cost (client-side, kasir yang final)
  const durationMins = Number(form.duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // 1. Register / find customer
      let customer;
      try {
        const reg = await customersApi.register({ name: form.name, phone: form.phone, email: form.email || undefined });
        customer = reg.data.data;
      } catch {
        // Customer mungkin sudah terdaftar — coba cari via list
        const list = await customersApi.list({ search: form.phone });
        customer = list.data.data?.[0];
        if (!customer) throw new Error('Gagal mendapatkan data pelanggan.');
      }

      // Hitung end_time
      const [h, m] = form.start_time.split(':').map(Number);
      const totalMin = h * 60 + m + durationMins;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      const end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // 2. Create booking
      const res = await bookingsApi.create({
        device_id:        Number(form.device_id),
        customer_id:      customer.id,
        booking_date:     form.booking_date,
        start_time:       form.start_time + ':00',
        end_time:         end_time + ':00',
        duration_minutes: durationMins,
        dp_amount:        0, // backend hitung dari tarif
        estimated_cost:   0,
      });

      setBookingResult(res.data.data);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'success' && bookingResult) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-success-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Booking berhasil dikirim!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Silakan transfer DP ke rekening kami dan kirimkan bukti ke kasir.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Booking akan dikonfirmasi setelah DP terverifikasi.
        </p>
        <div className="inline-block bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-4 text-left text-sm space-y-2 mb-6">
          <div className="flex justify-between gap-8">
            <span className="text-gray-500">ID Booking</span>
            <span className="font-medium text-gray-900 dark:text-white">#{bookingResult.id}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-500">Perangkat</span>
            <span className="font-medium text-gray-900 dark:text-white">{selectedDevice?.name}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatDate(form.booking_date)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-500">Jam</span>
            <span className="font-medium text-gray-900 dark:text-white">{form.start_time}</span>
          </div>
        </div>
        <button onClick={() => { setStep('form'); setForm(f => ({ ...f, device_id: '', booking_date: '', dp_proof_file: null })); }}
          className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Buat booking baru
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Diri</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nama lengkap" required>
          <input required value={form.name} onChange={set('name')} placeholder="Budi Santoso"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors" />
        </Field>
        <Field label="No. HP / WhatsApp" required>
          <input required value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx"
            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors" />
        </Field>
      </div>
      <Field label="Email (opsional)">
        <input type="email" value={form.email} onChange={set('email')} placeholder="email@kamu.com"
          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors" />
      </Field>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Detail Booking</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Perangkat" required>
            <select required value={form.device_id} onChange={set('device_id')}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors">
              <option value="">Pilih perangkat</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.ps_type})</option>)}
            </select>
          </Field>
          <Field label="Tanggal booking" required>
            <input required type="date" value={form.booking_date} onChange={set('booking_date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors" />
          </Field>
          <Field label="Jam mulai" required>
            <input required type="time" value={form.start_time} onChange={set('start_time')}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors" />
          </Field>
          <Field label="Durasi" required>
            <select required value={form.duration} onChange={set('duration')}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors">
              {[30, 60, 90, 120, 180, 240].map(d => (
                <option key={d} value={d}>{d >= 60 ? `${d / 60} jam${d > 60 ? ` ${d % 60 > 0 ? d % 60 + ' menit' : ''}` : ''}` : `${d} menit`}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Info DP */}
      <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-brand-700 dark:text-brand-300 space-y-1">
            <p className="font-medium">Pembayaran DP</p>
            <p className="text-xs leading-relaxed">
              Setelah booking dikirim, transfer DP sebesar 50% dari total biaya ke rekening kami.
              Kirimkan bukti transfer via WhatsApp ke kasir. Booking akan dikonfirmasi setelah DP terverifikasi.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20 rounded-xl px-4 py-3 text-sm text-error-600 dark:text-error-400">
          {error}
        </div>
      )}

      <button type="submit" disabled={saving}
        className="w-full h-11 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saving ? 'Mengirim...' : 'Kirim Booking'}
      </button>
    </form>
  );
}

// ─── Section: Cek Status ──────────────────────────────────────────────────────

function CekStatus() {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      // Cari customer by phone, lalu ambil bookings-nya
      const custRes = await customersApi.list({ search: phone });
      const customer = custRes.data.data?.[0];
      if (!customer) {
        setBookings([]);
        setSearched(true);
        return;
      }
      const bRes = await customersApi.bookings(customer.id);
      setBookings(bRes.data.data ?? []);
      setSearched(true);
    } catch {
      setError('Gagal mencari data. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Masukkan nomor HP yang digunakan saat booking"
          className="flex-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-dark text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors"
        />
        <button type="submit" disabled={loading || !phone.trim()}
          className="px-4 h-10 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
          Cari
        </button>
      </form>

      {error && <p className="text-sm text-error-500">{error}</p>}

      {searched && bookings.length === 0 && (
        <div className="text-center py-10">
          <Search size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada booking ditemukan untuk nomor ini.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.slice(0, 5).map(b => {
            const st = STATUS_MAP[b.status] ?? STATUS_MAP.completed;
            const Icon = st.icon;
            return (
              <div key={b.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-dark">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.device?.name ?? `Perangkat #${b.device_id}`}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(b.booking_date)} · {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${st.bg} ${st.color}`}>
                    <Icon size={12} />
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {b.duration_minutes} menit</span>
                  <span>DP: {formatRupiah(b.dp_amount)}</span>
                  {b.cancel_reason && <span className="text-error-500 truncate">· {b.cancel_reason}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-400">
        {label}{required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Section: Two-panel (Booking + Cek Status) ────────────────────────────────

function MainPanel() {
  const [tab, setTab] = useState<'booking' | 'status'>('booking');

  return (
    <section id="booking" className="py-14 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex rounded-xl bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-800 p-1 mb-8">
          {[
            { key: 'booking', label: 'Booking Sekarang', icon: CalendarCheck },
            { key: 'status',  label: 'Cek Status',       icon: Search },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          {tab === 'booking' ? <BookingForm id="booking" /> : <CekStatus />}
        </div>
      </div>
    </section>
  );
}

// ─── Info strip ───────────────────────────────────────────────────────────────

const INFO = [
  { icon: Zap,      label: 'Konfirmasi cepat', desc: 'Booking dikonfirmasi dalam hitungan menit' },
  { icon: Utensils, label: 'Tersedia FnB',      desc: 'Pesan makanan & minuman langsung dari kasir' },
  { icon: Clock,    label: 'Buka setiap hari',  desc: 'Senin – Minggu, pukul 09.00 – 23.00' },
];

function InfoStrip() {
  return (
    <section className="py-12 px-4 sm:px-6 bg-white dark:bg-gray-dark border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {INFO.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Gamepad2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white font-outfit">
            PS<span className="text-brand-500">Rental</span>
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          Pertanyaan? Hubungi kami via WhatsApp atau datang langsung ke outlet.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} PSRental</p>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerLandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-dark font-outfit antialiased">
      <Navbar
        onBooking={() => scrollTo('booking')}
        onCekStatus={() => { scrollTo('booking'); }}
      />
      <Hero
        onBooking={() => scrollTo('booking')}
        onCekStatus={() => scrollTo('booking')}
      />
      <DeviceSection />
      <HowToBook onBooking={() => scrollTo('booking')} />
      <InfoStrip />
      <MainPanel />
      <Footer />
    </div>
  );
}
