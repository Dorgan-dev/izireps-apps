<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ============================================================
// routes/console.php — Daftarkan scheduler
// ============================================================

use Illuminate\Support\Facades\Schedule;

// Cek booking expired setiap 5 menit
Schedule::command('bookings:expire-unverified')->everyFiveMinutes();

// Cek no-show setiap menit
Schedule::command('bookings:auto-cancel-noshow')->everyMinute();

Schedule::command('sessions:mark-time-up')->everyMinute();

// ============================================================
// CATATAN SETUP CRON
// ============================================================
// Tambahkan satu baris ini ke crontab server (crontab -e):
//
// * * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
//
// Laravel scheduler akan mengurus sisanya secara otomatis.
