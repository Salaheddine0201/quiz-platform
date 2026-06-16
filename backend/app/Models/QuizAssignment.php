namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAssignment extends Model
{
    use HasFactory;

    protected $fillable = ['quiz_id', 'student_id', 'score', 'status', 'completed_at'];

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function responses() {
        return $this->hasMany(StudentResponse::class);
    }
}