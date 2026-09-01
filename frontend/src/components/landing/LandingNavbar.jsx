import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Gamepad2, Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
  { label: "Perangkat", href: "/devices" },
  { label: "Lihat Jadwal", href: "/schedule" },
];

export default function LandingNavbar({ theme, setTheme, themes }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token } = useAuthStore();
  const isAuthenticated = !!token;
  
  const menuRef = useRef(null);

  // Menutup menu mobile jika diklik di luar header
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  const ThemeDropdown = () => (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-sm btn-ghost m-1">Theme ▾</div>
      <ul tabIndex={0} className="dropdown-content bg-base-200 text-base-content z-[100] p-2 shadow-2xl rounded-box w-52 max-h-60 overflow-y-auto">
        {themes?.map((t) => (
          <li key={t}>
            <button
              className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-base-300 ${theme === t ? 'font-bold bg-base-300' : ''}`}
              onClick={() => {
                setTheme(t);
                // Menghapus fokus dari tombol supaya dropdown daisyUI otomatis tertutup
                document.activeElement.blur();
              }}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-md shadow-sm" ref={menuRef}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm text-primary-content">
            <Gamepad2 size={16} />
          </div>
          <span className="text-base font-bold text-base-content tracking-tight">
            iZi<span className="text-primary">Reps</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? location.pathname === "/" : location.pathname.startsWith(link.href);
            return (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-base-200 hover:text-base-content ${
                  isActive ? "bg-base-200 text-base-content shadow-sm ring-1 ring-base-300" : "text-base-content/80"
                }`}>
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeDropdown />
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/register")}
                className="btn btn-sm btn-outline btn-primary">
                Daftar
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-sm btn-primary shadow-sm"
              >
                Masuk
              </button>
            </>
          ) : (<></>)}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeDropdown />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-sm btn-ghost"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full border-t border-base-300 bg-base-100/95 px-4 pb-4 pt-2 shadow-lg backdrop-blur-md lg:hidden z-50">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? location.pathname === "/" : location.pathname.startsWith(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-base-200 hover:text-base-content ${
                    isActive ? "bg-base-200 text-base-content shadow-sm ring-1 ring-base-300" : "text-base-content/80"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            
            <div className="mt-2 flex flex-col gap-2 border-t border-base-300 pt-3">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/register"); }}
                    className="btn btn-outline btn-primary"
                  >
                    Daftar
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/login"); }}
                    className="btn btn-primary"
                  >
                    Masuk
                  </button>
                </>
              ) : (<></>)}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
