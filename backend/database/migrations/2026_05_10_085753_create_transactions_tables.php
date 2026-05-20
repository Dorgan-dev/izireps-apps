<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('play_sessions');
            $table->foreignId('cashier_id')->constrained('users')
                  ->comment('Kasir yang memproses checkout');

            $table->string('invoice_number')->unique()
                  ->comment('Format: INV-YYYYMMDD-XXXX');

            $table->decimal('gaming_total', 10, 2)->default(0)
                  ->comment('Total biaya sesi bermain');
            $table->decimal('fnb_total', 10, 2)->default(0)
                  ->comment('Total biaya F&B');
            $table->decimal('grand_total', 10, 2)->default(0)
                  ->comment('gaming_total + fnb_total');

            $table->decimal('dp_paid', 10, 2)->default(0)
                  ->comment('Nominal DP yang sudah dibayar saat booking (0 jika walk-in)');
            $table->decimal('remaining_amount', 10, 2)->default(0)
                  ->comment('grand_total - dp_paid');
            $table->decimal('amount_paid', 10, 2)->default(0)
                  ->comment('Nominal uang yang dibayarkan pelanggan saat checkout');
            $table->decimal('change_amount', 10, 2)->default(0)
                  ->comment('Kembalian: amount_paid - remaining_amount');

            $table->enum('payment_method', ['cash', 'qris', 'transfer'])->nullable()
                  ->comment('Diisi saat checkout');
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('fnb_item_id')->nullable()->constrained('fnb_items')->nullOnDelete()
                  ->comment('Nullable untuk antisipasi item dihapus di masa depan');

            $table->string('item_name')
                  ->comment('Snapshot nama item saat transaksi, agar tidak berubah jika harga/nama item diupdate');
            $table->unsignedSmallInteger('quantity');
            $table->decimal('unit_price', 10, 2)
                  ->comment('Snapshot harga per item saat transaksi');
            $table->decimal('subtotal', 10, 2)
                  ->comment('quantity x unit_price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
    }
};
