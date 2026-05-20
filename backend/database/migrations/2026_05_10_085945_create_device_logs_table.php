<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete()
                  ->comment('User yang mengubah status. Nullable jika diubah oleh sistem (auto)');

            $table->enum('from_status', ['available', 'booked', 'in_use', 'maintenance']);
            $table->enum('to_status', ['available', 'booked', 'in_use', 'maintenance']);
            $table->string('note')->nullable()
                  ->comment('Keterangan tambahan perubahan status');
            $table->timestamp('changed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_logs');
    }
};
