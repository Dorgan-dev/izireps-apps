import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../api";
import {
  formatDuration,
  getElapsedMinutes,
  formatRupiah,
  calcGamingCost,
} from "../../utils";
import { EmptyState, Spinner } from "../common";
import { useState, useEffect } from "react";

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(startedAt));
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(getElapsedMinutes(startedAt)),
      30_000,
    );
    return () => clearInterval(id);
  }, [startedAt]);
  return <span className="tabular-nums">{formatDuration(elapsed)}</span>;
}
export function ActiveSessionList() {
  const navigate = useNavigate();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", "active"],
    queryFn: () =>
      sessionApi.list({ status: "active" }).then((r) => r.data.data),
    refetchInterval: 10_000,
  });

  if (isLoading) return <Spinner className="py-16" />;

  if (!sessions?.length)
    return (
      <EmptyState
        icon=""
        title="Tidak ada sesi aktif"
        description="Semua perangkat sedang tidak digunakan"
      />
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Ringkasan */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center justify-between">
        <span>
          <strong>{sessions.length} sesi</strong> sedang aktif
        </span>
        <span className="text-xs text-amber-500">
          Diperbarui setiap 10 detik
        </span>
      </div>

      {/* List kartu sesi */}
      <div className="flex flex-col gap-3">
        {sessions.map((session) => {
          const pricePerHour =
            session.device?.current_rate?.price_per_hour ?? 0;
          const elapsed = getElapsedMinutes(session.started_at);
          const gamingEst = calcGamingCost(elapsed, pricePerHour);
          const fnbTotal = session.transaction?.fnb_total ?? 0;
          const dpPaid = session.transaction?.dp_paid ?? 0;
          const grandEst = Math.max(0, gamingEst + fnbTotal - dpPaid);

          return (
            <>
              {isLoading ? (
                <Spinner className="py-16" />
              ) : (
                <div
                  key={session.id}
                  onClick={() =>
                    navigate(`/cashier/sessions/${session.id}/checkout`)
                  }
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4
                cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {/* Indikator status */}
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />

                  {/* Info perangkat & pelanggan */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {session.device?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {session.customer?.name ?? "Walk-in"}
                      {session.booking_id && (
                        <span className="ml-1 text-blue-400">
                          · Booking #{session.booking_id}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Durasi */}
                  <div className="text-center flex-shrink-0">
                    <p className="text-sm font-medium text-amber-700">
                      <ElapsedTimer startedAt={session.started_at} />
                    </p>
                    <p className="text-xs text-gray-400">durasi</p>
                  </div>

                  {/* Estimasi biaya */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatRupiah(grandEst)}
                    </p>
                    <p className="text-xs text-gray-400">est. total</p>
                  </div>

                  {/* Chevron */}
                  <span className="text-gray-300 flex-shrink-0">›</span>
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}
