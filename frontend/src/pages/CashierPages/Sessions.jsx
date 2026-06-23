import { ActiveSessionList } from "../../components/cashier/ActiveSessionList";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi, bookingsApi } from "../../services/api";
import Modal from "../../components/ui/modal";
import { Spinner } from "../../components/common";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

// Import komponen hasil pemisahan (Sub-komponen)
import WaitingBookingCard from "../../components/cashier/WaitingBookingCard";
import SessionCard from "../../components/cashier/SessionCard";
import NewSessionModal from "../../components/cashier/NewSessionModal";
import AddFnbModal from "../../components/cashier/AddFnbModal";

export function PlaySessionsPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [fnbSession, setFnbSession] = useState(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["play_sessions", "open"],
    queryFn: () =>
      sessionsApi.list({ status: "active,time_up" }).then((r) => r.data.data),
    refetchInterval: 10_000,
  });

  const all = sessions ?? [];
  const timeUps = all.filter((s) => s.status === "time_up");
  const actives = all.filter((s) => s.status === "active");

  const { data: rawBookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["waiting_bookings"],
    queryFn: () =>
      bookingsApi.list({ status: "confirmed" }).then((r) => r.data.data),
    refetchInterval: 15_000,
  });

  // Filter for today's bookings only
  // Menambahkan offset timezone agar toISOString mengembalikan tanggal lokal yang benar.
  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const todayDateStr = todayDate.toISOString().split("T")[0];

  const waitings = (rawBookings ?? []).filter((b) => {
    if (!b.booking_date) return false;

    // 1. Ubah string UTC dari DB menjadi objek Date JavaScript
    const dbDate = new Date(b.booking_date);

    // 2. Format menjadi string lokal (YYYY-MM-DD)
    const localDbDate = new Date(
      dbDate.getTime() - dbDate.getTimezoneOffset() * 60000,
    );
    const localDbDateStr = localDbDate.toISOString().split("T")[0];

    // 3. Cocokkan tanggalnya
    return localDbDateStr === todayDateStr;
  });

  const startBookingMutation = useMutation({
    mutationFn: (bookingId) => sessionsApi.startFromBooking(bookingId),
    onSuccess: () => {
      toast.success("Sesi berhasil dimulai");
      qc.invalidateQueries({ queryKey: ["play_sessions"] });
      qc.invalidateQueries({ queryKey: ["waiting_bookings"] });
      qc.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Gagal memulai sesi dari booking",
      );
    },
  });

  return (
    <>
      <PageBreadcrumb
        items={[{ label: "Sesi bermain", path: "/cashier/sessions" }]}
        pageDescription="Pelanggan yang sedang bermain akan tercatat dalam sesi"
      />
      <ComponentCard
        title="Daftar sesi aktif"
        headerAction={
          <Button size="md" onClick={() => setShowNew(true)}>
            + Sesi baru
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <ActiveSessionList />
          {/* Alert time_up */}
          {timeUps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span>🔴</span>
              <span>
                <strong>{timeUps.length} sesi</strong> waktunya sudah habis dan
                menunggu tindakan. Segera extend atau checkout.
              </span>
            </div>
          )}

          {/* List sesi */}
          {isLoading || isBookingsLoading ? (
            <Spinner className="py-16" />
          ) : (
            <div className="flex flex-col gap-4">
              {/* time_up duluan */}
              {timeUps.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-red-500 uppercase tracking-wide">
                    Waktu Habis
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeUps.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onAddFnb={setFnbSession}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Sesi aktif */}
              {actives.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                    Sedang Bermain
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actives.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        onAddFnb={setFnbSession}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Menunggu Kedatangan */}
              {waitings.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    Menunggu Kedatangan (Hari Ini)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {waitings.map((b) => (
                      <WaitingBookingCard
                        key={b.id}
                        booking={b}
                        isStarting={
                          startBookingMutation.isPending &&
                          startBookingMutation.variables === b.id
                        }
                        onStart={(b) => startBookingMutation.mutate(b.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal sesi baru */}
          <Modal
            isOpen={showNew}
            onClose={() => setShowNew(false)}
            title="Sesi baru — Walk-in"
            size="sm"
          >
            <NewSessionModal onClose={() => setShowNew(false)} />
          </Modal>

          {/* Modal tambah F&B */}
          <Modal
            isOpen={!!fnbSession}
            onClose={() => setFnbSession(null)}
            title="Tambah F&B"
            size="sm"
          >
            {fnbSession && (
              <AddFnbModal
                session={fnbSession}
                onClose={() => setFnbSession(null)}
              />
            )}
          </Modal>
        </div>
      </ComponentCard>
    </>
  );
}

export default PlaySessionsPage;
