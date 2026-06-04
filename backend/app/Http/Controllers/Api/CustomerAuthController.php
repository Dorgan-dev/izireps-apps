<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use Laravel\Socialite\Facades\Socialite;

class CustomerAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:customers',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20',
        ]);

        $customer = Customer::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone'        => $request->phone,
            'password'     => Hash::make($request->password),
            'password_set' => true,
        ]);

        $token = $customer->createToken('customer-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id'    => $customer->id,
                'name'  => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'role'  => 'customer',
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        $token = $customer->createToken('customer-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id'    => $customer->id,
                'name'  => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'role'  => 'customer',
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        $customer = $request->user();
        return response()->json([
            'user' => [
                'id'    => $customer->id,
                'name'  => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'role'  => 'customer',
            ]
        ]);
    }

    /**
     * GOOGLE LOGIN / REGISTER — Khusus pelanggan.
     *
     * Alur:
     *   1. Verifikasi access token Google.
     *   2. Jika customer belum ada → buat akun baru (register) lalu login.
     *   3. Jika customer sudah ada → langsung login.
     *   4. Respons khusus `already_registered: true` dikirim agar frontend
     *      bisa menampilkan pesan "Akun sudah terdaftar, klik untuk melanjutkan."
     *      ketika dipanggil dari halaman Register.
     */
    public function handleGoogleCallback(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
            // Flag dari frontend: apakah ini dipanggil dari halaman Register?
            'from_register' => 'nullable|boolean',
        ]);

        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider   = Socialite::driver('google');
        $googleUser = $provider->stateless()->userFromToken($request->access_token);

        $customer = Customer::where('email', $googleUser->email)->first();

        $alreadyRegistered = false;

        if ($customer) {
            // Akun sudah ada → update google_id jika belum tersimpan
            if (!$customer->google_id) {
                $customer->update(['google_id' => $googleUser->id]);
            }

            // Jika dipanggil dari halaman Register, tandai sebagai "sudah terdaftar"
            if ($request->boolean('from_register')) {
                $alreadyRegistered = true;
            }
        } else {
            // Buat customer baru (hanya boleh dari flow customer)
            $customer = Customer::create([
                'name'      => $googleUser->name,
                'email'     => $googleUser->email,
                'google_id' => $googleUser->id,
            ]);
        }

        $token = $customer->createToken('customer-token')->plainTextToken;

        return response()->json([
            'already_registered' => $alreadyRegistered,
            'user' => [
                'id'    => $customer->id,
                'name'  => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone ?? null,
                'role'  => 'customer',
            ],
            'token' => $token,
        ]);
    }
}
