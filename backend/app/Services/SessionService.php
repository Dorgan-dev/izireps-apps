<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\DeviceStatus;
use App\Enums\SessionStatus;
use App\Enums\TransactionStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Device;
use App\Models\DeviceLog;
use App\Models\PlaySession;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SessionService
{
    /**
     * Mulai sesi walk-in (pelanggan datang langsung).
     */
    public function startWalkIn(Device $device, User $cashier, ?array $customerData = null): PlaySession
    {
        return DB::transaction(function () use ($device, $cashier, $customerData) {
            // Buat atau cari pelanggan jika data diisi
            $customer = null;
            if ($customerData && ! empty($customerData['phone'])) {
                $customer = Customer::firstOrCreate(
                    ['phone' => $customerData['phone']],
                    ['name'  => $customerData['name'] ?? 'Pelanggan Walk-in']
                );
            }

            // Buat sesi
            $session = PlaySession::create([
                'device_id'   => $device->id,
                'customer_id' => $customer?->id,
                'cashier_id'  => $cashier->id,
                'started_at'  => now(),
                'status'      => SessionStatus::Active,
            ]);

            // Buat transaksi pending
            Transaction::create([
                'session_id'     => $session->id,
                'cashier_id'     => $cashier->id,
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'status'         => TransactionStatus::Pending,
            ]);

            // Update status perangkat
            $this->updateDeviceStatus($device, DeviceStatus::InUse, $cashier, 'Sesi walk-in dimulai');

            return $session->load(['device', 'customer', 'transaction']);
        });
    }

    /**
     * Mulai sesi dari booking yang sudah dikonfirmasi.
     */
    public function startFromBooking(Booking $booking, User $cashier): PlaySession
    {
        return DB::transaction(function () use ($booking, $cashier) {
            // Hitung sisa waktu berdasarkan keterlambatan
            $scheduledStart = Carbon::parse(
                $booking->booking_date->format('Y-m-d') . ' ' . $booking->start_time
            );
            $scheduledEnd = Carbon::parse(
                $booking->booking_date->format('Y-m-d') . ' ' . $booking->end_time
            );

            // Sisa durasi = waktu berakhir - sekarang (dikurangi keterlambatan)
            $remainingMinutes = (int) now()->diffInMinutes($scheduledEnd, false);
            $remainingMinutes = max(0, $remainingMinutes);

            $session = PlaySession::create([
                'device_id'        => $booking->device_id,
                'customer_id'      => $booking->customer_id,
                'booking_id'       => $booking->id,
                'cashier_id'       => $cashier->id,
                'started_at'       => now(),
                'status'           => SessionStatus::Active,
            ]);

            // Transaksi sudah termasuk DP
            Transaction::create([
                'session_id'     => $session->id,
                'cashier_id'     => $cashier->id,
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'dp_paid'        => $booking->dp_amount,
                'status'         => TransactionStatus::Pending,
            ]);

            // Update status booking & perangkat
            $booking->update(['status' => BookingStatus::InUse]);
            $this->updateDeviceStatus($booking->device, DeviceStatus::InUse, $cashier, 'Sesi booking dimulai');

            return $session->load(['device', 'customer', 'booking', 'transaction']);
        });
    }

    /**
     * Tambah durasi bermain pada sesi aktif.
     */
    public function extendSession(PlaySession $session, int $additionalMinutes, User $cashier): PlaySession
    {
        abort_unless($session->isActive(), 422, 'Sesi tidak dalam status aktif.');

        // Simpan catatan extend (opsional: bisa dicatat di tabel terpisah untuk audit)
        $session->touch(); // update updated_at sebagai tanda ada aksi

        // Durasi extend disimpan di session agar kalkulasi akhir akurat
        // Caranya: saat checkout, ended_at - started_at = durasi real
        // Extend hanya menggeser "waktu berakhir yang diharapkan" di frontend
        // Data durasi aktual tetap dihitung dari waktu nyata saat ended

        return $session;
    }

    /**
     * Tambah item F&B ke transaksi sesi aktif.
     */
    public function addFnbItems(PlaySession $session, array $items, User $cashier): Transaction
    {
        abort_unless($session->isActive(), 422, 'Sesi tidak dalam status aktif.');

        return DB::transaction(function () use ($session, $items) {
            $transaction = $session->transaction;
            $fnbTotal    = 0;

            foreach ($items as $item) {
                $fnbItem = \App\Models\FnbItem::findOrFail($item['fnb_item_id']);

                abort_unless($fnbItem->isInStock(), 422, "Stok {$fnbItem->name} habis.");

                $subtotal = $fnbItem->price * $item['quantity'];

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'fnb_item_id'    => $fnbItem->id,
                    'item_name'      => $fnbItem->name,     // snapshot nama
                    'quantity'       => $item['quantity'],
                    'unit_price'     => $fnbItem->price,    // snapshot harga
                    'subtotal'       => $subtotal,
                ]);

                // Kurangi stok
                $fnbItem->decrement('stock', $item['quantity']);
                if ($fnbItem->stock <= 0) {
                    $fnbItem->update(['is_available' => false]);
                }

                $fnbTotal += $subtotal;
            }

            // Recalculate fnb_total di transaksi
            $transaction->increment('fnb_total', $fnbTotal);
            $transaction->increment('grand_total', $fnbTotal);
            $transaction->decrement('remaining_amount', min($fnbTotal, $transaction->dp_paid));

            return $transaction->fresh(['items']);
        });
    }

    /**
     * Akhiri sesi dan proses checkout.
     */
    public function checkout(PlaySession $session, array $paymentData, User $cashier): Transaction
    {
        abort_unless($session->isActive(), 422, 'Sesi tidak dalam status aktif.');

        return DB::transaction(function () use ($session, $paymentData, $cashier) {
            $endedAt         = now();
            $durationMinutes = (int) $session->started_at->diffInMinutes($endedAt);

            // Hitung biaya gaming berdasarkan tarif aktif
            $rate        = $session->device->current_rate;
            $gamingCost  = $rate
                ? round(($durationMinutes / 60) * $rate->price_per_hour, 2)
                : 0;

            // Update sesi
            $session->update([
                'ended_at'         => $endedAt,
                'duration_minutes' => $durationMinutes,
                'gaming_cost'      => $gamingCost,
                'status'           => SessionStatus::Completed,
            ]);

            // Hitung total transaksi
            $transaction    = $session->transaction;
            $fnbTotal       = $transaction->fnb_total;
            $grandTotal     = $gamingCost + $fnbTotal;
            $dpPaid         = $transaction->dp_paid;
            $remaining      = max(0, $grandTotal - $dpPaid);
            $amountPaid     = $paymentData['amount_paid'];
            $change         = max(0, $amountPaid - $remaining);

            $transaction->update([
                'cashier_id'       => $cashier->id,
                'gaming_total'     => $gamingCost,
                'grand_total'      => $grandTotal,
                'remaining_amount' => $remaining,
                'amount_paid'      => $amountPaid,
                'change_amount'    => $change,
                'payment_method'   => $paymentData['payment_method'],
                'status'           => TransactionStatus::Paid,
                'paid_at'          => now(),
            ]);

            // Update booking jika dari booking
            if ($session->booking_id) {
                $session->booking->update(['status' => BookingStatus::Completed]);
            }

            // Update status perangkat kembali ke tersedia
            $this->updateDeviceStatus(
                $session->device,
                DeviceStatus::Available,
                $cashier,
                'Sesi selesai - checkout'
            );

            return $transaction->fresh(['items', 'session.device', 'session.customer', 'cashier']);
        });
    }

    /**
     * Helper: update status perangkat dan catat log.
     */
    public function updateDeviceStatus(Device $device, DeviceStatus $newStatus, ?User $actor, string $note = ''): void
    {
        $oldStatus = $device->status;

        $device->update(['status' => $newStatus]);

        DeviceLog::create([
            'device_id'   => $device->id,
            'actor_id'    => $actor?->id,
            'from_status' => $oldStatus,
            'to_status'   => $newStatus,
            'note'        => $note,
            'changed_at'  => now(),
        ]);
    }
}
