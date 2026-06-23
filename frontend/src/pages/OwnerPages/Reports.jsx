import { useEffect, useState } from "react";
import { reportsApi } from "../../services/api";
import { formatRupiah } from "../../components/ui/badge/Badge";
import { Button, Field, Input } from "../../components/ui/Form";
import { Download } from "lucide-react";

export default function OwnerReports() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setIsLoading(true);
    reportsApi
      .summary({ from, to })
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const res = await reportsApi.export(type, { from, to });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-${from}-${to}.${type === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Laporan</h1>

      {/* Filter */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Dari Tanggal">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Sampai Tanggal">
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
          <Button onClick={load} loading={isLoading}>
            Tampilkan
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("excel")}
              loading={exporting}
            >
              <Download size={14} /> Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("pdf")}
              loading={exporting}
            >
              <Download size={14} /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Pendapatan",
              value: formatRupiah(data.total_revenue ?? 0),
            },
            { label: "Total Sesi", value: data.total_sessions ?? 0 },
            { label: "Total Booking", value: data.total_bookings ?? 0 },
            {
              label: "Pendapatan FnB",
              value: formatRupiah(data.fnb_revenue ?? 0),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">
          Grafik Pendapatan per Hari
        </h2>
        <p className="text-sm text-gray-500 text-center py-12">
          Grafik akan ditampilkan setelah backend terhubung
        </p>
      </div>
    </div>
  );
}
