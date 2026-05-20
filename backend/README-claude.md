# Migration Guide — Billing Rental PlayStation

## Urutan File Migration

File migration HARUS dijalankan sesuai urutan berikut karena ada dependensi foreign key antar tabel:

```
1. 000001_create_users_table.php
2. 000002_create_customers_table.php
3. 000003_create_devices_table.php
4. 000004_create_device_rates_table.php       → FK: devices
5. 000005_create_fnb_tables.php               → FK: fnb_categories
6. 000006_create_bookings_table.php           → FK: devices, customers, users
7. 000007_create_sessions_table.php           → FK: devices, customers, bookings, users
8. 000008_create_transactions_tables.php      → FK: sessions, users, fnb_items
9. 000009_create_refunds_table.php            → FK: bookings, users
10. 000010_create_device_logs_table.php       → FK: devices, users
```

## Cara Instalasi

1. Salin semua file migration ke folder `database/migrations/` proyek Laravel.
2. Salin setiap class enum dari `Enums.php` ke file masing-masing di `app/Enums/`.
3. Jalankan migration:

```bash
php artisan migrate
```

Untuk fresh install (hapus semua tabel lalu buat ulang):

```bash
php artisan migrate:fresh
```

## Catatan Penting

### Tabel `sessions`
Laravel memiliki tabel bawaan bernama `sessions` untuk manajemen sesi HTTP.
Pastikan pada `config/session.php` driver diset ke `database` ATAU ganti nama tabel
ini menjadi `play_sessions` untuk menghindari konflik:

```php
// config/session.php
'table' => 'laravel_sessions', // pisahkan dari tabel sessions aplikasi
```

Atau rename tabel di migration:
```php
Schema::create('play_sessions', function (Blueprint $table) { ... });
```

### Kolom `tv_ip_address`
Menggunakan `string(45)` untuk mendukung format IPv4 (maks 15 karakter)
maupun IPv6 (maks 45 karakter) sekaligus.

### Kolom `tv_mac_address`
Format standar MAC address: `XX:XX:XX:XX:XX:XX` = 17 karakter.

### Snapshot Harga di `transaction_items`
Kolom `item_name` dan `unit_price` menyimpan nilai pada saat transaksi terjadi.
Ini disengaja agar riwayat transaksi tidak berubah meski harga F&B diupdate kemudian.

### Invoice Number
Format yang disarankan untuk kolom `invoice_number`: `INV-YYYYMMDD-XXXX`
Contoh: `INV-20250510-0001`
Generate di aplikasi sebelum insert, bukan di database.

### Enum di PHP vs Database
Semua enum menggunakan PHP 8.1 Backed Enum (string).
Di kolom migration menggunakan `$table->enum(...)` yang akan membuat
tipe ENUM di MySQL — konsisten antara aplikasi dan database.

### Foreign Key `actor_id` di `device_logs`
Bersifat nullable karena perubahan status bisa dilakukan oleh sistem secara otomatis
(contoh: auto-cancel no-show) tanpa ada user yang login.

## Enum Files (buat masing-masing sebagai file terpisah)

```
app/Enums/
├── DeviceStatus.php
├── SessionStatus.php
├── BookingStatus.php
├── BookingCancelledBy.php
├── TransactionStatus.php
├── PaymentMethod.php
├── RefundMethod.php
└── UserRole.php
```

## Penggunaan Enum di Model

```php
// Contoh pada model Booking
use App\Enums\BookingStatus;
use App\Enums\BookingCancelledBy;

class Booking extends Model
{
    protected $casts = [
        'status'       => BookingStatus::class,
        'cancelled_by' => BookingCancelledBy::class,
        'booking_date' => 'date',
        'verified_at'  => 'datetime',
        'expires_at'   => 'datetime',
    ];
}

// Penggunaan di controller/service
$booking->status->label();  // "Menunggu Verifikasi"
$booking->status->color();  // "blue"
$booking->status === BookingStatus::Pending; // true/false
```
