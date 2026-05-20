import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PlaySession, FnbCategory, PaymentMethod } from '../../types'
import { sessionApi, fnbApi } from '../../api'
import { formatRupiah, formatDuration, getElapsedMinutes, calcGamingCost, paymentMethodLabel } from '../../utils'
import { Button, Modal, Field, Input, Select, Spinner } from '../../components/common'

function useTimer(startedAt: string | null) {
  const [m, setM] = useState(startedAt ? getElapsedMinutes(startedAt) : 0)
  useEffect(() => {
    if (!startedAt) return
    setM(getElapsedMinutes(startedAt))
    const id = setInterval(() => setM(getElapsedMinutes(startedAt)), 30_000)
    return () => clearInterval(id)
  }, [startedAt])
  return m
}

function FnbOrderModal({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const qc = useQueryClient()
  const [cart, setCart] = useState<Record<number, number>>({})
  const { data: cats, isLoading } = useQuery({
    queryKey: ['fnb-categories'],
    queryFn: () => fnbApi.categories().then(r => r.data.data as FnbCategory[]),
  })
  const mutation = useMutation({
    mutationFn: () => sessionApi.addFnb(sessionId,
      Object.entries(cart).filter(([, q]) => q > 0).map(([id, quantity]) => ({ fnb_item_id: Number(id), quantity }))
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['session', sessionId] }); onClose() },
  })
  const adjust = (id: number, d: number, max: number) =>
    setCart(p => { const n = Math.max(0, Math.min(max, (p[id] ?? 0) + d)); if (!n) { const { [id]: _, ...r } = p; return r }; return { ...p, [id]: n } })
  const allItems = cats?.flatMap(c => c.items ?? []) ?? []
  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.entries(cart).reduce((s, [id, q]) => s + (allItems.find(i => i.id === Number(id))?.price ?? 0) * q, 0)
  return (
    <div className="flex flex-col gap-4">
      {isLoading ? <Spinner className="py-8" /> : cats?.map(cat =>
        (cat.items?.filter(i => i.is_available && i.stock > 0).length ?? 0) > 0 && (
          <div key={cat.id}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{cat.name}</p>
            {cat.items!.filter(i => i.is_available && i.stock > 0).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-800">{item.name}</p><p className="text-xs text-gray-400">{formatRupiah(item.price)} · Stok: {item.stock}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjust(item.id, -1, item.stock)} className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">−</button>
                  <span className="w-6 text-center text-sm font-medium">{cart[item.id] ?? 0}</span>
                  <button onClick={() => adjust(item.id, 1, item.stock)} className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">+</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {totalQty > 0 && <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between text-sm"><span className="text-gray-500">{totalQty} item</span><span className="font-medium">{formatRupiah(totalPrice)}</span></div>}
      <div className="flex gap-3 justify-end pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" disabled={totalQty === 0} loading={mutation.isPending} onClick={() => mutation.mutate()}>Tambah ke sesi</Button>
      </div>
    </div>
  )
}

function ExtendModal({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const qc = useQueryClient()
  const [mins, setMins] = useState('30')
  const mutation = useMutation({
    // ⚠️ SESUAIKAN: tambahkan extend() ke sessionApi jika belum ada
    // mutationFn: () => sessionApi.extend(sessionId, Number(mins)),
    mutationFn: () => Promise.resolve(), // placeholder
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['session', sessionId] }); onClose() },
  })
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">Pilih durasi penambahan waktu (kelipatan 15 menit).</p>
      <div className="grid grid-cols-3 gap-2">
        {[15, 30, 45, 60, 90, 120].map(opt => (
          <button key={opt} onClick={() => setMins(String(opt))}
            className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
              mins === String(opt) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}>{formatDuration(opt)}</button>
        ))}
      </div>
      <div className="flex gap-3 justify-end pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" loading={mutation.isPending} onClick={() => mutation.mutate()}>+ Tambah {formatDuration(Number(mins))}</Button>
      </div>
    </div>
  )
}

