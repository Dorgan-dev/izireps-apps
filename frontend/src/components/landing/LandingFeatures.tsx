import { FEATURES } from './data';
import SectionHeader from './SectionHeader';

export default function LandingFeatures() {
  return (
    <section id="fitur" className="py-20 px-6 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          label="Fitur Utama"
          title="Semua yang kamu butuhkan"
          sub="Dari manajemen sesi hingga laporan keuangan, semuanya tersedia dalam satu sistem."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
