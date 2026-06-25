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
  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const todayDateStr = todayDate.toISOString().split("T")[0];

  const waitings = (rawBookings ?? []).filter((b) => {
    if (!b.booking_date) return false;

    const dbDate = new Date(b.booking_date);
    const localDbDate = new Date(
      dbDate.getTime() - dbDate.getTimezoneOffset() * 60000,
    );
    const localDbDateStr = localDbDate.toISOString().split("T")[0];

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
      
      {/* 🌟 PERUBAHAN: flex-col untuk mobile, md:flex-row untuk desktop */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        
        {/* 🌟 PERUBAHAN: w-full untuk mobile, md:w-1/2 untuk desktop */}
        <ComponentCard 
          className="w-full md:w-1/2 h-full"
          title="Daftar sesi aktif"
          headerAction={
            // 🌟 PERUBAHAN: Menyesuaikan ukuran tombol agar kompak di mobile
            <Button size="sm" sm={{ size: "md" }} onClick={() => setShowNew(true)}>
              + Sesi baru
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            <ActiveSessionList />
            
            {/* Alert time_up */}
            {timeUps.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start sm:items-center gap-2">
                <span className="shrink-0">🔴</span>
                <span>
                  <strong>{timeUps.length} sesi</strong> waktunya sudah habis dan
                  menunggu tindakan. Segera extend atau checkout.
                </span>
              </div>
            )}

            {/* List sesi */}
            {isLoading || isBookingsLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* time_up duluan */}
                {timeUps.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium text-red-500 uppercase tracking-wide">
                      Waktu Habis
                    </p>
                    {/* 🌟 PERUBAHAN: grid-cols-1 tetap satu kolom di layar sangat kecil */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <ComponentCard title={"Menunggu pelanggan tiba"} className="w-full md:w-1/2">
          {/* Menunggu Kedatangan */}
          {waitings.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          ) : (
            <div className="text-center py-8 text-sm text-gray-400">
               Tidak ada antrian booking untuk hari ini.
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

export default PlaySessionsPage;