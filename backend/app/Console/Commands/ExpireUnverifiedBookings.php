<?php

// ============================================================
// app/Console/Commands/ExpireUnverifiedBookings.php
// ============================================================
// Jalankan via scheduler setiap 5 menit.
// Membatalkan booking yang tidak diverifikasi kasir dalam 1 jam.

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Console\Command;

class ExpireUnverifiedBookings extends Command
{
    protected $signature = 'bookings:expire-unverified';
    protected $description = 'Batalkan booking pending yang melebihi batas waktu verifikasi 1 jam';

    public function handle(BookingService $service): void
    {
        $expired = Booking::where('status', 'pending')
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($expired as $booking) {
            /** @var \App\Models\Booking $booking */  // ← PHPDoc hint untuk IDE
            $service->expireUnverified($booking);
            $this->info("Booking #{$booking->id} expired.");
        }

        $this->info("Total expired: {$expired->count()}");
    }
}
