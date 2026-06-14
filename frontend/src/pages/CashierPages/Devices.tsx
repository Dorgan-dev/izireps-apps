import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Device } from '../../types'
import { deviceApi, sessionApi } from '../../api'
import {
  deviceStatusLabel, deviceStatusBadge, deviceStatusCard,
  formatRupiah, formatDuration, getElapsedMinutes,
} from '../../utils'
import { Button, ConfirmDialog } from '../../components/common'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'
import Select from '../../components/form/Select'

// 1. Perbaikan SessionTimer menggunakan useEffect agar tidak leak memory
function SessionTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(getElapsedMinutes(startedAt))

  useEffect(() => {
    // Reset elapsed saat startedAt berubah
    setElapsed(getElapsedMinutes(startedAt))

    const id = setInterval(() => {
      setElapsed(getElapsedMinutes(startedAt))
    }, 30_000)

    return () => clearInterval(id)
  }, [startedAt])

  return (
    <p className="text-sm font-medium text-amber-700 tabular-nums">
      {formatDuration(elapsed)}
    </p>
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
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['devices'] })
      setShowMaint(false) 
    },
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


      <div className="flex flex-col gap-1.5 mt-auto">
        {device.status === 'available' && (
          <Button size="sm" variant="danger" className="w-full" onClick={() => setShowMaint(true)}>
            Tandai perbaikan
          </Button>
        )}
        {device.status === 'in_use' && activeSession && (
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
    <>
      <PageBreadcrumb pageDescription="Daftar semua perangkat" items={[{ label: 'Perangkat', path: '/devices' }]} />
      
      <ComponentCard 
        title="Daftar perangkat" 
        headerAction={
          <div className="flex gap-3 flex-wrap items-center">
            {/* 2. Perbaikan Select: dihubungkan dengan state 'filter' yang benar */}
            <Select 
              className="w-44" defaultValue='all'
              placeholder='Filter Status'
              options={[
                { label: 'Semua status', value: 'all' },
                { label: 'Tersedia', value: 'available' },
                { label: 'Digunakan', value: 'in_use' },
                { label: 'Dibooking', value: 'booked' },
                { label: 'Perbaikan', value: 'maintenance' },
              ]}
              value={filter}
              onChange={e => setFilter(e)} // Sesuaikan e.target.value tergantung handler komponen Select Anda
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {!filtered.length ? (
            <div className="py-16 text-center text-gray-400 text-sm">Tidak ada perangkat</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(device => (
                <DeviceCard 
                  key={device.id} 
                  device={device}
                  activeSession={sessionByDevice[device.id] ?? null} 
                />
              ))}
            </div>
          )}
        </div>
      </ComponentCard>
    </>
  )
}