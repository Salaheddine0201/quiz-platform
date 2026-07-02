<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\QuizAssignment;
use App\Models\QuizSession;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Tableau de bord de l'enseignant connecté.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $quizzes = $user->quizzes()
            ->withCount(['questions', 'assignedUsers', 'quizSessions'])
            ->orderByDesc('created_at')
            ->get();

        $completedSessions = QuizSession::whereIn('quiz_id', $quizzes->pluck('id'))
            ->where('status', QuizSession::STATUS_TERMINE)
            ->with(['quiz', 'user'])
            ->orderByDesc('updated_at')
            ->get();

        $assignedStudentIds = QuizAssignment::whereIn('quiz_id', $quizzes->pluck('id'))
            ->distinct()
            ->pluck('user_id');

        $recentSessions = $completedSessions
            ->take(5)
            ->map(fn ($session) => [
                'session_id' => $session->id,
                'quiz_id' => $session->quiz_id,
                'quiz_title' => $session->quiz->title,
                'student_name' => $session->user->name,
                'student_email' => $session->user->email,
                'score' => $session->score,
                'completed_at' => $session->updated_at?->toDateTimeString(),
            ])
            ->values();

        $quizList = $quizzes->map(fn ($quiz) => [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'duration_minutes' => $quiz->duration_minutes,
            'starts_at' => $quiz->starts_at,
            'expires_at' => $quiz->expires_at,
            'grading_system' => $quiz->grading_system,
            'questions_count' => $quiz->questions_count,
            'assigned_count' => $quiz->assigned_users_count,
            'sessions_count' => $quiz->quiz_sessions_count,
            'is_expired' => $quiz->expires_at && now()->greaterThan($quiz->expires_at),
            'created_at' => $quiz->created_at?->toDateTimeString(),
        ]);

        return response()->json([
            'stats' => [
                'quizzes_count' => $quizzes->count(),
                'students_assigned_count' => $assignedStudentIds->count(),
                'completed_sessions_count' => $completedSessions->count(),
                'average_score' => $completedSessions->count() > 0
                    ? round($completedSessions->avg('score'), 1)
                    : 0,
            ],
            'quizzes' => $quizList,
            'recent_sessions' => $recentSessions,
        ]);
    }
}
