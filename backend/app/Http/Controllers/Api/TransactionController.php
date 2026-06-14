<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * GET /api/transactions
     * Semua role — daftar transaksi
     *   - Owner: semua transaksi
     *   - Kasir: hanya transaksi miliknya sendiri
     *
     * Query params:
     *   ?date=YYYY-MM-DD   => filter tanggal tertentu
     *   ?from=YYYY-MM-DD   => dari tanggal
     *   ?to=YYYY-MM-DD     => sampai tanggal
     *   ?status=paid|unpaid
     *   ?per_page=         => jumlah per halaman (default 20)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $transactions = Transaction::with([
            'session.device:id,name,ps_type',
            'session.customer:id,name,phone',
            'session.cashier:id,name',
            'cashier:id,name',
        ])
            ->when(
                $user->role === 'cashier',
                fn($q) => $q->where('cashier_id', $user->id)
            )
            ->when(
                $request->filled('date'),
                fn($q) => $q->whereDate('paid_at', $request->date)
            )
            ->when(
                $request->filled('from'),
                fn($q) => $q->whereDate('paid_at', '>=', $request->from)
            )
            ->when(
                $request->filled('to'),
                fn($q) => $q->whereDate('paid_at', '<=', $request->to)
            )
            ->when(
                $request->filled('status'),
                fn($q) => $q->where('status', $request->status)
            )
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($transactions);
    }

    /**
     * GET /api/transactions/{transaction}
     * Semua role — detail transaksi beserta semua relasinya
     */
    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load([
            'session.device:id,name,ps_type',
            'session.customer:id,name,phone',
            'cashier:id,name',
            'items',
        ]);

        return response()->json([
            'data' => $transaction,
        ]);
    }

    /**
     * GET /api/transactions/{transaction}/receipt
     * Semua role — data lengkap untuk cetak struk / kwitansi
     */
    public function receipt(Transaction $transaction): JsonResponse
    {
        $transaction->load([
            'session.device',
            'session.customer',
            'session.booking',
            'cashier:id,name',
            'items',
        ]);

        $session = $transaction->session;

        return response()->json([
            'data' => [
                // Header struk
                'invoice_number' => $transaction->invoice_number,
                'paid_at' => $transaction->paid_at,

                // Perangkat & sesi
                'device_name' => $session->device?->name ?? '-',
                'ps_type' => $session->device?->ps_type ?? '-',
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
                'duration_minutes' => $session->duration_minutes,

                // Pelanggan
                'customer_name' => $session->customer?->name ?? 'Umum',
                'customer_phone' => $session->customer?->phone ?? '-',

                // Kasir
                'cashier_name' => $transaction->cashier?->name ?? '-',

                // Item FnB
                'fnb_items' => $transaction->items->map(fn($i) => [
                    'name' => $i->item_name,
                    'quantity' => $i->quantity,
                    'unit_price' => $i->unit_price,
                    'subtotal' => $i->subtotal,
                ]),

                // Rincian biaya
                'gaming_total' => $transaction->gaming_total,
                'fnb_total' => $transaction->fnb_total,
                'grand_total' => $transaction->grand_total,
                'dp_paid' => $transaction->dp_paid,
                'remaining_amount' => $transaction->remaining_amount,
                'amount_paid' => $transaction->amount_paid,
                'change_amount' => $transaction->change_amount,
                'payment_method' => $transaction->payment_method,
            ],
        ]);
    }
}
