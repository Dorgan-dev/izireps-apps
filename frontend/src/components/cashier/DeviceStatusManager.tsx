import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Device } from '../../types'
import { deviceApi } from '../../api'
import { deviceStatusLabel, deviceStatusBadge } from '../../utils'
import { Button, EmptyState, Spinner, ConfirmDialog } from '../common'
import { useState } from 'react'

export function DeviceStatusManager() {
  const qc = useQueryClient()
  const [target, setTarget] = useState<Device | null>(null)

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list().then(r => r.data.data as Device[]),
    refetchInterval: 10_000,
  })

  const mutation = useMutation({
    mutationFn: (device: Device) => {
      const newStatus = device.status === 'maintenance' ? 'available' : 'maintenance'
      const note = newStatus === 'maintenance'
        ? 'Ditandai perbaikan oleh kasir'
        : 'Selesai perbaikan, dikembalikan kasir'
      return deviceApi.updateStatus(device.id, newStatus, note)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      setTarget(null)
    },
  })

  const all = devices ?? []
  const canToggle = (d: Device) => d.status === 'available' || d.status === 'maintenance'
  const willMaint = target?.status === 'available'

  if (isLoading) return <Spinner className="py-16" />

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        ℹ️ Kasir hanya dapat mengubah status perangkat antara <strong>Tersedia</strong> dan <strong>Perbaikan</strong>.
        Untuk edit data perangkat atau tarif, hubungi owner.
      </div>

      {!all.length ? (
        <EmptyState icon="🎮" title="Tidak ada perangkat" />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perangkat</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tipe</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {all.map((device, idx) => (
                <tr key={device.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{device.name}</p>
                    {device.tv_ip_address && (
                      <p className="text-xs text-gray-400 font-mono">{device.tv_ip_address}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{device.ps_type}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ring-1 ${deviceStatusBadge[device.status]}`}>
                      {deviceStatusLabel[device.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canToggle(device) ? (
                      <Button
                        size="sm"
                        variant={device.status === 'maintenance' ? 'secondary' : 'danger'}
                        onClick={() => setTarget(device)}
                      >
                        {device.status === 'maintenance' ? '✓ Selesai perbaikan' : 'Tandai perbaikan'}
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-300">
                        {device.status === 'in_use' ? 'Sedang digunakan' : 'Dibooking'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && mutation.mutate(target)}
        loading={mutation.isPending}
        title={willMaint ? 'Tandai dalam perbaikan?' : 'Selesai perbaikan?'}
        description={
          willMaint
            ? `${target?.name} tidak akan bisa digunakan sampai status dikembalikan ke tersedia.`
            : `${target?.name} akan kembali berstatus tersedia dan bisa digunakan.`
        }
        confirmLabel={willMaint ? 'Tandai perbaikan' : 'Selesai perbaikan'}
        variant={willMaint ? 'warning' : 'info'}
      />
    </div>
  )
}
