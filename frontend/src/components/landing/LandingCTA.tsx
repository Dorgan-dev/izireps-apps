import { useNavigate } from 'react-router-dom';
import { REVIEWS } from './data';
import SectionHeader from './SectionHeader';
import { Star, CalendarCheck, LogIn } from 'lucide-react';

export default function LandingCTA() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Reviews Section ── */}
      <section
        id="kontak"
        className="bg-white py-16 dark:bg-gray-900 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Ulasan Pelanggan"
            title="Dipercaya oleh banyak pelanggan"
            sub="Ini yang mereka rasakan setelah menggunakan layanan kami."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Stars */}
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < r.rating
                          ? 'fill-warning-400 text-warning-400'
                          : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                      }
                    />
                  ))}
                </div>
                {/* Quote */}
                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  "{r.comment}"
                </p>
                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {r.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gray-50 py-16 dark:bg-gray-950 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 sm:p-12">
            <span className="mb-4 inline-block rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-600 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-400">
              Siap mulai?
            </span>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Mulai booking sesi gaming sekarang
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Pesan unitmu secara online, bayar DP, dan tinggal datang bermain.
              Tidak perlu antri panjang lagi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/booking')}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-sm transition-colors hover:bg-brand-600"
              >
                <CalendarCheck size={16} />
                Mulai Booking
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07]"
              >
                <LogIn size={16} />
                Login Staf
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
