import { useEffect, useState } from "react";
import { Check, X, Calendar, Clock, Timer, MonitorPlay } from "lucide-react";
import { formatRupiah } from "../ui/badge/Badge";
import Modal from "../ui/modal";
import { bookingsApi } from "../../services/api";

export default function BookingItems({ booking, onReject, onConfirm }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [showProof, setShowProof] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [isFetchingProof, setIsFetchingProof] = useState(false);

  useEffect(() => {
    if (showProof && booking.dp_proof_file && !proofUrl) {
      setIsFetchingProof(true);
      bookingsApi.getProof(booking.id)
        .then((res) => {
          const url = URL.createObjectURL(res.data);
          setProofUrl(url);
        })
        .catch((err) => console.error("Gagal mengambil bukti:", err))
        .finally(() => setIsFetchingProof(false));
    }
  }, [showProof, booking.dp_proof_file, booking.id, proofUrl]);

  useEffect(() => {
    if (booking.status !== "pending" || !booking.expires_at) {
      setTimeLeft("");
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(booking.expires_at).getTime();
      const difference = expiresAt - now;

      if (difference <= 0) {
        return "Expired";
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return `${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      if (newTime === "Expired") clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.status, booking.expires_at]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-yellow-900/30 rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* INFO PELANGGAN & DETAIL BOOKING */}
        <div className="space-y-1 w-full">
          <p className="font-semibold text-gray-900 dark:text-white">
            {booking.customer?.name ?? "Pelanggan"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {booking.customer?.phone}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-md">
              <MonitorPlay size={14} />
              {booking.device?.name}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-md">
              <Calendar size={14} />
              {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-md">
              <Clock size={14} />
              {booking.start_time?.substring(0, 5)}–
              {booking.end_time?.substring(0, 5)}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2.5 py-1 rounded-md">
              <Timer size={14} />
              {booking.time_type === "free_play" ? "Main Bebas" : "Per Jam"} (
              {booking.duration_minutes} Menit)
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2.5 py-1 rounded-md">
              DP: {formatRupiah(booking.dp_amount)}
            </span>
          </div>

          {/* SISA WAKTU VERIFIKASI */}
          {timeLeft && (
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Sisa Waktu Verifikasi:
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md ${timeLeft === "Expired" ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"}`}
              >
                {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex sm:flex-shrink-0 gap-2 w-full sm:w-auto grid grid-cols-2 sm:flex">
          <button
            onClick={() => onReject(booking)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-semibold sm:font-medium transition-colors border border-red-200 dark:border-red-900/50"
          >
            <X size={14} /> Tolak
          </button>
          <button
            onClick={() => onConfirm(booking)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-semibold sm:font-medium transition-colors shadow-sm"
          >
            <Check size={14} /> Konfirmasi
          </button>
        </div>
      </div>

      {/* BUKTI TRANSFER */}
      {booking.dp_proof_file && (
        <>
          {console.log("dp_proof_file:", booking.dp_proof_file)}
          {console.log(
            "image url:",
            booking.dp_proof_file?.startsWith("http")
              ? booking.dp_proof_file
              : `http://localhost:8000/storage/${booking.dp_proof_file}`
          )}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex sm:justify-start">
            <button
              onClick={() => setShowProof(true)}
              className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              Lihat Bukti Transfer →
            </button>
          </div>

          <Modal
            isOpen={showProof}
            onClose={() => setShowProof(false)}
            title="Bukti Transfer Pelanggan"
            size="md"
          >
            <div className="flex justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 min-h-[200px] items-center">
              {isFetchingProof ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              ) : proofUrl ? (
                <img
                  src={proofUrl}
                  alt="Bukti Transfer"
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : (
                <span className="text-gray-500 text-sm">Gagal memuat gambar</span>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowProof(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Tutup
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
