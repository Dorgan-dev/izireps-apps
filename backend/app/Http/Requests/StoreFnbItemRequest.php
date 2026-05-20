<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFnbItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id'  => ['required', 'exists:fnb_categories,id'],
            'name'         => ['required', 'string', 'max:255'],
            'price'        => ['required', 'numeric', 'min:0'],
            'stock'        => ['required', 'integer', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}
