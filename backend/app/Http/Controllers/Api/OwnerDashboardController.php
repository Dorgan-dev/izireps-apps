<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Models\FnbItem;
use App\Models\PlaySession;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OwnerDashboardController extends Controller
{
    /**
     * GET /api/owner/dashboard
     * Aggregated data for the owner dashboard.
     */
    public function index()
    {
        $today     = Carbon::today();
        $yesterday = Carbon::yesterday();
        $weekAgo   = $today->copy()->subDays(6);
        $lastWeekStart = $today->copy()->subDays(13);
        $lastWeekEnd   = $today->copy()->subDays(7);

        // ─── 1. Summary Metrics ──────────────────────────────────────────────

        // Total pendapatan hari ini (gaming + FnB)
        $revenueToday = Transaction::whereDate('paid_at', $today)
            ->where('status', 'paid')
            ->sum('grand_total');

        // Breakdown gaming & fnb hari ini
        $gamingToday = Transaction::whereDate('paid_at', $today)
            ->where('status', 'paid')
            ->sum('gaming_total');

        $fnbToday = Transaction::whereDate('paid_at', $today)
            ->where('status', 'paid')
            ->sum('fnb_total');

        // Jumlah transaksi hari ini
        $transactionsToday = Transaction::whereDate('paid_at', $today)
            ->where('status', 'paid')
            ->count();

        // Jumlah sesi aktif saat ini
        $activeSessions = PlaySession::where('status', 'active')->count();

        // Jumlah booking pending
        $pendingBookings = Booking::where('status', 'pending')->count();

        // ─── 2. Perbandingan Performa ────────────────────────────────────────

        // Pendapatan kemarin
        $revenueYesterday = Transaction::whereDate('paid_at', $yesterday)
            ->where('status', 'paid')
            ->sum('grand_total');

        // Pendapatan minggu lalu (7 hari)
        $revenueThisWeek = Transaction::whereBetween(DB::raw('DATE(paid_at)'), [
            $weekAgo->toDateString(), $today->toDateString()
        ])->where('status', 'paid')->sum('grand_total');

        $revenueLastWeek = Transaction::whereBetween(DB::raw('DATE(paid_at)'), [
            $lastWeekStart->toDateString(), $lastWeekEnd->toDateString()
        ])->where('status', 'paid')->sum('grand_total');

        // Kalkulasi persentase
        $vsDayPercent  = $revenueYesterday > 0
            ? round((($revenueToday - $revenueYesterday) / $revenueYesterday) * 100, 1)
            : ($revenueToday > 0 ? 100 : 0);

        $vsWeekPercent = $revenueLastWeek > 0
            ? round((($revenueThisWeek - $revenueLastWeek) / $revenueLastWeek) * 100, 1)
            : ($revenueThisWeek > 0 ? 100 : 0);

        // ─── 3. Status Perangkat ─────────────────────────────────────────────

        $deviceStatuses = Device::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalDevices = array_sum($deviceStatuses);

        // ─── 4. Grafik Pendapatan (7 hari terakhir) ──────────────────────────

        $revenueChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            $dayRevenue = Transaction::whereDate('paid_at', $date)
                ->where('status', 'paid')
                ->sum('grand_total');

            $revenueChart[] = [
                'date'    => $date->format('M d'),
                'full_date' => $date->toDateString(),
                'total'   => (int) $dayRevenue,
            ];
        }

        // ─── 5. Aktivitas Perlu Perhatian ────────────────────────────────────

        // Booking pending > 30 menit
        $longPendingBookings = Booking::with(['customer', 'device'])
            ->where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes(30))
            ->orderBy('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($b) => [
                'id'            => $b->id,
                'customer_name' => $b->customer?->name ?? 'Anonim',
                'device_name'   => $b->device?->name ?? '-',
                'waiting_minutes' => (int) now()->diffInMinutes($b->created_at),
            ]);

        // Sesi time-up belum checkout
        $timeUpSessions = PlaySession::with(['device', 'customer'])
            ->where('status', 'time_up')
            ->orderBy('ended_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id'              => $s->id,
                'device_name'     => $s->device?->name ?? '-',
                'customer_name'   => $s->customer?->name ?? 'Umum',
                'overtime_minutes' => $s->ended_at
                    ? (int) now()->diffInMinutes($s->ended_at)
                    : (int) now()->diffInMinutes($s->planned_end_at),
            ]);

        // ─── 6. Ringkasan F&B — Stok menipis ────────────────────────────────

        $lowStockItems = FnbItem::with('category')
            ->where('is_available', true)
            ->where('stock', '<=', 3)
            ->where('stock', '>', 0)
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id'       => $item->id,
                'name'     => $item->name,
                'stock'    => $item->stock,
                'category' => $item->category?->name ?? '-',
            ]);

        $lowStockCount = FnbItem::where('is_available', true)
            ->where('stock', '<=', 3)
            ->where('stock', '>', 0)
            ->count();

        // ─── Response ────────────────────────────────────────────────────────

        return response()->json([
            'data' => [
                // Summary cards
                'revenue_today'      => (int) $revenueToday,
                'gaming_today'       => (int) $gamingToday,
                'fnb_today'          => (int) $fnbToday,
                'transactions_today' => $transactionsToday,
                'active_sessions'    => $activeSessions,
                'pending_bookings'   => $pendingBookings,

                // Perbandingan performa
                'performance' => [
                    'vs_day_percent'  => $vsDayPercent,
                    'vs_week_percent' => $vsWeekPercent,
                ],

                // Status perangkat
                'device_status' => [
                    'available'   => $deviceStatuses['available'] ?? 0,
                    'in_use'      => $deviceStatuses['in_use'] ?? 0,
                    'booked'      => $deviceStatuses['booked'] ?? 0,
                    'maintenance' => $deviceStatuses['maintenance'] ?? 0,
                    'total'       => $totalDevices,
                ],

                // Grafik 7 hari
                'revenue_chart' => $revenueChart,

                // Aktivitas perlu perhatian
                'alerts' => [
                    'long_pending_bookings' => $longPendingBookings,
                    'time_up_sessions'      => $timeUpSessions,
                ],

                // FnB
                'fnb_summary' => [
                    'low_stock_count' => $lowStockCount,
                    'low_stock_items' => $lowStockItems,
                ],
            ],
        ]);
    }
}
