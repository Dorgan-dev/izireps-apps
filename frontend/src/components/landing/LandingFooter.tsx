import { Gamepad2, Globe } from 'lucide-react';
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const FOOTER_LINKS = {
  Navigasi: [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Tentang Kami', href: '#tentang' },
    { label: 'Lihat Jadwal', href: '#jadwal' },
    { label: 'Ulasan', href: '#kontak' },
  ],
  Layanan: [
    { label: 'Booking Online', href: '/booking' },
    { label: 'Sesi Walk-in', href: '/booking' },
    { label: 'Paket FnB', href: '/booking' },
  ],
};

const phoneNumber = "628988182167";
const message = encodeURIComponent("Halo iZiReps, saya mau tanya tentang booking PS.");

const SOCIAL = [
  { icon: Globe, label: 'Website', href: '/' },
  { icon: FaWhatsapp, label: 'WhatsApp', href: `https://wa.me/${phoneNumber}?text=${message}` },
  { icon: FaInstagram, label: 'Telepon', href: 'https://www.instagram.com/izi.playstation/' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-md shadow-sm dark:border-gray-800 dark:bg-gray-900/80">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="#beranda" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
                <Gamepad2 size={16} className="text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                iZi<span className="text-brand-500">Reps</span>
              </span>
            </a>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Sistem billing rental PlayStation berbasis web untuk mengelola sesi
              gaming, booking, dan FnB dalam satu platform.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:bg-brand-950/50 dark:hover:text-brand-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-gray-600 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} iZiReps. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
