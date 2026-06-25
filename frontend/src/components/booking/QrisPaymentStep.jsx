import React from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

export default function QrisPaymentStep({
  dpAmount,
  estimatedCost,
  qrisString, // Jika memakai string QR dinamis, atau bisa diganti image tag langsung
  qrisAvailable,
  onProceedToProof,
  onBack,
}) {
  return (
    <div className="flex flex-col gap-5 text-gray-900 dark:text-white">
      {/* Rincian Biaya Box */}
      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Estimasi Total Biaya:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {estimatedCost ? `Rp ${estimatedCost.toLocaleString("id-ID")}` : "Belum dihitung"}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold">Harus Bayar (DP):</span>
          <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
            Rp {dpAmount?.toLocaleString("id-ID") || "0"}
          </span>
        </div>
      </div>

      {/* Petunjuk scan */}
      <div className="text-center space-y-1">
        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          Scan QR Code di bawah ini
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Gunakan aplikasi e-wallet atau m-banking Anda
        </p>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200 dark:border-gray-800 max-w-[260px] mx-auto shadow-sm">
        {/* Gantilah bagian ini dengan library QR Code Anda atau format Image QR */}
        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
          {/* Contoh jika qr berupa string/image placeholder, ganti dengan komponen QR Anda */}
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrisString || "IZIREPS"}`} 
            alt="QRIS Code" 
            className="w-full h-full object-contain p-1"
          />
        </div>
        
        {/* Badge E-Wallet Teratur */}
        <div className="mt-3 flex flex-wrap justify-center gap-1 text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
          <span>GoPay</span>•<span>OVO</span>•<span>Dana</span>•<span>ShopeePay</span>•<span>m-Banking</span>
        </div>
      </div>

      {/* Notifikasi info */}
      <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span>Harap simpan bukti transfer setelah pembayaran berhasil untuk diunggah di halaman berikutnya.</span>
      </div>

      {/* Tombol Navigasi / Action */}
      <div className="mt-2 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-800 sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-1/2 sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 px-4 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
        <button
          type="button"
          onClick={onProceedToProof}
          className="inline-flex w-1/2 sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 px-4 text-xs sm:text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Sudah Bayar <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}