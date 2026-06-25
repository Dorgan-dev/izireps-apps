import Chart from "react-apexcharts";

const STATUS_CONFIG = {
  available: { label: "Tersedia", color: "#10b981" },
  in_use: { label: "Digunakan", color: "#f59e0b" },
  booked: { label: "Dibooking", color: "#8b5cf6" },
  maintenance: { label: "Perbaikan", color: "#ef4444" },
};

export default function DeviceStatusChart({ data }) {
  if (!data) return null;

  const { device_status } = data;
  const { total } = device_status;

  const statuses = ["available", "in_use", "booked", "maintenance"];
  const series = statuses.map((s) => device_status[s] || 0);
  const labels = statuses.map((s) => STATUS_CONFIG[s].label);
  const colors = statuses.map((s) => STATUS_CONFIG[s].color);

  const options = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels,
    colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      colors: ["#fff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: false },
            value: { show: false },
            total: { show: false },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} unit`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 200 },
        },
      },
    ],
  };

  // Format angka total agar readable
  const formatTotal = (num) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h4 className="text-sm font-bold tracking-wide text-gray-700 dark:text-white/80">
        STATUS PERANGKAT
      </h4>

      <div className="mt-4 flex flex-col items-center gap-5 lg:flex-row">
        {/* Donut chart */}
        <div className="relative">
          <Chart
            options={options}
            series={series}
            type="donut"
            height={220}
            width={220}
          />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800 dark:text-white/90">
              {formatTotal(total)}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              TOTAL
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {statuses.map((s) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_CONFIG[s].color }}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {STATUS_CONFIG[s].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {device_status[s] || 0}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (
                  {total > 0
                    ? Math.round(((device_status[s] || 0) / total) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
