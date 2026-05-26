import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Gamepad2, ArrowRight } from 'lucide-react';
import DevicePreview from './DevicePreview';

const STATS = [
  { value: '50+', label: 'Unit PS Terdaftar' },
  { value: '1.200+', label: 'Sesi per Bulan' },
  { value: '99%', label: 'Uptime Sistem' },
];

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-white py-16 dark:bg-gray-900 sm:py-20 lg:py-28"
    >
      {/* Subtle radial gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(70,95,255,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-600 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-400">
            <Gamepad2 size={13} />
            Khusus untuk bisnis rental PlayStation
          </div>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-3xl text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Kelola rental PS kamu{' '}
          <span className="text-brand-500">lebih efisien</span>
        </h1>

        {/* Sub */}
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg">
          Sistem billing berbasis web untuk mengontrol sesi gaming, booking, FnB,
          dan laporan pendapatan dari satu dasbor terpadu.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-sm transition-colors hover:bg-brand-600"
          >
            <CalendarCheck size={16} />
            Mulai Booking
          </button>
          <a
            href="#jadwal"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-theme-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07]"
          >
            Lihat Jadwal
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Device Preview */}
        <DevicePreview />
      </div>
    </section>
  );
}
