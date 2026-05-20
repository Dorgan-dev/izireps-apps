<?php

// app/Enums/TransactionStatus.php

namespace App\Enums;

enum TransactionStatus: string
{
    case Pending   = 'pending';
    case Paid      = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Belum Dibayar',
            self::Paid      => 'Lunas',
            self::Cancelled => 'Dibatalkan',
        };
    }
}