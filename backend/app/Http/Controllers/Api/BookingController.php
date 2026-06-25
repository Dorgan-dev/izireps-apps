<?php

// namespace App\Http\Controllers;
// ============================================================
// BookingController.php
// ============================================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Models\Setting;
use App\Services\BookingService;
use App\Services\QrisService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $service,
        protected QrisService $qrisService,
    ) {
    }

    public function index(Request $request)
    {
        $bookings = Booking::with(['device', 'customer', 'verifiedBy'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date, fn($q, $d) => $q->whereDate('booking_date', $d))
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }

    /**
     * POST /public/bookings/calculate
     * Hitung estimasi biaya & DP, lalu generate QRIS string dengan nominal.
     * Tidak menyimpan apa pun ke database.
     */
    public function calculate(Request $request)
    {
        $data = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'time_type' => 'required|in:per_hour,free_play',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required_if:time_type,per_hour|nullable|date_format:H:i',
        ]);

        $device = Device::findOrFail($data['device_id']);
        $rate = $device->current_rate;
        $timeType = $data['time_type'];

        if ($timeType === 'per_hour') {
            // Cek konflik lebih awal saat user menekan "Bayar"
            $this->service->checkConflict($device, $data['booking_date'], $data['start_time'], $data['end_time']);

            $durationMinutes = Carbon::parse($data['start_time'])
                ->diffInMinutes(Carbon::parse($data['end_time']));
            $estimatedCost = $rate
                ? round(($durationMinutes / 60) * $rate->price_per_hour, 2)
                : 0;
            $dpAmount = round($estimatedCost / 2, 2);
        } else {
            // free_play: juga cek konflik sebelum tampilkan QRIS
            $this->service->checkConflict($device, $data['booking_date'], $data['start_time'], null);

            // DP = 1 jam tarif
            $estimatedCost = null;
            $dpAmount = $rate ? (float) $rate->price_per_hour : 0;
        }

        // Generate QRIS dengan nominal DP
        $baseQris = Setting::get('qris_string');
        $qrisString = null;

        if ($baseQris) {
            $qrisString = $this->qrisService->generateWithAmount($baseQris, $dpAmount);
        }

        return response()->json([
            'data' => [
                'estimated_cost' => $estimatedCost,
                'dp_amount' => $dpAmount,
                'qris_string' => $qrisString,
                'qris_available' => !is_null($qrisString),
            ],
        ]);
    }

    /**
     * POST /public/bookings
     * Buat booking dengan bukti bayar DP.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'customer_id' => 'required|exists:customers,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'time_type' => 'required|in:per_hour,free_play',
            'end_time' => 'required_if:time_type,per_hour|nullable|date_format:H:i',
            'dp_proof' => 'required|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('dp_proof')->store('dp-proofs', 'private');
        $booking = $this->service->create($data, $path);

        return response()->json(['data' => $booking], 201);
    }

    public function showPublic(Booking $booking)
    {
        // Tampilkan tanpa data sensitif
        return response()->json([
            'data' => $booking->only([
                'id',
                'booking_date',
                'start_time',
                'end_time',
                'status',
            ])
        ]);
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
        $booking = $this->service->changeDevice($booking, $newDevice, $request->user());
        return response()->json(['data' => $booking]);
    }

    public function refund(Request $request, Booking $booking)
    {
        $request->validate([
            'reason' => 'required|string|min:10',
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

    public function dpproof(Booking $booking)
    {
        $path = storage_path(
            'app/private/' . $booking->dp_proof_file
        );

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}