<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Services\TvBridgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TvRemoteController extends Controller
{
    public function __construct(protected TvBridgeService $tvBridge) {}

    public function sendKey(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
            'key' => 'required|string'
        ]);

        $device = Device::findOrFail($request->device_id);
        $user = $request->user();

        // 1. Validasi keberadaan data TV di device
        if (!$device->tv_mac_address || !$device->tv) {
            return response()->json(['message' => 'Perangkat ini belum dikonfigurasi untuk TV.'], 400);
        }

        // 2. Guard untuk Kasir
        if ($user->role->value === 'cashier') {
            // Blokir command POWER
            if (in_array(strtoupper($request->key), ['KEY_POWER', 'KEY_POWEROFF', 'KEY_POWERON'])) {
                return response()->json(['message' => 'Kasir tidak diizinkan mengubah daya TV secara manual.'], 403);
            }

            // Pastikan device sedang digunakan (ada sesi aktif)
            // Kasir hanya boleh mengontrol TV yang ada pelanggannya
            if ($device->status !== \App\Enums\DeviceStatus::InUse) {
                return response()->json(['message' => 'Remote TV hanya bisa digunakan saat ada sesi aktif di unit ini.'], 403);
            }
        }

        // 3. Eksekusi Command
        $result = $this->tvBridge->sendKey($device->tv_mac_address, $device->tv, $request->key);

        if ($result['ok']) {
            return response()->json(['message' => 'Command sent successfully.']);
        }

        return response()->json([
            'message' => 'Failed to send command to TV.',
            'debug'   => $result['error'] ?? null,
        ], 500);
    }

    public function power(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
            'action' => 'required|in:ON,OFF'
        ]);

        $device = Device::findOrFail($request->device_id);
        $user = $request->user();

        // Hanya Owner yang boleh mengakses route manual power ini
        if ($user->role->value !== 'owner') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        if (!$device->tv_mac_address || !$device->tv) {
            return response()->json(['message' => 'Perangkat ini belum dikonfigurasi untuk TV.'], 400);
        }

        $result = $this->tvBridge->power($device->tv_mac_address, $device->tv, $request->action);

        if ($result['ok']) {
            return response()->json(['message' => "TV Power {$request->action} command sent."]);
        }

        return response()->json([
            'message' => 'Failed to send power command.',
            'debug'   => $result['error'] ?? null,
        ], 500);
    }

    public function status(Device $device)
    {
        if (!$device->tv_mac_address || !$device->tv) {
            return response()->json(['online' => false]);
        }

        $status = $this->tvBridge->getStatus($device->tv_mac_address, $device->tv);
        return response()->json($status);
    }
}
