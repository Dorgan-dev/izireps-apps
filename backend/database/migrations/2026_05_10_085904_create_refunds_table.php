<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings');
            $table->foreignId('processed_by')->constrained('users')
                  ->comment('Kasir yang memproses refund');

            $table->decimal('refund_amount', 10, 2)
                  ->comment('Nominal DP yang dikembalikan (tidak termasuk biaya transfer bank pelanggan)');
            $table->text('reason')
                  ->comment('Alasan refund, wajib diisi kasir');
            $table->enum('refund_method', ['cash', 'transfer']);
            $table->timestamp('processed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
