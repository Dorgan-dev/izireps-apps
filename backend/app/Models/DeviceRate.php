<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceRate extends Model
{
    protected $fillable = [
        'device_id',
        'price_per_hour',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}