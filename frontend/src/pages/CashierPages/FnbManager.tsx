import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FnbCategory, FnbItem } from '../../types'
import { fnbApi } from '../../api'
import { formatRupiah } from '../../utils'
import { Button, Modal, Field, Input, Select, Badge, EmptyState, Spinner, ConfirmDialog } from '../../components/common'

// ─── Form tambah/edit item ────────────────────────────────────────────────────
function ItemForm({
  item, categories, onClose, onSuccess,
}: {
  item?: FnbItem | null
  categories: FnbCategory[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = !!item
  const [form, setForm] = useState({
    category_id: String(item?.category_id ?? categories[0]?.id ?? ''),
    name: item?.name ?? '',
    price: String(item?.price ?? ''),
    stock: String(item?.stock ?? ''),
    is_available: item?.is_available ?? true,
  })
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        category_id: Number(form.category_id),
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        is_available: form.is_available,
      }
      return isEdit ? fnbApi.updateItem(item!.id, data) : fnbApi.createItem(data)
    },
    onSuccess,
  })

  return (
    <div className="flex flex-col gap-4">
      <Field label="Kategori">
        <Select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
          {categories.filter(c => c.is_active).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Nama item">
        <Input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="cth. Es Teh Manis" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga (Rp)">
          <Input type="number" min="0" value={form.price}
            onChange={e => set('price', e.target.value)} placeholder="7000" />
        </Field>
        <Field label={isEdit ? 'Stok (update)' : 'Stok awal'}>
          <Input type="number" min="0" value={form.stock}
            onChange={e => set('stock', e.target.value)} placeholder="0" />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_available}
          onChange={e => set('is_available', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300" />
        <span className="text-sm text-gray-700">Tersedia untuk dijual</span>
      </label>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant="primary" loading={mutation.isPending}
          disabled={!form.name || !form.price}
          onClick={() => mutation.mutate()}>
          {isEdit ? 'Simpan perubahan' : 'Tambah item'}
        </Button>
      </div>
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
// ⚠️ SESUAIKAN:
//   - Kasir bisa tambah & edit item, tapi TIDAK bisa hapus (hanya owner)
//   - Jika ingin kasir bisa hapus, tambahkan tombol hapus dan
//     pastikan endpoint DELETE /api/fnb-items/:id diberi akses 'cashier' di backend
//   - GET /api/fnb-categories harus return dengan relasi items
export default function FnbManager() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<FnbItem | null>(null)
  const [catFilter, setCatFilter] = useState<number | null>(null)

  const { data: cats, isLoading: loadingCats } = useQuery({
    queryKey: ['fnb-categories'],
    queryFn: () => fnbApi.categories().then(r => r.data.data as FnbCategory[]),
  })

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['fnb-items', catFilter],
    queryFn: () => fnbApi.items(catFilter ? { category_id: catFilter } : undefined)
      .then(r => r.data.data as FnbItem[]),
  })

  const toggleMutation = useMutation({
    mutationFn: (item: FnbItem) =>
      fnbApi.updateItem(item.id, { is_available: !item.is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fnb-items'] }),
  })

  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ['fnb-items'] })
    setShowForm(false)
    setEditItem(null)
  }

  const allItems = items ?? []
  const lowStock = allItems.filter(i => i.stock <= 3 && i.is_available).length

  return (
    <div className="flex flex-col gap-4">
      {/* Info stok menipis */}
      {lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
          <span>⚠️</span>
          <span><strong>{lowStock} item</strong> stoknya menipis (≤ 3). Segera restok atau nonaktifkan.</span>
        </div>
      )}

      {/* Filter kategori + tombol tambah */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${catFilter === null
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
            Semua
          </button>
          {cats?.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${catFilter === c.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}>
              {c.name}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm"
          onClick={() => { setEditItem(null); setShowForm(true) }}
          disabled={!cats?.length}>
          + Tambah item
        </Button>
      </div>

      {/* Tabel item */}
      {loadingCats || loadingItems ? <Spinner className="py-16" /> :
        !allItems.length ? (
          <EmptyState icon="🍜" title="Belum ada item"
            description={catFilter ? 'Tidak ada item di kategori ini' : 'Tambah item F&B untuk mulai berjualan'} />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Kategori</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Harga</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Stok</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {cats?.find(c => c.id === item.category_id)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">{formatRupiah(item.price)}</td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${item.stock <= 3 ? 'text-red-500' : 'text-gray-900'}`}>
                      {item.stock}
                      {item.stock <= 3 && <span className="ml-1 text-xs">⚠</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleMutation.mutate(item)}>
                        <Badge
                          label={item.is_available ? 'Tersedia' : 'Habis'}
                          className={item.is_available
                            ? 'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200'}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost"
                        onClick={() => { setEditItem(item); setShowForm(true) }}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null) }}
        title={editItem ? `Edit — ${editItem.name}` : 'Tambah item F&B'}
      >
        <ItemForm
          item={editItem}
          categories={cats ?? []}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  )
}
