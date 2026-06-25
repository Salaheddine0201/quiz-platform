<?php

namespace App\Services;

use App\Models\QuizSession;

class QuizGradingService
{
    /**
     * Calcule le score d'une session de quiz.
     *
     * RG-02 : La note est calculée automatiquement par le système.
     * RG-10 : En mode canadien, une mauvaise réponse entraîne des points négatifs.
     *
     * @param QuizSession $session
     * @return float Le score calculé (minimum 0)
     */
    public function calculateScore(QuizSession $session): float
    {
        $quiz = $session->quiz;
        $responses = $session->studentResponses()
            ->with(['answer', 'question'])
            ->get();

        $score = 0;

        foreach ($responses as $response) {
            if ($response->answer->is_correct) {
                // Bonne réponse → ajouter les points de la question
                $score += $response->question->points;
            } elseif ($quiz->grading_system === 'canadien') {
                // RG-10 : Système canadien → soustraire les points de pénalité
                $score -= $response->question->penalty_points;
            }
            // Mode standard + mauvaise réponse → 0 points (pas de pénalité)
        }

        // La note ne peut jamais être négative
        return max($score, 0);
    }

    /**
     * Clôture automatiquement une session et calcule la note.
     *
     * Utilisé lors de la soumission finale ou de l'expiration du temps (RG-08).
     *
     * @param QuizSession $session
     * @return QuizSession La session mise à jour
     */
    public function gradeAndClose(QuizSession $session): QuizSession
    {
        $score = $this->calculateScore($session);

        $session->update([
            'status' => QuizSession::STATUS_TERMINE,
            'score' => $score,
        ]);

        return $session->fresh();
    }

    /**
     * Vérifie si le temps imparti est écoulé pour une session.
     *
     * RG-08 : Soumission automatique à la fin du temps imparti.
     *
     * @param QuizSession $session
     * @return bool
     */
    public function isTimeExpired(QuizSession $session): bool
    {
        $quiz = $session->quiz;

        // Si le quiz n'a pas de limite de temps, le temps n'est jamais écoulé
        if (!$quiz->duration_minutes) {
            return false;
        }

        $deadline = $session->started_at->addMinutes($quiz->duration_minutes);

        return now()->greaterThan($deadline);
    }
}
