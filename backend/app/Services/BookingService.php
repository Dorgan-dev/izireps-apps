<?php

namespace App\Services;

use App\Enums\BookingCancelledBy;
use App\Enums\BookingStatus;
use App\Enums\DeviceStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Device;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BookingService
{
    public function __construct(protected SessionService $sessionService) {}

    /**
     * Buat booking baru oleh pelanggan online.
     * Slot langsung diblokir, expires_at = 1 jam dari sekarang.
     */
    public function create(array $data, string $dpProofPath): Booking
    {
        return DB::transaction(function () use ($data, $dpProofPath) {
            $device   = Device::findOrFail($data['device_id']);
            $customer = Customer::findOrFail($data['customer_id']);

            // Cek tidak ada booking aktif yang overlap
            $this->ensureNoConflict($device, $data['booking_date'], $data['start_time'], $data['end_time']);

            $durationMinutes = Carbon::parse($data['start_time'])
                ->diffInMinutes(Carbon::parse($data['end_time']));

            // Hitung estimasi biaya & DP
            $rate          = $device->current_rate;
            $estimatedCost = $rate
                ? round(($durationMinutes / 60) * $rate->price_per_hour, 2)
                : 0;
            $dpAmount = round($estimatedCost / 2, 2); // 50%

            $booking = Booking::create([
                'device_id'        => $device->id,
                'customer_id'      => $customer->id,
                'booking_date'     => $data['booking_date'],
                'start_time'       => $data['start_time'],
                'end_time'         => $data['end_time'],
                'duration_minutes' => $durationMinutes,
                'estimated_cost'   => $estimatedCost,
                'dp_amount'        => $dpAmount,
                'dp_proof_file'    => $dpProofPath,
                'status'           => BookingStatus::Pending,
                'expires_at'       => now()->addHour(), // kasir punya 1 jam verifikasi
            ]);

            // Blokir slot perangkat
            $this->sessionService->updateDeviceStatus(
                $device,
                DeviceStatus::Booked,
                null,
                "Booking #{$booking->id} dibuat oleh pelanggan"
            );

            return $booking->load(['device', 'customer']);
        });
    }

    /**
     * Kasir konfirmasi booking (DP terverifikasi).
     */
    public function confirm(Booking $booking, User $cashier): Booking
    {
        abort_unless($booking->isPending(), 422, 'Booking tidak dalam status menunggu verifikasi.');

        $booking->update([
            'status'      => BookingStatus::Confirmed,
            'verified_by' => $cashier->id,
            'verified_at' => now(),
        ]);

        return $booking->fresh(['device', 'customer', 'verifiedBy']);
    }

    /**
     * Kasir tolak booking (DP tidak terverifikasi).
     */
    public function reject(Booking $booking, User $cashier, string $reason): Booking
    {
        abort_unless($booking->isPending(), 422, 'Booking tidak dalam status menunggu verifikasi.');

        return DB::transaction(function () use ($booking, $cashier, $reason) {
            $booking->update([
                'status'        => BookingStatus::Rejected,
                'verified_by'   => $cashier->id,
                'verified_at'   => now(),
                'cancel_reason' => $reason,
                'cancelled_by'  => BookingCancelledBy::Outlet,
            ]);

            // Bebaskan slot perangkat
            $this->sessionService->updateDeviceStatus(
                $booking->device,
                DeviceStatus::Available,
                $cashier,
                "Booking #{$booking->id} ditolak: {$reason}"
            );

            return $booking->fresh();
        });
    }

    /**
     * Pelanggan batalkan booking (maks 15 menit sebelum jam main).
     */
    public function cancelByCustomer(Booking $booking): Booking
    {
        abort_unless($booking->isCancellableByCustomer(), 422,
            'Booking tidak dapat dibatalkan. Pembatalan hanya bisa dilakukan minimal 15 menit sebelum jam bermain.');

        return DB::transaction(function () use ($booking) {
            $booking->update([
                'status'        => BookingStatus::Cancelled,
                'cancelled_by'  => BookingCancelledBy::Customer,
                'cancel_reason' => 'Dibatalkan oleh pelanggan',
            ]);

            $this->sessionService->updateDeviceStatus(
                $booking->device,
                DeviceStatus::Available,
                null,
                "Booking #{$booking->id} dibatalkan oleh pelanggan"
            );

            // DP tidak dikembalikan (sesuai kebijakan)
            return $booking->fresh();
        });
    }

    /**
     * Sistem batalkan otomatis (no-show setelah grace period 15+5 menit).
     */
    public function cancelBySystem(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->update([
                'status'        => BookingStatus::Cancelled,
                'cancelled_by'  => BookingCancelledBy::System,
                'cancel_reason' => 'Dibatalkan otomatis - pelanggan tidak hadir',
            ]);

            $this->sessionService->updateDeviceStatus(
                $booking->device,
                DeviceStatus::Available,
                null,
                "Booking #{$booking->id} dibatalkan sistem (no-show)"
            );

            return $booking->fresh();
        });
    }

    /**
     * Sistem expire booking yang tidak diverifikasi kasir dalam 1 jam.
     */
    public function expireUnverified(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->update([
                'status'        => BookingStatus::Expired,
                'cancelled_by'  => BookingCancelledBy::System,
                'cancel_reason' => 'Kedaluwarsa - tidak diverifikasi dalam 1 jam',
            ]);

            $this->sessionService->updateDeviceStatus(
                $booking->device,
                DeviceStatus::Available,
                null,
                "Booking #{$booking->id} expired - tidak diverifikasi"
            );

            return $booking->fresh();
        });
    }

    /**
     * Kasir batalkan booking karena perangkat rusak tanpa pengganti,
     * dan proses refund DP.
     */
    public function cancelByOutletWithRefund(
        Booking $booking,
        User $cashier,
        string $reason,
        string $refundMethod
    ): Booking {
        return DB::transaction(function () use ($booking, $cashier, $reason, $refundMethod) {
            $booking->update([
                'status'        => BookingStatus::Cancelled,
                'cancelled_by'  => BookingCancelledBy::Outlet,
                'cancel_reason' => $reason,
                'verified_by'   => $cashier->id,
            ]);

            // Buat record refund
            \App\Models\Refund::create([
                'booking_id'    => $booking->id,
                'processed_by'  => $cashier->id,
                'refund_amount' => $booking->dp_amount, // kembalikan seluruh DP yang diterima outlet
                'reason'        => $reason,
                'refund_method' => $refundMethod,
                'processed_at'  => now(),
            ]);

            $this->sessionService->updateDeviceStatus(
                $booking->device,
                DeviceStatus::Available,
                $cashier,
                "Booking #{$booking->id} dibatalkan outlet: {$reason}"
            );

            return $booking->fresh(['refund']);
        });
    }

    /**
     * Pindah perangkat pada booking aktif (karena perangkat rusak, ada pengganti).
     */
    public function changeDevice(Booking $booking, Device $newDevice, User $cashier): Booking
    {
        abort_unless($booking->isConfirmed(), 422, 'Hanya booking yang sudah dikonfirmasi yang bisa dipindah perangkatnya.');
        abort_unless($newDevice->isAvailable(), 422, 'Perangkat pengganti tidak tersedia.');

        return DB::transaction(function () use ($booking, $newDevice, $cashier) {
            $oldDevice = $booking->device;

            // Bebaskan perangkat lama
            $this->sessionService->updateDeviceStatus(
                $oldDevice,
                DeviceStatus::Available,
                $cashier,
                "Booking #{$booking->id} dipindah ke perangkat #{$newDevice->id}"
            );

            // Blokir perangkat baru
            $this->sessionService->updateDeviceStatus(
                $newDevice,
                DeviceStatus::Booked,
                $cashier,
                "Pengganti untuk booking #{$booking->id}"
            );

            $booking->update(['device_id' => $newDevice->id]);

            return $booking->fresh(['device', 'customer']);
        });
    }

    /**
     * Cek tidak ada booking yang overlap di perangkat yang sama.
     */
    private function ensureNoConflict(Device $device, string $date, string $startTime, string $endTime): void
    {
        $conflict = Booking::where('device_id', $device->id)
            ->whereDate('booking_date', $date)
            ->whereIn('status', [BookingStatus::Pending, BookingStatus::Confirmed, BookingStatus::InUse])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            })
            ->exists();

        abort_if($conflict, 422, 'Perangkat sudah dibooking pada waktu yang dipilih.');
    }
}
