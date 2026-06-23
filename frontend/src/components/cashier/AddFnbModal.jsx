import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatRupiah } from "../../utils";
import { sessionsApi, fnbApi } from "../../services/api";
import toast from "react-hot-toast";
import Button from "../../components/ui/button/Button";

// ─── Modal Tambah F&B (Sesi Aktif) ────────────────────────────────────────────
export default function AddFnbModal({ session, onClose }) {
  const qc = useQueryClient();
  const [cart, setCart] = useState({});

  const { data: cats } = useQuery({
    queryKey: ["fnb-categories"],
    queryFn: () => fnbApi.categories().then((r) => r.data.data),
  });

  const allItems = (cats ?? [])
    .flatMap((c) => c.items ?? [])
    .filter((i) => i.is_available && i.stock > 0);

  const adjust = (id, d, max) =>
    setCart((p) => {
      const n = Math.max(0, Math.min(max, (p[id] ?? 0) + d));
      if (!n) {
        const { [id]: _, ...r } = p;
        return r;
      }
      return { ...p, [id]: n };
    });

  const totalFnbPrice = Object.entries(cart).reduce((s, [id, q]) => {
    const item = allItems.find((i) => i.id === Number(id));
    return s + (item?.price ?? 0) * q;
  }, 0);

  const mutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, quantity]) => ({ fnb_item_id: Number(id), quantity }));
      return sessionsApi.addFnb(session.id, items);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["play_sessions"] });
      qc.invalidateQueries({ queryKey: ["fnb-categories"] });
      onClose();
      toast.success("Berhasil menambah pesanan F&B!");
    },
    onError: () => {
      toast.error("Gagal menambah F&B");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 p-3 rounded-xl mb-2">
        <p className="text-sm font-medium text-gray-900">
          Pesanan untuk {session.device?.name ?? "Sesi Aktif"}
        </p>
        <p className="text-xs text-gray-500">
          {session.customer?.name ?? "Walk-in"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!allItems.length ? (
          <p className="text-xs text-gray-400">Tidak ada item F&B tersedia.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1">
            {(cats ?? []).map((cat) => {
              const catItems = (cat.items ?? []).filter(
                (i) => i.is_available && i.stock > 0,
              );
              if (!catItems.length) return null;
              return (
                <div key={cat.id} className="mb-2">
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {cat.name}
                  </p>
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjust(item.id, -1, item.stock)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">
                          {cart[item.id] ?? 0}
                        </span>
                        <button
                          onClick={() => adjust(item.id, 1, item.stock)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        {totalFnbPrice > 0 && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatRupiah(totalFnbPrice)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 mt-2">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          loading={mutation.isPending}
          disabled={totalFnbPrice === 0}
          onClick={() => mutation.mutate()}
        >
          Pesan & Masukkan Tagihan
        </Button>
      </div>
    </div>
  );
}
