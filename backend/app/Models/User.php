<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'google_id',
        'password_set',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'role'      => UserRole::class,
        'is_active' => 'boolean',
    ];

    // ── Relationships ──────────────────────────────────────

    public function sessions()
    {
        return $this->hasMany(PlaySession::class, 'cashier_id');
    }

    public function verifiedBookings()
    {
        return $this->hasMany(Booking::class, 'verified_by');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'cashier_id');
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class, 'processed_by');
    }

    public function deviceLogs()
    {
        return $this->hasMany(DeviceLog::class, 'actor_id');
    }

    // ── Helpers ────────────────────────────────────────────

    public function isOwner(): bool
    {
        return $this->role === UserRole::Owner;
    }

    public function isCashier(): bool
    {
        return $this->role === UserRole::Cashier;
    }
}
