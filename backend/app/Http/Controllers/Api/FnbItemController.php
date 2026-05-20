<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFnbItemRequest;
use App\Http\Requests\UpdateFnbItemRequest;
use App\Models\FnbItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FnbItemController extends Controller
{
    /**
     * GET /api/fnb-items
     * Semua role — daftar item FnB
     *
     * Query params:
     *   ?category_id= => filter berdasar kategori
     *   ?search=      => cari nama item
     *   ?all=1        => tampilkan semua termasuk tidak tersedia
     */
    public function index(Request $request): JsonResponse
    {
        $items = FnbItem::with('category')
            ->when($request->filled('category_id'),
                fn ($q) => $q->where('category_id', $request->integer('category_id'))
            )
            ->when($request->filled('search'),
                fn ($q) => $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->when(
                ! $request->boolean('all'),
                fn ($q) => $q->where('is_available', true)
            )
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    /**
     * POST /api/fnb-items
     * Kasir — tambah item FnB baru
     */
    public function store(StoreFnbItemRequest $request): JsonResponse
    {
        $item = FnbItem::create([
            ...$request->validated(),
            'is_available' => $request->boolean('is_available', true),
        ]);

        return response()->json([
            'message' => 'Item berhasil ditambahkan.',
            'data'    => $item->load('category'),
        ], 201);
    }

    /**
     * GET /api/fnb-items/{item}
     * Semua role — detail item FnB beserta kategorinya
     */
    public function show(FnbItem $item): JsonResponse
    {
        return response()->json([
            'data' => $item->load('category'),
        ]);
    }

    /**
     * PUT /api/fnb-items/{item}
     * Kasir — perbarui item FnB (nama, harga, stok, ketersediaan)
     */
    public function update(UpdateFnbItemRequest $request, FnbItem $item): JsonResponse
    {
        $item->update($request->validated());

        return response()->json([
            'message' => 'Item berhasil diperbarui.',
            'data'    => $item->load('category'),
        ]);
    }

    /**
     * DELETE /api/fnb-items/{item}
     * Owner — hapus item (hanya jika belum ada di riwayat transaksi)
     */
    public function destroy(FnbItem $item): JsonResponse
    {
        if ($item->transactionItems()->exists()) {
            return response()->json([
                'message' => 'Item tidak bisa dihapus karena sudah memiliki riwayat transaksi.',
            ], 409);
        }

        $item->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus.',
        ]);
    }
}
