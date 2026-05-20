<?php

// app/Enums/BookingCancelledBy.php

namespace App\Enums;

enum BookingCancelledBy: string
{
    case Customer = 'customer';
    case System   = 'system';
    case Outlet   = 'outlet';

    public function label(): string
    {
        return match($this) {
            self::Customer => 'Pelanggan',
            self::System   => 'Sistem (no-show)',
            self::Outlet   => 'Outlet',
        };
    }
}
