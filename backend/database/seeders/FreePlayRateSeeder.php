<?php
// ============================================================
// database/seeders/FreePlayRateSeeder.php
// ============================================================
// Jalankan SETELAH DeviceSeeder karena butuh device_rates yang sudah ada.
// Rentang tarif bebas untuk semua device_rate yang aktif.

namespace Database\Seeders;

use App\Models\DeviceRate;
use App\Models\FreePlayRate;
use Illuminate\Database\Seeder;

class FreePlayRateSeeder extends Seeder
{
    // Pola rentang berlaku sama untuk semua tipe PS
    // cycle_cost = biaya yang dikenakan JIKA sesi berakhir di rentang ini
    // Rentang 31-60 menggunakan price_per_hour perangkat (tarif normal 1 jam)
    private array $ranges = [
        ['range_start' => 0,  'range_end' => 5,  'multiplier' => null, 'fixed' => 1000],
        ['range_start' => 6,  'range_end' => 15, 'multiplier' => null, 'fixed' => 2000],
        ['range_start' => 16, 'range_end' => 20, 'multiplier' => null, 'fixed' => 3000],
        ['range_start' => 21, 'range_end' => 30, 'multiplier' => null, 'fixed' => 4000],
        // Rentang 31-60: sama dengan tarif normal 1 jam (multiplier = 1.0)
        ['range_start' => 31, 'range_end' => 60, 'multiplier' => 1.0,  'fixed' => null],
    ];

    public function run(): void
    {
        // Ambil semua tarif default (effective_from = null) yang aktif
        $defaultRates = DeviceRate::whereNull('effective_from')
            ->where('is_active', true)
            ->get();

        foreach ($defaultRates as $rate) {
            foreach ($this->ranges as $range) {
                $cycleCost = $range['fixed'] !== null
                    ? $range['fixed']
                    : $rate->price_per_hour * $range['multiplier'];

                FreePlayRate::firstOrCreate(
                    [
                        'device_rate_id' => $rate->id,
                        'range_start'    => $range['range_start'],
                    ],
                    [
                        'range_end'  => $range['range_end'],
                        'cycle_cost' => $cycleCost,
                    ]
                );
            }
        }
    }
}