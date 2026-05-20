import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Device, DeviceRate } from '../../types'
import { deviceApi } from '../../api'
import api from '../../api'
import {
  deviceStatusLabel, deviceStatusBadge,
  formatRupiah, formatTime,
} from '../../utils'
import {
  Button, Modal, Field, Input, Select,
  Badge, Spinner, EmptyState, ConfirmDialog, StatCard,
} from '../../components/common'

// ─── Form Perangkat ───────────────────────────────────────────────────────────
interface DeviceFormProps {
  device?: Device | null
  onClose: () => void
  onSuccess: () => void
}

const DeviceForm = ({ device, onClose, onSuccess }: DeviceFormProps) => {
  const isEdit = !!device
  const [form, setForm] = useState({
    name:           device?.name           ?? '',
    ps_type:        device?.ps_type        ?? 'PS5',
    ps_sn:          device?.ps_sn          ?? '',
    tv:             device?.tv             ?? '',
    tv_sn:          device?.tv_sn          ?? '',
    tv_ip_address:  device?.tv_ip_address  ?? '',
    tv_mac_address: device?.tv_mac_address ?? '',
  })

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? deviceApi.update(device!.id, form)
      : deviceApi.create(form),
    onSuccess,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama unit">
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="cth. PS5 Unit 1" />
        </Field>
        <Field label="Tipe PlayStation">
          <Select value={form.ps_type} onChange={e => set('ps_type', e.target.value)}>
            <option value="PS5">PS5</option>
            <option value="PS4">PS4</option>
            <option value="PS4 Pro">PS4 Pro</option>
            <option value="PS3">PS3</option>
          </Select>
        </Field>
      </div>

      <Field label="Serial number konsol" hint="Opsional — untuk identifikasi unit fisik">
        <Input value={form.ps_sn} onChange={e => set('ps_sn', e.target.value)} placeholder="cth. CUH-1200A" />
      </Field>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Konfigurasi TV (untuk integrasi STB)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Merek / model TV">
            <Input value={form.tv} onChange={e => set('tv', e.target.value)} placeholder="cth. Samsung 32" />
          </Field>
          <Field label="Serial number TV">
            <Input value={form.tv_sn} onChange={e => set('tv_sn', e.target.value)} placeholder="cth. SN12345678" />
          </Field>
          <Field label="IP address TV" hint="Format: 192.168.x.x">
            <Input value={form.tv_ip_address} onChange={e => set('tv_ip_address', e.target.value)} placeholder="cth. 192.168.1.101" />
          </Field>
          <Field label="MAC address TV" hint="Format: XX:XX:XX:XX:XX:XX">
            <Input value={form.tv_mac_address} onChange={e => set('tv_mac_address', e.target.value)} placeholder="cth. AA:BB:CC:DD:EE:FF" />
          </Field>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button
          variant="primary"
          loading={mutation.isPending}
          disabled={!form.name || !form.ps_type}
          onClick={() => mutation.mutate()}
        >
          {isEdit ? 'Simpan perubahan' : 'Tambah perangkat'}
        </Button>
      </div>
    </div>
  )
}

// ─── Form Tarif ───────────────────────────────────────────────────────────────
interface RateFormProps {
  deviceId: number
  rate?: DeviceRate | null
  onClose: () => void
  onSuccess: () => void
}

const RateForm = ({ deviceId, rate, onClose, onSuccess }: RateFormProps) => {
  const isEdit = !!rate
  const [pricePerHour, setPricePerHour] = useState(String(rate?.price_per_hour ?? ''))
  const [effectiveFrom, setEffectiveFrom] = useState(rate?.effective_from?.slice(0, 5) ?? '')
  const [effectiveUntil, setEffectiveUntil] = useState(rate?.effective_until?.slice(0, 5) ?? '')
  const [isDefault, setIsDefault] = useState(!rate?.effective_from)

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        price_per_hour:  Number(pricePerHour),
        effective_from:  isDefault ? null : effectiveFrom || null,
        effective_until: isDefault ? null : effectiveUntil || null,
      }
      return isEdit
        ? api.put(`/rates/${rate!.id}`, data)
        : api.post(`/devices/${deviceId}/rates`, data)
    },
    onSuccess,
  })

  return (
    <div className="flex flex-col gap-4">
      <Field label="Harga per jam (Rp)">
        <Input
          type="number" min="1000"
          value={pricePerHour}
          onChange={e => setPricePerHour(e.target.value)}
          placeholder="cth. 15000"
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox" checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Tarif default (berlaku seharian)</span>
      </label>

      {!isDefault && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jam mulai" hint="Format HH:MM">
            <Input
              type="time" value={effectiveFrom}
              onChange={e => setEffectiveFrom(e.target.value)}
            />
          </Field>
          <Field label="Jam selesai" hint="Format HH:MM">
            <Input
              type="time" value={effectiveUntil} min={effectiveFrom}
              onChange={e => setEffectiveUntil(e.target.value)}
            />
          </Field>
        </div>
      )}

      {!isDefault && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700">
          Tarif ini akan aktif pada rentang jam yang dipilih. Pastikan tidak tumpang tindih dengan tarif lain.
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button
          variant="primary"
          loading={mutation.isPending}
          disabled={!pricePerHour || (!isDefault && (!effectiveFrom || !effectiveUntil))}
          onClick={() => mutation.mutate()}
        >
          {isEdit ? 'Simpan tarif' : 'Tambah tarif'}
        </Button>
      </div>
    </div>
  )
}

