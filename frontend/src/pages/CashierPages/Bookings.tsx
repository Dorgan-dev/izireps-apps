import { useEffect, useState } from 'react';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';
import { formatRupiah } from '../../components/ui/badge/Badge';
import { Button, Field } from '../../components/ui/Form';
import Textarea from '../../components/form/input/TextArea';
import Modal from '../../components/ui/modal';
import { EmptyState } from '../../components/common';
import { Check, X } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';

export default function CashierBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ type: 'confirm' | 'reject'; booking: Booking } | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    bookingsApi.list({ status: 'pending' })
      .then((res) => setBookings(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    if (!actionModal) return;
    const currentReason = reason.trim();
    console.log("LOG FRONTEND - Data sebelum dikirim:", {
      bookingId: actionModal.booking.id,
      reasonToSend: currentReason
    });

    if (actionModal.type === 'reject' && !currentReason) {
      alert('Aplikasi Frontend Memblokir: State "reason" terdeteksi kosong di frontend!');
      return;
    }

    setSaving(true);
    try {
      if (actionModal.type === 'confirm') {
        await bookingsApi.confirm(actionModal.booking.id);
      } else {
        await bookingsApi.reject(actionModal.booking.id, currentReason);
      }
      setActionModal(null);
      setReason('');
      load();
    } catch (error: any) {
      console.error("Backend Reject Error:", error.response?.data);
    } finally {
      setSaving(false);
    }
  };

  // 💡 PERBAIKAN 1: Hapus pengecekan `if (!load?.length)` yang merusak flow di sini.

  return (
    <>
      <PageBreadcrumb 
        items={[{ label: 'Booking', path: '/cashier/bookings' }]} 
        pageDescription='Pelanggan yang booking akan tercatat di sini' 
      />
      
      <ComponentCard title="Daftar Booking">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon=""
            title="Tidak ada data booking"
            description="Data booking akan muncul di sini ketika ada pelanggan yang melakukan booking"
          />
        ) : (
          /* Daftar Booking */
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-gray-900 border border-yellow-900/50 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{b.customer?.name ?? 'Pelanggan'}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{b.customer?.phone}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-400">
                      <span>{b.device?.name}</span>
                      <span>·</span>
                      <span>{b.booking_date} · {b.start_time}–{b.end_time}</span>
                      <span>·</span>
                      <span className="text-gray-300 font-medium">DP {formatRupiah(b.dp_amount)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setActionModal({ type: 'reject', booking: b })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 text-xs font-medium transition-colors"
                    >
                      <X size={13} /> Tolak
                    </button>
                    <button
                      onClick={() => setActionModal({ type: 'confirm', booking: b })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 text-xs font-medium transition-colors"
                    >
                      <Check size={13} /> Konfirmasi
                    </button>
                  </div>
                </div>

                {b.dp_proof_file && (
                  <a
                    href={b.dp_proof_file}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Lihat Bukti Transfer →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirm / Reject modal */}
        <Modal
          isOpen={!!actionModal}
          onClose={() => { setActionModal(null); setReason(''); }}
          title={actionModal?.type === 'confirm' ? 'Konfirmasi Booking' : 'Tolak Booking'}
          size="sm"
        >
          {actionModal?.type === 'confirm' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Konfirmasi booking dari <span className="text-white font-medium">{actionModal.booking.customer?.name}</span>?
                Pastikan DP sudah masuk ke rekening.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setActionModal(null)} className="flex-1">Batal</Button>
                <Button onClick={handleAction} loading={saving} className="flex-1 bg-emerald-700 hover:bg-emerald-600">
                  Ya, Konfirmasi
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Tolak booking dari <span className="text-white font-medium">{actionModal?.booking.customer?.name}</span>
              </p>
              <Field label="Alasan Penolakan" required>
                <Textarea
                  value={reason}
                  onChange={(e: any) => {
                    const textValue = e?.target ? e.target.value : e;
                    setReason(textValue);
                  }}
                  placeholder="DP tidak terdeteksi masuk..."
                />
              </Field>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setActionModal(null)} className="flex-1">Batal</Button>
                <Button variant="danger" onClick={handleAction} loading={saving} disabled={!reason} className="flex-1">
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