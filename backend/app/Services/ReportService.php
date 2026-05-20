<?php

namespace App\Services;

use App\Models\Device;
use App\Models\FnbItem;
use App\Models\Transaction;
use App\Models\PlaySession;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Dashboard ringkasan hari ini.
     */
    public function dailySummary(?Carbon $date = null): array
    {
        $date = $date ?? today();

        $transactions = Transaction::whereDate('paid_at', $date)
            ->where('status', 'paid')
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(gaming_total) as gaming_revenue,
                SUM(fnb_total) as fnb_revenue,
                SUM(grand_total) as total_revenue
            ')
            ->first();

        $activeSessions = PlaySession::where('status', 'active')->count();

        $deviceSummary = Device::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $pendingBookings = Booking::where('status', 'pending')->count();

        return [
            'date'               => $date->format('Y-m-d'),
            'total_transactions' => $transactions->total_transactions ?? 0,
            'gaming_revenue'     => $transactions->gaming_revenue    ?? 0,
            'fnb_revenue'        => $transactions->fnb_revenue       ?? 0,
            'total_revenue'      => $transactions->total_revenue     ?? 0,
            'active_sessions'    => $activeSessions,
            'pending_bookings'   => $pendingBookings,
            'device_summary'     => $deviceSummary,
        ];
    }

    /**
     * Laporan pendapatan per periode (harian/mingguan/bulanan).
     */
    public function revenueReport(Carbon $from, Carbon $to, string $groupBy = 'day'): array
    {
        $groupFormat = match($groupBy) {
            'month' => '%Y-%m',
            'week'  => '%Y-%u',
            default => '%Y-%m-%d',
        };

        $revenue = Transaction::whereBetween('paid_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('status', 'paid')
            ->selectRaw("
                DATE_FORMAT(paid_at, '{$groupFormat}') as period,
                COUNT(*) as total_transactions,
                SUM(gaming_total) as gaming_revenue,
                SUM(fnb_total) as fnb_revenue,
                SUM(grand_total) as total_revenue
            ")
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return [
            'from'    => $from->format('Y-m-d'),
            'to'      => $to->format('Y-m-d'),
            'groupBy' => $groupBy,
            'data'    => $revenue,
            'summary' => [
                'total_revenue'      => $revenue->sum('total_revenue'),
                'gaming_revenue'     => $revenue->sum('gaming_revenue'),
                'fnb_revenue'        => $revenue->sum('fnb_revenue'),
                'total_transactions' => $revenue->sum('total_transactions'),
            ],
        ];
    }

    /**
     * Laporan utilisasi dan pendapatan per perangkat.
     */
    public function deviceReport(Carbon $from, Carbon $to): array
    {
        $data = Device::with(['sessions' => function ($q) use ($from, $to) {
                $q->whereBetween('started_at', [$from->startOfDay(), $to->endOfDay()])
                  ->where('status', 'completed');
            }])
            ->get()
            ->map(function ($device) use ($from, $to) {
                $sessions        = $device->sessions;
                $totalMinutes    = $sessions->sum('duration_minutes');
                $totalDays       = $from->diffInDays($to) + 1;
                $operationalMins = $totalDays * 12 * 60; // asumsi 12 jam operasional/hari
                $utilization     = $operationalMins > 0
                    ? round(($totalMinutes / $operationalMins) * 100, 1)
                    : 0;

                $revenue = Transaction::whereIn('session_id', $sessions->pluck('id'))
                    ->where('status', 'paid')
                    ->sum('gaming_total');

                return [
                    'device_id'        => $device->id,
                    'device_name'      => $device->name,
                    'ps_type'          => $device->ps_type,
                    'total_sessions'   => $sessions->count(),
                    'total_minutes'    => $totalMinutes,
                    'utilization_pct'  => $utilization,
                    'gaming_revenue'   => $revenue,
                ];
            })
            ->sortByDesc('gaming_revenue')
            ->values();

        return [
            'from' => $from->format('Y-m-d'),
            'to'   => $to->format('Y-m-d'),
            'data' => $data,
        ];
    }

    /**
     * Laporan F&B: item terlaris dan total omzet.
     */
    public function fnbReport(Carbon $from, Carbon $to): array
    {
        $items = DB::table('transaction_items')
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->whereBetween('transactions.paid_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('transactions.status', 'paid')
            ->selectRaw('
                transaction_items.fnb_item_id,
                transaction_items.item_name,
                SUM(transaction_items.quantity) as total_qty,
                SUM(transaction_items.subtotal) as total_revenue
            ')
            ->groupBy('transaction_items.fnb_item_id', 'transaction_items.item_name')
            ->orderByDesc('total_qty')
            ->get();

        return [
            'from'          => $from->format('Y-m-d'),
            'to'            => $to->format('Y-m-d'),
            'data'          => $items,
            'total_revenue' => $items->sum('total_revenue'),
        ];
    }

    /**
     * Laporan per kasir: jumlah transaksi dan total nilai.
     */
    public function cashierReport(Carbon $from, Carbon $to): array
    {
        $data = DB::table('transactions')
            ->join('users', 'users.id', '=', 'transactions.cashier_id')
            ->whereBetween('transactions.paid_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('transactions.status', 'paid')
            ->selectRaw('
                users.id as cashier_id,
                users.name as cashier_name,
                COUNT(transactions.id) as total_transactions,
                SUM(transactions.grand_total) as total_revenue
            ')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_revenue')
            ->get();

        return [
            'from' => $from->format('Y-m-d'),
            'to'   => $to->format('Y-m-d'),
            'data' => $data,
        ];
    }
}
