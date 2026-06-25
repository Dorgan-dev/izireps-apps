import React from "react";
import Button from "../ui/button/Button";

export default function UserSecurityCard() {
  const handleLogoutAllDevices = () => {
    // Tambahkan logika logout semua perangkat di sini
    console.log("Logging out from all devices...");
  };

  const handleDeleteAccount = () => {
    // Tambahkan logika hapus akun di sini
    console.log("Deleting account permanently...");
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-900">
      {/* Judul Utama */}
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        Danger Zone
      </h4>

      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
        {/* Baris 1: Logout All Devices */}
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between first:pt-0">
          <div className="max-w-xl">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-1">
              Update Password
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
              Sign out from every active session.
            </p>
          </div>
          <button
            onClick={handleLogoutAllDevices}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 w-full sm:w-auto"
          >
            {/* Icon Log out */}
            <svg
              className="stroke-current"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
