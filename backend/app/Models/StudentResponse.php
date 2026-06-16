namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentResponse extends Model
{
    use HasFactory;

    protected $fillable = ['quiz_assignment_id', 'question_id', 'chosen_answer_id'];

    public function assignment() {
        return $this->belongsTo(QuizAssignment::class, 'quiz_assignment_id');
    }

    public function question() {
        return $this->belongsTo(Question::class);
    }

    public function chosenAnswer() {
        return $this->belongsTo(Answer::class, 'chosen_answer_id');
    }
}
