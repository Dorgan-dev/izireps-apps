<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'google_id',
        'password_set',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'password_set' => 'boolean',
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
