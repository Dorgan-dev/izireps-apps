import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Device } from '../../types'
import { deviceApi } from '../../api'
import { Button, Field, Input } from '../ui/Form'
import Select from '../form/Select'

interface DeviceFormProps {
  device?: Device | null
  onClose: () => void
  onSuccess: () => void
}

export function DeviceForm({ device, onClose, onSuccess }: DeviceFormProps) {
  const isEdit = !!device
  const [form, setForm] = useState({
    name: device?.name ?? '',
    ps_type: device?.ps_type ?? 'PS5',
    ps_sn: device?.ps_sn ?? '',
    tv: device?.tv ?? '',
    tv_sn: device?.tv_sn ?? '',
    tv_ip_address: device?.tv_ip_address ?? '',
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
        <Button variant="outline" onClick={onClose}>Batal</Button>
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