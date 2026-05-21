<?php

namespace App\Models;

use App\Enums\SessionStatus;
use App\Enums\SessionType;
use App\Models\FreePlayRate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaySession extends Model
{
    use HasFactory;

    protected $table = 'play_sessions';

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
        'session_type',
        'planned_end_at',
        'extend_count',
        'status',
    ];

    protected $casts = [
        'status'         => SessionStatus::class,
        'gaming_cost'    => 'decimal:2',
        'session_type'   => SessionType::class,
        'started_at'     => 'datetime',
        'extended_until' => 'datetime',
        'planned_end_at' => 'datetime',
        'ended_at'       => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

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

    // ── Helpers ────────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === SessionStatus::Active;
    }

    /**
     * Apakah sesi ini sudah pernah diperpanjang.
     */
    public function isExtended(): bool
    {
        return ! is_null($this->extended_until);
        return $this->extend_count > 0;

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

    /**
     * Sisa menit hingga extended_until (negatif jika sudah lewat).
     * Null jika sesi belum pernah di-extend.
     */
    public function getRemainingMinutesAttribute(): ?int
    {
        if (! $this->extended_until) return null;
        return (int) now()->diffInMinutes($this->extended_until, false);
    }

    public function isPerJam(): bool
    {
        return $this->session_type === SessionType::PerJam;
    }

    public function isBebas(): bool
    {
        return $this->session_type === SessionType::Bebas;
    }

    public function isTimeUp(): bool
    {
        return $this->status === SessionStatus::TimeUp;
    }

    /**
     * Hitung biaya gaming berdasarkan durasi dan tipe sesi.
     * Untuk mode per_jam: durasi x tarif/jam (proporsional per menit).
     * Untuk mode bebas: kalkulasi siklus via FreePlayRate::calculate().
     */
    public function calculateGamingCost(int $minutes): float
    {
        $rate = $this->device->current_rate;
        if (! $rate) return 0;

        if ($this->isPerJam()) {
            return round(($minutes / 60) * $rate->price_per_hour, 2);
        }

        // Mode bebas — gunakan tarif progresif
        return FreePlayRate::calculate(
            $minutes,
            (float) $rate->price_per_hour,
            $rate->id
        );
    }
}
