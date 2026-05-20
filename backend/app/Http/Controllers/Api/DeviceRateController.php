<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Device\StoreDeviceRateRequest;
use App\Http\Requests\Device\UpdateDeviceRateRequest;
use App\Models\Device;
use App\Models\DeviceRate;
use Illuminate\Http\JsonResponse;

class DeviceRateController extends Controller
{
    // ── GET /api/devices/{device}/rates ───────────────────────────────────────
    // List semua tarif untuk perangkat tertentu (aktif dan nonaktif)
    public function index(Device $device): JsonResponse
    {
        $rates = $device->rates()
            ->orderByRaw('effective_from IS NULL DESC') // tarif default (seharian) di atas
            ->orderBy('effective_from')
            ->get();

        return response()->json(['data' => $rates]);
    }

    // ── POST /api/devices/{device}/rates ──────────────────────────────────────
    // Tambah tarif baru untuk perangkat
    // Jika effective_from & effective_until null: tarif default berlaku seharian
    // Jika diisi: tarif berlaku pada rentang jam tersebut (misal tarif malam)
    // Validasi: tidak boleh overlap dengan tarif jam lain yang sudah ada
    public function store(StoreDeviceRateRequest $request, Device $device): JsonResponse
    {
        // Cek overlap jika ini tarif jam-tertentu (bukan tarif default)
        if ($request->filled('effective_from')) {
            $this->ensureNoOverlap(
                $device,
                $request->effective_from,
                $request->effective_until
            );
        }

        $rate = $device->rates()->create([
            'price_per_hour'  => $request->price_per_hour,
            'effective_from'  => $request->effective_from,
            'effective_until' => $request->effective_until,
            'is_active'       => true,
        ]);

        return response()->json(['data' => $rate], 201);
    }

    // ── PUT /api/rates/{rate} ─────────────────────────────────────────────────
    // Update tarif: harga, rentang jam, atau status aktif
    // Menggunakan shallow route (/api/rates/{rate}) karena rate punya device_id sendiri
    public function update(UpdateDeviceRateRequest $request, DeviceRate $rate): JsonResponse
    {
        // Cek overlap jika rentang jam diubah
        if ($request->filled('effective_from')) {
            $this->ensureNoOverlap(
                $rate->device,
                $request->effective_from,
                $request->effective_until,
                excludeId: $rate->id
            );
        }

        $rate->update($request->only([
            'price_per_hour',
            'effective_from',
            'effective_until',
            'is_active',
        ]));

        return response()->json(['data' => $rate->fresh()]);
    }

    // ── DELETE /api/rates/{rate} ──────────────────────────────────────────────
    // Hapus tarif
    // Tarif yang sedang digunakan sesi aktif tidak bisa dihapus
    // (sesi aktif sudah mengunci tarif di saat mulai, jadi hapus aman)
    public function destroy(DeviceRate $rate): JsonResponse
    {
        // Pastikan minimal ada 1 tarif aktif tersisa setelah hapus
        $activeCount = $rate->device->rates()->where('is_active', true)->count();

        abort_if(
            $activeCount <= 1 && $rate->is_active,
            422,
            'Tidak dapat menghapus tarif terakhir yang aktif. Perangkat harus memiliki minimal satu tarif aktif.'
        );

        $rate->delete();

        return response()->json(['message' => 'Tarif berhasil dihapus.']);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    // Pastikan rentang jam tidak tumpang tindih dengan tarif lain di perangkat yang sama
    private function ensureNoOverlap(
        Device $device,
        string $from,
        string $until,
        ?int $excludeId = null
    ): void {
        $conflict = $device->rates()
            ->where('is_active', true)
            ->whereNotNull('effective_from') // lewati tarif default
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where(fn ($q) =>
                // Overlap terjadi jika rentang baru dan existing saling berpotongan
                $q->where(fn ($q) =>
                    $q->where('effective_from', '<', $until)
                      ->where('effective_until', '>', $from)
                )
            )
            ->exists();

        abort_if(
            $conflict,
            422,
            "Rentang jam {$from}–{$until} tumpang tindih dengan tarif lain yang sudah ada."
        );
    }
}
