<?php
// ============================================================
// app/Enums/SessionType.php  — BARU
// ============================================================

namespace App\Enums;

enum SessionType: string
{
    case PerJam = 'per_hour';
    case Bebas = 'free_play';

    public function label(): string
    {
        return match ($this) {
            self::PerJam => 'Per Jam',
            self::Bebas => 'Bebas',
        };
    }
}
