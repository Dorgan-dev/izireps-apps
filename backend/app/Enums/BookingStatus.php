<?php

// app/Enums/BookingStatus.php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending   = 'pending';
    case Confirmed = 'confirmed';
    case InUse     = 'in_use';
    case Completed = 'completed';
    case Rejected  = 'rejected';
    case Cancelled = 'cancelled';
    case Expired   = 'expired';

    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Menunggu Verifikasi',
            self::Confirmed => 'Dikonfirmasi',
            self::InUse     => 'Sedang Dimainkan',
            self::Completed => 'Selesai',
            self::Rejected  => 'Ditolak',
            self::Cancelled => 'Dibatalkan',
            self::Expired   => 'Kedaluwarsa',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Pending   => 'blue',
            self::Confirmed => 'green',
            self::InUse     => 'amber',
            self::Completed => 'teal',
            self::Rejected  => 'red',
            self::Cancelled => 'coral',
            self::Expired   => 'gray',
        };
    }
}
