<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete()
                  ->comment('Kasir yang memverifikasi atau menolak DP');

            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('duration_minutes');

            $table->decimal('estimated_cost', 10, 2)->comment('Total estimasi biaya bermain');
            $table->decimal('dp_amount', 10, 2)->comment('Nominal DP yang diterima outlet (50% dari estimated_cost)');
            $table->string('dp_proof_file')->nullable()->comment('Path file bukti transfer DP');

            $table->enum('status', [
                'pending',
                'confirmed',
                'in_use',
                'completed',
                'rejected',
                'cancelled',
                'expired',
            ])->default('pending');

            $table->text('cancel_reason')->nullable()->comment('Alasan penolakan atau pembatalan');
            $table->enum('cancelled_by', ['customer', 'system', 'outlet'])->nullable();

            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable()->comment('Batas waktu verifikasi kasir (1 jam setelah booking dibuat)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
