<?php

// ============================================================
// DeviceController.php
// ============================================================

namespace App\Http\Controllers\Api;

use App\Enums\DeviceStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Device;
use App\Services\SessionService;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function __construct(protected SessionService $sessionService)
    {
    }

    /** Halaman publik: list perangkat + status */
    public function publicIndex()
    {
        $devices = Device::with('rates')->get()->map(fn($d) => [
            'id' => $d->id,
            'name' => $d->name,
            'ps_type' => $d->ps_type,
            'status' => $d->status->value,
            'status_label' => $d->status->label(),
            'status_color' => $d->status->color(),
            'rate' => $d->current_rate?->price_per_hour,
        ]);

        return response()->json(['data' => $devices]);
    }

    /** Jadwal booking perangkat (publik) */
    public function schedule(Device $device, Request $request)
    {
        $date = $request->input('date', today()->format('Y-m-d'));

        $bookings = Booking::where('device_id', $device->id)
            ->whereDate('booking_date', $date)
            ->whereIn('status', ['confirmed', 'in_use'])
            ->get(['start_time', 'end_time', 'status']);

        return response()->json(['data' => $bookings]);
    }

    public function index()
    {
        // return response()->json(['data' => Device::with(['rates', 'logs' => fn($q) => $q->latest()->limit(5)])->get()]);
        return response()->json([
            'data' => Device::with(['rates', 'latestLog'])->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'ps_type' => 'required|string',
            'ps_sn' => 'nullable|string',
            'tv' => 'nullable|string',
            'tv_sn' => 'nullable|string',
            'tv_ip_address' => 'nullable|ip',
            'tv_mac_address' => 'nullable|regex:/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/',
        ]);

        $device = Device::create($data);
        return response()->json(['data' => $device], 201);
    }

    public function show(Device $device)
    {
        return response()->json(['data' => $device->load(['rates', 'logs.actor'])]);
    }

    public function update(Request $request, Device $device)
    {
        $data = $request->validate([
            'name' => 'sometimes|string',
            'ps_type' => 'sometimes|string',
            'ps_sn' => 'nullable|string',
            'tv' => 'nullable|string',
            'tv_sn' => 'nullable|string',
            'tv_ip_address' => 'nullable|ip',
            'tv_mac_address' => 'nullable|regex:/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/',
        ]);

        $device->update($data);
        return response()->json(['data' => $device->fresh()]);
    }

    public function updateStatus(Request $request, Device $device)
    {
        $request->validate([
            'status' => 'required|in:available,maintenance',
            'note' => 'nullable|string',
        ]);

        // Hanya allow manual ubah ke available atau maintenance
        $this->sessionService->updateDeviceStatus(
            $device,
            DeviceStatus::from($request->status),
            $request->user(),
            $request->input('note', '')
        );

        return response()->json(['data' => $device->fresh()]);
    }

    public function logs(Device $device)
    {
        return response()->json([
            'data' => $device->logs()->with('actor:id,name')->latest('changed_at')->paginate(20)
        ]);
    }

    public function destroy(Device $device)
    {
        $device->delete();
        return response()->json(['data' => $device]);
    }
}