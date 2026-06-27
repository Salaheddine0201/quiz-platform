<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = ['text_content', 'is_correct', 'question_id'];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function question() {
        return $this->belongsTo(Question::class);
    }
}
