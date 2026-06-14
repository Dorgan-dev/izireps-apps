<?php
// ============================================================
// app/Enums/SessionStatus.php  — UPDATE (tambah time_up)
// ============================================================

namespace App\Enums;

enum SessionStatus: string
{
    case Active = 'active';
    case TimeUp = 'time_up';   // khusus per_hour: waktu habis, TV mati, belum checkout
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::TimeUp => 'Waktu Habis',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'amber',
            self::TimeUp => 'red',
            self::Completed => 'green',
            self::Cancelled => 'gray',
        };
    }

    // Apakah sesi masih "terbuka" (belum checkout)
    public function isOpen(): bool
    {
        return in_array($this, [self::Active, self::TimeUp]);
    }
}