<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->decimal('price_per_hour', 10, 2);
            $table->time('effective_from')->nullable()->comment('Jam mulai berlaku tarif, null = berlaku sepanjang hari');
            $table->time('effective_until')->nullable()->comment('Jam akhir berlaku tarif');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_rates');
    }
};
