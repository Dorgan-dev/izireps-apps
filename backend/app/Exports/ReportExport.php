<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class ReportExport implements
    FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    public function __construct(
        protected string $type,
        protected array $data,
    ) {}

    public function title(): string
    {
        return match ($this->type) {
            'revenue'  => 'Laporan Pendapatan',
            'devices'  => 'Laporan Perangkat',
            'fnb'      => 'Laporan F&B',
            'cashiers' => 'Laporan Kasir',
        };
    }

    public function collection(): Collection
    {
        return collect($this->data['data'] ?? $this->data);
    }

    public function headings(): array
    {
        return match ($this->type) {
            'revenue' => [
                'Periode', 'Jumlah Transaksi',
                'Pendapatan Gaming (Rp)', 'Pendapatan F&B (Rp)', 'Total (Rp)',
            ],
            'devices' => [
                'Perangkat', 'Tipe PS', 'Jumlah Sesi',
                'Total Menit', 'Utilisasi (%)', 'Pendapatan (Rp)',
            ],
            'fnb' => [
                'Item', 'Qty Terjual', 'Total Omzet (Rp)',
            ],
            'cashiers' => [
                'Kasir', 'Jumlah Transaksi',
                'Total Pendapatan (Rp)', 'Rata-rata per Transaksi (Rp)',
            ],
        };
    }

    public function map($row): array
    {
        $row = (array) $row;

        return match ($this->type) {
            'revenue' => [
                $row['period'],
                $row['total_transactions'],
                number_format($row['gaming_revenue'], 0, ',', '.'),
                number_format($row['fnb_revenue'], 0, ',', '.'),
                number_format($row['total_revenue'], 0, ',', '.'),
            ],
            'devices' => [
                $row['device_name'],
                $row['ps_type'],
                $row['total_sessions'],
                $row['total_minutes'],
                $row['utilization_pct'] . '%',
                number_format($row['gaming_revenue'], 0, ',', '.'),
            ],
            'fnb' => [
                $row['item_name'],
                $row['total_qty'],
                number_format($row['total_revenue'], 0, ',', '.'),
            ],
            'cashiers' => [
                $row['cashier_name'],
                $row['total_transactions'],
                number_format($row['total_revenue'], 0, ',', '.'),
                $row['total_transactions'] > 0
                    ? number_format($row['total_revenue'] / $row['total_transactions'], 0, ',', '.')
                    : '0',
            ],
        };
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            // Baris header: bold + background abu-abu
            1 => [
                'font'    => ['bold' => true],
                'fill'    => [
                    'fillType'   => 'solid',
                    'startColor' => ['rgb' => 'F3F4F6'],
                ],
            ],
        ];
    }
}
