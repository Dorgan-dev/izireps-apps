import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import { FiPlayCircle } from "react-icons/fi";
import { TbLayoutDashboard, TbCalendarEvent, TbReceipt, TbCoffee, TbDeviceDesktopQuestion,
  TbTrendingUp, TbDeviceGamepad, TbBasket, TbUserCog, TbSettings } from "react-icons/tb";
import { HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";

// ==========================================
// DATA MENU KASIR (CASHIER)
// ==========================================
const cashierMenu = [
  {
    title: "Main",
    type: "main",
    items: [
      {
        icon: <TbLayoutDashboard className="size-5" />,
        name: "Dasbor",
        path: "/cashier",
      },
      {
        icon: <FiPlayCircle className="size-5" />,
        name: "Sesi Bermain",
        path: "/cashier/sessions",
        badge: "3",
      },
    ],
  },
  {
    title: "Order",
    type: "order",
    items: [
      {
        icon: <TbCalendarEvent className="size-5" />,
        name: "Booking",
        path: "/cashier/bookings",
        badge: "2",
      },
    ],
  },
  {
    title: "Transactions",
    type: "transactions",
    items: [
      {
        icon: <TbReceipt className="size-5" />,
        name: "Transaksi",
        path: "/cashier/transactions",
      },
      {
        icon: <TbCoffee className="size-5" />,
        name: "Kelola Jajanan",
        path: "/cashier/fnb",
      },
    ],
  },
  {
    title: "", // Tanpa judul teks, langsung pembatas line atas
    type: "other",
    hasTopSeparator: true,
    items: [
      {
        icon: <TbDeviceDesktopQuestion className="size-5" />,
        name: "Status Perangkat",
        path: "/cashier/devices",
      },
    ],
  },
];

// ==========================================
// DATA MENU PEMILIK (OWNER)
// ==========================================
const ownerMenu = [
  {
    title: "Main",
    type: "main",
    items: [
      {
        icon: <TbLayoutDashboard className="size-5" />,
        name: "Dasbor",
        path: "/owner",
      },
    ],
  },
  {
    title: "Reports",
    type: "reports",
    items: [
      {
        icon: <TbTrendingUp className="size-5" />,
        name: "Laporan",
        path: "/owner/reports",
      },
    ],
  },
  {
    title: "Management",
    type: "management",
    items: [
      {
        icon: <TbDeviceGamepad className="size-5" />,
        name: "Kelola Perangkat",
        path: "/owner/devices",
      },
      {
        icon: <TbBasket className="size-5" />,
        name: "Kelola Jajanan",
        path: "/owner/fnb",
      },
      {
        icon: <TbUserCog className="size-5" />,
        name: "Kelola Kasir",
        path: "/owner/cashiers",
      },
      {
        icon: <TbSettings className="size-5" />,
        name: "Pengaturan",
        path: "/owner/settings",
      },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // Otomatis deteksi menu berdasarkan path URL awal
  const isOwner = location.pathname.startsWith("/owner");
  const currentMenu = isOwner ? ownerMenu : cashierMenu;

  // Fix: Ditambahkan location.search agar akurat membaca parameter query (?tab=...) milik menu Owner
  const isActive = useCallback(
    (path) => {
      // Exact match or starts-with (so /owner/reports stays active for all tabs)
      return location.pathname === path || location.pathname.startsWith(path + "/");
    },
    [location.pathname],
  );

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              className={`menu-item group cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                <span
                  className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {nav.badge && (isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5
                    text-xs font-medium text-white bg-blue-600 rounded-full">
                    {nav.badge}
                  </span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900
        dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`} onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Logo Section */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : ( <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} /> )}
        </Link>
      </div>

      {/* Navigation Menu Section */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {currentMenu.map((section) => (
              <div key={section.type} className={section.hasTopSeparator ? "pt-4 border-t border-gray-200 dark:border-gray-800" : ""}>
                {/* Header Judul Sekat */}
                {section.title ? (
                  <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400
                    ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                    {isExpanded || isHovered || isMobileOpen ? (section.title) : (<HorizontaLDots className="size-6" />)}
                  </h2>
                ) : (!section.title && // Jika judul kosong tapi statusnya sekat (seperti di bagian Other Device Status Kasir)
                  !isExpanded && !isHovered && (<HorizontaLDots className="mb-4 size-6 text-gray-400 lg:mx-auto" />))}
                {renderMenuItems(section.items, section.type)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;