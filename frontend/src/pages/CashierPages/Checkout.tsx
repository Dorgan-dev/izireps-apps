import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsApi, transactionsApi } from '../../services/api';
import type { PlaySession, PaymentMethod } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatRupiah } from '../../components/ui/badge/Badge';
import { Button, Field, Input, Select } from '../../components/ui/Form';
import { Check } from 'lucide-react';

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

  if (isLoading) return <div className="h-64 bg-gray-900 rounded-xl animate-pulse" />;
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

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-16 h-16 bg-emerald-700 rounded-full flex items-center justify-center mb-4">
          <Check size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Transaksi Berhasil!</h2>
        <p className="text-gray-400 text-sm mb-6">Sesi telah selesai dan pembayaran dicatat</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/cashier')}>Kembali ke Dashboard</Button>
          <Button onClick={() => navigate('/cashier/sessions')}>Lihat Sesi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Checkout</h1>

      {/* Session info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
        <p className="text-sm font-semibold text-white mb-3">{session.device?.name}</p>
        <div className="space-y-2 text-sm">
          <Row label="Mulai" value={new Date(session.started_at).toLocaleTimeString('id-ID')} />
          <Row label="Durasi" value={`${durationMinutes} menit`} />
          {session.customer && <Row label="Pelanggan" value={session.customer.name} />}
        </div>
      </div>

      {/* FnB items */}
      {cart.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Item FnB</p>
          {cart.map((item) => (
            <div key={item.fnb_item_id} className="flex justify-between text-sm py-1.5">
              <span className="text-gray-300">{item.name} ×{item.quantity}</span>
              <span className="text-white">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cost breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase mb-3">Rincian Biaya</p>
        <Row label="Biaya Gaming" value={formatRupiah(gamingTotal)} note="dihitung oleh backend" />
        <Row label="Biaya FnB" value={formatRupiah(fnbTotal)} />
        <div className="border-t border-gray-800 pt-2 mt-2">
          <Row label="Total" value={formatRupiah(grandTotal)} bold />
        </div>
        {dpPaid > 0 && <Row label="DP Terbayar" value={`−${formatRupiah(dpPaid)}`} />}
        <div className="border-t border-gray-800 pt-2">
          <Row label="Sisa yang Harus Dibayar" value={formatRupiah(remainingAmount)} bold />
        </div>
      </div>

      {/* Payment */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 space-y-4">
        <p className="text-xs font-medium text-gray-500 uppercase">Pembayaran</p>
        <Field label="Metode Pembayaran">
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </Field>

        {paymentMethod === 'cash' && (
          <>
            <Field label="Uang yang Diterima (Rp)">
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={String(remainingAmount)}
              />
            </Field>
            {paid > 0 && (
              <div className="bg-gray-800 rounded-lg px-4 py-3 flex justify-between text-sm">
                <span className="text-gray-400">Kembalian</span>
                <span className="font-bold text-emerald-400">{formatRupiah(change)}</span>
              </div>
            )}
          </>
        )}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleCheckout}
        loading={saving}
        disabled={paymentMethod === 'cash' && paid < remainingAmount}
      >
        Selesaikan Transaksi
      </Button>
    </div>
  );
}

function Row({ label, value, bold, note }: {
  label: string; value: string; bold?: boolean; note?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">
        {label}
        {note && <span className="text-gray-600 text-xs ml-1">({note})</span>}
      </span>
      <span className={bold ? 'font-bold text-white' : 'text-gray-200'}>{value}</span>
    </div>
  );
}
