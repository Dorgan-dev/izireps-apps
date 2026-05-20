<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'phone',
        'email',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function sessions()
    {
        return $this->hasMany(PlaySession::class);
    }
}
