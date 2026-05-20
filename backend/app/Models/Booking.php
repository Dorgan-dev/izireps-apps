<?php

namespace App\Models;

use App\Enums\BookingCancelledBy;
use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property \Illuminate\Support\Carbon $booking_date
 */
class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'customer_id',
        'verified_by',
        'booking_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'estimated_cost',
        'dp_amount',
        'dp_proof_file',
        'status',
        'cancel_reason',
        'cancelled_by',
        'verified_at',
        'expires_at',
    ];

    protected $casts = [
        'status'         => BookingStatus::class,
        'cancelled_by'   => BookingCancelledBy::class,
        'booking_date'   => 'date',
        'estimated_cost' => 'decimal:2',
        'dp_amount'      => 'decimal:2',
        'verified_at'    => 'datetime',
        'expires_at'     => 'datetime',
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

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function session()
    {
        return $this->hasOne(PlaySession::class);
    }

    public function refund()
    {
        return $this->hasOne(Refund::class);
    }

    // ── Scopes ─────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', BookingStatus::Pending);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', BookingStatus::Confirmed);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('booking_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->whereDate('booking_date', '>=', today())
                     ->where('status', BookingStatus::Confirmed);
    }

    // ── Helpers ────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === BookingStatus::Pending;
    }

    public function isConfirmed(): bool
    {
        return $this->status === BookingStatus::Confirmed;
    }

    public function isCancellableByCustomer(): bool
    {
        if (! $this->isConfirmed()) return false;

        $cutoff = \Carbon\Carbon::parse(
            $this->booking_date->format('Y-m-d') . ' ' . $this->start_time
        )->subMinutes(15);

        return now()->lt($cutoff);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }

    /**
     * Apakah pelanggan sudah no-show (lewat 15 menit dari jam booking).
     */
    public function isNoShow(): bool
    {
        if (! $this->isConfirmed()) return false;

        $noShowAt = \Carbon\Carbon::parse(
            $this->booking_date->format('Y-m-d') . ' ' . $this->start_time
        )->addMinutes(15);

        return now()->gte($noShowAt);
    }
}
