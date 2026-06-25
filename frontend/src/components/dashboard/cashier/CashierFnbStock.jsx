/**
 * Komponen stok F&B menipis — konteks kasir:
 * Supaya kasir bisa kasih tahu pelanggan kalau item tertentu mau habis.
 */
export default function CashierFnbStock({ data }) {
  if (!data?.fnb) return null;

  const { low_stock_items, out_of_stock_count } = data.fnb;
  const hasAlerts = low_stock_items?.length > 0 || out_of_stock_count > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <svg className="size-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-4h8m-4 0v4" />
            </svg>
          </span>
          <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
            STOK F&B
          </h4>
        </div>

        {out_of_stock_count > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {out_of_stock_count} HABIS
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {hasAlerts ? (
          <>
            {low_stock_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3.5 py-2.5 transition-colors hover:bg-orange-50 dark:border-orange-800/30 dark:bg-orange-900/10 dark:hover:bg-orange-900/20"
              >
                {/* Stock indicator */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-200/60 dark:bg-orange-800/40">
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    {item.stock}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.category}
                  </p>
                </div>

                {/* Stock level */}
                <div className="flex shrink-0 items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < item.stock
                          ? "bg-orange-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="text-3xl">📦</span>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Semua stok F&B aman
            </p>
          </div>
        )}
      </div>

      {/* Footer tip for cashier */}
      {hasAlerts && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/15">
          <p className="text-[11px] text-blue-600 dark:text-blue-400">
            💡 Informasikan ke pelanggan jika item di atas hampir habis
          </p>
        </div>
      )}
    </div>
  );
}
