<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Penggunaan di route:
     *   Route::middleware('role:owner')
     *   Route::middleware('role:kasir,owner')   ← bisa multi-role
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role->value, $roles, true)) {
            return response()->json([
                'message' => 'Akses ditolak. Role kamu tidak memiliki izin untuk aksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
