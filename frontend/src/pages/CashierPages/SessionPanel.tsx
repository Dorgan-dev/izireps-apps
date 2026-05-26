import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PlaySession, FnbCategory, Device, PaymentMethod } from '../../types'
import { formatRupiah, formatDuration, getElapsedMinutes, calcGamingCost, sessionStatusLabel, sessionStatusBadge, paymentMethodLabel } from '../../utils'
import { Modal, Field, Input, Spinner, Badge, EmptyState } from '../../components/common'
import Select from '../../components/form/Select'
import { sessionApi, deviceApi, fnbApi } from '../../api'
import toast from 'react-hot-toast'
import { ActiveSessionList } from './ActiveSessionList'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'
import Button from '../../components/ui/button/Button'

// ─── Timer ───────────────────────────────────────────────────────────────────
function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [m, setM] = useState(getElapsedMinutes(startedAt))
  useEffect(() => {
    const id = setInterval(() => setM(getElapsedMinutes(startedAt)), 30_000)
    return () => clearInterval(id)
  }, [startedAt])
  return <span className="tabular-nums font-medium">{formatDuration(m)}</span>
}

// ─── Countdown untuk sesi per_jam ────────────────────────────────────────────
function CountdownTimer({ plannedEndAt }: { plannedEndAt: string }) {
  const calc = () => {
    const diff = Math.max(0, Math.floor((new Date(plannedEndAt).getTime() - Date.now()) / 60000))
    return diff
  }
  const [remaining, setRemaining] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 30_000)
    return () => clearInterval(id)
  }, [plannedEndAt])

  if (remaining <= 0) return <span className="text-red-600 font-medium tabular-nums">Waktu habis</span>
  return (
    <span className={`tabular-nums font-medium ${remaining <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
      sisa {formatDuration(remaining)}
    </span>
  )
}

// ─── Modal sesi baru (walk-in) ────────────────────────────────────────────────
// ⚠️ SESUAIKAN: POST /api/sessions/start-walkin
//   request body: { device_id, session_type, duration_minutes?, customer?, fnb_items? }
function NewSessionModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [deviceId, setDeviceId] = useState('')
  const [sessionType, setSessionType] = useState<'per_jam' | 'bebas'>('bebas')
  const [hours, setHours] = useState('1')
  const [minutes, setMinutes] = useState('0')
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [cart, setCart] = useState<Record<number, number>>({})
  const [step, setStep] = useState<1 | 2>(1)

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list().then(r => r.data.data as Device[]),
  })

  const { data: cats } = useQuery({
    queryKey: ['fnb-categories'],
    queryFn: () => fnbApi.categories().then(r => r.data.data as FnbCategory[]),
  })

  const availableDevices = (devices ?? []).filter(d => d.status === 'available')
  const allItems = (cats ?? []).flatMap(c => c.items ?? []).filter(i => i.is_available && i.stock > 0)
  const totalDurationMin = (parseInt(hours) || 1) * 60 + (parseInt(minutes) || 0)

  const adjust = (id: number, d: number, max: number) =>
    setCart(p => {
      const n = Math.max(0, Math.min(max, (p[id] ?? 0) + d))
      if (!n) { const { [id]: _, ...r } = p; return r }
      return { ...p, [id]: n }
    })

  const totalFnbPrice = Object.entries(cart).reduce((s, [id, q]) => {
    const item = allItems.find(i => i.id === Number(id))
    return s + (item?.price ?? 0) * q
  }, 0)

  const mutation = useMutation({
    mutationFn: () => sessionApi.startWalkIn({
      device_id: Number(deviceId),
      session_type: sessionType,
      duration_minutes: sessionType === 'per_jam' ? totalDurationMin : undefined,
      customer: custName || custPhone ? { name: custName, phone: custPhone } : undefined,
      fnb_items: Object.entries(cart).filter(([, q]) => q > 0)
        .map(([id, quantity]) => ({ fnb_item_id: Number(id), quantity })),
    }),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['play_sessions'] })
      qc.invalidateQueries({ queryKey: ['devices'] })
      onClose()
      navigate(`/cashier`) // Back to dashboard or keep it here since it auto updates
    },
  })
  return (
    <>
      <div className="flex flex-col gap-5">
        {/* ── Step indicator ── */}
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
              <span className={`text-xs ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Sesi & perangkat' : 'Pelanggan & F&B'}
              </span>
              {s < 2 && <span className="text-gray-200 mx-1">──</span>}
            </div>
          ))}
        </div>

        {/* ── Step 1: Perangkat & jenis waktu ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Pilih perangkat">
              <Select
                value={deviceId}
                onChange={(val) => setDeviceId(val)}
                options={availableDevices.map((d) => ({
                  value: String(d.id),
                  label: `${d.name} (${d.ps_type})${d.current_rate
                    ? ` · Rp ${Number(d.current_rate.price_per_hour).toLocaleString('id-ID')}/jam`
                    : ""
                    }`,
                }))}
                placeholder="Pilih Device" />
              {!availableDevices.length && (
                <p className="text-xs text-red-500 mt-1">Tidak ada perangkat yang tersedia saat ini.</p>
              )}
            </Field>

            {/* Pilihan jenis waktu */}
            <Field label="Jenis waktu bermain">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'bebas', label: 'Bebas', desc: 'Tidak ada batas waktu' },
                  { value: 'per_jam', label: 'Per Jam', desc: 'Tentukan durasi di awal' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSessionType(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${sessionType === opt.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            {/* Input durasi jika per_jam */}
            {sessionType === 'per_jam' && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-medium text-blue-700">Tentukan durasi bermain (minimal 1 jam)</p>
                <Field label="Jam">
                  <Select
                    value={String(hours)}
                    onChange={(val) => setHours(String(val))}
                    options={[1, 2, 3, 4, 5, 6].map(h => ({
                      value: String(h),
                      label: `${h} jam`
                    }))}
                    placeholder="Pilih jam"
                  />
                </Field>
                <p className="text-xs text-blue-600">
                  Total: <span className="font-medium">{formatDuration(totalDurationMin)}</span>
                  {' '}· Sesi berakhir pukul{' '}
                  <span className="font-medium">
                    {new Date(Date.now() + totalDurationMin * 60000)
                      .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            )}
            <div className="flex justify-end pt-1">
              <Button variant="primary" disabled={!deviceId} onClick={() => setStep(2)}>
                Lanjutkan →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Data pelanggan & F&B ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Data pelanggan — opsional */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Data pelanggan <span className="text-gray-300 font-normal normal-case">(opsional)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nama">
                  <Input value={custName} onChange={e => setCustName(e.target.value)}
                    placeholder="cth. Budi Santoso" />
                </Field>
                <Field label="No HP">
                  <Input type="tel" value={custPhone} onChange={e => setCustPhone(e.target.value)}
                    placeholder="cth. 0812xxxx" />
                </Field>
              </div>
            </div>

            {/* Order F&B — opsional */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Order F&B <span className="text-gray-300 font-normal normal-case">(opsional)</span>
              </p>
              {!allItems.length ? (
                <p className="text-xs text-gray-400">Tidak ada item F&B tersedia.</p>
              ) : (
                <div className="max-h-52 overflow-y-auto flex flex-col gap-1 pr-1">
                  {(cats ?? []).map(cat => {
                    const catItems = (cat.items ?? []).filter(i => i.is_available && i.stock > 0)
                    if (!catItems.length) return null
                    return (
                      <div key={cat.id} className="mb-2">
                        <p className="text-xs font-medium text-gray-400 mb-1">{cat.name}</p>
                        {catItems.map(item => (
                          <div key={item.id}
                            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-sm text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-400">{formatRupiah(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => adjust(item.id, -1, item.stock)}
                                className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">−</button>
                              <span className="w-5 text-center text-sm font-medium">{cart[item.id] ?? 0}</span>
                              <button onClick={() => adjust(item.id, 1, item.stock)}
                                className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
              {totalFnbPrice > 0 && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal F&B</span>
                  <span className="font-medium">{formatRupiah(totalFnbPrice)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between pt-1 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setStep(1)}>← Kembali</Button>
              <Button variant="primary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
                ▶ Mulai sesi
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Modal Tambah F&B (Sesi Aktif) ────────────────────────────────────────────
function AddFnbModal({ session, onClose }: { session: PlaySession, onClose: () => void }) {
  const qc = useQueryClient()
  const [cart, setCart] = useState<Record<number, number>>({})

  const { data: cats } = useQuery({
    queryKey: ['fnb-categories'],
    queryFn: () => fnbApi.categories().then(r => r.data.data as FnbCategory[]),
  })

  const allItems = (cats ?? []).flatMap(c => c.items ?? []).filter(i => i.is_available && i.stock > 0)

  const adjust = (id: number, d: number, max: number) =>
    setCart(p => {
      const n = Math.max(0, Math.min(max, (p[id] ?? 0) + d))
      if (!n) { const { [id]: _, ...r } = p; return r }
      return { ...p, [id]: n }
    })

  const totalFnbPrice = Object.entries(cart).reduce((s, [id, q]) => {
    const item = allItems.find(i => i.id === Number(id))
    return s + (item?.price ?? 0) * q
  }, 0)

  const mutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(cart).filter(([, q]) => q > 0)
        .map(([id, quantity]) => ({ fnb_item_id: Number(id), quantity }))
      return sessionApi.addFnb(session.id, items)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['play_sessions'] })
      qc.invalidateQueries({ queryKey: ['fnb-categories'] })
      onClose()
      toast.success('Berhasil menambah pesanan F&B!')
    },
    onError: () => {
      toast.error('Gagal menambah F&B')
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 p-3 rounded-xl mb-2">
        <p className="text-sm font-medium text-gray-900">Pesanan untuk {session.device?.name ?? 'Sesi Aktif'}</p>
        <p className="text-xs text-gray-500">{session.customer?.name ?? 'Walk-in'}</p>
      </div>

      <div className="flex flex-col gap-3">
        {!allItems.length ? (
          <p className="text-xs text-gray-400">Tidak ada item F&B tersedia.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1">
            {(cats ?? []).map(cat => {
              const catItems = (cat.items ?? []).filter(i => i.is_available && i.stock > 0)
              if (!catItems.length) return null
              return (
                <div key={cat.id} className="mb-2">
                  <p className="text-xs font-medium text-gray-400 mb-1">{cat.name}</p>
                  {catItems.map(item => (
                    <div key={item.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{formatRupiah(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjust(item.id, -1, item.stock)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">−</button>
                        <span className="w-5 text-center text-sm font-medium">{cart[item.id] ?? 0}</span>
                        <button onClick={() => adjust(item.id, 1, item.stock)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
        {totalFnbPrice > 0 && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">{formatRupiah(totalFnbPrice)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 mt-2">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" loading={mutation.isPending} disabled={totalFnbPrice === 0} onClick={() => mutation.mutate()}>
          Pesan & Masukkan Tagihan
        </Button>
      </div>
    </div>
  )
}

// ─── Kartu sesi aktif ─────────────────────────────────────────────────────────
function SessionCard({ session, onAddFnb }: { session: PlaySession, onAddFnb: (s: PlaySession) => void }) {
  const navigate = useNavigate()
  const isTimeUp = session.status === 'time_up'
  const isExtended = session.extend_count > 0

  return (
    <div
      onClick={() => navigate(`/cashier/sessions/${session.id}/checkout`)}
      className={`bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer
        hover:shadow-sm transition-all ${isTimeUp ? 'border-red-200' : 'border-gray-100 hover:border-gray-300'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isTimeUp ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
            }`} />
          <div>
            <p className="font-medium text-gray-900 text-sm">{session.device?.name ?? '—'}</p>
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
            label={session.session_type === 'per_jam' ? 'Per Jam' : 'Bebas'}
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
        {session.customer?.name ?? 'Walk-in'}
        {session.booking_id && <span className="ml-1 text-blue-400">· Booking #{session.booking_id}</span>}
      </p>

      {/* Timer */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Durasi</p>
          <ElapsedTimer startedAt={session.started_at} />
        </div>
        {session.session_type === 'per_jam' && session.planned_end_at && (
          <div className={`rounded-xl px-3 py-2 ${isTimeUp ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-400 mb-0.5">Waktu</p>
            {isTimeUp
              ? <span className="text-red-600 font-medium text-sm">Waktu habis!</span>
              : <CountdownTimer plannedEndAt={session.planned_end_at} />
            }
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
          onClick={(e) => { e.stopPropagation(); onAddFnb(session); }}
        >
          🍔 Tambah F&B
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); navigate(`/cashier/sessions/${session.id}/checkout`); }}
        >
          Checkout
        </Button>
      </div>
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
// ⚠️ SESUAIKAN:
//   - Path file: src/components/cashier/PlaySessionsPage.tsx
//     (atau src/pages/cashier/ sesuai struktur proyekmu)
//   - GET /api/sessions?status=active,time_up → harus return: device, customer, booking, transaction
//   - navigate ke /kasir/sesi/:id — sesuaikan jika route berbeda
export function PlaySessionsPage() {
  const [showNew, setShowNew] = useState(false)
  const [fnbSession, setFnbSession] = useState<PlaySession | null>(null)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['play_sessions', 'open'],
    queryFn: () =>
      sessionApi.list({ status: 'active,time_up' })
        .then(r => r.data.data as PlaySession[]),
    refetchInterval: 10_000,
  })

  const all = sessions ?? []
  const timeUps = all.filter(s => s.status === 'time_up')
  const actives = all.filter(s => s.status === 'active')

  return (
    <><PageBreadcrumb items={[{ label: 'Sesi bermain', path: '/cashier/sessions' }]} pageDescription='Pelanggan yang sedang bermain akan tercatat dalam sesi' />
      <ComponentCard title='Daftar sesi aktif' headerAction={
        <Button size='sm' variant="primary" onClick={() => setShowNew(true)}>
          + Sesi baru
        </Button>
      }>
        <div className="flex flex-col gap-5">
          <ActiveSessionList />
          {/* Alert time_up */}
          {timeUps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span>🔴</span>
              <span>
                <strong>{timeUps.length} sesi</strong> waktunya sudah habis dan menunggu tindakan.
                Segera extend atau checkout.
              </span>
            </div>
          )}

          {/* List sesi */}
          {isLoading ? (<Spinner className="py-16" />) : (
            <div className="flex flex-col gap-4">
              {/* time_up duluan */}
              {timeUps.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-red-500 uppercase tracking-wide">Waktu Habis</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeUps.map(s => <SessionCard key={s.id} session={s} onAddFnb={setFnbSession} />)}
                  </div>
                </div>
              )}
              {/* Sesi aktif */}
              {actives.length > 0 && (
                <div className="flex flex-col gap-3">
                  {timeUps.length > 0 && (
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Sedang Bermain</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actives.map(s => <SessionCard key={s.id} session={s} onAddFnb={setFnbSession} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal sesi baru */}
          <Modal
            open={showNew}
            onClose={() => setShowNew(false)}
            title="Sesi baru — Walk-in"
            maxWidth="max-w-lg"
          >
            <NewSessionModal onClose={() => setShowNew(false)} />
          </Modal>

          {/* Modal tambah F&B */}
          <Modal
            open={!!fnbSession}
            onClose={() => setFnbSession(null)}
            title="Tambah F&B"
            maxWidth="max-w-md"
          >
            {fnbSession && (
              <AddFnbModal session={fnbSession} onClose={() => setFnbSession(null)} />
            )}
          </Modal>
        </div>
      </ComponentCard>
    </>
  )
}

export default PlaySessionsPage;
