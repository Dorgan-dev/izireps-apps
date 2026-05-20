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
     * POST /api/public/customers/register
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
}
