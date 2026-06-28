import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, transactionsApi } from "../../services/api";
import { formatRupiah } from "../../utils";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { Spinner, EmptyState, Badge, Button } from "../../components/common";
import RevenueTable from "../../components/tables/owner/RevenueTable";
import Metric from "../../components/common/Metric";
import DatePicker from "../../components/form/DatePicker";
import RevenueChart from "../../components/dashboard/owner/RevenueChart";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { TbFileExcel, TbFileDescription, TbTrendingUp, TbDeviceGamepad, TbCoffee, TbUserCog } from "react-icons/tb";

// Helper function to format Date object to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("revenue");
  
  // Date filter state at the parent level
  const [dateFilter, setDateFilter] = useState({
    from: formatDateToYYYYMMDD(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // default 7 days ago
    to: formatDateToYYYYMMDD(new Date()),
  });

  const [activePeriod, setActivePeriod] = useState("7"); // "7", "30", "90" or "custom"

  // 1. Data Fetching - Pendapatan (Revenue)
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["reports-summary", dateFilter],
    queryFn: () => reportsApi.summary(dateFilter).then((r) => r.data.data),
    enabled: activeTab === "revenue",
  });

  const { data: revenueChartData, isLoading: loadingChart } = useQuery({
    queryKey: ["reports-revenue-chart", dateFilter],
    queryFn: () => reportsApi.revenue({ ...dateFilter, group_by: "day" }).then((r) => r.data.data),
    enabled: activeTab === "revenue",
  });

  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions-list", dateFilter],
    queryFn: () =>
      transactionsApi.list({ ...dateFilter, per_page: 100 }).then((r) => r.data.data),
    enabled: activeTab === "revenue",
  });

  // 2. Data Fetching - Perangkat
  const { data: devicesData, isLoading: loadingDevices } = useQuery({
    queryKey: ["reports-devices", dateFilter],
    queryFn: () => reportsApi.devices(dateFilter).then((r) => r.data.data),
    enabled: activeTab === "devices",
  });

  // 3. Data Fetching - F&B
  const { data: fnbData, isLoading: loadingFnb } = useQuery({
    queryKey: ["reports-fnb", dateFilter],
    queryFn: () => reportsApi.fnb(dateFilter).then((r) => r.data.data),
    enabled: activeTab === "fnb",
  });

  // 4. Data Fetching - Kasir
  const { data: cashiersData, isLoading: loadingCashiers } = useQuery({
    queryKey: ["reports-cashiers", dateFilter],
    queryFn: () => reportsApi.cashiers(dateFilter).then((r) => r.data.data),
    enabled: activeTab === "cashiers",
  });

  // Export handling
  const handleExport = async (format) => {
    try {
      const response = await reportsApi.export({ ...dateFilter, type: activeTab, format });
      
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laporan-${activeTab}-${dateFilter.from}-${dateFilter.to}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  const handlePeriodChange = (days) => {
    setActivePeriod(days.toString());
    const to = new Date();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateFilter({
      from: formatDateToYYYYMMDD(from),
      to: formatDateToYYYYMMDD(to),
    });
  };

  const handleCustomDateChange = (field, dateStr) => {
    setActivePeriod("custom");
    setDateFilter((prev) => ({ ...prev, [field]: dateStr }));
  };

  // Tabs definitions
  const tabs = [
    { id: "revenue", label: "Pendapatan", icon: <TbTrendingUp className="size-5" /> },
    { id: "devices", label: "Perangkat", icon: <TbDeviceGamepad className="size-5" /> },
    { id: "fnb", label: "F&B", icon: <TbCoffee className="size-5" /> },
    { id: "cashiers", label: "Kasir", icon: <TbUserCog className="size-5" /> },
  ];

  return (
    <>
      {/* 1. Header Section */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pendapatan, perangkat, F&B, dan performa kasir dalam satu tempat
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => handleExport("excel")} className="gap-2">
            <TbFileExcel className="size-5" />
            Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport("pdf")} className="gap-2">
            <TbFileDescription className="size-5" />
            PDF
          </Button>
        </div>
      </div>

      {/* 2. Global Date Filter Section */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Periode</span>
            <div className="flex items-center gap-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => handlePeriodChange(days)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activePeriod === days.toString()
                      ? "bg-gray-900 text-white dark:bg-gray-800 dark:text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {days} hari
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">Custom Range</span>
            <div className="w-full sm:w-48">
              <DatePicker
                id="filter-date-from"
                value={dateFilter.from}
                placeholder="Dari Tanggal"
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    handleCustomDateChange("from", formatDateToYYYYMMDD(dates[0]));
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">sampai</span>
            <div className="w-full sm:w-48">
              <DatePicker
                id="filter-date-to"
                value={dateFilter.to}
                placeholder="Sampai Tanggal"
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    handleCustomDateChange("to", formatDateToYYYYMMDD(dates[0]));
                  }
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 4. Tab Content */}
      <div className="min-h-[400px]">
        
        {/* --- TAB: PENDAPATAN --- */}
        {activeTab === "revenue" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                title="Total pendapatan"
                amount={formatRupiah(summary?.total_revenue ?? 0)}
                icon="Rp"
                iconBg="bg-green-50 dark:bg-green-500/15"
                iconColor="text-green-600 dark:text-green-400"
              />
              <Metric
                title="Gaming"
                amount={formatRupiah(summary?.gaming_total ?? 0)}
                icon="🎮"
                iconBg="bg-blue-50 dark:bg-blue-500/15"
                iconColor="text-blue-600 dark:text-blue-400"
              />
              <Metric
                title="F&B"
                amount={formatRupiah(summary?.fnb_total ?? 0)}
                icon="🍔"
                iconBg="bg-amber-50 dark:bg-amber-500/15"
                iconColor="text-amber-600 dark:text-amber-400"
              />
              <Metric
                title="Transaksi"
                amount={summary?.transaction_count ?? 0}
                icon="💰"
                iconBg="bg-purple-50 dark:bg-purple-500/15"
                iconColor="text-purple-600 dark:text-purple-400"
              />
            </div>

            {loadingChart ? (
              <ComponentCard title="Tren Pendapatan"><Spinner className="py-12" /></ComponentCard>
            ) : (
              <RevenueChart data={{ revenue_chart: revenueChartData || [] }} />
            )}

            <ComponentCard title="Rincian Transaksi">
              {loadingTransactions || loadingSummary ? (
                <Spinner className="py-12" />
              ) : !transactionsData || transactionsData.length === 0 ? (
                <EmptyState icon="💰" title="Tidak ada data" description="Belum ada transaksi pada periode ini." />
              ) : (
                <RevenueTable items={transactionsData} />
              )}
            </ComponentCard>
          </div>
        )}

        {/* --- TAB: PERANGKAT --- */}
        {activeTab === "devices" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ComponentCard title="Performa Perangkat">
              {loadingDevices ? (
                <Spinner className="py-12" />
              ) : !devicesData || devicesData.length === 0 ? (
                <EmptyState icon="🎮" title="Tidak ada data" description="Belum ada data perangkat pada periode ini." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Nama Perangkat</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Tipe PS</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Total Sesi</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Total Waktu (Menit)</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Rata-rata Waktu / Sesi</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {devicesData.map((item) => (
                          <TableRow key={item.device_id}>
                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.device_name}</TableCell>
                            <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <Badge className="bg-blue-50 text-blue-700">{item.ps_type}</Badge>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-400">{item.total_sessions}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{item.total_minutes} mnt</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{item.avg_minutes} mnt</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
        )}

        {/* --- TAB: F&B --- */}
        {activeTab === "fnb" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Metric
                title="Total Penjualan F&B"
                amount={formatRupiah(fnbData?.total_fnb ?? 0)}
                icon="🍔"
                iconBg="bg-amber-50 dark:bg-amber-500/15"
                iconColor="text-amber-600 dark:text-amber-400"
              />
            </div>

            <ComponentCard title="Item Terlaris">
              {loadingFnb ? (
                <Spinner className="py-12" />
              ) : !fnbData?.items || fnbData.items.length === 0 ? (
                <EmptyState icon="🍜" title="Tidak ada data" description="Belum ada data penjualan F&B pada periode ini." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Nama Item</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Terjual (Qty)</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Rata-rata Harga</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Total Pendapatan</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {fnbData.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.item_name}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{item.total_qty}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{formatRupiah(item.avg_price)}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm font-semibold text-gray-800 dark:text-white/90">{formatRupiah(item.total_revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
        )}

        {/* --- TAB: KASIR --- */}
        {activeTab === "cashiers" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ComponentCard title="Performa Kasir">
              {loadingCashiers ? (
                <Spinner className="py-12" />
              ) : !cashiersData || cashiersData.length === 0 ? (
                <EmptyState icon="👤" title="Tidak ada data" description="Belum ada data performa kasir pada periode ini." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Nama Kasir</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Total Transaksi</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Pendapatan Gaming</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Pendapatan F&B</TableCell>
                          <TableCell isHeader className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Total Setoran</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {cashiersData.map((item) => (
                          <TableRow key={item.cashier_id}>
                            <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{item.cashier_name}</TableCell>
                            <TableCell className="px-5 py-4 text-center text-sm text-gray-600 dark:text-gray-400">{item.total_transactions}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{formatRupiah(item.gaming_revenue)}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400">{formatRupiah(item.fnb_revenue)}</TableCell>
                            <TableCell className="px-5 py-4 text-end text-sm font-semibold text-gray-800 dark:text-white/90">{formatRupiah(item.total_revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </ComponentCard>
          </div>
        )}

      </div>
    </>
  );
}
