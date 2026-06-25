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

class BookingService
{
    public function __construct(protected SessionService $sessionService)
    {
    }

    /**
     * Buat booking baru oleh pelanggan online.
     * Slot langsung diblokir, expires_at = 1 jam dari sekarang.
     */
    public function create(array $data, string $dpProofPath): Booking
    {
        return DB::transaction(function () use ($data, $dpProofPath) {
            $timeType = $data['time_type'] ?? 'per_hour';
            $isPerHour = $timeType === 'per_hour';

            $device = Device::findOrFail($data['device_id']);
            $customer = Customer::findOrFail($data['customer_id']);

            // Inisialisasi nilai default untuk tipe free_play
            $durationMinutes = null;
            $estimatedCost = null;
            $dpAmount = 20000; // Nominal DP flat untuk free_play (sesuaikan aturan bisnis)
            $endTime = null;

            if ($isPerHour) {
                // 1. Cek konflik dengan booking lain (per_hour)
                $this->checkConflict($device, $data['booking_date'], $data['start_time'], $data['end_time']);

                // 2. Hitung durasi (Aman karena end_time pasti ada)
                $durationMinutes = Carbon::parse($data['start_time'])
                    ->diffInMinutes(Carbon::parse($data['end_time']));

                // 3. Hitung estimasi biaya & DP (50%)
                $rate = $device->current_rate;
                $estimatedCost = $rate
                    ? round(($durationMinutes / 60) * $rate->price_per_hour, 2)
                    : 0;

                $dpAmount = round($estimatedCost / 2, 2);
                $endTime = $data['end_time'];
            } else {
                // Untuk free_play: cek apakah ada booking aktif di perangkat ini
                $this->checkConflict($device, $data['booking_date'], $data['start_time'], null);

                $rate = $device->current_rate;
                $dpAmount = $rate ? $rate->price_per_hour : 0;
            }

            // Simpan data ke database
            $booking = Booking::create([
                'device_id' => $device->id,
                'customer_id' => $customer->id,
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => !$isPerHour ? null : $endTime,
                'duration_minutes' => !$isPerHour ? null : $durationMinutes,
                'estimated_cost' => !$isPerHour ? null : $estimatedCost,
                'dp_amount' => $dpAmount,
                'dp_proof_file' => $dpProofPath,
                'time_type' => $timeType,
                'status' => BookingStatus::Pending,
                'expires_at' => now()->addMinutes(config('booking.verification_timeout_minutes')),
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
            'status' => BookingStatus::Confirmed,
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
                'status' => BookingStatus::Rejected,
                'verified_by' => $cashier->id,
                'verified_at' => now(),
                'cancel_reason' => $reason,
                'cancelled_by' => BookingCancelledBy::Outlet,
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
        abort_unless(
            $booking->isCancellableByCustomer(),
            422,
            'Booking tidak dapat dibatalkan. Pembatalan hanya bisa dilakukan minimal 15 menit sebelum jam bermain.'
        );

        return DB::transaction(function () use ($booking) {
            $booking->update([
                'status' => BookingStatus::Cancelled,
                'cancelled_by' => BookingCancelledBy::Customer,
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
                'status' => BookingStatus::Cancelled,
                'cancelled_by' => BookingCancelledBy::System,
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
                'status' => BookingStatus::Expired,
                'cancelled_by' => BookingCancelledBy::System,
                'cancel_reason' => 'Kedaluwarsa - tidak diverifikasi dalam 15 menit',
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
                'status' => BookingStatus::Cancelled,
                'cancelled_by' => BookingCancelledBy::Outlet,
                'cancel_reason' => $reason,
                'verified_by' => $cashier->id,
            ]);

            // Buat record refund
            \App\Models\Refund::create([
                'booking_id' => $booking->id,
                'processed_by' => $cashier->id,
                'refund_amount' => $booking->dp_amount, // kembalikan seluruh DP yang diterima outlet
                'reason' => $reason,
                'refund_method' => $refundMethod,
                'processed_at' => now(),
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
     *
     * Aturan:
     * - $endTime = null berarti booking baru bertipe free_play (open-ended).
     * - Booking lama dengan end_time = null (free_play) selalu memblokir booking baru
     *   yang dimulai setelah atau bersamaan dengan start_time-nya.
     * - Buffer 5 menit ditambahkan ke end_time booking yang ada (jika bukan NULL).
     */
    public function checkConflict(Device $device, string $date, string $startTime, ?string $endTime): void
    {
        $messages = "";
        $query = Booking::where('device_id', $device->id)
            ->whereDate('booking_date', $date)
            ->whereIn('status', [BookingStatus::Pending, BookingStatus::Confirmed, BookingStatus::InUse]);

        if ($endTime === null) {
            // Booking baru bertipe free_play (open-ended):
            // Konflik jika ada booking aktif yang WAKTU AKTIFNYA masih bertumpuk dengan start_time baru.
            // - Existing free_play (end_time NULL): masih berjalan → selalu blokir
            // - Existing per_hour: blokir jika end_time + 5mnt > start_new (belum selesai saat kita mulai)
            $query->where(function ($q) use ($startTime) {
                $q->whereNull('end_time')  // free_play lain yang masih aktif
                    ->orWhereRaw("ADDTIME(end_time, '00:05:00') > ?", [$startTime]); // per_hour yang belum selesai
            });
        } else {
            // Booking baru bertipe per_hour:
            // Overlap jika: start_existing < end_new DAN (end_existing + 5mnt > start_new ATAU end_existing IS NULL)
            $query->where('start_time', '<', $endTime)
                ->where(function ($q) use ($startTime) {
                    $q->whereNull('end_time')  // free_play yang ada: selalu overlap
                        ->orWhereRaw("ADDTIME(end_time, '00:05:00') > ?", [$startTime]);
                });
        }

        $conflictingBooking = $query->first();

        if ($conflictingBooking) {
            $formattedEndTime = $conflictingBooking->end_time 
                ? Carbon::parse($conflictingBooking->end_time)->addMinutes(5)->format('H:i') 
                : null;

            if ($endTime === null) {
                // Booking baru bertipe free_play (open-ended):
                if ($conflictingBooking->time_type === 'free_play' || $conflictingBooking->end_time === null) {
                    $messages = "Perangkat sudah digunakan dalam sesi Bebas (Free Play). Pilih perangkat lain yang tersedia!";
                } else {
                    $messages = "Perangkat sudah dibooking pada jam tersebut (aktif sampai jam {$formattedEndTime} termasuk jeda). Pilih waktu atau perangkat lain!";
                }
            } else {
                // Booking baru bertipe per_hour:
                if ($conflictingBooking->time_type === 'free_play' || $conflictingBooking->end_time === null) {
                    $messages = "Perangkat ini digunakan dalam sesi Bebas dari jam {$conflictingBooking->start_time}. Ubah jam bermain atau pilih perangkat lain!";
                } else {
                    $messages = "Perangkat sudah dibooking pada jam yang dipilih ({$formattedEndTime}). Pilih waktu lain!";
                }
            }

            abort(422, $messages);
        }
    }
}
