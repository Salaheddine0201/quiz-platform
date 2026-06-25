<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreQuizRequest;
use App\Http\Requests\Teacher\UpdateQuizRequest;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * Liste les quiz créés par l'enseignant connecté.
     */
    public function index(Request $request)
    {
        $quizzes = $request->user()->quizzes()
            ->withCount(['questions', 'assignedUsers', 'quizSessions'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($quiz) => $this->formatQuizSummary($quiz));

        return response()->json(['quizzes' => $quizzes]);
    }

    /**
     * Crée un nouveau quiz.
     */
    public function store(StoreQuizRequest $request)
    {
        $quiz = $request->user()->quizzes()->create($request->validated());

        return response()->json([
            'message' => 'Quiz créé avec succès.',
            'quiz' => $this->formatQuizSummary($quiz->loadCount(['questions', 'assignedUsers', 'quizSessions'])),
        ], 201);
    }

    /**
     * Affiche un quiz avec ses questions et réponses.
     */
    public function show(Request $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        $quiz->load(['questions.answers']);

        return response()->json([
            'quiz' => $this->formatQuizDetail($quiz),
        ]);
    }

    /**
     * Met à jour les métadonnées d'un quiz.
     */
    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        $quiz->update($request->validated());

        return response()->json([
            'message' => 'Quiz mis à jour avec succès.',
            'quiz' => $this->formatQuizSummary($quiz->fresh()->loadCount(['questions', 'assignedUsers', 'quizSessions'])),
        ]);
    }

    /**
     * Supprime un quiz et toutes ses données associées (cascade).
     */
    public function destroy(Request $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz supprimé avec succès.']);
    }

    private function denyUnlessOwner(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function formatQuizSummary(Quiz $quiz): array
    {
        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'duration_minutes' => $quiz->duration_minutes,
            'expires_at' => $quiz->expires_at,
            'grading_system' => $quiz->grading_system,
            'questions_count' => $quiz->questions_count ?? $quiz->questions()->count(),
            'assigned_count' => $quiz->assigned_users_count ?? $quiz->assignedUsers()->count(),
            'sessions_count' => $quiz->quiz_sessions_count ?? $quiz->quizSessions()->count(),
            'is_expired' => $quiz->expires_at && now()->greaterThan($quiz->expires_at),
            'created_at' => $quiz->created_at->toDateTimeString(),
            'updated_at' => $quiz->updated_at->toDateTimeString(),
        ];
    }

    private function formatQuizDetail(Quiz $quiz): array
    {
        $totalPoints = $quiz->questions->sum('points');

        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'duration_minutes' => $quiz->duration_minutes,
            'expires_at' => $quiz->expires_at,
            'grading_system' => $quiz->grading_system,
            'total_points' => $totalPoints,
            'is_expired' => $quiz->expires_at && now()->greaterThan($quiz->expires_at),
            'questions' => $quiz->questions->map(fn ($question) => [
                'id' => $question->id,
                'text_content' => $question->text_content,
                'points' => $question->points,
                'penalty_points' => $question->penalty_points,
                'answers' => $question->answers->map(fn ($answer) => [
                    'id' => $answer->id,
                    'text_content' => $answer->text_content,
                    'is_correct' => $answer->is_correct,
                ]),
            ]),
            'created_at' => $quiz->created_at->toDateTimeString(),
            'updated_at' => $quiz->updated_at->toDateTimeString(),
        ];
    }
}
