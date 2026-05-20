import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Device } from '../../types'
import { deviceApi, sessionApi } from '../../api'
import {
  deviceStatusLabel, deviceStatusBadge, deviceStatusCard,
  formatRupiah, formatDuration, getElapsedMinutes,
} from '../../utils'
import { Button, Modal, Field, Input, ConfirmDialog } from '../../components/common'

function SessionTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(startedAt))
  useState(() => {
    const id = setInterval(() => setElapsed(getElapsedMinutes(startedAt)), 30_000)
    return () => clearInterval(id)
  })
  return (
    <p className="text-sm font-medium text-amber-700 tabular-nums">
      {formatDuration(elapsed)}
    </p>
  )
}

function StartWalkInModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      sessionApi.startWalkIn(device.id, name || phone ? { name, phone } : undefined),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
      onClose()
      // ⚠️ SESUAIKAN: pastikan route /cashier/sessions/:id ada di router
      navigate(`/cashier/sessions/${res.data.data.id}`)
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Data pelanggan opsional. Isi jika ingin simpan riwayat pelanggan.
      </p>
      <Field label="Nama pelanggan (opsional)">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="cth. Budi Santoso" />
      </Field>
      <Field label="Nomor HP (opsional)">
        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="cth. 0812xxxx" />
      </Field>
      {device.current_rate && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          Tarif aktif: <span className="font-medium">{formatRupiah(device.current_rate.price_per_hour)}</span> / jam
        </div>
      )}
      <div className="flex gap-3 justify-end pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          ▶ Mulai sesi
        </Button>
      </div>
    </div>
  )
}

function DeviceCard({
  device,
  activeSession,
}: {
  device: Device
  activeSession?: { id: number; started_at: string } | null
}) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showStart, setShowStart] = useState(false)
  const [showMaint, setShowMaint] = useState(false)

  const maintMutation = useMutation({
    mutationFn: () =>
      deviceApi.updateStatus(
        device.id,
        device.status === 'maintenance' ? 'available' : 'maintenance',
        device.status === 'maintenance' ? 'Selesai perbaikan' : 'Ditandai dalam perbaikan'
      ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['devices'] }); setShowMaint(false) },
  })

  return (
    <div className={`rounded-2xl border-2 p-4 flex flex-col gap-3 transition-all ${deviceStatusCard[device.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{device.name}</p>
          <p className="text-xs text-gray-500">{device.ps_type}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ring-1 flex-shrink-0 ${deviceStatusBadge[device.status]}`}>
          {deviceStatusLabel[device.status]}
        </span>
      </div>

      {device.status === 'available' && device.current_rate && (
        <p className="text-xs text-gray-500">{formatRupiah(device.current_rate.price_per_hour)} / jam</p>
      )}
      {device.status === 'in_use' && activeSession && (
        <div className="bg-white/70 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500 mb-0.5">Durasi bermain</p>
          <SessionTimer startedAt={activeSession.started_at} />
        </div>
      )}
      {device.status === 'booked' && (
        <div className="bg-white/70 rounded-xl px-3 py-2">
          <p className="text-xs text-blue-600 font-medium">Ada booking aktif</p>
        </div>
      )}
      {device.status === 'maintenance' && (
        <div className="bg-white/70 rounded-xl px-3 py-2">
          <p className="text-xs text-red-500">Perangkat dalam perbaikan</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mt-auto">
        {device.status === 'available' && (
          <>
            <Button size="sm" variant="primary" className="w-full" onClick={() => setShowStart(true)}>
              ▶ Mulai sesi
            </Button>
            <Button size="sm" variant="danger" className="w-full" onClick={() => setShowMaint(true)}>
              Tandai perbaikan
            </Button>
          </>
        )}
        {device.status === 'in_use' && activeSession && (
          // ⚠️ SESUAIKAN: route sesi aktif
          <Button size="sm" variant="secondary" className="w-full"
            onClick={() => navigate(`/cashier/sessions/${activeSession.id}`)}>
            Lihat sesi aktif →
          </Button>
        )}
        {device.status === 'booked' && (
          <Button size="sm" variant="primary" className="w-full" onClick={() => setShowStart(true)}>
            ▶ Mulai dari booking
          </Button>
        )}
        {device.status === 'maintenance' && (
          <Button size="sm" variant="secondary" className="w-full" onClick={() => setShowMaint(true)}>
            ✓ Selesai perbaikan
          </Button>
        )}
      </div>

      <Modal open={showStart} onClose={() => setShowStart(false)} title={`Mulai sesi — ${device.name}`}>
        <StartWalkInModal device={device} onClose={() => setShowStart(false)} />
      </Modal>

      <ConfirmDialog
        open={showMaint}
        onClose={() => setShowMaint(false)}
        onConfirm={() => maintMutation.mutate()}
        loading={maintMutation.isPending}
        title={device.status === 'maintenance' ? 'Selesai perbaikan?' : 'Tandai perbaikan?'}
        description={device.status === 'maintenance'
          ? `${device.name} akan kembali berstatus tersedia.`
          : `${device.name} akan ditandai dalam perbaikan dan tidak bisa digunakan.`}
        confirmLabel={device.status === 'maintenance' ? 'Selesai perbaikan' : 'Tandai perbaikan'}
        variant={device.status === 'maintenance' ? 'info' : 'warning'}
      />
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
// ⚠️ SESUAIKAN:
//   - GET /api/devices            → endpoint list perangkat
//   - GET /api/sessions?status=active → endpoint sesi aktif
export default function DeviceGrid() {
  const [filter, setFilter] = useState<string>('all')

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list().then(r => r.data.data as Device[]),
    refetchInterval: 5_000,
  })

  const { data: activeSessions } = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () =>
      sessionApi.list({ status: 'active' })
        .then(r => r.data.data as { id: number; device_id: number; started_at: string }[]),
    refetchInterval: 10_000,
  })

  const sessionByDevice = Object.fromEntries(
    (activeSessions ?? []).map(s => [s.device_id, s])
  )

  const all = devices ?? []
  const filtered = filter === 'all' ? all : all.filter(d => d.status === filter)
  const counts = {
    all: all.length,
    available: all.filter(d => d.status === 'available').length,
    in_use: all.filter(d => d.status === 'in_use').length,
    booked: all.filter(d => d.status === 'booked').length,
    maintenance: all.filter(d => d.status === 'maintenance').length,
  }

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'available', 'in_use', 'booked', 'maintenance'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
            {s === 'all' ? 'Semua' : deviceStatusLabel[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="py-16 text-center text-gray-400 text-sm">Tidak ada perangkat</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(device => (
            <DeviceCard key={device.id} device={device}
              activeSession={sessionByDevice[device.id] ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}
