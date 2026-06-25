import React from "react";
import { Loader2 } from "lucide-react";
import Label from "../form/Label";
import InputField from "../form/input/InputField";
import DatePicker from "../form/DatePicker";
import Select from "../form/Select";
import ClockTimePicker from "../form/ClockTimePicker";

export default function BookingFormStep({
  formData,
  handleInputChange,
  timeType,
  setTimeType,
  setFormData,
  duration,
  setDuration,
  minTime,
  handleTimeChange,
  isCalculating,
  handleProceedToPayment,
  handleCloseModal,
  isDatePickerOpenRef,
  setSelectedBookingDate,
  setIsTimeEdited,
  getTodayDateString,
}) {
  return (
    <>
      {/* Nama & WhatsApp */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="flex flex-col gap-1">
          <Label className="text-xs sm:text-sm">Nama Pelanggan</Label>
          <InputField
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            required
            placeholder="Nama"
            className="w-full text-xs sm:text-sm h-9 sm:h-11 px-2.5"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs sm:text-sm">No. WhatsApp</Label>
          <InputField
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            required
            placeholder="08123..."
            className="w-full text-xs sm:text-sm h-9 sm:h-11 px-2.5"
          />
        </div>
      </div>

      {/* Tanggal & Tipe Waktu */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div
          className="flex flex-col gap-1 relative z-[70]"
          onClick={(e) => {
            e.stopPropagation();
            isDatePickerOpenRef.current = true;
          }}
          onFocus={() => {
            isDatePickerOpenRef.current = true;
          }}
          onBlur={() => {
            setTimeout(() => {
              isDatePickerOpenRef.current = false;
            }, 200);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DatePicker
            id="booking-date-picker"
            label="Tanggal Bermain"
            minDate={getTodayDateString()}
            placeholder="Pilih tgl"
            value={formData.booking_date || getTodayDateString()}
            onChange={(_, dateStr) => {
              isDatePickerOpenRef.current = false;
              if (!dateStr) return;
              if (dateStr !== getTodayDateString()) setIsTimeEdited(false);
              setSelectedBookingDate(dateStr);
              setFormData((p) => ({ ...p, booking_date: dateStr }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs sm:text-sm">Tipe Waktu</Label>
          <Select
            defaultValue="per_hour"
            value={timeType}
            onChange={(val) => {
              setTimeType(val);
              setFormData((prev) => ({ ...prev, time_type: val }));
            }}
            options={[
              { value: "per_hour", label: "Per jam" },
              { value: "free_play", label: "Bebas" },
            ]}
            placeholder="Tipe"
            className="w-full text-xs sm:text-sm h-9 sm:h-11"
          />
        </div>
      </div>

      {/* Durasi */}
      {timeType === "per_hour" && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs sm:text-sm">Durasi Bermain</Label>
          <Select
            defaultValue="1"
            value={String(duration)}
            onChange={(val) => setDuration(Number(val))}
            options={[1, 2, 3, 4, 5, 6].map((h) => ({
              value: String(h),
              label: `${h} jam`,
            }))}
            placeholder="Pilih durasi"
            className="w-full text-xs sm:text-sm h-9 sm:h-11"
          />
        </div>
      )}

      {/* Jam Mulai & Selesai */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 relative">
        <div className="flex flex-col gap-1 relative z-[65]">
          <ClockTimePicker
            id="start_time"
            label="Jam Mulai"
            value={formData.start_time || ""}
            onChange={handleTimeChange}
            minTime={minTime}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs sm:text-sm">Jam Selesai</Label>
          <div className="h-9 sm:h-11 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs sm:text-sm font-mono text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 select-none w-full truncate">
            {timeType === "free_play" ? (
              <span className="text-warning-500 italic text-[11px] sm:text-sm">Bebas</span>
            ) : (
              formData.end_time || <span className="text-gray-400 dark:text-gray-500">Otomatis</span>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-2 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800 sm:justify-end">
        <button
          type="button"
          onClick={handleCloseModal}
          className="rounded-lg border border-gray-200 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 w-1/2 sm:w-auto transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleProceedToPayment}
          disabled={isCalculating}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 w-1/2 sm:w-auto transition-colors"
        >
          {isCalculating && <Loader2 size={14} className="animate-spin" />}
          {isCalculating ? "Menghitung..." : "Bayar →"}
        </button>
      </div>
    </>
  );
}