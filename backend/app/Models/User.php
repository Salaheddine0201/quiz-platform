<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_ENSEIGNANT = 'enseignant';
    const ROLE_ETUDIANT = 'etudiant';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    public function quizzes() {
        return $this->hasMany(Quiz::class, 'user_id');
    }
    
    public function quizSessions() {
        return $this->hasMany(QuizSession::class, 'user_id');
    }
    
    public function assignedQuizzes() {
        return $this->belongsToMany(Quiz::class, 'quiz_assignments', 'user_id', 'quiz_id');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
