import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: flatpickr.Options.Hook | flatpickr.Options.Hook[];
  defaultDate?: flatpickr.Options.DateOption;
  label?: string;
  placeholder?: string;
  minDate?: flatpickr.Options.DateOption;
  value?: string | flatpickr.Options.DateOption;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
  value,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpInstanceRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);

  const isTimeMode = mode === "time";

  // Menjaga agar ref onChange selalu mendapatkan fungsi terbaru
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Efek 1: Inisialisasi & Penghancuran Flatpickr
  useEffect(() => {
    if (!inputRef.current) return;

    const instance = flatpickr(inputRef.current, {
      mode: isTimeMode ? "single" : mode,
      static: true,
      monthSelectorType: "static",
      dateFormat: isTimeMode ? "H:i" : "Y-m-d",
      enableTime: isTimeMode,
      noCalendar: isTimeMode,
      time_24hr: true,
      disableMobile: true,
      defaultDate,
      minDate,
      onChange: (dates, dateStr, inst) => {
        if (onChangeRef.current) {
          if (Array.isArray(onChangeRef.current)) {
            onChangeRef.current.forEach((fn) => fn(dates, dateStr, inst));
          } else {
            onChangeRef.current(dates, dateStr, inst);
          }
        }
      },
    });

    // Simpan instance ke ref agar bisa diakses di useEffect lain
    fpInstanceRef.current = Array.isArray(instance) ? instance[0] : instance;

    return () => {
      if (fpInstanceRef.current) {
        fpInstanceRef.current.destroy();
        fpInstanceRef.current = null;
      }
    };
  }, [mode, isTimeMode, defaultDate, minDate]);

  // Efek 2: Sinkronisasi Nilai Kontrol (Value Control)
  useEffect(() => {
    const instance = fpInstanceRef.current;
    if (!instance) return;

    if (!value) {
      instance.clear();
      return;
    }

    const parseNewDate = instance.parseDate(value, instance.config.dateFormat);
    const currentSelected = instance.selectedDates[0];

    const isDifferent =
      !currentSelected ||
      instance.parseDate(currentSelected, instance.config.dateFormat).getTime() !== parseNewDate.getTime();

    if (isDifferent) {
      instance.setDate(parseNewDate, false);
    }
  }, [value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none 
          px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900
          dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300
          focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          {isTimeMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (
            <CalenderIcon className="size-5" />
          )}
        </span>
      </div>
    </div>
  );
}