import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { FiPlayCircle } from "react-icons/fi";
import {
  TbLayoutDashboard,
  TbCalendarEvent,
  TbReceipt,
  TbCoffee,
  TbDeviceDesktopQuestion,
  TbTrendingUp,
  TbDeviceGamepad2,
  TbUsers,
  TbDeviceGamepad,
  TbBasket,
  TbUserCog,
  TbSettings,
} from "react-icons/tb";

import { ChevronDownIcon, HorizontaLDots } from "../icons";
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
        name: "Dashboard",
        path: "/cashier",
      },
      {
        icon: <FiPlayCircle className="size-5" />,
        name: "Play Sessions",
        path: "/cashier/sessions",
        badge: "3",
      },
    ],
  },
  {
    title: "Bookings",
    type: "booking",
    items: [
      {
        icon: <TbCalendarEvent className="size-5" />,
        name: "Bookings",
        path: "/cashier/bookings",
        badge: "2",
      },
    ],
  },
  {
    title: "Transactions & F&B",
    type: "transaction",
    items: [
      {
        icon: <TbReceipt className="size-5" />,
        name: "Transactions",
        path: "/cashier/transactions",
      },
      {
        icon: <TbCoffee className="size-5" />,
        name: "Manage F&B",
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
        name: "Device Status",
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
        name: "Dashboard",
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
        name: "Revenue",
        path: "/owner/revenue",
      },
      {
        icon: <TbDeviceGamepad2 className="size-5" />,
        name: "Devices",
        path: "/owner/reports?tab=devices",
      },
      {
        icon: <TbCoffee className="size-5" />,
        name: "F&B",
        path: "/owner/reports?tab=fnb",
      },
      {
        icon: <TbUsers className="size-5" />,
        name: "Cashiers",
        path: "/owner/reports?tab=cashiers",
      },
    ],
  },
  {
    title: "Management",
    type: "management",
    items: [
      {
        icon: <TbDeviceGamepad className="size-5" />,
        name: "Manage Devices",
        path: "/owner/devices",
      },
      {
        icon: <TbBasket className="size-5" />,
        name: "Manage F&B",
        path: "/owner/fnb",
      },
      {
        icon: <TbUserCog className="size-5" />,
        name: "Manage Cashiers",
        path: "/owner/cashiers",
      },
      {
        icon: <TbSettings className="size-5" />,
        name: "Settings",
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

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // Fix: Ditambahkan location.search agar akurat membaca parameter query (?tab=...) milik menu Owner
  const isActive = useCallback(
    (path) => {
      const currentFullPath = location.pathname + location.search;
      return currentFullPath === path;
    },
    [location.pathname, location.search],
  );

  // Efek pencarian submenu aktif otomatis
  useEffect(() => {
    let submenuMatched = false;

    currentMenu.forEach((section) => {
      section.items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: section.type, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, currentMenu]);

  // Efek kalkulasi tinggi dropdown submenu
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {nav.badge && (isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {nav.badge}
                  </span>
                )}
              </Link>
            )
          )}

          {/* Submenu rendering */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Navigation Menu Section */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {currentMenu.map((section) => (
              <div
                key={section.type}
                className={
                  section.hasTopSeparator
                    ? "pt-4 border-t border-gray-200 dark:border-gray-800"
                    : ""
                }
              >
                {/* Header Judul Sekat */}
                {section.title ? (
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      section.title
                    ) : (
                      <HorizontaLDots className="size-6" />
                    )}
                  </h2>
                ) : (
                  // Jika judul kosong tapi statusnya sekat (seperti di bagian Other Device Status Kasir)
                  !section.title &&
                  !isExpanded &&
                  !isHovered && (
                    <HorizontaLDots className="mb-4 size-6 text-gray-400 lg:mx-auto" />
                  )
                )}
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
