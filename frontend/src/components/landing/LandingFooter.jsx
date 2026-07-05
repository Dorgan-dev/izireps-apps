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
    <footer className="border-t border-base-300 bg-base-100 backdrop-blur-md shadow-sm">
      {/* Main footer content */}
<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    {/* Menggunakan grid fleksibel: 1 kolom di mobile untuk struktur utama, lalu membagi layout di layar besar */}
    <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-12">
      
      {/* Brand - Tetap di atas pada mobile, lebar penuh */}
      <div className="w-full lg:max-w-xs">
        <a href="#beranda" className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
            <Gamepad2 size={16} />
          </div>
          <span className="text-base font-bold text-base-content">
            iZi<span className="text-primary">Reps</span>
          </span>
        </a>
        <p className="mb-4 max-w-sm text-sm leading-relaxed text-base-content/70">
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

      {/* Links - Disusun MENYAMPING (2 kolom) khusus di mobile agar ringkas */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:gap-16">
        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} className="min-w-[120px]">
            <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-base-content/40">
              {group}
            </h4>
            <ul className="space-y-2">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-xs sm:text-sm text-base-content/80 transition-colors hover:text-primary block py-0.5">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  </div>

      {/* Bottom bar */}
      <div className="border-t border-base-300 bg-base-100/30">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-base-content/50">
            © {new Date().getFullYear()} iZiReps. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
