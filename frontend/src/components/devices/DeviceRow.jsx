import { PiMoney } from "react-icons/pi";
import { TableRow, TableCell } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { DeviceStatusBadge } from "../../components/ui/badge/Badge";
import { formatRupiah } from "../../utils";
import { Pencil, Trash2 } from "lucide-react";

export default function DeviceRow({ device, onRate, onEdit, onDelete }) {
  return (
    <TableRow>
      {/* Device */}
      <TableCell className="px-5 py-4 sm:px-6 text-center">
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">
            {device.name}
          </p>
          <p className="mt-0.5 ml-8 text-start text-theme-xs text-gray-500 dark:text-gray-400">
            {device.ps_type} {device.ps_sn && ` · ${device.ps_sn}`}
          </p>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="px-5 py-4 text-center">
        <DeviceStatusBadge status={device.status} />
      </TableCell>

      {/* Rate */}
      <TableCell className="px-5 py-4 text-center">
        {device.current_rate ? (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatRupiah(device.current_rate.price_per_hour)} / jam
          </span>
        ) : (
          <span className="text-xs text-red-500 dark:text-red-400">
            Belum ada tarif
          </span>
        )}
      </TableCell>

      {/* TV IP */}
      <TableCell className="px-5 py-4 text-center">
        {device.tv_ip_address ? (
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
            {device.tv_ip_address}
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onRate(device)}>
            <PiMoney size={20} /> Tarif
          </Button>

          <Button size="sm" variant="outline" onClick={() => onEdit(device)}>
            <Pencil size={20} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10"
            disabled={device.status === "in_use"}
            onClick={() => onDelete(device)}
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
