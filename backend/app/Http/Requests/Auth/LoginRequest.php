<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class LoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255', 'exists:users,email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Obtenir les messages d'erreur de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'email.exists' => 'Cet email n\'existe pas dans notre système.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ];
    }

    /**
     * Configurer le validateur avec des règles supplémentaires après la validation initiale.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Ne vérifier le mot de passe que si l'email existe (évite les erreurs en double)
            if (! $validator->errors()->has('email') && $this->password) {
                $user = User::where('email', $this->email)->first();
                if ($user && ! Hash::check($this->password, $user->password)) {
                    $validator->errors()->add('password', 'Le mot de passe est incorrect.');
                }
            }
        });
    }
}
