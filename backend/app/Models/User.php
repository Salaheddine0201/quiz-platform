<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];
    // Relationship to get a teacher's students
    public function students() {
        return $this->belongsToMany(User::class, 'teacher_student', 'teacher_id', 'student_id');
    }
    
    // Relationship to get a student's teachers
    public function teachers() {
        return $this->belongsToMany(User::class, 'teacher_student', 'student_id', 'teacher_id');
    }
    
    // Quizzes created by a teacher
    public function createdQuizzes() {
        return $this->hasMany(Quiz::class, 'teacher_id');
    }
    
    // Quizzes assigned to a student
    public function quizAssignments() {
        return $this->hasMany(QuizAssignment::class, 'student_id');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

