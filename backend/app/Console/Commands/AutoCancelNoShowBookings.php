<?php

// ============================================================
// app/Console/Commands/AutoCancelNoShowBookings.php
// ============================================================
// Jalankan setiap 1 menit.
// Menampilkan notifikasi di kasir pada menit ke-15,
// membatalkan otomatis pada menit ke-20 (grace period 5 menit).

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoCancelNoShowBookings extends Command
{
    protected $signature   = 'bookings:auto-cancel-noshow';
    protected $description = 'Batalkan otomatis booking no-show setelah 20 menit dari jam bermain';

    public function handle(BookingService $service): void
    {
        // Batas waktu: jam booking + 15 menit keterlambatan + 5 menit grace period = 20 menit
        $cutoff = now()->subMinutes(20);

        $noShows = Booking::where('status', 'confirmed')
            ->whereDate('booking_date', today())
            ->whereRaw("ADDTIME(start_time, '00:20:00') <= ?", [now()->format('H:i:s')])
            ->get();

        foreach ($noShows as $booking) {
            $service->cancelBySystem($booking);
            $this->info("Booking #{$booking->id} dibatalkan sistem (no-show).");
        }

        $this->info("Total dibatalkan: {$noShows->count()}");
    }
}