import { useEffect, useState } from "react";
import { bookingsApi } from "../../services/api";
import {
  BookingStatusBadge,
  formatRupiah,
} from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = () => {
    setIsLoading(true);
    bookingsApi
      .list({ status: status || undefined })
      .then((res) => setBookings(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Booking</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === t.value
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-900 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                  Perangkat
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                  DP
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5 text-gray-100">
                    {b.customer?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    {b.device?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    {b.booking_date} · {b.start_time}–{b.end_time}
                  </td>
                  <td className="px-5 py-3.5 text-gray-300">
                    {formatRupiah(b.dp_amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDetail(b)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500 text-sm"
                  >
                    Tidak ada booking
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal (read-only for owner) */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Booking"
        size="lg"
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <Row label="Pelanggan" value={detail.customer?.name ?? "—"} />
            <Row label="No. HP" value={detail.customer?.phone ?? "—"} />
            <Row label="Perangkat" value={detail.device?.name ?? "—"} />
            <Row label="Tanggal" value={detail.booking_date} />
            <Row
              label="Waktu"
              value={`${detail.start_time} – ${detail.end_time}`}
            />
            <Row label="Durasi" value={`${detail.duration_minutes} menit`} />
            <Row
              label="Estimasi Biaya"
              value={formatRupiah(detail.estimated_cost)}
            />
            <Row label="DP" value={formatRupiah(detail.dp_amount)} />
            <Row
              label="Status"
              value={<BookingStatusBadge status={detail.status} />}
            />
            {detail.cancel_reason && (
              <Row label="Alasan Batal" value={detail.cancel_reason} />
            )}
            <Button
              variant="outline"
              onClick={() => setDetail(null)}
              className="w-full mt-2"
            >
              Tutup
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-800">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-100 font-medium">{value}</span>
    </div>
  );
}
