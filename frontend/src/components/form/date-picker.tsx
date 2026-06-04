import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  minDate?: DateOption;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
}: PropsType) {
  useEffect(() => {
    const isTimeMode = mode === "time"; // Cek apakah mode yang dipilih adalah waktu
    const flatPickr = flatpickr(`#${id}`, {
      mode: isTimeMode ? "single" : (mode || "single"),
      static: true,
      monthSelectorType: "static",
      dateFormat: isTimeMode ? "H:i" : "Y-m-d", // Format waktu 24 jam (Contoh: 14:30)
      enableTime: isTimeMode,                  // ✨ Aktifkan fitur waktu jika mode="time"
      noCalendar: isTimeMode,                  // ✨ Sembunyikan kalender jika mode="time"
      time_24hr: true,                         // Gunakan format 24 jam
      defaultDate,
      minDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, minDate]);


  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          {/* ✨ Jika mode="time", tampilkan ikon jam, jika tidak tampilkan ikon kalender */}
          {mode === "time" ? (
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (
            <CalenderIcon className="size-6" />
          )}
        </span>
      </div>
    </div>
  );

}
