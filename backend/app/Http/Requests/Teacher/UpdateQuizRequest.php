<?php

namespace App\Http\Requests\Teacher;

use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'expires_at' => ['nullable', 'date'],
            'grading_system' => ['sometimes', 'required', 'string', 'in:' . Quiz::GRADING_STANDARD . ',' . Quiz::GRADING_CANADIEN],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du quiz est obligatoire.',
            'title.min' => 'Le titre doit contenir au moins 3 caractères.',
            'duration_minutes.min' => 'La durée doit être d\'au moins 1 minute.',
            'grading_system.in' => 'Le système de notation sélectionné est invalide.',
        ];
    }
}
