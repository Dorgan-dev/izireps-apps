import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Device, DeviceRate } from '../../types'
import api from '../../api'
import { formatRupiah, formatTime } from '../../utils'
import { Button } from '../ui/Form'
import Modal from '../ui/modal'
import Badge from '../ui/badge/Badge'
import { Spinner, EmptyState, ConfirmDialog } from '../common'
import { RateForm } from './RateForm'

interface RatePanelProps { device: Device; onClose: () => void }

export function RatePanel({ device, onClose }: RatePanelProps) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editRate, setEditRate] = useState<DeviceRate | null>(null)
  const [deleteRate, setDeleteRate] = useState<DeviceRate | null>(null)

  const { data: rates, isLoading } = useQuery({
    queryKey: ['rates', device.id],
    queryFn: () => api.get(`/devices/${device.id}/rates`).then(r => r.data.data as DeviceRate[]),
  })

  const deleteMutation = useMutation({
    mutationFn: (rate: DeviceRate) => api.delete(`/rates/${rate.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rates', device.id] })
      setDeleteRate(null)
    },
  })

  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ['rates', device.id] })
    qc.invalidateQueries({ queryKey: ['devices'] })
    setShowForm(false)
    setEditRate(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{device.name}</p>
          <p className="text-xs text-gray-400">{device.ps_type}</p>
        </div>
        <Button size="sm" variant="primary" onClick={() => { setEditRate(null); setShowForm(true) }}>
          + Tambah tarif
        </Button>
      </div>

      {isLoading ? <Spinner className="py-8" /> : !rates?.length ? (
        <EmptyState icon="Rp." title="Belum ada tarif" description="Tambah minimal satu tarif agar perangkat bisa digunakan" />
      ) : (
        <div className="flex flex-col gap-2">
          {rates.map(rate => (
            <div key={rate.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{formatRupiah(rate.price_per_hour)} / jam</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {rate.effective_from
                    ? `${formatTime(rate.effective_from)} – ${formatTime(rate.effective_until ?? '')} (tarif jam)`
                    : 'Tarif default (seharian)'}
                </p>
              </div>
              <Badge variant={rate.is_active ? 'light' : 'solid'}>
                {rate.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => { setEditRate(rate); setShowForm(true) }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setDeleteRate(rate)}>Hapus</Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-1 border-t border-gray-100">
        <Button variant="outline" onClick={onClose}>Tutup</Button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditRate(null) }}
        title={editRate ? 'Edit tarif' : 'Tambah tarif'}
      >
        <RateForm
          deviceId={device.id}
          rate={editRate}
          onClose={() => { setShowForm(false); setEditRate(null) }}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteRate}
        onClose={() => setDeleteRate(null)}
        onConfirm={() => deleteRate && deleteMutation.mutate(deleteRate)}
        loading={deleteMutation.isPending}
        title="Hapus tarif ini?"
        description={`Tarif ${formatRupiah(deleteRate?.price_per_hour ?? 0)}/jam akan dihapus permanen.`}
        confirmLabel="Hapus tarif"
        variant="danger"
      />
    </div>
  )
}