<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ── GET /api/users ────────────────────────────────────────────────────────
    // List semua kasir dengan filter opsional status aktif/nonaktif
    // Query params: search, is_active (true|false)
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search'    => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $users = User::query()
            ->where('role', 'cashier')
            ->when($request->filled('search'), fn ($q) =>
                $q->where(fn ($q) =>
                    $q->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%")
                )
            )
            ->when($request->filled('is_active'), fn ($q) =>
                $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN))
            )
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $users]);
    }

    // ── POST /api/users ───────────────────────────────────────────────────────
    // Tambah akun kasir baru, role dikunci ke 'cashier'
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 'cashier', // role selalu kasir, tidak bisa diubah dari sini
            'is_active' => true,
        ]);

        return response()->json(['data' => $user], 201);
    }

    // ── GET /api/users/{user} ─────────────────────────────────────────────────
    // Detail satu kasir beserta statistik transaksinya
    public function show(User $user): JsonResponse
    {
        // Hitung statistik ringkas
        $stats = [
            'total_transactions' => $user->transactions()->where('status', 'paid')->count(),
            'total_revenue'      => $user->transactions()->where('status', 'paid')->sum('grand_total'),
            'last_login'         => $user->updated_at, // di implementasi nyata: dari tabel login_logs
        ];

        return response()->json([
            'data'  => $user,
            'stats' => $stats,
        ]);
    }

    // ── PUT /api/users/{user} ─────────────────────────────────────────────────
    // Update data kasir: nama, email, dan/atau reset password
    // Password hanya diupdate jika field 'password' diisi
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->only(['name', 'email']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['data' => $user->fresh()]);
    }

    // ── PATCH /api/users/{user}/toggle-active ─────────────────────────────────
    // Aktifkan atau nonaktifkan akun kasir
    // Dipisah dari update() agar lebih eksplisit dan mudah di-audit
    // Akun owner tidak bisa di-toggle dari endpoint ini
    public function toggleActive(User $user): JsonResponse
    {
        abort_if(
            $user->role->value === 'owner',
            403,
            'Akun owner tidak dapat dinonaktifkan melalui endpoint ini.'
        );

        $user->update(['is_active' => ! $user->is_active]);

        $label = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'data'    => $user->fresh(),
            'message' => "Akun {$user->name} berhasil {$label}.",
        ]);
    }
}
