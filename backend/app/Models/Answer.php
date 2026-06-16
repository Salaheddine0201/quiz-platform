namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = ['question_id', 'answer_text', 'is_correct'];

    // Cast is_correct to a proper boolean value automatically
    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function question() {
        return $this->belongsTo(Question::class);
    }
}