<?php

// ============================================================
// SessionController.php
// ============================================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Models\PlaySession;
use App\Services\SessionService;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function __construct(protected SessionService $service) {}

    public function index(Request $request)
    {
        $sessions = PlaySession::with(['device', 'customer', 'cashier', 'transaction'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest('started_at')
            ->paginate(20);

        return response()->json($sessions);
    }

    public function show(PlaySession $session)
    {
        return response()->json([
            'data' => $session->load(['device', 'customer', 'cashier', 'transaction.items', 'booking']),
        ]);
    }

    public function startWalkIn(Request $request)
    {
        $request->validate([
            'device_id'       => 'required|exists:devices,id',
            'customer.name'   => 'nullable|string',
            'customer.phone'  => 'nullable|string',
        ]);

        $device  = Device::findOrFail($request->device_id);

        abort_unless($device->isAvailable(), 422, 'Perangkat tidak tersedia.');

        $session = $this->service->startWalkIn(
            $device,
            $request->user(),
            $request->input('customer')
        );

        return response()->json(['data' => $session], 201);
    }

    public function startFromBooking(Request $request, PlaySession $session)
    {
        // Endpoint ini menerima booking_id, bukan session_id
        $request->validate(['booking_id' => 'required|exists:bookings,id']);
        $booking = Booking::findOrFail($request->booking_id);

        abort_unless($booking->isConfirmed(), 422, 'Booking belum dikonfirmasi.');

        $session = $this->service->startFromBooking($booking, $request->user());

        return response()->json(['data' => $session], 201);
    }

    public function addFnb(Request $request, PlaySession $session)
    {
        $request->validate([
            'items'                => 'required|array|min:1',
            'items.*.fnb_item_id'  => 'required|exists:fnb_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        $transaction = $this->service->addFnbItems($session, $request->items, $request->user());

        return response()->json(['data' => $transaction]);
    }

    public function checkout(Request $request, PlaySession $session)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,qris,transfer',
            'amount_paid'    => 'required|numeric|min:0',
        ]);

        $transaction = $this->service->checkout($session, $request->only('payment_method', 'amount_paid'), $request->user());

        return response()->json(['data' => $transaction]);
    }
}
