<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    use HasFactory;

    const STATUS_EN_COURS = 'en_cours';
    const STATUS_TERMINE = 'termine';

    protected $fillable = ['started_at', 'status', 'score', 'user_id', 'quiz_id', 'current_question_id'];

    protected $casts = [
        'started_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }

    public function currentQuestion() {
        return $this->belongsTo(Question::class, 'current_question_id');
    }

    public function studentResponses() {
        return $this->hasMany(StudentResponse::class, 'session_id');
    }
}
