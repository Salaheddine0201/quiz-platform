<?php

namespace App\Http\Requests\Teacher;

use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'grading_system' => ['required', 'string', 'in:' . Quiz::GRADING_STANDARD . ',' . Quiz::GRADING_CANADIEN],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du quiz est obligatoire.',
            'title.min' => 'Le titre doit contenir au moins 3 caractères.',
            'duration_minutes.min' => 'La durée doit être d\'au moins 1 minute.',
            'expires_at.after' => 'La date d\'expiration doit être dans le futur.',
            'grading_system.in' => 'Le système de notation sélectionné est invalide.',
        ];
    }
}
