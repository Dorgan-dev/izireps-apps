import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fnbApi } from "../../services/api";
import Button from "../../components/ui/button/Button";
import { Field, Input, EmptyState, Spinner } from "../../components/common";
import Alert from "../../components/ui/alert/Alert";
import Modal from "../../components/ui/modal";
import FnbTable from "../../components/tables/FnbTables";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Select from "../../components/form/Select";

// ─── Form tambah/edit item ────────────────────────────────────────────────────
function ItemForm({ item, categories, onClose, onSuccess }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    category_id: String(item?.category_id ?? categories[0]?.id ?? ""),
    name: item?.name ?? "",
    price: String(item?.price ?? ""),
    stock: String(item?.stock ?? ""),
    is_available: item?.is_available ?? true,
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        category_id: Number(form.category_id),
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        is_available: form.is_available,
      };
      return isEdit
        ? fnbApi.updateItem(item.id, data)
        : fnbApi.createItem(data);
    },
    onSuccess,
  });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Kategori">
        <Select
          value={form.category_id}
          onChange={(val) => set("category_id", val)}
          options={categories
            .filter((c) => c.is_active)
            .map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
        />
      </Field>
      <Field label="Nama item">
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="cth. Es Teh Manis"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga (Rp)">
          <Input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="7000"
          />
        </Field>
        <Field label={isEdit ? "Stok (update)" : "Stok awal"}>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_available}
          onChange={(e) => set("is_available", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Tersedia untuk dijual</span>
      </label>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          loading={mutation.isPending}
          disabled={!form.name || !form.price}
          onClick={() => mutation.mutate()}
        >
          {isEdit ? "Simpan perubahan" : "Tambah item"}
        </Button>
      </div>
    </div>
  );
}

export default function FnbManager() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [catFilter, setCatFilter] = useState(null);

  const { data: cats, isLoading: loadingCats } = useQuery({
    queryKey: ["fnb-categories"],
    queryFn: () => fnbApi.categories().then((r) => r.data.data),
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["fnb-items", catFilter],
    queryFn: () =>
      fnbApi
        .items(catFilter ? { category_id: catFilter } : undefined)
        .then((r) => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (item) =>
      fnbApi.updateItem(item.id, { is_available: !item.is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fnb-items"] }),
  });

  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ["fnb-items"] });
    setShowForm(false);
    setEditItem(null);
  };

  const allItems = items ?? [];
  const lowStock = allItems.filter(
    (i) => i.stock <= 3 && i.is_available,
  ).length;

  return (
    <>
      <PageBreadcrumb
        pageDescription="Kelola makanan dan minuman"
        items={[{ label: "F&B", path: "/fnb" }]}
      ></PageBreadcrumb>
      <ComponentCard
        title="Daftar jajanan"
        headerAction={
          <Button
            size="md"
            onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}
            disabled={!cats?.length}
          >
            + Tambah item
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Filter kategori*/}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCatFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  catFilter === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                Semua
              </button>
              {cats?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    catFilter === c.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {/* Info stok menipis */}
          {lowStock > 0 && (
            <>
              <Alert
                variant="warning"
                title="Stok Menipis"
                message={`Ada ${lowStock} item yang stoknya sedikit. Segera restok atau nonaktifkan.`}
              ></Alert>
            </>
          )}

          {/* Tabel item */}
          {loadingCats || loadingItems ? (
            <Spinner className="py-16" />
          ) : !allItems.length ? (
            <EmptyState
              icon="🍜"
              title="Belum ada item"
              description={
                catFilter
                  ? "Tidak ada item di kategori ini"
                  : "Tambah item F&B untuk mulai berjualan"
              }
            />
          ) : (
            <FnbTable
              items={allItems}
              categories={cats ?? []}
              onEdit={(item) => {
                setEditItem(item);
                setShowForm(true);
              }}
              onToggleStatus={(item) => toggleMutation.mutate(item)}
            />
          )}

          <Modal
            isOpen={showForm}
            onClose={() => {
              setShowForm(false);
              setEditItem(null);
            }}
            title={editItem ? `Edit — ${editItem.name}` : "Tambah item F&B"}
          >
            <ItemForm
              item={editItem}
              categories={cats ?? []}
              onClose={() => {
                setShowForm(false);
                setEditItem(null);
              }}
              onSuccess={handleFormSuccess}
            />
          </Modal>
        </div>
      </ComponentCard>
    </>
  );
}
