<?php

namespace App\Models;

use App\Enums\DeviceStatus;
use Illuminate\Database\Eloquent\Model;

class DeviceLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'device_id',
        'actor_id',
        'from_status',
        'to_status',
        'note',
        'changed_at',
    ];

    protected $casts = [
        'from_status' => DeviceStatus::class,
        'to_status'   => DeviceStatus::class,
        'changed_at'  => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