function CheckoutModal({ session, onClose, onSuccess }: { session: PlaySession; onClose: () => void; onSuccess: () => void }) {
  const qc = useQueryClient()
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const trx = session.transaction
  const remaining = trx?.remaining_amount ?? 0
  const paid = Number(amountPaid) || 0
  const change = Math.max(0, paid - remaining)
  const mutation = useMutation({
    mutationFn: () => sessionApi.checkout(session.id, method, paid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['devices'] }); qc.invalidateQueries({ queryKey: ['sessions'] }); onSuccess() },
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Biaya bermain</span><span>{formatRupiah(trx?.gaming_total ?? 0)}</span></div>
        {(trx?.fnb_total ?? 0) > 0 && <div className="flex justify-between text-gray-600"><span>F&B</span><span>{formatRupiah(trx?.fnb_total ?? 0)}</span></div>}
        {(trx?.dp_paid ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>DP dibayar</span><span>− {formatRupiah(trx?.dp_paid ?? 0)}</span></div>}
        <div className="flex justify-between font-medium text-gray-900 border-t border-gray-200 pt-2"><span>Total bayar</span><span>{formatRupiah(remaining)}</span></div>
      </div>
      <Field label="Metode pembayaran">
        <Select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
          {(['cash', 'qris', 'transfer'] as PaymentMethod[]).map(m => <option key={m} value={m}>{paymentMethodLabel[m]}</option>)}
        </Select>
      </Field>
      {method === 'cash' && (
        <Field label="Nominal dibayar (Rp)">
          <Input type="number" placeholder="0" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
          {paid >= remaining && paid > 0 && <p className="text-sm text-green-600 font-medium mt-1">Kembalian: {formatRupiah(change)}</p>}
          {paid > 0 && paid < remaining && <p className="text-xs text-red-500 mt-1">Nominal kurang</p>}
        </Field>
      )}
      <div className="flex gap-3 justify-end pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" loading={mutation.isPending}
          disabled={method === 'cash' && (paid < remaining || paid === 0)}
          onClick={() => mutation.mutate()}>Selesaikan sesi</Button>
      </div>
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
// ⚠️ SESUAIKAN:
//   - sessionId → dari useParams<{ id: string }>() di halaman /kasir/sesi/:id
//   - GET /api/sessions/:id harus return: device, customer, booking, transaction (+ items)
export default function SessionPanel() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()
  const [showFnb, setShowFnb]           = useState(false)
  const [showExtend, setShowExtend]     = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionApi.show(sessionId).then(r => r.data.data as PlaySession),
    refetchInterval: 30_000,
  })

  const elapsed     = useTimer(session?.started_at ?? null)
  const pricePerHour = session?.device?.current_rate?.price_per_hour ?? 0
  const gamingEst   = calcGamingCost(elapsed, pricePerHour)
  const fnbTotal    = session?.transaction?.fnb_total ?? 0
  const dpPaid      = session?.transaction?.dp_paid   ?? 0
  const grandEst    = Math.max(0, gamingEst + fnbTotal - dpPaid)

  if (isLoading) return <Spinner className="py-20" />
  if (!session)  return <div className="py-20 text-center text-gray-400">Sesi tidak ditemukan</div>

  const isActive = session.status === 'active'

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/cashier')} className="text-gray-400 hover:text-gray-700 text-sm">← Kembali</button>
        <h1 className="text-base font-medium text-gray-900">Sesi — {session.device?.name}</h1>
        <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${isActive ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
          {isActive ? 'Aktif' : 'Selesai'}
        </span>
      </div>

      {isActive && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">Durasi bermain</p>
          <p className="text-5xl font-medium text-amber-700 tabular-nums">{formatDuration(elapsed)}</p>
          <p className="text-sm text-amber-500 mt-2">Est. biaya: {formatRupiah(gamingEst)}</p>
          {session.customer && <p className="text-sm text-amber-600 mt-1">Pelanggan: {session.customer.name}</p>}
          {session.booking  && <p className="text-xs text-amber-500 mt-0.5">Booking #{session.booking.id}</p>}
        </div>
      )}

      {(session.transaction?.items?.length ?? 0) > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-gray-100">Order F&B</p>
          {session.transaction?.items?.map(item => (
            <div key={item.id} className="flex justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-700">{item.item_name} × {item.quantity}</span>
              <span className="font-medium">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 bg-gray-50 text-sm">
            <span className="text-gray-500">Subtotal F&B</span>
            <span className="font-medium">{formatRupiah(fnbTotal)}</span>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Est. biaya bermain ({formatDuration(elapsed)})</span><span>{formatRupiah(gamingEst)}</span></div>
        {fnbTotal > 0 && <div className="flex justify-between text-gray-600"><span>F&B</span><span>{formatRupiah(fnbTotal)}</span></div>}
        {dpPaid  > 0 && <div className="flex justify-between text-green-600"><span>DP dibayar</span><span>− {formatRupiah(dpPaid)}</span></div>}
        <div className="flex justify-between font-medium text-gray-900 border-t border-gray-200 pt-2"><span>Est. total</span><span>{formatRupiah(grandEst)}</span></div>
      </div>

      {isActive && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="w-full" onClick={() => setShowFnb(true)}>+ Order F&B</Button>
            <Button variant="secondary" className="w-full" onClick={() => setShowExtend(true)}>+ Tambah waktu</Button>
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={() => setShowCheckout(true)}>Selesaikan & checkout</Button>
        </div>
      )}

      <Modal open={showFnb} onClose={() => setShowFnb(false)} title="Order F&B" maxWidth="max-w-lg">
        <FnbOrderModal sessionId={session.id} onClose={() => setShowFnb(false)} />
      </Modal>
      <Modal open={showExtend} onClose={() => setShowExtend(false)} title="Tambah waktu bermain">
        <ExtendModal sessionId={session.id} onClose={() => setShowExtend(false)} />
      </Modal>
      <Modal open={showCheckout} onClose={() => setShowCheckout(false)} title="Checkout">
        <CheckoutModal session={session} onClose={() => setShowCheckout(false)} onSuccess={() => navigate('/cashier')} />
      </Modal>
    </div>
  )
}
