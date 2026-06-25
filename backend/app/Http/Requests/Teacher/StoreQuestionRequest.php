<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'text_content' => ['required', 'string', 'min:3', 'max:2000'],
            'points' => ['required', 'numeric', 'min:0.5', 'max:100'],
            'penalty_points' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'answers' => ['required', 'array', 'min:2', 'max:6'],
            'answers.*.text_content' => ['required', 'string', 'min:1', 'max:500'],
            'answers.*.is_correct' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'text_content.required' => 'Le texte de la question est obligatoire.',
            'points.required' => 'Les points de la question sont obligatoires.',
            'answers.required' => 'Chaque question doit avoir au moins 2 réponses.',
            'answers.min' => 'Chaque question doit avoir au moins 2 réponses.',
            'answers.*.text_content.required' => 'Le texte de chaque réponse est obligatoire.',
            'answers.*.is_correct.required' => 'Indiquez si chaque réponse est correcte ou non.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $answers = $this->input('answers', []);
            $hasCorrect = collect($answers)->contains(fn ($a) => ($a['is_correct'] ?? false) === true);

            if (!empty($answers) && !$hasCorrect) {
                $validator->errors()->add('answers', 'Au moins une réponse doit être marquée comme correcte.');
            }
        });
    }
}
