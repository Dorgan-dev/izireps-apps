<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Nama tabel 'play_sessions' (bukan 'sessions') untuk menghindari konflik
        // dengan tabel session PHP Laravel yang dikelola framework secara internal.
        Schema::create('play_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete()
                  ->comment('Nullable untuk pelanggan walk-in tanpa data');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete()
                  ->comment('Diisi jika sesi berasal dari booking online');
            $table->foreignId('cashier_id')->constrained('users')
                  ->comment('Kasir yang memulai sesi');

            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable()
                  ->comment('Diisi saat sesi selesai');

            $table->decimal('gaming_cost', 10, 2)->default(0)
                  ->comment('Biaya bermain berdasarkan durasi x tarif');

            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('play_sessions');
    }
};

