<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'fnb_item_id',
        'item_name', 'quantity', 'unit_price', 'subtotal',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal'   => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function fnbItem()
    {
        return $this->belongsTo(FnbItem::class, 'fnb_item_id');
    }
}