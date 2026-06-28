import { Gamepad2, Globe } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

const FOOTER_LINKS = {
  Navigasi: [
    { label: "Beranda", href: "/" },
    { label: "Tentang Kami", href: "/about" },
    { label: "Lihat Jadwal", href: "/schedule" },
    { label: "Ulasan", href: "" },
  ],
  Layanan: [
    { label: "Booking Online" },
    { label: "Sesi Walk-in" },
  ],
};

const phoneNumber = "628988182167";
const message = encodeURIComponent(
  "Halo iZiReps, saya mau tanya tentang booking PS.",
);

const SOCIAL = [
  { icon: Globe, label: "Website", href: "/" },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    href: `https://wa.me/${phoneNumber}?text=${message}`,
  },
  {
    icon: FaInstagram,
    label: "Telepon",
    href: "https://www.instagram.com/izi.playstation/",
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200/80 backdrop-blur-md shadow-sm">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="#beranda" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
                <Gamepad2 size={16} />
              </div>
              <span className="text-base font-bold text-base-content">
                iZi<span className="text-primary">Reps</span>
              </span>
            </a>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-base-content/70">
              Sistem reservasi PlayStation berbasis web untuk mengelola
              sesi gaming, booking, dan FnB dalam satu platform.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-base-300
                text-base-content/70 transition-colors hover:border-primary hover:bg-primary hover:text-primary-content">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-base-content/50">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-base-content/80 transition-colors hover:text-primary">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-300 bg-base-300/30">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-base-content/50">
            © {new Date().getFullYear()} iZiReps. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
