<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    // ── Penggunaan di routes ───────────────────────────────────────────────────
    // Route::middleware('role:owner')->group(...)
    // Route::middleware('role:cashier')->group(...)
    // Route::middleware('role:owner,cashier')->group(...) // keduanya boleh

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Akun tidak aktif. Hubungi owner untuk mengaktifkan kembali.',
            ], 403);
        }

        $userRole = $user->role instanceof UserRole
            ? $user->role->value
            : $user->role;

        if (! in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
