<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAnswerRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'answer_id' => ['required', 'integer', 'exists:answers,id'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answer_id.required' => 'Veuillez sélectionner une réponse.',
            'answer_id.integer' => 'L\'identifiant de la réponse doit être un nombre entier.',
            'answer_id.exists' => 'La réponse sélectionnée est invalide.',
        ];
    }
}
