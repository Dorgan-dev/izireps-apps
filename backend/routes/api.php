<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\DeviceRateController;
use App\Http\Controllers\Api\FnbCategoryController;
use App\Http\Controllers\Api\FnbItemController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Billing Rental PlayStation
|--------------------------------------------------------------------------
| Middleware stack:
|   auth:sanctum  → wajib login (Bearer token)
|   role:owner    → hanya owner
|   role:cashier  → hanya kasir
|   role:owner,cashier → keduanya boleh (alias: semua user internal)
|
| Daftarkan middleware 'role' di bootstrap/app.php:
|   ->withMiddleware(function (Middleware $middleware) {
|       $middleware->alias(['role' => \App\Http\Middleware\CheckRole::class]);
|   })
*/

// ═══════════════════════════════════════════════════════════════
// PUBLIC — tanpa autentikasi
// ═══════════════════════════════════════════════════════════════
Route::prefix('public')->group(function () {

    // Perangkat
    Route::get('devices', [DeviceController::class, 'publicIndex']);
    Route::get('devices/{device}/schedule', [DeviceController::class, 'schedule']);

    // Booking
    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings/{booking}', [BookingController::class, 'showPublic']);
    Route::patch('bookings/{booking}/cancel', [BookingController::class, 'cancelByCustomer']);
});

// ═══════════════════════════════════════════════════════════════
// AUTH UNIFIED — satu endpoint untuk semua role (owner, kasir, pelanggan)
// ═══════════════════════════════════════════════════════════════

// Email/password login — cek users tabel dulu, fallback ke customers
Route::post('login', [AuthController::class, 'unifiedLogin']);

// Google OAuth — unified (from_register=false: login only, from_register=true: register jika belum ada)
Route::post('auth/google', [AuthController::class, 'handleGoogleCallback']);

// Customer register via email/password (masih terpisah karena hanya boleh untuk customer)
Route::post('customer-auth/register', [CustomerAuthController::class, 'register']);

// Protected endpoints — berlaku untuk SEMUA token (user internal & customer)
// Sanctum akan mencocokkan token dari personal_access_tokens tanpa peduli model-nya
Route::middleware('auth:sanctum,customer')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',     [AuthController::class, 'me']);
});


// ═══════════════════════════════════════════════════════════════
// AUTHENTICATED — owner & kasir
// ═══════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:owner,cashier'])->group(function () {

    // ── Perangkat ─────────────────────────────────────────────
    Route::get('devices', [DeviceController::class, 'index']);
    Route::get('devices/{device}', [DeviceController::class, 'show']);
    Route::get('devices/{device}/logs', [DeviceController::class, 'logs']);

    // Hanya kasir yang ubah status manual (available ↔ maintenance)
    Route::patch('devices/{device}/status', [DeviceController::class, 'updateStatus'])
        ->middleware('role:owner,cashier');

    // ── Sesi bermain ──────────────────────────────────────────
    Route::get('sessions', [SessionController::class, 'index']);
    Route::get('sessions/{session}', [SessionController::class, 'show']);

    // ── Booking ───────────────────────────────────────────────
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);

    // ── Pelanggan ─────────────────────────────────────────────
    Route::get('customers', [CustomerController::class, 'index']);
    Route::get('customers/{customer}', [CustomerController::class, 'show']);
    Route::get('customers/{customer}/bookings', [CustomerController::class, 'bookings']);

    // ── F&B — read ────────────────────────────────────────────
    Route::get('fnb-categories', [FnbCategoryController::class, 'index']);
    Route::get('fnb-items', [FnbItemController::class, 'index']);
    Route::get('fnb-items/{item}', [FnbItemController::class, 'show']);

    // ── Transaksi ─────────────────────────────────────────────
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::get('transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('transactions/{transaction}/receipt', [TransactionController::class, 'receipt']);
});

// ═══════════════════════════════════════════════════════════════
// KASIR — operasional harian
// ═══════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:cashier,owner'])->group(function () {

    // Sesi bermain
    Route::post('sessions/start-walkin', [SessionController::class, 'startWalkIn']);
    Route::post('sessions/start-booking/{booking}', [SessionController::class, 'startFromBooking']);
    Route::post('sessions/{session}/add-fnb', [SessionController::class, 'addFnb']);
    Route::post('sessions/{session}/extend', [SessionController::class, 'extend']);
    Route::post('sessions/{session}/checkout', [SessionController::class, 'checkout']);

    // Booking — verifikasi & aksi
    Route::patch('bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::patch('bookings/{booking}/reject', [BookingController::class, 'reject']);
    Route::patch('bookings/{booking}/change-device', [BookingController::class, 'changeDevice']);
    Route::post('bookings/{booking}/refund', [BookingController::class, 'refund']);

    // F&B — write (kasir & owner)
    Route::post('fnb-items', [FnbItemController::class, 'store']);
    Route::put('fnb-items/{item}', [FnbItemController::class, 'update']);
});

// ═══════════════════════════════════════════════════════════════
// OWNER — manajemen & laporan
// ═══════════════════════════════════════════════════════════════
Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {

    // Perangkat — CRUD
    Route::post('devices', [DeviceController::class, 'store']);
    Route::put('devices/{device}', [DeviceController::class, 'update']);
    Route::delete('devices/{device}', [DeviceController::class, 'destroy']);

    // Tarif perangkat
    Route::get('devices/{device}/rates', [DeviceRateController::class, 'index']);
    Route::post('devices/{device}/rates', [DeviceRateController::class, 'store']);
    Route::put('rates/{rate}', [DeviceRateController::class, 'update']);     // shallow
    Route::delete('rates/{rate}', [DeviceRateController::class, 'destroy']); // shallow

    // F&B — kategori (hanya owner)
    Route::post('fnb-categories', [FnbCategoryController::class, 'store']);
    Route::put('fnb-categories/{category}', [FnbCategoryController::class, 'update']);
    Route::delete('fnb-categories/{category}', [FnbCategoryController::class, 'destroy']);
    Route::delete('fnb-items/{item}', [FnbItemController::class, 'destroy']);

    // Manajemen kasir
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

    // Laporan
    Route::prefix('reports')->group(function () {
        Route::get('summary', [ReportController::class, 'summary']);
        Route::get('revenue', [ReportController::class, 'revenue']);
        Route::get('devices', [ReportController::class, 'devices']);
        Route::get('fnb', [ReportController::class, 'fnb']);
        Route::get('cashiers', [ReportController::class, 'cashiers']);
        Route::get('export', [ReportController::class, 'export']);
    });
});
