<?php

// ============================================================
// app/Http/Requests/Device/UpdateDeviceRateRequest.php
// ============================================================

namespace App\Http\Requests\Device;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeviceRateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'price_per_hour'  => 'sometimes|numeric|min:1000|max:999999',
            'effective_from'  => 'nullable|date_format:H:i|required_with:effective_until',
            'effective_until' => [
                'nullable',
                'date_format:H:i',
                'required_with:effective_from',
                function ($attr, $value, $fail) {
                    if ($this->filled('effective_from') && $value <= $this->effective_from) {
                        $fail('Jam akhir harus setelah jam mulai.');
                    }
                },
            ],
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'price_per_hour.min'          => 'Harga per jam minimal Rp 1.000.',
            'effective_from.date_format'  => 'Format jam mulai harus HH:MM.',
            'effective_until.date_format' => 'Format jam akhir harus HH:MM.',
        ];
    }
}
