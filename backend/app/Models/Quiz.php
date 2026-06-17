namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_id', 'title', 'description', 'time_limit'];

    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function questions() {
        return $this->hasMany(Question::class);
    }

    public function assignments() {
        return $this->hasMany(QuizAssignment::class);
    }
}
