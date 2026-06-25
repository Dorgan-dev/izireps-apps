import Chart from "react-apexcharts";
import { formatRupiah } from "../../../utils";

/**
 * Grafik Pendapatan (7 Hari Terakhir) — line chart dengan area.
 */
export default function RevenueChart({ data }) {
  if (!data?.revenue_chart?.length) return null;

  const categories = data.revenue_chart.map((r) => r.date);
  const seriesData = data.revenue_chart.map((r) => r.total);

  const formatCompact = (num) => {
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)}M`;
    if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}K`;
    return `Rp ${num}`;
  };

  const options = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      height: 320,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#0ea5e9"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCompact(val),
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: ["#0c4a6e"],
      },
      background: {
        enabled: true,
        foreColor: "#0c4a6e",
        borderRadius: 4,
        padding: 4,
        borderWidth: 0,
        dropShadow: { enabled: false },
        opacity: 0.9,
      },
      offsetY: -8,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCompact(val),
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
        },
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: {
      size: 5,
      colors: ["#0ea5e9"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { sizeOffset: 3 },
    },
    tooltip: {
      y: {
        formatter: (val) => formatRupiah(val),
      },
    },
  };

  const series = [
    {
      name: "Pendapatan",
      data: seriesData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold tracking-wide text-gray-700 dark:text-white/80">
          GRAFIK PENDAPATAN (7 HARI TERAKHIR)
        </h4>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Pendapatan
          </span>
        </div>
      </div>

      <div className="mt-4 -ml-2 overflow-x-auto">
        <div className="min-w-[500px]">
          <Chart options={options} series={series} type="area" height={320} />
        </div>
      </div>
    </div>
  );
}
