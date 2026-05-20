<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FnbItem extends Model
{
    protected $fillable = [
        'category_id', 'name', 'price', 'stock', 'is_available',
    ];

    protected $casts = [
        'price'        => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(FnbCategory::class, 'category_id');
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function isInStock(): bool
    {
        return $this->is_available && $this->stock > 0;
    }
}