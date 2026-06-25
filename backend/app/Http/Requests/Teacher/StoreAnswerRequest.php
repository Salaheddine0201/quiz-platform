<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'text_content' => ['required', 'string', 'min:1', 'max:500'],
            'is_correct' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'text_content.required' => 'Le texte de la réponse est obligatoire.',
            'is_correct.required' => 'Indiquez si la réponse est correcte ou non.',
        ];
    }
}
