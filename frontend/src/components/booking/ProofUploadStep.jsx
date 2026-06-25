import React from "react";
import { Loader2 } from "lucide-react";
import Label from "../form/Label";
import FileInput from "../form/input/FileInput";

export default function ProofUploadStep({ setDpProof, handleBookingSubmit, isSubmitting, setStep }) {
  return (
    <>
      <div className="rounded-lg bg-brand-50 dark:bg-brand-950/30 p-3 text-xs text-brand-700 dark:text-brand-300">
        ✅ Pembayaran berhasil? Upload screenshot bukti transfer di bawah ini.
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs sm:text-sm">Bukti Transfer DP (Maks 5MB)</Label>
        <FileInput onChange={(e) => setDpProof(e.target.files?.[0] || null)} className="w-full text-xs sm:text-sm" />
        <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">Format: JPG, PNG</p>
      </div>

      <div className="mt-2 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800 sm:justify-end">
        <button
          type="button"
          onClick={() => setStep("payment")}
          className="rounded-lg border border-gray-200 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 w-1/2 sm:w-auto transition-colors"
        >
          ← Kembali
        </button>
        <button
          type="button"
          onClick={handleBookingSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 w-1/2 sm:w-auto transition-colors"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isSubmitting ? "Mengirim..." : "Kirim Booking"}
        </button>
      </div>
    </>
  );
}