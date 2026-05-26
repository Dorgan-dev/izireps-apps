import { STEPS } from './data';
import SectionHeader from './SectionHeader';
import { ArrowRight } from 'lucide-react';

export default function LandingWorkflow() {
  return (
    <section
      id="tentang"
      className="bg-white py-16 dark:bg-gray-900 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* About blurb */}
        <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-500">
              Tentang Kami
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
              Platform billing rental PS yang modern
            </h2>
            <p className="mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
              iZiReps lahir dari kebutuhan nyata para pelaku usaha rental PlayStation yang
              ingin mengelola operasional harian dengan lebih terstruktur, cepat, dan
              efisien—tanpa perlu keahlian teknis khusus.
            </p>
            <p className="leading-relaxed text-gray-500 dark:text-gray-400">
              Kami menyediakan solusi all-in-one: dari sesi gaming real-time, booking
              online dengan DP, hingga integrasi FnB dan laporan pendapatan harian.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '3 Tahun', label: 'Pengalaman di industri rental PS' },
              { num: '200+', label: 'Pelanggan puas di seluruh Indonesia' },
              { num: '24/7', label: 'Dukungan teknis siap membantu' },
              { num: 'Gratis', label: 'Uji coba tanpa kartu kredit' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-2xl font-bold text-brand-500">{item.num}</p>
                <p className="mt-1 text-xs leading-snug text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow steps */}
        <SectionHeader
          label="Alur Kerja"
          title="Dari booking sampai selesai"
          sub="Proses sederhana yang mudah diikuti kasir setiap harinya."
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-start sm:flex-col sm:items-center">
              <div className="relative flex flex-col sm:flex-row sm:items-center">
                <div className="flex flex-col items-center sm:items-center sm:w-36 sm:px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white shadow-theme-sm">
                    {step.num}
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight
                  size={16}
                  className="mx-2 mt-2.5 hidden shrink-0 text-gray-300 dark:text-gray-700 sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
