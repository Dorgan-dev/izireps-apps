import { useNavigate } from 'react-router-dom';

export default function LandingCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-6 border-t border-gray-800 bg-gray-900/40 text-center">
      <h2 className="text-2xl font-bold text-white mb-3">Siap mengelola rental PS kamu?</h2>
      <p className="text-gray-400 text-sm mb-8">Masuk ke sistem sekarang dan mulai kelola operasional lebih rapi.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate('/login')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-sm"
        >
          Masuk sebagai staf
        </button>
        <button
          onClick={() => navigate('/booking')}
          className="border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium px-8 py-3.5 rounded-xl transition-colors text-sm"
        >
          Halaman pelanggan ↗
        </button>
      </div>
    </section>
  );
}
