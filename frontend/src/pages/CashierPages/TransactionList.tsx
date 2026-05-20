import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Transaction } from '../../types'
import { transactionApi } from '../../api'
import { formatRupiah, formatDateTime, paymentMethodLabel } from '../../utils'
import { Badge, EmptyState, Spinner, Modal } from '../../components/common'

// ─── Detail struk ─────────────────────────────────────────────────────────────
function ReceiptModal({ trx, onClose }: { trx: Transaction; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="text-center pb-3 border-b border-gray-100">
        <p className="font-medium text-gray-900 text-base">Rental PlayStation</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{trx.invoice_number}</p>
        {trx.paid_at && <p className="text-xs text-gray-400">{formatDateTime(trx.paid_at)}</p>}
      </div>

      {/* Item F&B */}
      {(trx.items?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">F&B</p>
          {trx.items!.map(item => (
            <div key={item.id} className="flex justify-between py-1 text-gray-700">
              <span>{item.item_name} × {item.quantity}</span>
              <span>{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rincian biaya */}
      <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5">
        <div className="flex justify-between text-gray-600">
          <span>Biaya bermain</span>
          <span>{formatRupiah(trx.gaming_total)}</span>
        </div>
        {trx.fnb_total > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>F&B</span>
            <span>{formatRupiah(trx.fnb_total)}</span>
          </div>
        )}
        {trx.dp_paid > 0 && (
          <div className="flex justify-between text-green-600">
            <span>DP dibayar</span>
            <span>− {formatRupiah(trx.dp_paid)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-gray-900 border-t border-gray-200 pt-2 mt-1">
          <span>Total</span>
          <span>{formatRupiah(trx.grand_total)}</span>
        </div>
        {trx.payment_method && (
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Metode bayar</span>
            <span>{paymentMethodLabel[trx.payment_method]}</span>
          </div>
        )}
        {trx.change_amount > 0 && (
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Kembalian</span>
            <span>{formatRupiah(trx.change_amount)}</span>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
        Terima kasih sudah bermain! 🎮
      </p>
    </div>
  )
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
// ⚠️ SESUAIKAN:
//   - GET /api/transactions → support query params: page, date, status
//   - GET /api/transactions/:id → harus return items (F&B detail)
export default function TransactionList() {
  const [page, setPage] = useState(1)
  const [dateFilter, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [statusFilter, setStatus] = useState('paid')
  const [receipt, setReceipt] = useState<Transaction | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, dateFilter, statusFilter],
    queryFn: () =>
      transactionApi.list({
        page,
        per_page: 20,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
      }).then(r => r.data),
  })

  const transactions: Transaction[] = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  // Buka detail transaksi (dengan items)
  const openReceipt = async (trx: Transaction) => {
    if (trx.items) { setReceipt(trx); return }
    // Jika items belum di-load, fetch detail dulu
    const res = await transactionApi.show(trx.id)
    setReceipt(res.data.data)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="date" value={dateFilter}
          onChange={e => { setDate(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">Semua status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        {total > 0 && (
          <span className="text-xs text-gray-400 ml-auto">{total} transaksi</span>
        )}
      </div>

      {isLoading ? <Spinner className="py-16" /> :
        !transactions.length ? (
          <EmptyState icon="🧾" title="Tidak ada transaksi"
            description={dateFilter ? `Tidak ada transaksi pada ${dateFilter}` : 'Belum ada transaksi'} />
        ) : (
          <>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Waktu</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Gaming</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">F&B</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trx, idx) => (
                    <tr key={trx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{trx.invoice_number}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {trx.paid_at ? formatDateTime(trx.paid_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">{formatRupiah(trx.gaming_total)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {trx.fnb_total > 0 ? formatRupiah(trx.fnb_total) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(trx.grand_total)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          label={trx.status === 'paid' ? 'Lunas' : trx.status === 'pending' ? 'Pending' : 'Batal'}
                          className={
                            trx.status === 'paid' ? 'bg-green-100 text-green-800' :
                              trx.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-500'
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openReceipt(trx)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Sebelumnya
                </button>
                <span className="text-sm text-gray-500">Hal. {page} / {lastPage}</span>
                <button
                  onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Berikutnya →
                </button>
              </div>
            )}
          </>
        )}

      {/* Modal struk */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Struk transaksi">
        {receipt && <ReceiptModal trx={receipt} onClose={() => setReceipt(null)} />}
      </Modal>
    </div>
  )
}
