import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Menu, X, Calendar, CalendarCheck } from 'lucide-react';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Kontak', href: '#kontak' },
  { label: 'Lihat Jadwal', href: '#jadwal' },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-99999 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#beranda" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <Gamepad2 size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            iZi<span className="text-brand-500">Reps</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggleButton />
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07]"
          >
            <Calendar size={15} />
            Lihat Jadwal
          </button>
          <button
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <CalendarCheck size={15} />
            Mulai Booking
          </button>
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggleButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                onClick={() => { navigate('/booking'); setMobileOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <Calendar size={15} />
                Lihat Jadwal
              </button>
              <button
                onClick={() => { navigate('/booking'); setMobileOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <CalendarCheck size={15} />
                Mulai Booking
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
