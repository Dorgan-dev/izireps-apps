<?php
// ============================================================
// app/Http/Requests/User/UpdateUserRequest.php
// ============================================================

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'     => 'sometimes|string|max:100',
            'email'    => [
                'sometimes', 'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            // Password opsional saat update
            // Jika diisi, wajib minimal 8 karakter dan dikonfirmasi
            'password' => 'nullable|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'       => 'Email sudah digunakan oleh akun lain.',
            'password.min'       => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ];
    }
}
