import { useEffect, useState } from 'react';
import { devicesApi } from '../../services/api';
import type { Device, DeviceRate } from '../../types';
import { Button, Field, Input } from '../../components/ui/Form';
import { formatRupiah } from '../../components/ui/badge/Badge';
import Modal from '../../components/ui/modal';
import { Plus } from 'lucide-react';

export default function OwnerDeviceRates() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rates, setRates] = useState<Record<number, DeviceRate[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [form, setForm] = useState({ price_per_hour: '', effective_from: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    devicesApi.list().then(async (res) => {
      const devList = res.data.data;
      setDevices(devList);
      const rateMap: Record<number, DeviceRate[]> = {};
      await Promise.all(devList.map(async (d) => {
        const r = await devicesApi.rates(d.id);
        rateMap[d.id] = r.data.data;
      }));
      setRates(rateMap);
      setIsLoading(false);
    });
  }, []);

  const openModal = (d: Device) => {
    setSelectedDevice(d);
    setForm({ price_per_hour: '', effective_from: new Date().toISOString().split('T')[0] });
    setModal(true);
  };

  const handleSave = async () => {
    if (!selectedDevice) return;
    setSaving(true);
    try {
      await devicesApi.setRate(selectedDevice.id, {
        price_per_hour: Number(form.price_per_hour),
        effective_from: form.effective_from,
        is_active: true,
      });
      const r = await devicesApi.rates(selectedDevice.id);
      setRates((prev) => ({ ...prev, [selectedDevice.id]: r.data.data }));
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Tarif Perangkat</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-900 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((d) => {
            const activeRate = rates[d.id]?.find((r) => r.is_active);
            return (
              <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{d.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{d.ps_type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {activeRate ? formatRupiah(activeRate.price_per_hour) : '—'}
                    </p>
                    <p className="text-xs text-gray-500">per jam</p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => openModal(d)}>
                    <Plus size={13} /> Set Tarif
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={`Set Tarif — ${selectedDevice?.name}`}>
        <div className="space-y-4">
          <Field label="Tarif per Jam (Rp)" required>
            <Input
              type="number"
              value={form.price_per_hour}
              onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })}
              placeholder="5000"
            />
          </Field>
          <Field label="Berlaku Mulai" required>
            <Input
              type="date"
              value={form.effective_from}
              onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={() => setModal(false)} className="flex-1">Batal</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
