<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ps_type');
            $table->string('ps_sn')->nullable()->comment('Serial number konsol PlayStation');
            $table->string('tv')->nullable()->comment('Merek/model TV');
            $table->string('tv_sn')->nullable()->comment('Serial number TV');
            $table->string('tv_ip_address', 45)->nullable()->comment('IP lokal TV untuk kontrol STB');
            $table->string('tv_mac_address', 17)->nullable()->comment('MAC address TV untuk identifikasi jaringan');
            $table->enum('status', ['available', 'booked', 'in_use', 'maintenance'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
