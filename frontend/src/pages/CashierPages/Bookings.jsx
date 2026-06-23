import { useEffect, useState } from "react";
import { bookingsApi } from "../../services/api";
import { Button, Field } from "../../components/ui/Form";
import Textarea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Modal from "../../components/ui/modal";
import { EmptyState, Spinner } from "../../components/common";
import BookingItems from "../../components/cashier/BookingItems";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { useAuthStore } from "../../store/authStore";

export default function CashierBookings() {
  const { user } = useAuthStore();
  const cashierId = user?.id;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = (status, currentPage) => {
    setIsLoading(true);
    bookingsApi
      .list({
        status: status || undefined,
        page: currentPage,
        ...(cashierId ? { cashier_id: cashierId } : {}),
      })
      .then((res) => {
        const d = res.data;
        // Mendukung respons paginasi maupun array biasa
        if (d?.data && Array.isArray(d.data)) {
          setBookings(d.data);
          setLastPage(d.last_page ?? 1);
          setTotal(d.total ?? d.data.length);
        } else if (Array.isArray(d)) {
          setBookings(d);
          setLastPage(1);
          setTotal(d.length);
        } else {
          setBookings([]);
        }
      })
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load(statusFilter, page);
  }, [statusFilter, page, cashierId]);

  const handleAction = async () => {
    if (!actionModal) return;
    const currentReason = reason.trim();
    console.log("LOG FRONTEND - Data sebelum dikirim:", {
      bookingId: actionModal.booking.id,
      reasonToSend: currentReason,
    });

    if (actionModal.type === "reject" && !currentReason) {
      alert(
        'Aplikasi Frontend Memblokir: State "reason" terdeteksi kosong di frontend!',
      );
      return;
    }

    setSaving(true);
    try {
      if (actionModal.type === "confirm") {
        await bookingsApi.confirm(actionModal.booking.id);
      } else {
        await bookingsApi.reject(actionModal.booking.id, currentReason);
      }
      setActionModal(null);
      setReason("");
      load(statusFilter || "all", page);
    } catch (error) {
      console.error("Backend Reject Error:", error.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        items={[{ label: "Booking", path: "/cashier/bookings" }]}
        pageDescription="Pelanggan yang booking akan tercatat di sini"
      />

      <ComponentCard
        title="Daftar booking"
        headerAction={
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                {total} booking
              </span>
            )}
            <div className="w-36">
              <Select
                defaultValue="pending"
                placeholder="Status"
                options={[
                  { label: "Menunggu", value: "pending" },
                  { label: "Diterima", value: "confirmed" },
                  { label: "Ditolak", value: "rejected" },
                  { label: "Selesai", value: "completed" },
                  { label: "Kadaluwarsa", value: "expired" },
                ]}
                value={statusFilter}
                onChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <Spinner className="py-16" />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Tidak ada data booking"
            description={
              statusFilter
                ? `Tidak ada booking berstatus "${statusFilter}" saat ini`
                : "Data booking akan muncul di sini ketika ada pelanggan yang melakukan booking"
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <BookingItems
                key={b.id}
                booking={b}
                onReject={(booking) =>
                  setActionModal({ type: "reject", booking })
                }
                onConfirm={(booking) =>
                  setActionModal({ type: "confirm", booking })
                }
              />
            ))}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Sebelumnya
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Hal. {page} / {lastPage}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Berikutnya →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Konfirmasi / Tolak */}
        <Modal
          isOpen={!!actionModal}
          onClose={() => {
            setActionModal(null);
            setReason("");
          }}
          title={
            actionModal?.type === "confirm"
              ? "Konfirmasi Booking"
              : "Tolak Booking"
          }
          size="sm"
        >
          {actionModal?.type === "confirm" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Konfirmasi booking dari{" "}
                <span className="text-white font-medium">
                  {actionModal.booking.customer?.name}
                </span>
                ? Pastikan DP sudah masuk ke rekening.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setActionModal(null)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAction}
                  loading={saving}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600"
                >
                  Ya, Konfirmasi
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Tolak booking dari{" "}
                <span className="text-white font-medium">
                  {actionModal?.booking.customer?.name}
                </span>
              </p>
              <Field label="Alasan Penolakan" required>
                <Textarea
                  value={reason}
                  onChange={(e) => {
                    const textValue = e?.target ? e.target.value : e;
                    setReason(textValue);
                  }}
                  placeholder="DP tidak terdeteksi masuk..."
                />
              </Field>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setActionModal(null)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={handleAction}
                  loading={saving}
                  disabled={!reason}
                  className="flex-1"
                >
                  Tolak Booking
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </ComponentCard>
    </>
  );
}
