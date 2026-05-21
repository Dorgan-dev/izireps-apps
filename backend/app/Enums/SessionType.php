<?php
// ============================================================
// app/Enums/SessionType.php  — BARU
// ============================================================

namespace App\Enums;

enum SessionType: string
{
    case PerJam = 'per_jam';
    case Bebas  = 'bebas';

    public function label(): string
    {
        return match($this) {
            self::PerJam => 'Per Jam',
            self::Bebas  => 'Bebas',
        };
    }
}
