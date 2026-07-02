<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSession;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Liste toutes les sessions d'un quiz (résultats des étudiants).
     */
    public function index(Request $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        $totalPoints = $quiz->questions()->sum('points');

        $sessions = $quiz->quizSessions()
            ->with('user')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (QuizSession $session) => $this->formatSessionSummary($session, $totalPoints));

        $completed = $sessions->where('status', QuizSession::STATUS_TERMINE);

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'total_points' => $totalPoints,
            ],
            'stats' => [
                'total_sessions' => $sessions->count(),
                'completed_count' => $completed->count(),
                'in_progress_count' => $sessions->where('status', QuizSession::STATUS_EN_COURS)->count(),
                'average_score' => $completed->count() > 0 ? round($completed->avg('score'), 1) : 0,
                'average_percentage' => $completed->count() > 0 && $totalPoints > 0
                    ? round($completed->avg('percentage'), 1)
                    : 0,
            ],
            'sessions' => $sessions->values(),
        ]);
    }

    /**
     * Détail d'une session (réponses de l'étudiant).
     */
    public function show(Request $request, Quiz $quiz, QuizSession $session)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        if ($session->quiz_id !== $quiz->id) {
            return response()->json(['message' => 'Cette session n\'appartient pas à ce quiz.'], 404);
        }

        $session->load(['user', 'quiz.questions.answers', 'studentResponses.answer']);

        $totalPoints = $session->quiz->questions->sum('points');
        $summary = $this->formatSessionSummary($session, $totalPoints);

        $questionsDetail = $session->quiz->questions->map(function ($question) use ($session) {
            $studentResponse = $session->studentResponses
                ->firstWhere('question_id', $question->id);

            return [
                'id' => $question->id,
                'text_content' => $question->text_content,
                'points' => $question->points,
                'selected_answer_id' => $studentResponse?->answer_id,
                'is_correct' => $studentResponse?->answer?->is_correct ?? false,
                'was_answered' => $studentResponse !== null,
                'answers' => $question->answers->map(fn ($answer) => [
                    'id' => $answer->id,
                    'text_content' => $answer->text_content,
                    'is_correct' => $answer->is_correct,
                ]),
            ];
        });

        $correctCount = $questionsDetail->where('is_correct', true)->count();
        $answeredCount = $questionsDetail->where('was_answered', true)->count();

        return response()->json([
            'session' => array_merge($summary, [
                'correct_count' => $correctCount,
                'incorrect_count' => $answeredCount - $correctCount,
                'unanswered_count' => $questionsDetail->count() - $answeredCount,
                'questions' => $questionsDetail,
            ]),
        ]);
    }

    private function denyUnlessOwner(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function formatSessionSummary(QuizSession $session, float $totalPoints): array
    {
        $percentage = $totalPoints > 0 ? round(($session->score / $totalPoints) * 100) : 0;
        $scoreOn20 = $totalPoints > 0 ? round(($session->score / $totalPoints) * 20, 1) : 0;

        return [
            'id' => $session->id,
            'student' => [
                'id' => $session->user->id,
                'name' => $session->user->name,
                'email' => $session->user->email,
            ],
            'status' => $session->status,
            'score' => $session->score,
            'total_points' => $totalPoints,
            'score_on_20' => $scoreOn20,
            'percentage' => $percentage,
            'result' => $session->status === QuizSession::STATUS_TERMINE
                ? ($scoreOn20 >= 10 ? 'Réussi' : 'Insuffisant')
                : null,
            'started_at' => $session->started_at?->toDateTimeString(),
'completed_at' => $session->status === QuizSession::STATUS_TERMINE
    ? $session->updated_at?->toDateTimeString()
    : null,
        ];
    }
}
