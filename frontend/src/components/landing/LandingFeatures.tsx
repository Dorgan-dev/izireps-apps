import { FEATURES } from './data';
import SectionHeader from './SectionHeader';

export default function LandingFeatures() {
  return (
    <section
      id="fitur"
      className="bg-gray-50 py-16 dark:bg-gray-950 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Fitur Utama"
          title="Semua yang kamu butuhkan"
          sub="Dari manajemen sesi hingga laporan keuangan, semuanya tersedia dalam satu sistem yang mudah digunakan."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, bg, text, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all hover:-translate-y-0.5 hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={18} className={text} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
