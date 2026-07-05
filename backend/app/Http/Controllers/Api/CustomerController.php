<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * POST /api/public/customer-auth/register
     * Publik — pelanggan mendaftarkan diri sebelum booking
     */
    public function register(RegisterCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'data'    => $customer,
        ], 201);
    }

    /**
     * GET /api/customers
     * Semua role — daftar pelanggan dengan pencarian opsional
     *
     * Query params:
     *   ?search=  => cari nama / phone / email
     *   ?per_page= => jumlah per halaman (default 20)
     */
    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = $request->search;
                $q->where(fn ($q) => $q
                    ->where('name',  'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                );
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($customers);
    }

    /**
     * GET /api/customers/{customer}
     * Semua role — detail satu pelanggan
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'data' => $customer,
        ]);
    }

    /**
     * GET /api/customers/{customer}/bookings
     * Semua role — riwayat booking pelanggan tertentu
     */
    public function bookings(Customer $customer): JsonResponse
    {
        $bookings = $customer
            ->bookings()
            ->with(['device:id,name,ps_type', 'cashier:id,name'])
            ->latest('booking_date')
            ->get();

        return response()->json([
            'data' => $bookings,
        ]);
    }

    /**
     * GET /api/customer/bookings
     * Pelanggan — riwayat booking pelanggan itu sendiri
     */
    public function myBookings(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user instanceof Customer) {
            return response()->json(['message' => 'Unauthorized. Hanya untuk customer.'], 403);
        }

        $bookings = $user
            ->bookings()
            ->with(['device:id,name,ps_type'])
            ->latest('created_at')
            ->get();

        return response()->json([
            'data' => $bookings,
        ]);
    }

    /**
     * GET /api/customer/bookings/{booking}/proof
     * Pelanggan melihat bukti DP miliknya sendiri
     */
    public function myBookingProof(Request $request, \App\Models\Booking $booking)
    {
        $user = $request->user();
        if (!$user instanceof Customer || $booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $path = storage_path('app/private/' . $booking->dp_proof_file);
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}
