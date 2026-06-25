<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Models\FnbItem;
use App\Models\PlaySession;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashierDashboardController extends Controller
{
    /**
     * GET /api/cashier/dashboard
     * Data aggregat untuk dashboard kasir yang sedang login.
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $today = Carbon::today();

        // ─── 1. Status Perangkat Real-time ───────────────────────────────

        $devices = Device::select('id', 'name', 'ps_type', 'status')
            ->orderBy('name')
            ->get()
            ->map(fn ($d) => [
                'id'      => $d->id,
                'name'    => $d->name,
                'ps_type' => $d->ps_type,
                'status'  => $d->status->value,
            ]);

        $deviceCounts = Device::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ─── 2. Ringkasan Shift Kasir ────────────────────────────────────

        $cashierTransactions = Transaction::where('cashier_id', $user->id)
            ->whereDate('paid_at', $today)
            ->where('status', 'paid');

        $shiftTransactionCount = (clone $cashierTransactions)->count();
        $shiftTransactionTotal = (int) (clone $cashierTransactions)->sum('grand_total');
        $shiftGamingTotal      = (int) (clone $cashierTransactions)->sum('gaming_total');
        $shiftFnbTotal         = (int) (clone $cashierTransactions)->sum('fnb_total');

        // Sesi yang diproses kasir ini hari ini
        $cashierSessionsToday = PlaySession::where('cashier_id', $user->id)
            ->whereDate('started_at', $today)
            ->count();

        // ─── 3. Notifikasi Butuh Tindakan ────────────────────────────────

        // Booking pending yang perlu diverifikasi
        $pendingBookings = Booking::where('status', 'pending')->count();

        // Sesi time-up yang menunggu extend/checkout
        $timeUpSessions = PlaySession::with(['device:id,name,ps_type', 'customer:id,name'])
            ->where('status', 'time_up')
            ->orderBy('planned_end_at')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id'               => $s->id,
                'device_name'      => $s->device?->name ?? '-',
                'device_type'      => $s->device?->ps_type ?? '-',
                'customer_name'    => $s->customer?->name ?? 'Umum',
                'overtime_minutes' => $s->planned_end_at
                    ? (int) now()->diffInMinutes($s->planned_end_at)
                    : 0,
            ]);

        $timeUpCount = PlaySession::where('status', 'time_up')->count();

        // Booking yang mendekati no-show (15-20 menit dari jam booking)
        $noShowBookings = Booking::with(['device:id,name', 'customer:id,name'])
            ->where('status', 'confirmed')
            ->whereDate('booking_date', $today)
            ->get()
            ->filter(function ($b) {
                $bookingStart = Carbon::parse(
                    $b->booking_date->format('Y-m-d') . ' ' . $b->start_time
                );
                $minutesSince = now()->diffInMinutes($bookingStart, false);
                // negatif berarti sudah lewat jam booking
                return $minutesSince <= 0 && $minutesSince >= -20;
            })
            ->map(fn ($b) => [
                'id'              => $b->id,
                'customer_name'   => $b->customer?->name ?? 'Anonim',
                'device_name'     => $b->device?->name ?? '-',
                'start_time'      => substr($b->start_time, 0, 5),
                'minutes_overdue' => (int) abs(now()->diffInMinutes(
                    Carbon::parse($b->booking_date->format('Y-m-d') . ' ' . $b->start_time),
                    false
                )),
            ])
            ->values();

        // ─── 4. Stok F&B Menipis ────────────────────────────────────────

        $lowStockItems = FnbItem::with('category')
            ->where('is_available', true)
            ->where('stock', '<=', 3)
            ->where('stock', '>', 0)
            ->orderBy('stock')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'id'       => $item->id,
                'name'     => $item->name,
                'stock'    => $item->stock,
                'category' => $item->category?->name ?? '-',
                'price'    => (int) $item->price,
            ]);

        $outOfStockCount = FnbItem::where('is_available', true)
            ->where('stock', 0)
            ->count();

        // ─── Response ────────────────────────────────────────────────────

        return response()->json([
            'data' => [
                // Perangkat
                'devices'       => $devices,
                'device_counts' => [
                    'available'   => $deviceCounts['available'] ?? 0,
                    'in_use'      => $deviceCounts['in_use'] ?? 0,
                    'booked'      => $deviceCounts['booked'] ?? 0,
                    'maintenance' => $deviceCounts['maintenance'] ?? 0,
                    'total'       => array_sum($deviceCounts),
                ],

                // Shift kasir
                'shift' => [
                    'transaction_count' => $shiftTransactionCount,
                    'transaction_total' => $shiftTransactionTotal,
                    'gaming_total'      => $shiftGamingTotal,
                    'fnb_total'         => $shiftFnbTotal,
                    'sessions_started'  => $cashierSessionsToday,
                ],

                // Notifikasi
                'notifications' => [
                    'pending_bookings'   => $pendingBookings,
                    'time_up_count'      => $timeUpCount,
                    'time_up_sessions'   => $timeUpSessions,
                    'no_show_bookings'   => $noShowBookings,
                ],

                // F&B
                'fnb' => [
                    'low_stock_items'   => $lowStockItems,
                    'out_of_stock_count' => $outOfStockCount,
                ],
            ],
        ]);
    }
}
