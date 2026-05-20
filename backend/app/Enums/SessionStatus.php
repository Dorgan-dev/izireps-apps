<?php

// app/Enums/SessionStatus.php

namespace App\Enums;

enum SessionStatus: string
{
    case Active    = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Active    => 'Aktif',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }
}