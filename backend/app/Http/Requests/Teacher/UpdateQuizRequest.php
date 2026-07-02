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
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'grading_system' => ['sometimes', 'required', 'string', 'in:' . Quiz::GRADING_STANDARD . ',' . Quiz::GRADING_CANADIEN],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du quiz est obligatoire.',
            'title.min' => 'Le titre doit contenir au moins 3 caractères.',
            'duration_minutes.max' => 'La durée ne peut pas dépasser 8 heures (480 minutes).',
            'starts_at.date' => 'La date de début n\'est pas valide.',
            'expires_at.date' => 'La date d\'expiration n\'est pas valide.',
            'expires_at.after' => 'La date d\'expiration doit être après la date de début.',
        ];
    }
}
