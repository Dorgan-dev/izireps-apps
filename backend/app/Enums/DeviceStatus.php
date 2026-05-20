<?php
// app/Enums/DeviceStatus.php

namespace App\Enums;

enum DeviceStatus: string
{
    case Available   = 'available';
    case Booked      = 'booked';
    case InUse       = 'in_use';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return match($this) {
            self::Available   => 'Tersedia',
            self::Booked      => 'Dibooking',
            self::InUse       => 'Digunakan',
            self::Maintenance => 'Perbaikan',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Available   => 'green',
            self::Booked      => 'blue',
            self::InUse       => 'amber',
            self::Maintenance => 'red',
        };
    }
}