import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { formatRupiah } from "../../../utils";

export default function RevenueTable({ items }) {
  // Helper for formatting date to time, e.g., 14:30
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                NO PS
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Jenis Main
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Jam Mulai
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Kasir Mulai
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Kasir Selesai
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Durasi Main
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                Belanja/Jajan
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {items.map((row) => (
              <TableRow key={row.id}>
                {/* 1. NO PS */}
                <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                  {row.session?.device?.name || "-"}
                </TableCell>

                {/* 2. Jenis main */}
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {row.session?.session_type === "per_hour" ? (
                    <Badge color="success">Perjam</Badge>
                  ) : (
                    <Badge color="primary">Bebas</Badge>
                  )}
                </TableCell>

                {/* 3. Jam Mulai */}
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatTime(row.session?.started_at)}
                </TableCell>

                {/* 4. Register nama kasir Mulai */}
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {/* We use any cast here in case cashier is not typed in PlaySession */}
                  {row.session?.cashier?.name || "-"}
                </TableCell>

                {/* 5. Register nama kasir Selesai */}
                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {row.cashier?.name || "-"}
                </TableCell>

                {/* 6. Hitung Durasi main */}
                <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {row.session?.duration_minutes
                    ? `${row.session.duration_minutes} mnt`
                    : "-"}
                </TableCell>

                {/* 7. Hitung belanja/Jajan */}
                <TableCell className="px-5 py-4 text-end text-sm font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">
                  {formatRupiah(row.fnb_total || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
