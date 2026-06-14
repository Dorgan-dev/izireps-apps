<?php

// ============================================================
// app/Console/Commands/AutoCancelNoShowBookings.php
// ============================================================
// Jalankan setiap 1 menit.
// Menampilkan notifikasi di kasir pada menit ke-15,
// membatalkan otomatis pada menit ke-20 (grace period 5 menit).

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

class AutoCancelNoShowBookings extends Command
{
    protected $signature = 'bookings:auto-cancel-noshow';
    protected $description = 'Batalkan otomatis booking no-show setelah 20 menit dari jam bermain';

    public function handle(BookingService $service): void
    {
        // 1. Tentukan waktu sekarang (Pastikan timezone di .env sudah Asia/Jakarta)
        $now = now();

        // 2. Hitung waktu mundur (Batas toleransi maksimal 20 menit yang lalu)
        // Contoh: Jika sekarang jam 14:25, maka cutoff-nya adalah jam 14:05.
        // Semua booking jam 14:00 (<= 14:05) dinyatakan hangus/no-show.
        $cutoffTime = $now->subMinutes(20)->format('H:i:s');

        $noShows = \App\Models\Booking::where('status', 'confirmed')
            ->whereDate('booking_date', today())
            ->where('start_time', '<=', $cutoffTime)
            ->get();

        foreach ($noShows as $booking) {
            /** @var \App\Models\Booking $booking */  // ← PHPDoc hint untuk IDE
            $service->cancelBySystem($booking);
            $this->info("Booking #{$booking->id} dibatalkan sistem (no-show).");
        }

        $this->info("Total dibatalkan: {$noShows->count()}");
    }
}