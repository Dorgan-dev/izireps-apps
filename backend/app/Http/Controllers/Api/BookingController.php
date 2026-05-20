<?php

// namespace App\Http\Controllers;
// ============================================================
// BookingController.php
// ============================================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    public function __construct(protected BookingService $service) {}

    public function index(Request $request)
    {
        $bookings = Booking::with(['device', 'customer', 'verifiedBy'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date, fn($q, $d) => $q->whereDate('booking_date', $d))
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'device_id'    => 'required|exists:devices,id',
            'customer_id'  => 'required|exists:customers,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|date_format:H:i',
            'end_time'     => 'required|date_format:H:i|after:start_time',
            'dp_proof'     => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $path    = $request->file('dp_proof')->store('dp-proofs', 'private');
        $booking = $this->service->create($data, $path);

        return response()->json(['data' => $booking], 201);
    }

    public function showPublic(Booking $booking)
    {
        // Tampilkan tanpa data sensitif
        return response()->json(['data' => $booking->only([
            'id', 'booking_date', 'start_time', 'end_time', 'status',
        ])]);
    }

    public function show(Booking $booking)
    {
        return response()->json(['data' => $booking->load(['device', 'customer', 'verifiedBy', 'session', 'refund'])]);
    }

    public function confirm(Request $request, Booking $booking)
    {
        $booking = $this->service->confirm($booking, $request->user());
        return response()->json(['data' => $booking]);
    }

    public function reject(Request $request, Booking $booking)
    {
        $request->validate(['reason' => 'required|string|min:10']);
        $booking = $this->service->reject($booking, $request->user(), $request->reason);
        return response()->json(['data' => $booking]);
    }

    public function cancelByCustomer(Request $request, Booking $booking)
    {
        $booking = $this->service->cancelByCustomer($booking);
        return response()->json(['data' => $booking]);
    }

    public function changeDevice(Request $request, Booking $booking)
    {
        $request->validate(['device_id' => 'required|exists:devices,id']);
        $newDevice = Device::findOrFail($request->device_id);
        $booking   = $this->service->changeDevice($booking, $newDevice, $request->user());
        return response()->json(['data' => $booking]);
    }

    public function refund(Request $request, Booking $booking)
    {
        $request->validate([
            'reason'        => 'required|string|min:10',
            'refund_method' => 'required|in:cash,transfer',
        ]);

        $booking = $this->service->cancelByOutletWithRefund(
            $booking,
            $request->user(),
            $request->reason,
            $request->refund_method
        );

        return response()->json(['data' => $booking]);
    }
}