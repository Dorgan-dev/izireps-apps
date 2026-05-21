<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_play_rates', function (Blueprint $table) {
            $table->id();

            // Terikat ke device_rates — tarif bebas berbeda per tipe perangkat
            // Jika device_rate dihapus, tarif bebasnya ikut terhapus
            $table->foreignId('device_rate_id')
                  ->constrained('device_rates')
                  ->cascadeOnDelete();

            // Rentang menit dalam satu siklus 60 menit
            // range_start dan range_end membentuk interval: [range_start, range_end]
            $table->tinyInteger('range_start')->unsigned()
                  ->comment('Menit mulai rentang, inklusif. Contoh: 0, 6, 16, 21, 31');
            $table->tinyInteger('range_end')->unsigned()
                  ->comment('Menit akhir rentang, inklusif. Contoh: 5, 15, 20, 30, 60');

            // Biaya yang dikenakan JIKA sesi berakhir dalam rentang ini
            // Bukan akumulasi — ini adalah total biaya siklus terakhir
            $table->decimal('cycle_cost', 10, 2)
                  ->comment('Biaya siklus jika sesi berakhir di rentang ini. Bukan akumulasi.');

            $table->timestamps();

            // Satu device_rate tidak boleh punya rentang yang tumpang tindih
            $table->unique(['device_rate_id', 'range_start'], 'unique_rate_range_start');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('free_play_rates');
    }
};
