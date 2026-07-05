# Fitur Riwayat Booking Pelanggan (Customer Booking History)

Fitur ini akan memungkinkan pelanggan yang sudah login untuk melihat riwayat booking mereka. Implementasi mencakup penambahan endpoint di backend dan pembuatan antarmuka pengguna (UI) dengan DaisyUI di frontend.

## User Review Required
> [!IMPORTANT]
> Terdapat beberapa keputusan desain yang memerlukan konfirmasi Anda sebelum implementasi dimulai. Mohon tinjau bagian "Open Questions" di bawah ini.

## Open Questions
1. **Navigasi Frontend**: Di mana Anda ingin menempatkan tombol akses ke halaman riwayat booking ini? Apakah di dalam *dropdown* profil pengguna (pojok kanan atas) atau sebagai menu baru di *navbar* utama?
2. **Detail Tampilan**: Apakah Anda ingin riwayat booking ditampilkan dalam format *tabel* (seperti halaman jadwal) atau *kartu (cards)* yang lebih ramah di perangkat seluler? Keduanya akan menggunakan gaya DaisyUI yang sudah ada.
3. **Pembatalan / Bukti DP**: Apakah pelanggan diperbolehkan membatalkan booking (jika statusnya *pending*) atau melihat kembali bukti DP melalui halaman riwayat ini?

## Proposed Changes

### Backend (API Endpoint)

#### [MODIFY] [api.php](file:///d:/bpf-2-react/izireps-apps/backend/routes/api.php)
- Menambahkan *endpoint* baru `GET /customer/bookings` di dalam grup _middleware_ `auth:sanctum,customer`.

#### [MODIFY] [CustomerController.php](file:///d:/bpf-2-react/izireps-apps/backend/app/Http/Controllers/Api/CustomerController.php)
- Menambahkan fungsi `myBookings(Request $request)` yang akan mengambil data relasi `bookings()` milik pelanggan yang sedang login beserta detail peralatannya (`device`).

---

### Frontend (React & DaisyUI)

#### [MODIFY] [api.js](file:///d:/bpf-2-react/izireps-apps/frontend/src/services/api.js)
- Menambahkan pemanggilan API `myBookings: () => api.get("/customer/bookings")` ke dalam layanan API yang sudah ada (misal di `bookingsApi`).

#### [NEW] History.jsx (file:///d:/bpf-2-react/izireps-apps/frontend/src/pages/CustomerPages/History.jsx)
- Membuat komponen halaman riwayat booking baru menggunakan komponen standar DaisyUI (Badge status, Skeleton loading, Empty state).
- Halaman ini akan mengambil data dari endpoint `myBookings` secara reaktif ketika di-*mount*.

#### [MODIFY] [index.jsx](file:///d:/bpf-2-react/izireps-apps/frontend/src/router/index.jsx)
- Meregistrasi halaman baru `History.jsx` ke dalam sistem *router* React dengan *path* `/history` di bawah rute yang terproteksi (`<RequireAuth />`).

## Verification Plan

### Automated Tests
- Memastikan tidak ada masalah _build_ atau linting pada proyek frontend dan backend setelah implementasi.

### Manual Verification
1. Login sebagai pelanggan (`customer`).
2. Navigasi ke rute `/history`.
3. Memastikan daftar _booking_ yang pernah dibuat oleh akun tersebut berhasil ditampilkan.
4. Mengecek tampilan responsif dan kesesuaian _badge_ warna dengan DaisyUI theme yang ada.
