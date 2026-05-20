<?php

namespace App\Models;

use App\Enums\RefundMethod;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    protected $fillable = [
        'booking_id', 'processed_by',
        'refund_amount', 'reason', 'refund_method', 'processed_at',
    ];

    protected $casts = [
        'refund_method' => RefundMethod::class,
        'refund_amount' => 'decimal:2',
        'processed_at'  => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}