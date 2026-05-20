<?php

// ============================================================
// FnbSeeder.php
// ============================================================

namespace Database\Seeders;

use App\Models\FnbCategory;
use App\Models\FnbItem;
use Illuminate\Database\Seeder;

class FnbSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'  => 'Minuman',
                'items' => [
                    ['name' => 'Air Mineral 600ml',   'price' => 5000,  'stock' => 50],
                    ['name' => 'Teh Botol 350ml',      'price' => 6000,  'stock' => 30],
                    ['name' => 'Kopi Sachet',           'price' => 4000,  'stock' => 40],
                    ['name' => 'Minuman Kaleng 330ml',  'price' => 8000,  'stock' => 24],
                    ['name' => 'Es Jeruk',              'price' => 7000,  'stock' => 20],
                ],
            ],
            [
                'name'  => 'Makanan Ringan',
                'items' => [
                    ['name' => 'Indomie Goreng',        'price' => 12000, 'stock' => 20],
                    ['name' => 'Indomie Kuah',          'price' => 12000, 'stock' => 20],
                    ['name' => 'Roti Bakar Coklat',     'price' => 10000, 'stock' => 15],
                    ['name' => 'Telur Dadar',           'price' => 5000,  'stock' => 30],
                ],
            ],
            [
                'name'  => 'Snack',
                'items' => [
                    ['name' => 'Chitato 68gr',          'price' => 8000,  'stock' => 15],
                    ['name' => 'Oreo 119gr',            'price' => 9000,  'stock' => 12],
                    ['name' => 'Kacang Garuda 100gr',   'price' => 7000,  'stock' => 20],
                    ['name' => 'Coklat Silverqueen',    'price' => 10000, 'stock' => 10],
                ],
            ],
            [
                'name'  => 'Rokok',
                'items' => [
                    ['name' => 'Sampoerna Mild 16',     'price' => 25000, 'stock' => 20],
                    ['name' => 'Gudang Garam Merah 12', 'price' => 22000, 'stock' => 20],
                    ['name' => 'Djarum Super 12',       'price' => 22000, 'stock' => 20],
                ],
            ],
        ];

        foreach ($categories as $cat) {
            $category = FnbCategory::create([
                'name'      => $cat['name'],
                'is_active' => true,
            ]);

            foreach ($cat['items'] as $item) {
                FnbItem::create([
                    'category_id'  => $category->id,
                    'name'         => $item['name'],
                    'price'        => $item['price'],
                    'stock'        => $item['stock'],
                    'is_available' => true,
                ]);
            }
        }
    }
}