<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Kunci unik setting, e.g. qris_string');
            $table->longText('value')->nullable()->comment('Nilai setting');
            $table->string('group')->default('general')->comment('Grup setting untuk pengelompokan');
            $table->string('label')->nullable()->comment('Label tampilan untuk UI owner');
            $table->timestamps();
        });

        // Seed default QRIS setting (kosong, diisi owner)
        DB::table('settings')->insert([
            [
                'key'        => 'qris_string',
                'value'      => null,
                'group'      => 'payment',
                'label'      => 'QRIS String (dari Bank)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'store_name',
                'value'      => 'IZI PLAYSTATION',
                'group'      => 'general',
                'label'      => 'Nama Toko',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
