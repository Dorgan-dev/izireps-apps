<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFnbCategoryRequest;
use App\Http\Requests\UpdateFnbCategoryRequest;
use App\Models\FnbCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FnbCategoryController extends Controller
{
    /**
     * GET /api/fnb-categories
     * Semua role — daftar kategori FnB
     *
     * Query params:
     *   ?all=1 => tampilkan semua termasuk nonaktif (default: aktif saja)
     */
    public function index(Request $request): JsonResponse
    {
        $categories = FnbCategory::query()
            ->when(
                ! $request->boolean('all'),
                fn ($q) => $q->where('is_active', true)
            )
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * POST /api/fnb-categories
     * Owner — buat kategori baru
     */
    public function store(StoreFnbCategoryRequest $request): JsonResponse
    {
        $category = FnbCategory::create([
            'name'      => $request->name,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil dibuat.',
            'data'    => $category,
        ], 201);
    }

    /**
     * PUT /api/fnb-categories/{category}
     * Owner — perbarui kategori
     */
    public function update(UpdateFnbCategoryRequest $request, FnbCategory $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data'    => $category,
        ]);
    }

    /**
     * DELETE /api/fnb-categories/{category}
     * Owner — hapus kategori (hanya jika tidak punya item)
     */
    public function destroy(FnbCategory $category): JsonResponse
    {
        if ($category->items()->exists()) {
            return response()->json([
                'message' => 'Kategori tidak bisa dihapus karena masih memiliki item.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
