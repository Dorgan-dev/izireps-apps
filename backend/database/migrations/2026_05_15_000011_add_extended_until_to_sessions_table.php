<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('play_sessions', function (Blueprint $table) {
            // Timestamp kapan sesi "seharusnya" berakhir setelah perpanjangan.
            // Null = belum pernah di-extend atau sesi walk-in tanpa batas waktu.
            // Dipakai frontend untuk countdown dan trigger notifikasi no-show
            // pada sesi yang berasal dari booking.
            $table->timestamp('extended_until')
                  ->nullable()
                  ->after('started_at')
                  ->comment('Batas waktu sesi setelah perpanjangan. Null jika belum pernah di-extend.');
        });
    }

    public function down(): void
    {
        Schema::table('play_sessions', function (Blueprint $table) {
            $table->dropColumn('extended_until');
        });
    }
};
