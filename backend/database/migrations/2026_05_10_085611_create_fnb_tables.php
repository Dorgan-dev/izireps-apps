<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fnb_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('fnb_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('fnb_categories')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fnb_items');
        Schema::dropIfExists('fnb_categories');
    }
};
