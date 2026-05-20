<?php

// ============================================================
// UserSeeder.php
// ============================================================

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Owner
        User::create([
            'name'      => 'Owner Rental PS',
            'email'     => 'owner@rentalps.com',
            'password'  => Hash::make('password'),
            'role'      => 'owner',
            'is_active' => true,
        ]);

        // Kasir 1
        User::create([
            'name'      => 'Kasir Satu',
            'email'     => 'kasir1@rentalps.com',
            'password'  => Hash::make('password'),
            'role'      => 'cashier',
            'is_active' => true,
        ]);

        // Kasir 2
        User::create([
            'name'      => 'Kasir Dua',
            'email'     => 'kasir2@rentalps.com',
            'password'  => Hash::make('password'),
            'role'      => 'cashier',
            'is_active' => true,
        ]);
    }
}
