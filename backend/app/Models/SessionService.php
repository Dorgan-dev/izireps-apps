<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\DeviceStatus;
use App\Enums\SessionStatus;
use App\Enums\SessionType;
use App\Enums\TransactionStatus;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Device;
use App\Models\DeviceLog;
use App\Models\FnbItem;
use App\Models\PlaySession;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SessionService
{
    // ── Mulai sesi walk-in ────────────────────────────────────────────────────
    // @param array $data {
    //   session_type: 'per_jam'|'bebas'
    //   duration_minutes: int   (wajib jika per_jam, minimal 60)
    //   customer: { name?: string, phone?: string }
    //   fnb_items: [{ fnb_item_id: int, quantity: int }]
    // }
    public function startWalkIn(Device $device, User $cashier, array $data): PlaySession
    {
        return DB::transaction(function () use ($device, $cashier, $data) {
            $sessionType = SessionType::from($data['session_type'] ?? 'bebas');

            $customer = null;
            if (! empty($data['customer']['phone'])) {
                $customer = Customer::firstOrCreate(
                    ['phone' => $data['customer']['phone']],
                    ['name'  => $data['customer']['name'] ?? 'Walk-in']
                );
            }

            $plannedEndAt = null;
            if ($sessionType === SessionType::PerJam) {
                abort_unless(
                    ! empty($data['duration_minutes']) && $data['duration_minutes'] >= 60,
                    422, 'Mode per jam membutuhkan durasi minimal 60 menit.'
                );
                $plannedEndAt = now()->addMinutes((int) $data['duration_minutes']);
            }

            $session = PlaySession::create([
                'device_id'      => $device->id,
                'customer_id'    => $customer?->id,
                'cashier_id'     => $cashier->id,
                'started_at'     => now(),
                'session_type'   => $sessionType,
                'planned_end_at' => $plannedEndAt,
                'extend_count'   => 0,
                'status'         => SessionStatus::Active,
            ]);

            $transaction = Transaction::create([
                'session_id'     => $session->id,
                'cashier_id'     => $cashier->id,
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'status'         => TransactionStatus::Pending,
            ]);

            if (! empty($data['fnb_items'])) {
                $this->recordFnbItems($transaction, $data['fnb_items']);
            }

            $this->updateDeviceStatus($device, DeviceStatus::InUse, $cashier, 'Sesi walk-in dimulai');

            return $session->load(['device', 'customer', 'transaction.items']);
        });
    }

    // ── Mulai sesi dari booking (selalu per_jam) ──────────────────────────────
    public function startFromBooking(Booking $booking, User $cashier): PlaySession
    {
        return DB::transaction(function () use ($booking, $cashier) {
            $scheduledEnd = Carbon::parse(
                $booking->booking_date->format('Y-m-d') . ' ' . $booking->end_time
            );

            $session = PlaySession::create([
                'device_id'      => $booking->device_id,
                'customer_id'    => $booking->customer_id,
                'booking_id'     => $booking->id,
                'cashier_id'     => $cashier->id,
                'started_at'     => now(),
                'session_type'   => SessionType::PerJam,
                'planned_end_at' => $scheduledEnd,
                'extend_count'   => 0,
                'status'         => SessionStatus::Active,
            ]);

            Transaction::create([
                'session_id'     => $session->id,
                'cashier_id'     => $cashier->id,
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'dp_paid'        => $booking->dp_amount,
                'status'         => TransactionStatus::Pending,
            ]);

            $booking->update(['status' => BookingStatus::InUse]);
            $this->updateDeviceStatus(
                $booking->device, DeviceStatus::InUse, $cashier, 'Sesi booking dimulai'
            );

            return $session->load(['device', 'customer', 'booking', 'transaction']);
        });
    }

    // ── Tambah F&B ke sesi aktif / time_up ───────────────────────────────────
    public function addFnbItems(PlaySession $session, array $items): Transaction
    {
        abort_unless($session->status->isOpen(), 422, 'Sesi tidak dalam status aktif.');

        return DB::transaction(function () use ($session, $items) {
            $this->recordFnbItems($session->transaction, $items);
            return $session->transaction->fresh(['items']);
        });
    }

    // ── Extend sesi ───────────────────────────────────────────────────────────
    public function extend(PlaySession $session, int $additionalMinutes): PlaySession
    {
        abort_unless($session->status->isOpen(), 422, 'Hanya sesi aktif atau waktu habis yang bisa diperpanjang.');
        abort_unless($additionalMinutes % 15 === 0, 422, 'Penambahan waktu harus kelipatan 15 menit.');
        abort_unless(
            $additionalMinutes >= 15 && $additionalMinutes <= 180,
            422, 'Penambahan waktu antara 15-180 menit.'
        );

        $updates = [
            'extend_count' => $session->extend_count + 1,
            'status'       => SessionStatus::Active,
        ];

        if ($session->isPerJam()) {
            $base = $session->status === SessionStatus::TimeUp
                ? now()
                : ($session->planned_end_at ?? now());

            $updates['planned_end_at'] = Carbon::parse($base)->addMinutes($additionalMinutes);
        }

        $session->update($updates);

        return $session->fresh(['device', 'transaction']);
    }

    // ── Mark time_up — dipanggil scheduler saat planned_end_at tercapai ──────
    public function markTimeUp(PlaySession $session): void
    {
        abort_unless($session->status === SessionStatus::Active, 422, 'Sesi tidak aktif.');
        abort_unless($session->isPerJam(), 422, 'Hanya sesi per_jam yang bisa time_up.');

        $session->update(['status' => SessionStatus::TimeUp]);
        // TV dimatikan via STB dari command terpisah (STBService)
    }

    // ── Checkout ──────────────────────────────────────────────────────────────
    public function checkout(PlaySession $session, array $paymentData, User $cashier): Transaction
    {
        abort_unless($session->status->isOpen(), 422, 'Sesi tidak bisa di-checkout.');

        return DB::transaction(function () use ($session, $paymentData, $cashier) {
            $endedAt         = now();
            $durationMinutes = (int) Carbon::parse($session->started_at)->diffInMinutes($endedAt);
            $gamingCost      = $session->calculateGamingCost($durationMinutes);

            $session->update([
                'ended_at'         => $endedAt,
                'duration_minutes' => $durationMinutes,
                'gaming_cost'      => $gamingCost,
                'status'           => SessionStatus::Completed,
            ]);

            $transaction = $session->transaction;
            $fnbTotal    = $transaction->fnb_total;
            $grandTotal  = $gamingCost + $fnbTotal;
            $dpPaid      = $transaction->dp_paid;
            $remaining   = max(0, $grandTotal - $dpPaid);
            $amountPaid  = $paymentData['amount_paid'];
            $change      = max(0, $amountPaid - $remaining);

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

            if ($session->booking_id) {
                $session->booking->update(['status' => BookingStatus::Completed]);
            }

            $this->updateDeviceStatus(
                $session->device, DeviceStatus::Available, $cashier, 'Sesi selesai - checkout'
            );

            return $transaction->fresh(['items', 'session.device', 'session.customer']);
        });
    }

    // ── Helper: catat F&B + kurangi stok ─────────────────────────────────────
    private function recordFnbItems(Transaction $transaction, array $items): void
    {
        $fnbAdded = 0;

        foreach ($items as $item) {
            $fnbItem = FnbItem::findOrFail($item['fnb_item_id']);

            abort_unless($fnbItem->isInStock(), 422, "Stok {$fnbItem->name} habis.");
            abort_unless(
                $fnbItem->stock >= $item['quantity'],
                422, "Stok {$fnbItem->name} tidak cukup (tersisa {$fnbItem->stock})."
            );

            $subtotal = $fnbItem->price * $item['quantity'];

            TransactionItem::create([
                'transaction_id' => $transaction->id,
                'fnb_item_id'    => $fnbItem->id,
                'item_name'      => $fnbItem->name,
                'quantity'       => $item['quantity'],
                'unit_price'     => $fnbItem->price,
                'subtotal'       => $subtotal,
            ]);

            $fnbItem->decrement('stock', $item['quantity']);

            if ($fnbItem->stock <= 0) {
                $fnbItem->update(['is_available' => false]);
            }

            $fnbAdded += $subtotal;
        }

        $transaction->increment('fnb_total', $fnbAdded);
        $transaction->increment('grand_total', $fnbAdded);
    }

    // ── Helper: update status perangkat + catat log ───────────────────────────
    public function updateDeviceStatus(
        Device $device,
        DeviceStatus $newStatus,
        ?User $actor,
        string $note = ''
    ): void {
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
