/**
 * Komponen Ringkasan F&B — menampilkan item stok menipis (≤ 3).
 */
export default function FnbSummary({ data }) {
  if (!data?.fnb_summary) return null;

  const { low_stock_count, low_stock_items } = data.fnb_summary;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <svg className="size-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0L4.07 9.044a1 1 0 01-.634.634L.076 10.66a1 1 0 000 1.898l3.36.981a1 1 0 01.634.634l.981 3.36a1 1 0 001.898 0l.981-3.36a1 1 0 01.634-.634l3.36-.981a1 1 0 000-1.898l-3.36-.981a1 1 0 01-.634-.634L6.95 5.684z" />
          </svg>
        </span>
        <h4 className="text-xs font-bold tracking-wide text-gray-700 dark:text-white/80">
          RINGKASAN F&B
        </h4>
      </div>

      {/* Stok menipis badge */}
      <div className="mt-4 mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          STOK MENIPIS ({low_stock_count})
        </span>
      </div>

      <div className="space-y-2">
        {low_stock_items?.length > 0 ? (
          low_stock_items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3.5 py-2.5 transition-colors hover:bg-orange-50 dark:border-orange-800/30 dark:bg-orange-900/10 dark:hover:bg-orange-900/20"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200/60 dark:bg-orange-800/40">
                <svg className="size-3.5 text-orange-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.category}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-orange-200/60 px-2.5 py-1 text-xs font-bold text-orange-800 dark:bg-orange-800/40 dark:text-orange-300">
                Stok: {item.stock}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-3xl">📦</span>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Semua stok F&B aman
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
