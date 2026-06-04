<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PlaySession;
use App\Models\Booking;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * GET /api/reports/summary
     * Ringkasan pendapatan dan aktivitas dalam rentang tanggal.
     *
     * Query params: from (Y-m-d), to (Y-m-d)
     */
    public function summary(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $from = $request->from;
        $to   = $request->to;

        $today = now()->toDateString();

        // Total pendapatan dalam rentang
        $totalRevenue = Transaction::whereBetween(DB::raw('DATE(paid_at)'), [$from, $to])
            ->where('status', 'paid')
            ->sum('grand_total');

        // Pendapatan hari ini
        $revenueToday = Transaction::whereDate('paid_at', $today)
            ->where('status', 'paid')
            ->sum('grand_total');

        // Pendapatan dari FnB
        $fnbRevenue = Transaction::whereBetween(DB::raw('DATE(paid_at)'), [$from, $to])
            ->where('status', 'paid')
            ->sum('fnb_total');

        // Total sesi dalam rentang
        $totalSessions = PlaySession::whereBetween(DB::raw('DATE(started_at)'), [$from, $to])
            ->count();

        // Sesi hari ini
        $sessionsToday = PlaySession::whereDate('started_at', $today)->count();

        // Total booking dalam rentang
        $totalBookings = Booking::whereBetween(DB::raw('DATE(booking_date)'), [$from, $to])
            ->count();

        // Perangkat aktif (sedang digunakan) saat ini
        $activeDevices = Device::where('status', 'in_use')->count();

        return response()->json([
            'data' => [
                'total_revenue'   => (int) $totalRevenue,
                'revenue_today'   => (int) $revenueToday,
                'fnb_revenue'     => (int) $fnbRevenue,
                'total_sessions'  => $totalSessions,
                'sessions_today'  => $sessionsToday,
                'total_bookings'  => $totalBookings,
                'active_devices'  => $activeDevices,
            ],
        ]);
    }

    /**
     * GET /api/reports/revenue
     * Grafik pendapatan dikelompokkan per hari / minggu / bulan.
     *
     * Query params: from, to, group_by (day|week|month) — default: day
     */
    public function revenue(Request $request)
    {
        $request->validate([
            'from'     => 'required|date',
            'to'       => 'required|date|after_or_equal:from',
            'group_by' => 'in:day,week,month',
        ]);

        $groupBy = $request->query('group_by', 'day');

        $dateExpr = match ($groupBy) {
            'week'  => DB::raw("DATE_FORMAT(paid_at, '%x-W%v')"),
            'month' => DB::raw("DATE_FORMAT(paid_at, '%Y-%m')"),
            default => DB::raw('DATE(paid_at)'),
        };

        $rows = Transaction::select(
                DB::raw("{$dateExpr->getValue(DB::connection()->getQueryGrammar())} as period"),
                DB::raw('SUM(gaming_total) as gaming_total'),
                DB::raw('SUM(fnb_total) as fnb_total'),
                DB::raw('SUM(grand_total) as total'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->whereBetween(DB::raw('DATE(paid_at)'), [$request->from, $request->to])
            ->where('status', 'paid')
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn ($r) => [
                'period'            => $r->period,
                'gaming_total'      => (int) $r->gaming_total,
                'fnb_total'         => (int) $r->fnb_total,
                'total'             => (int) $r->total,
                'transaction_count' => (int) $r->transaction_count,
            ]);

        return response()->json([
            'data' => $rows,
        ]);
    }

    /**
     * GET /api/reports/devices
     * Statistik penggunaan per perangkat dalam rentang tanggal.
     *
     * Query params: from, to
     */
    public function devices(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $rows = PlaySession::select(
                'device_id',
                DB::raw('COUNT(*) as total_sessions'),
                DB::raw('SUM(duration_minutes) as total_minutes'),
                DB::raw('AVG(duration_minutes) as avg_minutes')
            )
            ->with('device:id,name,ps_type')
            ->whereBetween(DB::raw('DATE(started_at)'), [$request->from, $request->to])
            ->whereNotNull('ended_at')
            ->groupBy('device_id')
            ->orderByDesc('total_sessions')
            ->get()
            ->map(fn ($r) => [
                'device_id'      => $r->device_id,
                'device_name'    => $r->device->name ?? '-',
                'ps_type'        => $r->device->ps_type ?? '-',
                'total_sessions' => (int) $r->total_sessions,
                'total_minutes'  => (int) $r->total_minutes,
                'avg_minutes'    => round($r->avg_minutes, 1),
            ]);

        return response()->json([
            'data' => $rows,
        ]);
    }

    /**
     * GET /api/reports/export/{type}
     * Export laporan ke Excel atau PDF.
     *
     * Query params: from, to
     * Path params: type (excel|pdf)
     */
    public function export(Request $request, string $type)
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        if (! in_array($type, ['excel', 'pdf'])) {
            return response()->json(['message' => 'Tipe export tidak valid. Gunakan excel atau pdf.'], 422);
        }

        // Ambil data transaksi untuk export
        $transactions = Transaction::with([
                'session.device:id,name,ps_type',
                'session.customer:id,name,phone',
                'cashier:id,name',
                'items',
            ])
            ->whereBetween(DB::raw('DATE(paid_at)'), [$request->from, $request->to])
            ->where('status', 'paid')
            ->orderBy('paid_at')
            ->get();

        if ($type === 'excel') {
            return $this->exportExcel($transactions, $request->from, $request->to);
        }

        return $this->exportPdf($transactions, $request->from, $request->to);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function exportExcel($transactions, string $from, string $to)
    {
        // Menggunakan PhpSpreadsheet (composer require phpoffice/phpspreadsheet)
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Transaksi');

        // Header
        $headers = [
            'No', 'Invoice', 'Tanggal', 'Perangkat', 'Pelanggan',
            'Kasir', 'Gaming (Rp)', 'FnB (Rp)', 'Total (Rp)',
            'DP (Rp)', 'Dibayar (Rp)', 'Metode',
        ];
        foreach ($headers as $col => $header) {
            $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
        }

        // Data
        foreach ($transactions as $i => $trx) {
            $row = $i + 2;
            $sheet->setCellValueByColumnAndRow(1,  $row, $i + 1);
            $sheet->setCellValueByColumnAndRow(2,  $row, $trx->invoice_number);
            $sheet->setCellValueByColumnAndRow(3,  $row, $trx->paid_at?->format('d/m/Y H:i'));
            $sheet->setCellValueByColumnAndRow(4,  $row, $trx->session->device->name ?? '-');
            $sheet->setCellValueByColumnAndRow(5,  $row, $trx->session->customer->name ?? 'Umum');
            $sheet->setCellValueByColumnAndRow(6,  $row, $trx->cashier->name ?? '-');
            $sheet->setCellValueByColumnAndRow(7,  $row, $trx->gaming_total);
            $sheet->setCellValueByColumnAndRow(8,  $row, $trx->fnb_total);
            $sheet->setCellValueByColumnAndRow(9,  $row, $trx->grand_total);
            $sheet->setCellValueByColumnAndRow(10, $row, $trx->dp_paid);
            $sheet->setCellValueByColumnAndRow(11, $row, $trx->amount_paid);
            $sheet->setCellValueByColumnAndRow(12, $row, strtoupper($trx->payment_method));
        }

        $writer   = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = "laporan-{$from}-{$to}.xlsx";
        $tmpPath  = storage_path("app/exports/{$filename}");

        @mkdir(dirname($tmpPath), 0755, true);
        $writer->save($tmpPath);

        return response()->download($tmpPath, $filename)->deleteFileAfterSend();
    }

    private function exportPdf($transactions, string $from, string $to)
    {
        // Menggunakan Barryvdh DomPDF (composer require barryvdh/laravel-dompdf)
        $pdf = app('dompdf.wrapper');

        $html = view('reports.transactions', [
            'transactions' => $transactions,
            'from'         => $from,
            'to'           => $to,
        ])->render();

        $pdf->loadHTML($html);
        $filename = "laporan-{$from}-{$to}.pdf";

        return $pdf->download($filename);
    }
}
