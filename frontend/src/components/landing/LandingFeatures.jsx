import { FEATURES } from "./data";
import SectionHeader from "./SectionHeader";

export default function LandingFeatures() {
  return (
    <section id="fitur" className="bg-base-200 py-16 sm:py-20">
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
              className="group rounded-2xl border border-base-300 bg-base-100 p-5 shadow-theme-xs transition-all hover:-translate-y-0.5 hover:shadow-theme-sm"
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={18} className={text} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-base-content">
                {title}
              </h3>
              <p className="text-xs leading-relaxed text-base-content/70">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
