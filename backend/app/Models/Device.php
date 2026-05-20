<?php

namespace App\Models;

use App\Enums\DeviceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ps_type',
        'ps_sn',
        'tv',
        'tv_sn',
        'tv_ip_address',
        'tv_mac_address',
        'status',
    ];

    protected $casts = [
        'status' => DeviceStatus::class,
    ];

    // ── Relationships ──────────────────────────────────────

    public function rates()
    {
        return $this->hasMany(DeviceRate::class);
    }

    public function activeRate()
    {
        return $this->hasOne(DeviceRate::class)
            ->where('is_active', true)
            ->whereNull('effective_from') // tarif default (seharian)
            ->orWhere(function ($q) {
                $q->where('is_active', true)
                    ->whereTime('effective_from', '<=', now())
                    ->whereTime('effective_until', '>=', now());
            });
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function sessions()
    {
        return $this->hasMany(PlaySession::class);
    }

    public function logs()
    {
        return $this->hasMany(DeviceLog::class);
    }

    // ── Helpers ────────────────────────────────────────────

    public function isAvailable(): bool
    {
        return $this->status === DeviceStatus::Available;
    }

    public function getCurrentRateAttribute(): ?DeviceRate
    {
        $now = now()->format('H:i:s');

        return $this->rates()
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('effective_from')
                    ->orWhere(function ($q2) use ($now) {
                        $q2->where('effective_from', '<=', $now)
                            ->where('effective_until', '>=', $now);
                    });
            })
            ->orderByRaw('effective_from IS NULL ASC') // prioritaskan tarif spesifik jam
            ->first();
    }
    public function latestLog()
    {
        // Ini akan mengambil tepat 1 log terbaru dengan query yang sangat efisien
        return $this->hasOne(DeviceLog::class)->latestOfMany('changed_at');
    }

}
