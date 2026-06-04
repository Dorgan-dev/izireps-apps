import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FnbCategory, Device } from '../../types'
import { formatRupiah, formatDuration } from '../../utils'
import { Field, Input } from '../../components/common'
import Select from '../../components/form/Select'
import { sessionApi, deviceApi } from '../../api'
import { fnbApi } from '../../services/api'
import Button from '../../components/ui/button/Button'
// ─── Modal sesi baru (walk-in) ────────────────────────────────────────────────
// ⚠️ SESUAIKAN: POST /api/sessions/start-walkin
//   request body: { device_id, session_type, duration_minutes?, customer?, fnb_items? }
export default function NewSessionModal({ onClose }: { onClose: () => void }) {
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