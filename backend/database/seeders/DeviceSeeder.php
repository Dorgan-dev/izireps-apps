<?php

// ============================================================
// DeviceSeeder.php
// ============================================================

namespace Database\Seeders;

use App\Models\Device;
use App\Models\DeviceRate;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $devices = [
            ['name' => 'PS5 Unit 1', 'ps_type' => 'PS5', 'price_per_hour' => 15000],
            ['name' => 'PS5 Unit 2', 'ps_type' => 'PS5', 'price_per_hour' => 15000],
            ['name' => 'PS5 Unit 3', 'ps_type' => 'PS5', 'price_per_hour' => 15000],
            ['name' => 'PS4 Unit 1', 'ps_type' => 'PS4', 'price_per_hour' => 10000],
            ['name' => 'PS4 Unit 2', 'ps_type' => 'PS4', 'price_per_hour' => 10000],
            ['name' => 'PS4 Unit 3', 'ps_type' => 'PS4', 'price_per_hour' => 10000],
            ['name' => 'PS4 Unit 4', 'ps_type' => 'PS4', 'price_per_hour' => 10000],
            ['name' => 'PS4 Unit 5', 'ps_type' => 'PS4', 'price_per_hour' => 10000],
        ];

        foreach ($devices as $data) {
            $device = Device::create([
                'name'    => $data['name'],
                'ps_type' => $data['ps_type'],
                'status'  => 'available',
            ]);

            // Tarif default (berlaku seharian, effective_from = null)
            DeviceRate::create([
                'device_id'      => $device->id,
                'price_per_hour' => $data['price_per_hour'],
                'effective_from' => null,
                'effective_until'=> null,
                'is_active'      => true,
            ]);

            // Contoh tarif malam (18:00 - 24:00) lebih mahal
            DeviceRate::create([
                'device_id'      => $device->id,
                'price_per_hour' => $data['price_per_hour'] * 1.2, // +20% malam
                'effective_from' => '18:00:00',
                'effective_until'=> '23:59:59',
                'is_active'      => true,
            ]);
        }
    }
}
