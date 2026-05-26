import { useNavigate } from 'react-router-dom';
import { Tv2, Gamepad2, Monitor } from 'lucide-react';
import { DEVICES, statusConfig } from './data';
import SectionHeader from './SectionHeader';

const CONSOLE_TYPES = [
  {
    name: 'PlayStation 3',
    tag: 'PS3',
    icon: Monitor,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    desc: 'Koleksi klasik dengan ratusan judul ikonik.',
    price: 'Mulai Rp 5.000 / jam',
  },
  {
    name: 'PlayStation 4',
    tag: 'PS4',
    icon: Gamepad2,
    color: 'text-brand-500',
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    desc: 'Pilihan terpopuler dengan perpustakaan game terbesar.',
    price: 'Mulai Rp 8.000 / jam',
  },
  {
    name: 'PlayStation 5',
    tag: 'PS5',
    icon: Tv2,
    color: 'text-success-600 dark:text-success-400',
    bg: 'bg-success-50 dark:bg-success-950/40',
    desc: 'Pengalaman next-gen dengan grafis dan loading ultra cepat.',
    price: 'Mulai Rp 15.000 / jam',
  },
];

export default function LandingRoles() {
  const navigate = useNavigate();

  return (
    <section
      id="jadwal"
      className="bg-gray-50 py-16 dark:bg-gray-950 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Console type cards */}
        <SectionHeader
          label="Konsol Tersedia"
          title="Pilih konsol favoritmu"
          sub="Kami menyediakan tiga generasi konsol PlayStation untuk memenuhi selera gaming kamu."
        />

        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CONSOLE_TYPES.map(({ name, tag, icon: Icon, color, bg, desc, price }) => (
            <div
              key={tag}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs transition-all hover:-translate-y-1 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${color}`}>
                {tag}
              </span>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                {name}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {desc}
              </p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{price}</p>
              <button
                onClick={() => navigate('/booking')}
                className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07]"
              >
                Booking sekarang
              </button>
            </div>
          ))}
        </div>

        {/* Live device grid */}
        <SectionHeader
          label="Status Perangkat"
          title="Ketersediaan unit real-time"
          sub="Cek ketersediaan unit secara langsung sebelum datang ke tempat."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {DEVICES.map((d) => {
            const cfg = statusConfig[d.status];
            return (
              <div
                key={d.name}
                className={`rounded-2xl border bg-white p-4 text-center shadow-theme-xs dark:bg-gray-900 ${cfg.border}`}
              >
                <div className="mb-2 text-2xl">
                  {d.status === 'maintenance' ? '🔧' : d.type === 'PS5' ? '🎮' : '🕹️'}
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {d.name}
                </p>
                <span
                  className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${cfg.badgeBg} ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
