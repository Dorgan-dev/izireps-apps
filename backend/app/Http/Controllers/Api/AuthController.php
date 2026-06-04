<?php

// ============================================================
// AuthController.php
// Menangani login SEMUA role (owner, kasir, pelanggan)
// melalui satu endpoint unified.
// ============================================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Customer;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * UNIFIED LOGIN — email/password untuk semua role.
     *
     * Alur:
     *   1. Cek tabel `users` (owner/kasir) berdasarkan email.
     *      → Jika ditemukan → validasi password → kembalikan token internal.
     *   2. Jika tidak ada di `users`, cek tabel `customers`.
     *      → Jika ditemukan → validasi password → kembalikan token customer.
     *   3. Jika tidak ditemukan di mana pun → 401.
     *
     * Catatan: Jika email ditemukan di `users` tapi password salah, langsung
     * kembalikan error tanpa mencoba ke `customers` (security best practice).
     */
    public function unifiedLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // ── 1. Cek user internal ───────────────────────────────────────────
        $user = User::where('email', $request->email)->first();

        if ($user) {
            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Email atau password salah.'], 401);
            }
            if (!$user->is_active) {
                return response()->json(['message' => 'Akun tidak aktif. Hubungi owner.'], 403);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'user' => [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'role'       => $user->role->value,
                    'role_label' => $user->role->label(),
                    'avatar'     => $user->avatar,
                ],
                'token' => $token,
            ]);
        }

        // ── 2. Cek customer ────────────────────────────────────────────────
        $customer = Customer::where('email', $request->email)->first();

        if ($customer) {
            // Customer yang dibuat via Google mungkin tidak punya password
            if (!$customer->password || !Hash::check($request->password, $customer->password)) {
                return response()->json([
                    'message' => 'Email atau password salah. Jika kamu mendaftar via Google, gunakan tombol "Login dengan Google".',
                ], 401);
            }

            $token = $customer->createToken('customer-token')->plainTextToken;

            return response()->json([
                'user' => [
                    'id'    => $customer->id,
                    'name'  => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'role'  => 'customer',
                    'avatar'=> $customer->avatar,
                ],
                'token' => $token,
            ]);
        }

        // ── 3. Tidak ditemukan di mana pun ────────────────────────────────
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    /**
     * UNIFIED GOOGLE AUTH — untuk semua role dari halaman login DAN register.
     *
     * Flag `from_register`:
     *   - false (dari halaman Login): cari di users/customers, jika tidak ada → error
     *   - true  (dari halaman Register): jika tidak ada di mana pun → buat customer baru
     *
     * Alur:
     *   1. Cek tabel `users` (internal).
     *      → Ditemukan + aktif → login. Jika from_register=true → already_registered=true.
     *   2. Cek tabel `customers`.
     *      → Ditemukan → login. Jika from_register=true → already_registered=true.
     *   3. Tidak ditemukan:
     *      → from_register=true → buat customer baru → login.
     *      → from_register=false → 404 (akun tidak ada, arahkan ke register).
     */
    public function handleGoogleCallback(Request $request)
    {
        $request->validate([
            'access_token'  => 'required|string',
            'from_register' => 'nullable|boolean',
        ]);

        $fromRegister = $request->boolean('from_register', false);

        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');
        $googleUser = $provider
            ->stateless()
            ->userFromToken($request->access_token);

        // ── 1. Cek user internal ───────────────────────────────────────────
        $user = User::where('email', $googleUser->email)->first();

        if ($user) {
            if (!$user->is_active) {
                return response()->json(['message' => 'Akun tidak aktif. Hubungi owner.'], 403);
            }

            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->id]);
            }
            if ($googleUser->avatar && $user->avatar !== $googleUser->avatar) {
                $user->update(['avatar' => $googleUser->avatar]);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'already_registered' => $fromRegister, // true jika dari register page
                'user' => [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'role'       => $user->role->value,
                    'role_label' => $user->role->label(),
                    'avatar'     => $user->avatar,
                ],
                'token' => $token,
            ]);
        }

        // ── 2. Cek customer ────────────────────────────────────────────────
        $customer = Customer::where('email', $googleUser->email)->first();

        if ($customer) {
            if (!$customer->google_id) {
                $customer->update(['google_id' => $googleUser->id]);
            }
            if ($googleUser->avatar && $customer->avatar !== $googleUser->avatar) {
                $customer->update(['avatar' => $googleUser->avatar]);
            }

            $token = $customer->createToken('customer-token')->plainTextToken;

            return response()->json([
                'already_registered' => $fromRegister,
                'user' => [
                    'id'    => $customer->id,
                    'name'  => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'role'  => 'customer',
                    'avatar'=> $customer->avatar,
                ],
                'token' => $token,
            ]);
        }

        // ── 3. Tidak ditemukan ─────────────────────────────────────────────
        if ($fromRegister) {
            // Buat customer baru (hanya dari halaman Register)
            $customer = Customer::create([
                'name'      => $googleUser->name,
                'email'     => $googleUser->email,
                'google_id' => $googleUser->id,
                'avatar'    => $googleUser->avatar,
            ]);

            $token = $customer->createToken('customer-token')->plainTextToken;

            return response()->json([
                'already_registered' => false,
                'user' => [
                    'id'    => $customer->id,
                    'name'  => $customer->name,
                    'email' => $customer->email,
                    'phone' => null,
                    'role'  => 'customer',
                    'avatar'=> $customer->avatar,
                ],
                'token' => $token,
            ]);
        }

        // Dari halaman Login dan akun tidak ditemukan → arahkan ke register
        return response()->json([
            'message' => 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
        ], 404);
    }

    /**
     * LOGOUT — berlaku untuk semua token (internal & customer).
     * Sanctum menghapus token berdasarkan Bearer token yang dikirim,
     * tidak peduli model mana yang membuatnya.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * ME — kembalikan data user/customer yang sedang login.
     */
    public function me(Request $request)
    {
        $authUser = $request->user();

        // Deteksi apakah ini User internal atau Customer berdasarkan class
        if ($authUser instanceof \App\Models\Customer) {
            return response()->json([
                'user' => [
                    'id'    => $authUser->id,
                    'name'  => $authUser->name,
                    'email' => $authUser->email,
                    'phone' => $authUser->phone,
                    'role'  => 'customer',
                    'avatar'=> $authUser->avatar,
                ],
            ]);
        }

        return response()->json([
            'user' => [
                'id'         => $authUser->id,
                'name'       => $authUser->name,
                'email'      => $authUser->email,
                'role'       => $authUser->role->value,
                'role_label' => $authUser->role->label(),
                'avatar'     => $authUser->avatar,
            ],
        ]);
    }
}
