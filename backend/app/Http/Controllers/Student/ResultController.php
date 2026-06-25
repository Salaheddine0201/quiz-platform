<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Liste toutes les sessions terminées de l'étudiant connecté.
     *
     * Retourne : quiz title, score, date, statut (réussi/insuffisant).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $sessions = $user->quizSessions()
            ->where('status', QuizSession::STATUS_TERMINE)
            ->with('quiz')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($session) {
                $totalPoints = $session->quiz->questions()->sum('points');
                $scoreOn20 = $totalPoints > 0 ? round(($session->score / $totalPoints) * 20, 1) : 0;
                $percentage = $totalPoints > 0 ? round(($session->score / $totalPoints) * 100) : 0;

                return [
                    'id' => $session->id,
                    'quiz_id' => $session->quiz_id,
                    'quiz_title' => $session->quiz->title,
                    'score' => $session->score,
                    'total_points' => $totalPoints,
                    'score_on_20' => $scoreOn20,
                    'percentage' => $percentage,
                    'result' => $scoreOn20 >= 10 ? 'Réussi' : 'Insuffisant',
                    'completed_at' => $session->updated_at->toDateTimeString(),
                ];
            });

        // Statistiques globales
        $totalSessions = $sessions->count();
        $averageScoreOn20 = $totalSessions > 0 ? round($sessions->avg('score_on_20'), 1) : 0;
        $passedCount = $sessions->where('result', 'Réussi')->count();

        return response()->json([
            'stats' => [
                'average_score' => $averageScoreOn20,
                'passed_count' => $passedCount,
                'total_count' => $totalSessions,
                'failed_count' => $totalSessions - $passedCount,
            ],
            'results' => $sessions->values(),
        ]);
    }

    /**
     * Affiche le détail d'un résultat (session terminée).
     *
     * Retourne : score, nombre de correctes/incorrectes, pourcentage, détails par question.
     */
    public function show(Request $request, QuizSession $session)
    {
        $user = $request->user();

        // Vérifier que la session appartient à l'étudiant
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // Vérifier que la session est terminée
        if ($session->status !== QuizSession::STATUS_TERMINE) {
            return response()->json(['message' => 'Ce quiz est encore en cours.'], 422);
        }

        $session->load(['quiz.questions.answers', 'studentResponses.answer']);

        $totalPoints = $session->quiz->questions->sum('points');
        $scoreOn20 = $totalPoints > 0 ? round(($session->score / $totalPoints) * 20, 1) : 0;
        $percentage = $totalPoints > 0 ? round(($session->score / $totalPoints) * 100) : 0;

        // Détail par question
        $questionsDetail = $session->quiz->questions->map(function ($question) use ($session) {
            $studentResponse = $session->studentResponses
                ->firstWhere('question_id', $question->id);

            $selectedAnswerId = $studentResponse?->answer_id;
            $isCorrect = $studentResponse?->answer?->is_correct ?? false;

            return [
                'id' => $question->id,
                'text_content' => $question->text_content,
                'points' => $question->points,
                'selected_answer_id' => $selectedAnswerId,
                'is_correct' => $isCorrect,
                'answers' => $question->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'text_content' => $answer->text_content,
                        'is_correct' => $answer->is_correct,
                    ];
                }),
            ];
        });

        $correctCount = $questionsDetail->where('is_correct', true)->count();
        $totalQuestions = $questionsDetail->count();

        return response()->json([
            'session_id' => $session->id,
            'quiz_title' => $session->quiz->title,
            'grading_system' => $session->quiz->grading_system,
            'score' => $session->score,
            'total_points' => $totalPoints,
            'score_on_20' => $scoreOn20,
            'percentage' => $percentage,
            'result' => $scoreOn20 >= 10 ? 'Réussi' : 'Insuffisant',
            'correct_count' => $correctCount,
            'incorrect_count' => $totalQuestions - $correctCount,
            'total_questions' => $totalQuestions,
            'completed_at' => $session->updated_at->toDateTimeString(),
            'questions' => $questionsDetail,
        ]);
    }
}