// ─── Panel Tarif per Perangkat ────────────────────────────────────────────────
interface RatePanelProps { device: Device; onClose: () => void }

const RatePanel = ({ device, onClose }: RatePanelProps) => {
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
        <EmptyState icon="💰" title="Belum ada tarif" description="Tambah minimal satu tarif agar perangkat bisa digunakan" />
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
              <Badge
                label={rate.is_active ? 'Aktif' : 'Nonaktif'}
                className={rate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}
              />
              <Button size="sm" variant="ghost" onClick={() => { setEditRate(rate); setShowForm(true) }}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setDeleteRate(rate)}>Hapus</Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-1 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Tutup</Button>
      </div>

      <Modal
        open={showForm}
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

// ─── Halaman Utama Kelola Perangkat ───────────────────────────────────────────
export function ManageDevicePage() {
  const qc = useQueryClient()
  const [showForm, setShowForm]       = useState(false)
  const [editDevice, setEditDevice]   = useState<Device | null>(null)
  const [rateDevice, setRateDevice]   = useState<Device | null>(null)
  const [deleteDevice, setDeleteDevice] = useState<Device | null>(null)
  const [filterType, setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list().then(r => r.data.data as Device[]),
    refetchInterval: 15000,
  })

  const deleteMutation = useMutation({
    mutationFn: (d: Device) => api.delete(`/devices/${d.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      setDeleteDevice(null)
    },
  })

  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ['devices'] })
    setShowForm(false)
    setEditDevice(null)
  }

  const allDevices = devices ?? []
  const filtered = allDevices.filter(d => {
    const matchType   = filterType   === 'all' || d.ps_type   === filterType
    const matchStatus = filterStatus === 'all' || d.status    === filterStatus
    return matchType && matchStatus
  })

  const psTypes   = [...new Set(allDevices.map(d => d.ps_type))]
  const counts    = {
    total:       allDevices.length,
    available:   allDevices.filter(d => d.status === 'available').length,
    in_use:      allDevices.filter(d => d.status === 'in_use').length,
    maintenance: allDevices.filter(d => d.status === 'maintenance').length,
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Kelola perangkat</h1>
          <p className="text-sm text-gray-400">Tambah, edit, dan kelola unit PlayStation beserta tarifnya</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditDevice(null); setShowForm(true) }}>
          + Tambah perangkat
        </Button>
      </div>

      {/* Stat */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total unit" value={counts.total} />
        <StatCard label="Tersedia" value={counts.available} color="text-green-600" />
        <StatCard label="Digunakan" value={counts.in_use} color="text-amber-600" />
        <StatCard label="Perbaikan" value={counts.maintenance} color="text-red-500" />
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-36">
          <option value="all">Semua tipe</option>
          {psTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-40">
          <option value="all">Semua status</option>
          <option value="available">Tersedia</option>
          <option value="in_use">Digunakan</option>
          <option value="booked">Dibooking</option>
          <option value="maintenance">Perbaikan</option>
        </Select>
      </div>

      {/* Tabel */}
      {isLoading ? <Spinner className="py-16" /> : !filtered.length ? (
        <EmptyState icon="🎮" title="Tidak ada perangkat" description="Tambah unit PlayStation untuk memulai" />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perangkat</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tarif default</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">IP TV</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device, idx) => (
                <tr key={device.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-xs text-gray-400">{device.ps_type}{device.ps_sn ? ` · ${device.ps_sn}` : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={deviceStatusLabel[device.status]}
                      className={deviceStatusBadge[device.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {device.current_rate
                      ? formatRupiah(device.current_rate.price_per_hour) + ' / jam'
                      : <span className="text-red-400 text-xs">Belum ada tarif</span>}
                  </td>
                  <td className="px-4 py-3">
                    {device.tv_ip_address
                      ? <span className="font-mono text-xs text-gray-500">{device.tv_ip_address}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost"
                        onClick={() => setRateDevice(device)}>
                        💰 Tarif
                      </Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => { setEditDevice(device); setShowForm(true) }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger"
                        onClick={() => setDeleteDevice(device)}
                        disabled={device.status === 'in_use'}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tambah/edit perangkat */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditDevice(null) }}
        title={editDevice ? `Edit — ${editDevice.name}` : 'Tambah perangkat baru'}
        maxWidth="max-w-xl"
      >
        <DeviceForm
          device={editDevice}
          onClose={() => { setShowForm(false); setEditDevice(null) }}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* Modal kelola tarif */}
      <Modal
        open={!!rateDevice}
        onClose={() => setRateDevice(null)}
        title={`Tarif — ${rateDevice?.name}`}
        maxWidth="max-w-lg"
      >
        {rateDevice && (
          <RatePanel device={rateDevice} onClose={() => setRateDevice(null)} />
        )}
      </Modal>

      {/* Konfirmasi hapus */}
      <ConfirmDialog
        open={!!deleteDevice}
        onClose={() => setDeleteDevice(null)}
        onConfirm={() => deleteDevice && deleteMutation.mutate(deleteDevice)}
        loading={deleteMutation.isPending}
        title={`Hapus ${deleteDevice?.name}?`}
        description="Perangkat akan dihapus permanen. Riwayat sesi dan transaksi yang sudah ada tetap tersimpan."
        confirmLabel="Hapus perangkat"
        variant="danger"
      />
    </div>
  )
}
