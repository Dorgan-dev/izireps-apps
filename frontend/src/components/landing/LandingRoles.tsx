import { useNavigate } from 'react-router-dom';
import { Crown, UserCheck, Check } from 'lucide-react';
import { OWNER_FEATURES, CASHIER_FEATURES } from './data';
import SectionHeader from './SectionHeader';

export default function LandingRoles() {
  const navigate = useNavigate();

  return (
    <section id="role" className="py-20 px-6 border-t border-gray-800">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          label="Akses Pengguna"
          title="Dua role, satu sistem"
          sub="Setiap role mendapatkan tampilan dan akses yang sesuai tugasnya."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Owner card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="inline-flex items-center gap-1.5 bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <Crown size={11} /> Owner
            </div>
            <h3 className="text-base font-semibold text-white mb-4">Kontrol penuh bisnis</h3>
            <ul className="space-y-2.5">
              {OWNER_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Masuk sebagai owner
            </button>
          </div>

          {/* Cashier card */}
          <div className="bg-gray-900 border border-emerald-900 rounded-xl p-6">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <UserCheck size={11} /> Kasir
            </div>
            <h3 className="text-base font-semibold text-white mb-4">Operasional harian</h3>
            <ul className="space-y-2.5">
              {CASHIER_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Masuk sebagai kasir
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
