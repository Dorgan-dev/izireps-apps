<?php

// app/Enums/RefundMethod.php

namespace App\Enums;

enum RefundMethod: string
{
    case Cash     = 'cash';
    case Transfer = 'transfer';

    public function label(): string
    {
        return match($this) {
            self::Cash     => 'Tunai',
            self::Transfer => 'Transfer Bank',
        };
    }
}