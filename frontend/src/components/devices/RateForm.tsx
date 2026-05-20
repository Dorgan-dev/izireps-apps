import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { DeviceRate } from '../../types'
import api from '../../api'
import { Button, Field, Input } from '../ui/Form'

interface RateFormProps {
  deviceId: number
  rate?: DeviceRate | null
  onClose: () => void
  onSuccess: () => void
}

export function RateForm({ deviceId, rate, onClose, onSuccess }: RateFormProps) {
  const isEdit = !!rate
  const [pricePerHour, setPricePerHour] = useState(String(rate?.price_per_hour ?? ''))
  const [effectiveFrom, setEffectiveFrom] = useState(rate?.effective_from?.slice(0, 5) ?? '')
  const [effectiveUntil, setEffectiveUntil] = useState(rate?.effective_until?.slice(0, 5) ?? '')
  const [isDefault, setIsDefault] = useState(!rate?.effective_from)

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        price_per_hour: Number(pricePerHour),
        effective_from: isDefault ? null : effectiveFrom || null,
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
        <Button variant="outline" onClick={onClose}>Batal</Button>
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