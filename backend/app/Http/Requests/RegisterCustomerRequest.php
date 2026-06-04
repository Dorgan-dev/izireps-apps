<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Siapapun bisa mendaftarkan identitas customer dari halaman public
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:15',
            'email' => 'nullable|email|max:255',
        ];
    }
    
    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required'  => 'Nama wajib diisi.',
            'name.string'    => 'Nama harus berupa teks.',
            'name.max'       => 'Nama maksimal 255 karakter.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'phone.string'   => 'Nomor WhatsApp harus berupa teks.',
            'phone.max'      => 'Nomor WhatsApp maksimal 15 karakter.',
            'email.email'    => 'Format email tidak valid.',
            'email.max'      => 'Email maksimal 255 karakter.',
        ];
    }
}
