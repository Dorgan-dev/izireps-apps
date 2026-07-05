import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Play,
  CalendarCheck,
  Hourglass,
  XCircle,
  FileImage,
  Ban,
  CheckCircle2,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { customerAuthApi } from "../../services/api";

const STATUS_MAP = {
  in_use: {
    label: "Sedang Digunakan",
    badgeClass: "badge-warning",
    Icon: Play,
  },
  confirmed: {
    label: "Dikonfirmasi",
    badgeClass: "badge-info",
    Icon: CalendarCheck,
  },
  pending: {
    label: "Menunggu",
    badgeClass: "badge-error text-white",
    Icon: Hourglass,
  },
  cancelled: {
    label: "Dibatalkan",
    badgeClass: "badge-ghost",
    Icon: Ban,
  },
  completed: {
    label: "Selesai",
    badgeClass: "badge-success text-white",
    Icon: CheckCircle2,
  },
  expired: {
    label: "Kedaluwarsa",
    badgeClass: "badge-ghost",
    Icon: XCircle,
  },
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAuthApi.myBookings();
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat riwayat booking.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewProof = async (id) => {
    try {
      const res = await customerAuthApi.myBookingProof(id);
      const url = URL.createObjectURL(res.data);
      setProofUrl(url);
      setIsProofModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat bukti DP.");
    }
  };

  const closeProofModal = () => {
    setIsProofModalOpen(false);
    if (proofUrl) URL.revokeObjectURL(proofUrl);
    setProofUrl(null);
  };

  const openCancelModal = (id) => {
    setSelectedBookingId(id);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBookingId(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;
    setCancelLoading(true);
    try {
      await customerAuthApi.publicCancel(selectedBookingId);
      alert("Booking berhasil dibatalkan.");
      closeCancelModal();
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal membatalkan booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(d);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <PageMeta title="IZIReps | Riwayat Booking" description="Riwayat booking perangkat" />
      <PageBreadcrumb items={[{ label: "Riwayat Booking", path: "/my-bookings" }]} />

      <section className="bg-base-100 py-10 sm:py-16 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-base-content sm:text-3xl">
              Riwayat Booking Anda
            </h1>
            <p className="mt-2 text-sm text-base-content/70">
              Lihat dan kelola jadwal booking yang telah Anda buat.
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-error mb-6">
              <XCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 bg-base-200/50 rounded-2xl border border-base-300">
              <CalendarCheck size={48} className="mx-auto text-base-content/30 mb-4" />
              <p className="text-base-content/70">Anda belum memiliki riwayat booking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => {
                const statusCfg = STATUS_MAP[booking.status] || STATUS_MAP.pending;
                const StatusIcon = statusCfg.Icon;
                const isPending = booking.status === "pending";

                return (
                  <div key={booking.id} className="card bg-base-200/50 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <h3 className="font-semibold text-lg text-base-content">
                            {booking.device?.name || "Perangkat"}
                          </h3>
                          <p className="text-xs text-base-content/60 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            {formatDate(booking.booking_date)}
                          </p>
                        </div>
                        <div className={`badge ${statusCfg.badgeClass} gap-1 p-3 shrink-0`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </div>
                      </div>

                      <div className="bg-base-100 rounded-xl p-3 mb-4 text-sm border border-base-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-base-content/70">Waktu Bermain</span>
                          <span className="font-medium text-base-content text-right">
                            {booking.start_time.substring(0, 5)} {booking.end_time ? `- ${booking.end_time.substring(0, 5)}` : "(Free Play)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">DP Dibayar</span>
                          <span className="font-medium text-base-content">
                            {formatCurrency(booking.dp_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="card-actions justify-end mt-auto pt-2 border-t border-base-300/50">
                        <button
                          onClick={() => handleViewProof(booking.id)}
                          className="btn btn-sm btn-ghost gap-2"
                        >
                          <FileImage size={14} />
                          Bukti DP
                        </button>
                        {isPending && (
                          <button
                            onClick={() => openCancelModal(booking.id)}
                            className="btn btn-sm btn-error btn-outline gap-2"
                          >
                            <XCircle size={14} />
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal Bukti DP */}
      <dialog className={`modal ${isProofModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box p-0 max-w-sm rounded-2xl overflow-hidden bg-base-100 border border-base-300">
          <div className="bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
            <h3 className="font-bold text-lg text-base-content">Bukti DP</h3>
            <button onClick={closeProofModal} className="btn btn-sm btn-circle btn-ghost">✕</button>
          </div>
          <div className="p-4 flex justify-center bg-base-100">
            {proofUrl ? (
              <img src={proofUrl} alt="Bukti DP" className="max-w-full rounded-xl max-h-[60vh] object-contain" />
            ) : (
              <span className="loading loading-spinner loading-md text-primary"></span>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeProofModal}>
          <button>Tutup</button>
        </form>
      </dialog>

      {/* Modal Konfirmasi Pembatalan */}
      <dialog className={`modal ${isCancelModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box border border-base-300">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
            <Ban className="text-error" size={20} />
            Batalkan Booking
          </h3>
          <p className="py-4 text-base-content/80 text-sm">
            Apakah Anda yakin ingin membatalkan booking ini? Uang DP yang telah dibayarkan mungkin tidak dapat dikembalikan sesuai dengan kebijakan yang berlaku.
          </p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeCancelModal} disabled={cancelLoading}>
              Batal
            </button>
            <button className="btn btn-error text-white" onClick={handleCancelBooking} disabled={cancelLoading}>
              {cancelLoading ? <span className="loading loading-spinner loading-sm"></span> : "Ya, Batalkan"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={closeCancelModal}>
          <button>Tutup</button>
        </form>
      </dialog>
    </>
  );
}
