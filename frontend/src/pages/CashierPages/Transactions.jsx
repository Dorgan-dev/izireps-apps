import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "../../api";
import { formatRupiah, formatDateTime, paymentMethodLabel } from "../../utils";
import { Badge, EmptyState, Spinner} from "../../components/common";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DatePicker from "../../components/form/DatePicker";
import Select from "../../components/form/Select";
import Modal from "../../components/ui/modal";

// ─── Detail Struk Transaksi ──────────────────────────────────────────────────
function ReceiptModal({ trx }) {
  return (
    <div className="flex flex-col gap-3 text-sm dark:text-gray-300">
      <div className="text-center pb-3 border-b border-gray-100 dark:border-gray-800">
        <p className="font-medium text-gray-900 text-base dark:text-white">
          Rental PlayStation
        </p>
        <p className="text-xs text-gray-400 font-mono mt-1">
          {trx.invoice_number}
        </p>
        {trx.paid_at && (
          <p className="text-xs text-gray-400">{formatDateTime(trx.paid_at)}</p>
        )}
      </div>

      {/* Item F&B */}
      {(trx.items?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400">
            F&B
          </p>
          {trx.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-1 text-gray-700 dark:text-gray-300"
            >
              <span>
                {item.item_name} × {item.quantity}
              </span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rincian Biaya */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-1.5">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Biaya bermain</span>
          <span>{formatRupiah(trx.gaming_total)}</span>
        </div>
        {trx.fnb_total > 0 && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>F&B</span>
            <span>{formatRupiah(trx.fnb_total)}</span>
          </div>
        )}
        {trx.dp_paid > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>DP dibayar</span>
            <span>− {formatRupiah(trx.dp_paid)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
          <span>Total</span>
          <span>{formatRupiah(trx.grand_total)}</span>
        </div>
        {trx.payment_method && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
            <span>Metode bayar</span>
            <span>
              {paymentMethodLabel[trx.payment_method] || trx.payment_method}
            </span>
          </div>
        )}
        {trx.change_amount > 0 && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
            <span>Kembalian</span>
            <span>{formatRupiah(trx.change_amount)}</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
        Terima kasih sudah bermain! 🎮
      </p>
    </div>
  );
}

// ─── Komponen Utama ──────────────────────────────────────────────────────────
export default function TransactionList() {
  const [page, setPage] = useState(1);
  const [dateFilter, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatus] = useState("paid");
  const [receipt, setReceipt] = useState(null);

  // Mengambil data dengan filter tanggal dan status yang sinkron
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, dateFilter, statusFilter],
    queryFn: () =>
      transactionApi
        .list({
          page,
          date: dateFilter || undefined,
          status: statusFilter || undefined, // PERBAIKAN: Sebelumnya parameter status lupa dikirim ke API
        })
        .then((r) => r.data),
  });

  const transactions = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // Buka detail transaksi (dengan items)
  const openReceipt = async (trx) => {
    if (trx.items) {
      setReceipt(trx);
      return;
    }
    try {
      const res = await transactionApi.show(trx.id);
      setReceipt(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil detail transaksi:", error);
    }
  };

  return (
    <>
      <PageBreadcrumb
        pageDescription="Lihat semua transaksi"
        items={[{ label: "Transaksi", path: "/transactions" }]}
      />

      <ComponentCard
        title="Daftar transaksi"
        headerAction={
          <div className="flex gap-3 flex-wrap items-center">
            <div className="w-32 sm:w-32">
              <Select
                className="w-32 sm:w-32"
                placeholder="Status"
                defaultValue="all"
                options={[
                  { label: "Semua status",},
                  { label: "Lunas", value: "paid" },
                  { label: "Pending", value: "pending" },
                  { label: "Dibatalkan", value: "cancelled" },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatus(e);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-32 sm:w-32">
              <DatePicker
                id="filter-date-trx"
                value={dateFilter}
                placeholder="Pilih Tanggal"
                onChange={(_, dateStr) => {
                  setDate(Array.isArray(dateStr) ? dateStr[0] : dateStr);
                  setPage(1);
                }}
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Bar Filter */}
          <div className="flex gap-3 flex-wrap items-center">
            {total > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                {total} transaksi
              </span>
            )}
          </div>

          {/* Konten Utama (Loading / Empty / Tabel) */}
          {isLoading ? (
            <Spinner className="py-16" />
          ) : !transactions.length ? (
            <EmptyState
              icon="🧾"
              title="Tidak ada transaksi"
              description={
                dateFilter
                  ? `Tidak ada transaksi pada ${dateFilter}`
                  : "Belum ada transaksi"
              }
            />
          ) : (
            <>
              {/* Tabel dengan dukungan UI Ringan & Gelap */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3 text-right">Gaming</th>
                        <th className="px-4 py-3 text-right">F&B</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300">
                      {transactions.map((trx) => (
                        <tr
                          key={trx.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {trx.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {trx.paid_at ? formatDateTime(trx.paid_at) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatRupiah(trx.gaming_total)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400 dark:text-gray-500">
                            {trx.fnb_total > 0
                              ? formatRupiah(trx.fnb_total)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            {formatRupiah(trx.grand_total)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              label={
                                trx.status === "paid"
                                  ? "Lunas"
                                  : trx.status === "pending"
                                    ? "Pending"
                                    : "Batal"
                              }
                              className={
                                trx.status === "paid"
                                  ? "bg-green-50 text-green-700 border border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                                  : trx.status === "pending"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                    : "bg-gray-50 text-gray-600 border border-gray-200/60 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20"
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openReceipt(trx)}
                              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline cursor-pointer"
                            >
                              Struk
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    ← Sebelumnya
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Halaman {page} dari {lastPage}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal Struk */}
          <Modal
            isOpen={!!receipt}
            onClose={() => setReceipt(null)}
            title="Struk Transaksi"
          >
            {receipt && <ReceiptModal trx={receipt} />}
          </Modal>
        </div>
      </ComponentCard>
    </>
  );
}
