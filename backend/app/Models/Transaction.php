<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'session_id', 'cashier_id', 'invoice_number',
        'gaming_total', 'fnb_total', 'grand_total',
        'dp_paid', 'remaining_amount', 'amount_paid', 'change_amount',
        'payment_method', 'status', 'paid_at',
    ];

    protected $casts = [
        'status'           => TransactionStatus::class,
        'payment_method'   => PaymentMethod::class,
        'gaming_total'     => 'decimal:2',
        'fnb_total'        => 'decimal:2',
        'grand_total'      => 'decimal:2',
        'dp_paid'          => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'amount_paid'      => 'decimal:2',
        'change_amount'    => 'decimal:2',
        'paid_at'          => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(PlaySession::class, 'session_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // Generate invoice number: INV-YYYYMMDD-XXXX
    public static function generateInvoiceNumber(): string
    {
        $date     = now()->format('Ymd');
        $lastToday = static::whereDate('created_at', today())->count();
        $seq      = str_pad($lastToday + 1, 4, '0', STR_PAD_LEFT);
        return "INV-{$date}-{$seq}";
    }
}