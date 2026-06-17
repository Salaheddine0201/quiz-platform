<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentResponse extends Model
{
    use HasFactory;

    protected $fillable = ['answered_at', 'session_id', 'question_id', 'answer_id'];

    protected $casts = [
        'answered_at' => 'datetime',
    ];

    public function quizSession() {
        return $this->belongsTo(QuizSession::class, 'session_id');
    }

    public function question() {
        return $this->belongsTo(Question::class);
    }

    public function answer() {
        return $this->belongsTo(Answer::class);
    }
}
