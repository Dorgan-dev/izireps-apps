import { useEffect, useState } from 'react';
import { fnbApi } from '../../services/api';
import type { FnbCategory, FnbItem } from '../../types';
import { Button, Field, Input } from '../../components/ui/Form';
import Badge, { formatRupiah } from '../../components/ui/badge/Badge';
import Modal from '../../components/ui/modal';
import { Plus, Pencil } from 'lucide-react';

export default function OwnerFnb() {
  const [categories, setCategories] = useState<FnbCategory[]>([]);
  const [items, setItems] = useState<FnbItem[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [catModal, setCatModal] = useState<'add' | 'edit' | null>(null);
  const [itemModal, setItemModal] = useState<'add' | 'edit' | null>(null);
  const [selCat, setSelCat] = useState<FnbCategory | null>(null);
  const [selItem, setSelItem] = useState<FnbItem | null>(null);
  const [catForm, setCatForm] = useState({ name: '' });
  const [itemForm, setItemForm] = useState({ name: '', price: '', stock: '', category_id: '' });
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setIsLoading(true);
    const [catRes, itemRes] = await Promise.all([fnbApi.categories(), fnbApi.items()]);
    setCategories(catRes.data.data);
    setItems(itemRes.data.data);
    if (!activeCat && catRes.data.data.length > 0) setActiveCat(catRes.data.data[0].id);
    setIsLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const filteredItems = activeCat ? items.filter((i) => i.category_id === activeCat) : items;

  const saveCat = async () => {
    setSaving(true);
    try {
      if (catModal === 'add') await fnbApi.createCategory({ name: catForm.name, is_active: true });
      else if (selCat) await fnbApi.updateCategory(selCat.id, { name: catForm.name });
      setCatModal(null);
      await loadAll();
    } finally { setSaving(false); }
  };

  const saveItem = async () => {
    setSaving(true);
    try {
      const payload = {
        name: itemForm.name,
        price: Number(itemForm.price),
        stock: Number(itemForm.stock),
        category_id: Number(itemForm.category_id || activeCat),
        is_available: true,
      };
      if (itemModal === 'add') await fnbApi.createItem(payload);
      else if (selItem) await fnbApi.updateItem(selItem.id, payload);
      setItemModal(null);
      await loadAll();
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Menu FnB</h1>

      <div className="flex gap-6">
        {/* Category sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase">Kategori</span>
            <button
              onClick={() => { setCatForm({ name: '' }); setSelCat(null); setCatModal('add'); }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeCat === c.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <span className="text-sm truncate">{c.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelCat(c); setCatForm({ name: c.name }); setCatModal('edit'); }}
                  className="opacity-60 hover:opacity-100"
                >
                  <Pencil size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              {filteredItems.length} item
            </span>
            <Button size="sm" onClick={() => {
              setItemForm({ name: '', price: '', stock: '', category_id: String(activeCat ?? '') });
              setSelItem(null); setItemModal('add');
            }}>
              <Plus size={14} /> Tambah Item
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-white text-sm leading-tight">{item.name}</p>
                    <Badge variant={item.is_available ? 'light' : 'solid'}>
                      {item.is_available ? 'Tersedia' : 'Habis'}
                    </Badge>
                  </div>
                  <p className="text-indigo-400 font-semibold text-sm">{formatRupiah(item.price)}</p>
                  <p className="text-xs text-gray-500 mt-1">Stok: {item.stock}</p>
                  <button
                    onClick={() => {
                      setSelItem(item);
                      setItemForm({
                        name: item.name, price: String(item.price),
                        stock: String(item.stock), category_id: String(item.category_id),
                      });
                      setItemModal('edit');
                    }}
                    className="mt-3 text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category modal */}
      <Modal isOpen={catModal !== null} onClose={() => setCatModal(null)} title={catModal === 'add' ? 'Tambah Kategori' : 'Edit Kategori'} size="sm">
        <div className="space-y-4">
          <Field label="Nama Kategori" required>
            <Input value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value })} placeholder="Minuman" />
          </Field>
          <div className="flex gap-3">
            {/* Tambahkan type="button" di sini */}
            <Button type="button" variant="primary" onClick={() => setCatModal(null)} className="flex-1">Batal</Button>
            <Button type="button" onClick={saveCat} loading={saving} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* Item modal */}
      <Modal isOpen={itemModal !== null} onClose={() => setItemModal(null)} title={itemModal === 'add' ? 'Tambah Item' : 'Edit Item'}>
        <div className="space-y-4">
          <Field label="Nama Item" required>
            <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Es Teh Manis" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga (Rp)" required>
              <Input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="5000" />
            </Field>
            <Field label="Stok" required>
              <Input type="number" value={itemForm.stock} onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })} placeholder="50" />
            </Field>
          </div>
          <div className="flex gap-3">
            {/* Tambahkan type="button" di sini */}
            <Button type="button" variant="primary" onClick={() => setItemModal(null)} className="flex-1">Batal</Button>
            <Button type="button" onClick={saveItem} loading={saving} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
