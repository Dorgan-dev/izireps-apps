<?php
// ============================================================
// app/Http/Requests/Device/StoreDeviceRateRequest.php
// ============================================================

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeviceRateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'price_per_hour' => 'required|numeric|min:1000|max:999999',

            // effective_from dan effective_until harus keduanya diisi atau keduanya kosong
            // Jika kosong: tarif berlaku seharian (default)
            // Jika diisi: tarif berlaku pada rentang jam tersebut
            'effective_from'  => 'nullable|date_format:H:i|required_with:effective_until',
            'effective_until' => [
                'nullable',
                'date_format:H:i',
                'required_with:effective_from',
                // Jam akhir harus setelah jam mulai
                function ($attr, $value, $fail) {
                    if ($this->filled('effective_from') && $value <= $this->effective_from) {
                        $fail('Jam akhir harus setelah jam mulai.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'price_per_hour.required'     => 'Harga per jam wajib diisi.',
            'price_per_hour.min'          => 'Harga per jam minimal Rp 1.000.',
            'effective_from.required_with'  => 'Jam mulai wajib diisi jika jam akhir diisi.',
            'effective_until.required_with' => 'Jam akhir wajib diisi jika jam mulai diisi.',
            'effective_from.date_format'  => 'Format jam mulai harus HH:MM (contoh: 18:00).',
            'effective_until.date_format' => 'Format jam akhir harus HH:MM (contoh: 23:00).',
        ];
    }
}