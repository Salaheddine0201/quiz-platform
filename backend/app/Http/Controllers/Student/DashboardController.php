<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Retourne les données du tableau de bord de l'étudiant connecté.
     *
     * Données retournées :
     * - pending_quizzes : quiz assignés non terminés et non expirés (RG-04, RG-09)
     * - completed_count : nombre de quiz terminés
     * - average_score   : moyenne globale des scores
     * - total_time      : temps total passé sur les quiz (en minutes)
     * - recent_results  : 5 dernières sessions terminées
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Quiz assignés avec leur session éventuelle pour cet étudiant
        $assignedQuizzes = $user->assignedQuizzes()
            ->with(['questions'])
            ->get();

        // Sessions terminées de l'étudiant
        $completedSessions = $user->quizSessions()
            ->where('status', QuizSession::STATUS_TERMINE)
            ->with('quiz')
            ->get();

        // Sessions en cours
        $inProgressSessions = $user->quizSessions()
            ->where('status', QuizSession::STATUS_EN_COURS)
            ->pluck('quiz_id')
            ->toArray();

        // IDs des quiz terminés
        $completedQuizIds = $completedSessions->pluck('quiz_id')->toArray();

        // Construire la liste des quiz à faire (assignés, non terminés, non expirés)
        $pendingQuizzes = $assignedQuizzes
            ->filter(function ($quiz) use ($completedQuizIds) {
                // Exclure les quiz déjà terminés (RG-01)
                if (in_array($quiz->id, $completedQuizIds)) {
                    return false;
                }
                // Exclure les quiz expirés (RG-09)
                if ($quiz->expires_at && now()->greaterThan($quiz->expires_at)) {
                    return false;
                }
                return true;
            })
            ->map(function ($quiz) use ($inProgressSessions) {
                // Statut virtuel calculé dynamiquement (Q3)
                $status = 'en_attente';
                if ($quiz->starts_at && now()->lessThan($quiz->starts_at)) {
                    $status = 'planifie';
                } elseif (in_array($quiz->id, $inProgressSessions)) {
                    $status = 'en_cours';
                }

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'duration_minutes' => $quiz->duration_minutes,
                    'starts_at' => $quiz->starts_at,
                    'expires_at' => $quiz->expires_at,
                    'questions_count' => $quiz->questions->count(),
                    'status' => $status,
                ];
            })
            ->values();

        // Statistiques globales
        $completedCount = $completedSessions->count();
        $averageScore = $completedCount > 0 ? round($completedSessions->avg('score'), 1) : 0;

        // Temps total en minutes (somme des durées des quiz terminés)
        $totalTime = 0;
        foreach ($completedSessions as $session) {
            if ($session->quiz && $session->quiz->duration_minutes) {
                $totalTime += $session->quiz->duration_minutes;
            }
        }

        // 5 derniers résultats
        $recentResults = $completedSessions
            ->sortByDesc('updated_at')
            ->take(5)
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'quiz_title' => $session->quiz->title,
                    'score' => $session->score,
                    'completed_at' => $session->updated_at->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'pending_quizzes' => $pendingQuizzes,
            'completed_count' => $completedCount,
            'average_score' => $averageScore,
            'total_time_minutes' => $totalTime,
            'recent_results' => $recentResults,
        ]);
    }
}
