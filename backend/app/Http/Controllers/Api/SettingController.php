<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * GET /public/settings
     * Ambil semua setting publik (tanpa autentikasi).
     * Tidak mengembalikan data sensitif, hanya informasi umum.
     */
    public function publicIndex()
    {
        $settings = Setting::whereIn('key', ['store_name'])->get(['key', 'value']);

        return response()->json(['data' => $settings->pluck('value', 'key')]);
    }

    /**
     * GET /settings
     * Ambil semua setting (owner only).
     */
    public function index()
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get();

        return response()->json(['data' => $settings->pluck('value', 'key')]);
    }

    /**
     * PUT /settings
     * Update satu atau beberapa setting sekaligus (owner only).
     * Body: { "qris_string": "...", "store_name": "..." }
     */
    public function update(Request $request)
    {
        $allowed = ['qris_string', 'store_name'];

        $data = $request->validate([
            'qris_string' => 'nullable|string|min:50',
            'store_name'  => 'nullable|string|max:100',
        ]);

        foreach ($data as $key => $value) {
            if (in_array($key, $allowed)) {
                Setting::set($key, $value);
            }
        }

        $settings = Setting::whereIn('key', $allowed)->get();

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'data'    => $settings->pluck('value', 'key'),
        ]);
    }
}
