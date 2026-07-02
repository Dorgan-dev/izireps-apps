<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingHistoryController extends Controller
{
    /**
     * Menampilkan seluruh riwayat booking milik customer yang sedang login.
     */
    public function index(Request $request)
    {
        $customer = $request->user();

        $bookings = Booking::with([
                'device:id,name',
                'session:id,booking_id,status',
            ])
            ->where('customer_id', $customer->id)
            ->orderByDesc('booking_date')
            ->orderByDesc('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Booking history retrieved successfully',
            'data' => $bookings,
        ]);
    }

    /**
     * Menampilkan detail satu booking milik customer.
     */
    public function show(Request $request, $id)
    {
        $customer = $request->user();

        $booking = Booking::with([
                'device',
                'customer',
                'session',
                'refund',
            ])
            ->where('customer_id', $customer->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Booking detail retrieved successfully',
            'data' => $booking,
        ]);
    }
}
