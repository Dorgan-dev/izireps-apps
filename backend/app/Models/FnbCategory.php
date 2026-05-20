<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FnbCategory extends Model
{
    protected $fillable = ['name', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function items()
    {
        return $this->hasMany(FnbItem::class, 'category_id');
    }

    public function availableItems()
    {
        return $this->hasMany(FnbItem::class, 'category_id')
                    ->where('is_available', true)
                    ->where('stock', '>', 0);
    }
}
