import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatDuration,
  getElapsedMinutes,
  sessionStatusLabel,
  sessionStatusBadge,
} from "../../utils";
import { Badge } from "../../components/common";
import Button from "../../components/ui/button/Button";

// ─── Timer ───────────────────────────────────────────────────────────────────
function ElapsedTimer({ startedAt }) {
  const [m, setM] = useState(getElapsedMinutes(startedAt));
  useEffect(() => {
    const id = setInterval(() => setM(getElapsedMinutes(startedAt)), 30_000);
    return () => clearInterval(id);
  }, [startedAt]);
  return <span className="tabular-nums font-medium">{formatDuration(m)}</span>;
}

// ─── Countdown untuk sesi per_hour ────────────────────────────────────────────
function CountdownTimer({ plannedEndAt }) {
  const calc = () => {
    const diff = Math.max(
      0,
      Math.floor((new Date(plannedEndAt).getTime() - Date.now()) / 60000),
    );
    return diff;
  };
  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 30_000);
    return () => clearInterval(id);
  }, [plannedEndAt]);

  if (remaining <= 0)
    return (
      <span className="text-red-600 font-medium tabular-nums">Waktu habis</span>
    );
  return (
    <span
      className={`tabular-nums font-medium ${remaining <= 10 ? "text-red-500" : "text-gray-700"}`}
    >
      sisa {formatDuration(remaining)}
    </span>
  );
}

// ─── Kartu sesi aktif ─────────────────────────────────────────────────────────
export default function SessionCard({ session, onAddFnb }) {
  const navigate = useNavigate();
  const isTimeUp = session.status === "time_up";
  const isExtended = session.extend_count > 0;

  return (
    <div
      onClick={() => navigate(`/cashier/sessions/${session.id}/checkout`)}
      className={`bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer
        hover:shadow-sm transition-all ${isTimeUp ? "border-red-200" : "border-gray-100 hover:border-gray-300"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${isTimeUp ? "bg-red-400" : "bg-amber-400 animate-pulse"}`}
          />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {session.device?.name ?? "—"}
            </p>
            <p className="text-xs text-gray-400">{session.device?.ps_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isExtended && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              🔄 +{session.extend_count}×
            </span>
          )}
          <Badge
            label={session.session_type === "per_hour" ? "Per Jam" : "Bebas"}
            className="bg-gray-100 text-gray-600 text-xs"
          />

          <Badge
            label={sessionStatusLabel[session.status]}
            className={sessionStatusBadge[session.status]}
          />
        </div>
      </div>

      {/* Info pelanggan */}
      <p className="text-xs text-gray-500">
        {session.customer?.name ?? "Walk-in"}
        {session.booking_id && (
          <span className="ml-1 text-blue-400">
            · Booking #{session.booking_id}
          </span>
        )}
      </p>

      {/* Timer */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Durasi</p>
          <ElapsedTimer startedAt={session.started_at} />
        </div>
        {session.session_type === "per_hour" && session.planned_end_at && (
          <div
            className={`rounded-xl px-3 py-2 ${isTimeUp ? "bg-red-50" : "bg-gray-50"}`}
          >
            <p className="text-xs text-gray-400 mb-0.5">Waktu</p>
            {isTimeUp ? (
              <span className="text-red-600 font-medium text-sm">
                Waktu habis!
              </span>
            ) : (
              <CountdownTimer plannedEndAt={session.planned_end_at} />
            )}
          </div>
        )}
      </div>

      {/* Aksi cepat untuk time_up */}
      {isTimeUp && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 font-medium">
          ⏰ Waktu bermain habis — segera selesaikan transaksi
        </div>
      )}

      {/* Aksi Sesi */}
      <div className="flex gap-2 mt-1 border-t border-gray-50 pt-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
          onClick={(e) => {
            e.stopPropagation();
            onAddFnb(session);
          }}
        >
          🍔 Tambah F&B
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/cashier/sessions/${session.id}/checkout`);
          }}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
