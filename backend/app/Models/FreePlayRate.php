<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreePlayRate extends Model
{
    protected $fillable = [
        'device_rate_id',
        'range_start',
        'range_end',
        'cycle_cost',
    ];

    protected $casts = [
        'cycle_cost' => 'decimal:2',
    ];

    public function deviceRate()
    {
        return $this->belongsTo(DeviceRate::class);
    }

    /**
     * Hitung biaya mode bebas berdasarkan total menit bermain.
     *
     * Logika:
     *   full_cycles  = floor(minutes / 60)
     *   remainder    = minutes % 60
     *   biaya        = (full_cycles × tarif_normal_1jam) + cycle_cost_sisa
     *
     * Jika remainder = 0 (tepat 60, 120, dst), tidak ada biaya siklus terakhir.
     *
     * @param  int    $totalMinutes    Total menit sesi bermain
     * @param  float  $normalHourRate  Tarif normal 1 jam perangkat ini
     * @return float
     */
    public static function calculate(int $totalMinutes, float $normalHourRate, int $deviceRateId): float
    {
        if ($totalMinutes <= 0) return 0;

        $fullCycles    = (int) floor($totalMinutes / 60);
        $remainder     = $totalMinutes % 60;

        // Biaya siklus-siklus penuh
        $fullCycleCost = $fullCycles * $normalHourRate;

        // Biaya siklus terakhir (jika ada sisa menit)
        $lastCycleCost = 0.0;
        if ($remainder > 0) {
            $rate = static::where('device_rate_id', $deviceRateId)
                ->where('range_start', '<=', $remainder)
                ->where('range_end', '>=', $remainder)
                ->first();

            $lastCycleCost = $rate ? (float) $rate->cycle_cost : $normalHourRate;
        }

        return round($fullCycleCost + $lastCycleCost, 2);
    }
}
