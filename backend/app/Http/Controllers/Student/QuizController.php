<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitAnswerRequest;
use App\Models\Answer;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\StudentResponse;
use App\Services\QuizGradingService;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    protected QuizGradingService $gradingService;

    public function __construct(QuizGradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    /**
     * Affiche les détails d'un quiz assigné.
     *
     * RG-04 : Vérifie que le quiz est bien assigné à l'étudiant.
     * Sécurité : Ne renvoie PAS les réponses correctes (is_correct).
     */
    public function show(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        // RG-04 : Vérifier que le quiz est assigné à cet étudiant
        if (!$user->assignedQuizzes()->where('quizzes.id', $quiz->id)->exists()) {
            return response()->json(['message' => 'Ce quiz ne vous est pas assigné.'], 403);
        }

        // Vérifier s'il existe une session pour ce quiz
        $session = $user->quizSessions()
            ->where('quiz_id', $quiz->id)
            ->first();

        // Calculer le statut virtuel (Q3)
        $status = 'en_attente';
        if ($session && $session->status === QuizSession::STATUS_TERMINE) {
            $status = 'termine';
        } elseif ($session && $session->status === QuizSession::STATUS_EN_COURS) {
            $status = 'en_cours';
        } elseif ($quiz->starts_at && now()->lessThan($quiz->starts_at)) {
            $status = 'planifie';
        } elseif ($quiz->expires_at && now()->greaterThan($quiz->expires_at)) {
            $status = 'expire';
        }

        return response()->json([
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'duration_minutes' => $quiz->duration_minutes,
            'starts_at' => $quiz->starts_at,
            'expires_at' => $quiz->expires_at,
            'grading_system' => $quiz->grading_system,
            'questions_count' => $quiz->questions()->count(),
            'status' => $status,
            'session_id' => $session?->id,
        ]);
    }

    /**
     * Démarre un quiz ou reprend une session existante.
     *
     * RG-01 : Bloque si une session 'termine' existe déjà.
     * RG-04 : Vérifie l'affectation.
     * RG-06 : Reprend la session 'en_cours' si elle existe.
     * RG-09 : Bloque si le quiz est expiré.
     */
    public function start(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        // RG-04 : Vérifier l'affectation
        if (!$user->assignedQuizzes()->where('quizzes.id', $quiz->id)->exists()) {
            return response()->json(['message' => 'Ce quiz ne vous est pas assigné.'], 403);
        }

        // RG-09 : Vérifier que le quiz n'est pas expiré
        if ($quiz->starts_at && now()->lessThan($quiz->starts_at)) {
            return response()->json(['message' => 'Ce quiz n\'est pas encore commencé.'], 403);
        } elseif ($quiz->expires_at && now()->greaterThan($quiz->expires_at)) {
            return response()->json(['message' => 'Ce quiz est expiré.'], 403);
        }

        // RG-01 : Vérifier qu'il n'y a pas de session terminée
        $existingTerminated = $user->quizSessions()
            ->where('quiz_id', $quiz->id)
            ->where('status', QuizSession::STATUS_TERMINE)
            ->exists();

        if ($existingTerminated) {
            return response()->json(['message' => 'Vous avez déjà terminé ce quiz. Repassage interdit.'], 409);
        }

        // RG-06 : Reprendre la session en cours si elle existe
        $existingSession = $user->quizSessions()
            ->where('quiz_id', $quiz->id)
            ->where('status', QuizSession::STATUS_EN_COURS)
            ->first();

        if ($existingSession) {
            // RG-08 : Vérifier si le temps n'est pas écoulé
            if ($this->gradingService->isTimeExpired($existingSession)) {
                $session = $this->gradingService->gradeAndClose($existingSession);
                return response()->json([
                    'message' => 'Le temps imparti est écoulé. Le quiz a été soumis automatiquement.',
                    'auto_submitted' => true,
                    'session_id' => $session->id,
                    'score' => $session->score,
                ], 200);
            }

            // Calculer le temps restant
            $remainingSeconds = null;
            if ($quiz->duration_minutes) {
                $deadline = $existingSession->started_at->addMinutes($quiz->duration_minutes);
                $remainingSeconds = max(0, now()->diffInSeconds($deadline, false));
            }

            return response()->json([
                'message' => 'Reprise de session.',
                'session_id' => $existingSession->id,
                'current_question_id' => $existingSession->current_question_id,
                'remaining_seconds' => $remainingSeconds,
                'resumed' => true,
            ], 200);
        }

        // Créer une nouvelle session
        $firstQuestion = $quiz->questions()->orderBy('id')->first();

        if (!$firstQuestion) {
            return response()->json(['message' => 'Ce quiz ne contient aucune question.'], 422);
        }

        $session = QuizSession::create([
            'started_at' => now(),
            'status' => QuizSession::STATUS_EN_COURS,
            'score' => 0,
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'current_question_id' => $firstQuestion->id,
        ]);

        // Calculer le temps restant
        $remainingSeconds = null;
        if ($quiz->duration_minutes) {
            $remainingSeconds = $quiz->duration_minutes * 60;
        }

        return response()->json([
            'message' => 'Quiz démarré.',
            'session_id' => $session->id,
            'current_question_id' => $firstQuestion->id,
            'remaining_seconds' => $remainingSeconds,
            'resumed' => false,
        ], 201);
    }

    /**
     * Charge une question et ses choix de réponse.
     *
     * RG-07 : Vérifie que la question demandée est la question courante.
     * RG-08 : Vérifie que le temps n'est pas écoulé.
     * Sécurité : Ne renvoie JAMAIS is_correct.
     */
    public function getQuestion(Request $request, QuizSession $session, $questionId)
    {
        $user = $request->user();

        // Vérifier que la session appartient à l'étudiant
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // Vérifier que la session est en cours
        if ($session->status !== QuizSession::STATUS_EN_COURS) {
            return response()->json(['message' => 'Ce quiz est déjà terminé.'], 409);
        }

        // RG-08 : Vérifier si le temps n'est pas écoulé
        if ($this->gradingService->isTimeExpired($session)) {
            $session = $this->gradingService->gradeAndClose($session);
            return response()->json([
                'message' => 'Le temps imparti est écoulé. Le quiz a été soumis automatiquement.',
                'auto_submitted' => true,
                'session_id' => $session->id,
                'score' => $session->score,
            ], 200);
        }

        // RG-07 : Vérifier que c'est bien la question courante
        if ((int) $questionId !== $session->current_question_id) {
            return response()->json(['message' => 'Navigation interdite. Vous devez répondre à la question courante.'], 422);
        }

        // Charger la question avec ses réponses (SANS is_correct !)
        $question = $session->quiz->questions()
            ->where('id', $questionId)
            ->with(['answers:id,text_content,question_id'])
            ->first();

        if (!$question) {
            return response()->json(['message' => 'Question introuvable.'], 404);
        }

        // Compter les questions totales et répondues
        $totalQuestions = $session->quiz->questions()->count();
        $answeredCount = $session->studentResponses()->count();

        // Calculer le temps restant
        $remainingSeconds = null;
        if ($session->quiz->duration_minutes) {
            $deadline = $session->started_at->addMinutes($session->quiz->duration_minutes);
            $remainingSeconds = max(0, now()->diffInSeconds($deadline, false));
        }

        return response()->json([
            'question' => [
                'id' => $question->id,
                'text_content' => $question->text_content,
                'points' => $question->points,
                'answers' => $question->answers,
            ],
            'progress' => [
                'current' => $answeredCount + 1,
                'total' => $totalQuestions,
            ],
            'remaining_seconds' => $remainingSeconds,
        ]);
    }

    /**
     * Enregistre la réponse à une question et passe à la suivante.
     *
     * RG-07 : Interdit de répondre à une question déjà répondue (navigation unidirectionnelle).
     * RG-08 : Vérifie le temps avant d'enregistrer.
     */
    public function submitAnswer(SubmitAnswerRequest $request, QuizSession $session, $questionId)
    {
        $user = $request->user();

        // Vérifier que la session appartient à l'étudiant
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // Vérifier que la session est en cours
        if ($session->status !== QuizSession::STATUS_EN_COURS) {
            return response()->json(['message' => 'Ce quiz est déjà terminé.'], 409);
        }

        // RG-08 : Vérifier si le temps n'est pas écoulé
        if ($this->gradingService->isTimeExpired($session)) {
            $session = $this->gradingService->gradeAndClose($session);
            return response()->json([
                'message' => 'Le temps imparti est écoulé. Le quiz a été soumis automatiquement.',
                'auto_submitted' => true,
                'session_id' => $session->id,
                'score' => $session->score,
            ], 200);
        }

        // RG-07 : Vérifier que c'est bien la question courante
        if ((int) $questionId !== $session->current_question_id) {
            return response()->json(['message' => 'Navigation interdite. Vous devez répondre à la question courante.'], 422);
        }

        // RG-07 : Vérifier que la question n'a pas déjà été répondue
        $alreadyAnswered = $session->studentResponses()
            ->where('question_id', $questionId)
            ->exists();

        if ($alreadyAnswered) {
            return response()->json(['message' => 'Vous avez déjà répondu à cette question.'], 422);
        }

        // Vérifier que la réponse appartient bien à cette question
        $answer = Answer::where('id', $request->validated()['answer_id'])
            ->where('question_id', $questionId)
            ->first();

        if (!$answer) {
            return response()->json(['message' => 'Cette réponse ne correspond pas à la question.'], 422);
        }

        // Enregistrer la réponse
        StudentResponse::create([
            'answered_at' => now(),
            'session_id' => $session->id,
            'question_id' => (int) $questionId,
            'answer_id' => $answer->id,
        ]);

        // Déterminer la question suivante (ordonnée par ID)
        $nextQuestion = $session->quiz->questions()
            ->where('id', '>', $questionId)
            ->orderBy('id')
            ->first();

        if ($nextQuestion) {
            // Il reste des questions → avancer
            $session->update(['current_question_id' => $nextQuestion->id]);

            return response()->json([
                'message' => 'Réponse enregistrée.',
                'next_question_id' => $nextQuestion->id,
                'is_last' => false,
            ]);
        } else {
            // C'était la dernière question → clôturer automatiquement (RG-02)
            $session = $this->gradingService->gradeAndClose($session);

            return response()->json([
                'message' => 'Quiz terminé ! Votre note a été calculée.',
                'next_question_id' => null,
                'is_last' => true,
                'session_id' => $session->id,
                'score' => $session->score,
            ]);
        }
    }

    /**
     * Clôture manuellement un quiz (soumission par l'étudiant).
     *
     * RG-02 : Appelle QuizGradingService pour calculer la note.
     * RG-08 : Permet la soumission même si toutes les questions ne sont pas répondues.
     */
    public function finish(Request $request, QuizSession $session)
    {
        $user = $request->user();

        // Vérifier que la session appartient à l'étudiant
        if ($session->user_id !== $user->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // Vérifier que la session est en cours
        if ($session->status !== QuizSession::STATUS_EN_COURS) {
            return response()->json(['message' => 'Ce quiz est déjà terminé.'], 409);
        }

        // Clôturer et calculer la note (RG-02)
        $session = $this->gradingService->gradeAndClose($session);

        // Statistiques du résultat
        $totalQuestions = $session->quiz->questions()->count();
        $answeredCount = $session->studentResponses()->count();
        $correctCount = $session->studentResponses()
            ->whereHas('answer', function ($q) {
                $q->where('is_correct', true);
            })
            ->count();

        return response()->json([
            'message' => 'Quiz soumis avec succès.',
            'session_id' => $session->id,
            'score' => $session->score,
            'total_questions' => $totalQuestions,
            'answered' => $answeredCount,
            'correct' => $correctCount,
            'incorrect' => $answeredCount - $correctCount,
        ]);
    }
}
