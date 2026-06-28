import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

const DAISY_THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee",
  "winter", "dim", "nord", "sunset"
];

export default function PublicLayout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("customer-theme") || "cyberpunk";
  });

  useEffect(() => {
    localStorage.setItem("customer-theme", theme);
  }, [theme]);

  return (
    <div data-theme={theme} className="bg-base-100 text-base-content min-h-screen font-outfit transition-colors duration-300">
      {/* Navbar menetap di atas */}
      <LandingNavbar theme={theme} setTheme={setTheme} themes={DAISY_THEMES} />

      {/* Konten halaman yang berubah sesuai rute */}
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <Outlet />
      </div>

      {/* Footer menetap di bawah */}
      <LandingFooter />
    </div>
  );
}
