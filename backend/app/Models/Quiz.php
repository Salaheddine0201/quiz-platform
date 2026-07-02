<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    const GRADING_STANDARD = 'standard';
    const GRADING_CANADIEN = 'canadien';

    protected $fillable = ['title', 'description', 'duration_minutes', 'starts_at', 'expires_at', 'grading_system', 'user_id'];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function questions() {
        return $this->hasMany(Question::class);
    }

    public function quizSessions() {
        return $this->hasMany(QuizSession::class);
    }

    public function assignedUsers() {
        return $this->belongsToMany(User::class, 'quiz_assignments', 'quiz_id', 'user_id');
    }
}
