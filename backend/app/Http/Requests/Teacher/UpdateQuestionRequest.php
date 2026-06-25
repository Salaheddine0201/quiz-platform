<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'text_content' => ['sometimes', 'required', 'string', 'min:3', 'max:2000'],
            'points' => ['sometimes', 'required', 'numeric', 'min:0.5', 'max:100'],
            'penalty_points' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'text_content.required' => 'Le texte de la question est obligatoire.',
            'points.required' => 'Les points de la question sont obligatoires.',
        ];
    }
}
