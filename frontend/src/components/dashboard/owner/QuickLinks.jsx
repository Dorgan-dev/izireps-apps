import { useNavigate } from "react-router-dom";

const links = [
  {
    label: "Laporan Pendapatan",
    path: "/owner/revenue",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-600",
    hoverBg: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    label: "Kelola Kasir",
    path: "/owner/cashiers",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    hoverBg: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    label: "Kelola Perangkat",
    path: "/owner/devices",
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    hoverBg: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
];

export default function QuickLinks() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <svg className="size-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
        </span>
        <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
          SHORTCUT / QUICK LINK
        </h4>
      </div>

      <div className="mt-4 space-y-2.5">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-white/[0.02] ${link.hoverBg}`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${link.color} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}
            >
              {link.icon}
            </span>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white">
              {link.label}
            </span>
            <svg
              className="ml-auto size-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
