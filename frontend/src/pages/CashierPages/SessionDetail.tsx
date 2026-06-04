import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsApi, transactionsApi } from '../../services/api';
import type { PlaySession, PaymentMethod } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatRupiah } from '../../components/ui/badge/Badge';
import { Button, Field, Input } from '../../components/ui/Form';
import Select from '../../components/form/Select';
import { Check, Receipt, CreditCard, Clock, User } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'qris', label: 'QRIS' },
];

export default function CashierCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<PlaySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const { items: cart, total: cartTotal, clear } = useCartStore();

  useEffect(() => {
    sessionsApi.show(Number(id))
      .then((res) => setSession(res.data.data))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />;
  if (!session) return null;

  // Calculate costs
  const durationMinutes = Math.ceil((Date.now() - new Date(session.started_at).getTime()) / 60000);
  const gamingTotal = 0; // will come from backend based on rate
  const fnbTotal = cartTotal();
  const grandTotal = gamingTotal + fnbTotal;
  const dpPaid = session.booking?.dp_amount ?? 0;
  const remainingAmount = Math.max(0, grandTotal - dpPaid);
  const paid = Number(amountPaid) || 0;
  const change = Math.max(0, paid - remainingAmount);

  const handleCancel = () => {
    navigate(`/cashier/sessions/${id}`);
  };

  const handleCheckout = async () => {
    setSaving(true);
    try {
      await transactionsApi.create({
        session_id: session.id,
        items: cart.map((c) => ({ fnb_item_id: c.fnb_item_id, quantity: c.quantity })),
        payment_method: paymentMethod,
        amount_paid: paid,
      });
      clear();
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  // --- TAMPILAN SUKSES ---
  if (done) {
    return (
      <ComponentCard title="Status Transaksi">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            Sesi bermain telah diselesaikan dan tagihan berhasil dicatat ke dalam sistem.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/cashier')}>Dasbor Kasir</Button>
            <Button onClick={() => navigate('/cashier/sessions')}>Lihat Daftar Sesi</Button>
          </div>
        </div>
      </ComponentCard>
    );
  }

  // --- TAMPILAN CHECKOUT ---
  return (
    <>
      <PageBreadcrumb
        pageDescription='Konfirmasi tagihan dan proses pembayaran'
        items={[
          { label: 'Sesi bermain', path: '/cashier/sessions' },
          { label: 'Detail', path: '#' }
        ]}
      />

      <ComponentCard 
        title='Detail sesi' 
        headerAction={
          <div className="flex items-center gap-2">
            <Button size='sm' variant="secondary" onClick={handleCancel}>
              Batal
            </Button>
            <Button 
              size='sm' 
              onClick={handleCheckout} 
              loading={saving} 
              disabled={paymentMethod === 'cash' && paid < remainingAmount}
            >
              Proses Pembayaran
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI: RINCIAN TAGIHAN (RECEIPT) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Info Sesi */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                <Receipt size={18} className="text-brand-500" />
                Rincian Tagihan
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{session.device?.name}</p>
                    {session.customer && (
                      <p className="text-sm flex items-center gap-1 text-gray-500 mt-1">
                        <User size={14} /> {session.customer.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="flex items-center justify-end gap-1 text-gray-500">
                      <Clock size={14} /> {durationMinutes} menit
                    </p>
                    <p className="text-gray-400 mt-1">{new Date(session.started_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* List Item FnB */}
                {cart.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-3">Pesanan Tambahan (FnB)</p>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.fnb_item_id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.name} <span className="text-gray-400 mx-1">x</span> {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatRupiah(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Kalkulasi */}
                <div className="space-y-3">
                  <Row label="Biaya Bermain" value={formatRupiah(gamingTotal)} note="Auto-kalkulasi" />
                  <Row label="Total FnB" value={formatRupiah(fnbTotal)} />
                  {dpPaid > 0 && (
                    <Row label="DP Terbayar" value={`− ${formatRupiah(dpPaid)}`} valueClass="text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Sisa Tagihan (Highlight) */}
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="text-brand-600 dark:text-brand-400 font-medium text-sm">Total yang harus dibayar</p>
              </div>
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {formatRupiah(remainingAmount)}
              </p>
            </div>

          </div>

          {/* KOLOM KANAN: INPUT PEMBAYARAN */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-6">
                <CreditCard size={18} className="text-brand-500" />
                Pembayaran
              </h3>

              <div className="space-y-5">
                <Field label="Metode Pembayaran">
                  <Select
                    value={paymentMethod}
                    onChange={(val) => setPaymentMethod(val as PaymentMethod)}
                    options={PAYMENT_METHODS}
                    placeholder="Pilih Metode Pembayaran"
                  />
                </Field>

                {paymentMethod === 'cash' && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                    <Field label="Uang yang Diterima (Rp)">
                      <Input
                        type="number"
                        className="text-lg font-medium"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder={String(remainingAmount)}
                      />
                    </Field>

                    {/* Alert Kembalian */}
                    <div className={`mt-4 rounded-xl p-4 flex justify-between items-center transition-colors ${paid > remainingAmount ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kembalian</span>
                      <span className={`text-xl font-bold ${paid > remainingAmount ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {formatRupiah(change)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pesan Instruksi Non-Cash */}
                {paymentMethod !== 'cash' && (
                   <div className="mt-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4">
                     <p className="text-sm text-blue-600 dark:text-blue-400">
                       Pastikan pelanggan telah melakukan transfer/scan sebesar <strong>{formatRupiah(remainingAmount)}</strong> sebelum menekan tombol Proses Pembayaran.
                     </p>
                   </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </ComponentCard>
    </>
  );
}

// Perbaikan komponen Row agar lebih fleksibel
function Row({ label, value, bold, note, valueClass }: {
  label: string; 
  value: string; 
  bold?: boolean; 
  note?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {label}
        {note && <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-medium text-gray-500">{note}</span>}
      </span>
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${valueClass || 'text-gray-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}