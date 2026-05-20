<?php

namespace App\Models;

use App\Enums\SessionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaySession extends Model
{
    use HasFactory;

    protected $table = 'play_sessions'; // nama tabel di DB (bukan 'sessions' agar tidak konflik dengan session Laravel)

    protected $fillable = [
        'device_id',
        'customer_id',
        'booking_id',
        'cashier_id',
        'started_at',
        'extended_until',
        'ended_at',
        'duration_minutes',
        'gaming_cost',
        'status',
    ];

    protected $casts = [
        'status'      => SessionStatus::class,
        'gaming_cost' => 'decimal:2',
        'started_at'  => 'datetime',
        'ended_at'    => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class, 'session_id');
    }

    // ── Helpers ────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === SessionStatus::Active;
    }

    /**
     * Durasi berjalan dalam menit (untuk sesi yang sedang aktif).
     */
    public function getElapsedMinutesAttribute(): int
    {
        return (int) $this->started_at->diffInMinutes(now());
    }

    /**
     * Estimasi biaya sementara berdasarkan durasi yang sudah berjalan.
     */
    public function getRunningCostAttribute(): float
    {
        $rate = $this->device->current_rate;
        if (! $rate) return 0;

        $hours = $this->elapsed_minutes / 60;
        return round($hours * $rate->price_per_hour, 2);
    }
}
