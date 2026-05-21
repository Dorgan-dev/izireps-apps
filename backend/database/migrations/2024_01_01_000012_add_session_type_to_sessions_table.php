<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('play_sessions', function (Blueprint $table) {
            // Jenis waktu bermain: per_jam (ada batas waktu) atau bebas (tanpa batas)
            $table->enum('session_type', ['per_jam', 'bebas'])
                  ->default('bebas')
                  ->after('status')
                  ->comment('per_jam = ada batas waktu, bebas = tanpa batas');

            // Kapan sesi seharusnya berakhir — hanya diisi untuk mode per_jam
            // Digunakan untuk trigger time_up dan matikan TV via STB
            $table->timestamp('planned_end_at')
                  ->nullable()
                  ->after('session_type')
                  ->comment('Batas waktu sesi (khusus per_jam). Null untuk mode bebas.');

            // Berapa kali sesi ini diperpanjang — untuk audit dan label di UI kasir
            $table->tinyInteger('extend_count')
                  ->unsigned()
                  ->default(0)
                  ->after('planned_end_at')
                  ->comment('Jumlah perpanjangan waktu. Bertambah setiap kali kasir extend.');
        });

        // Update enum status untuk tambahkan time_up
        // MySQL tidak support alter enum langsung, perlu modifikasi kolom
        Schema::table('play_sessions', function (Blueprint $table) {
            $table->enum('status', ['active', 'time_up', 'completed', 'cancelled'])
                  ->default('active')
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('play_sessions', function (Blueprint $table) {
            $table->dropColumn(['session_type', 'planned_end_at', 'extend_count']);
            $table->enum('status', ['active', 'completed', 'cancelled'])
                  ->default('active')
                  ->change();
        });
    }
};
