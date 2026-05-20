import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import DevicePreview from './DevicePreview';

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-16 px-6 text-center">
      <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
        <Gamepad2 size={13} />
        Khusus untuk bisnis rental PlayStation
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-xl mx-auto mb-5">
        Kelola rental PS kamu dengan{' '}
        <span className="text-emerald-400">lebih efisien</span>
      </h1>

      <p className="text-gray-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
        Sistem billing berbasis web untuk mengontrol sesi gaming, booking, FnB, dan laporan pendapatan dari satu dasbor.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate('/login')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-7 py-3 rounded-xl transition-colors text-sm"
        >
          Mulai sekarang
        </button>
        <a
          href="#fitur"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-medium px-7 py-3 rounded-xl transition-colors text-sm"
        >
          Lihat fitur
        </a>
      </div>

      <DevicePreview />
    </section>
  );
}
