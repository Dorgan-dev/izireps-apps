import { useNavigate } from 'react-router-dom';

export default function LandingNavbar() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">
          PS<span className="text-emerald-400">Rental</span>
        </span>
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
          <a href="#alur" className="hover:text-white transition-colors">Alur kerja</a>
          <a href="#role" className="hover:text-white transition-colors">Role</a>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Masuk ke Aplikasi
        </button>
      </div>
    </nav>
  );
}
