<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAssignment;
use App\Models\QuizSession;
use App\Models\StudentResponse;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration rattachées à l'enseignant prof@ecole.fr.
 *
 * Lancement :
 *   php artisan db:seed --class=TeacherDemoSeeder
 *
 * Le seeder est ré-exécutable sans créer de doublons (updateOrCreate
 * pour les comptes, et garde-fous sur les questions/sessions).
 */
class TeacherDemoSeeder extends Seeder
{
    public function run(): void
    {
        /* ---------------------------------------------------------
         * 1) L'ENSEIGNANT
         *    On passe le mot de passe EN CLAIR : le cast `hashed` du
         *    modèle User le hache automatiquement (ne pas Hash::make ici,
         *    sinon double hachage et connexion impossible).
         * --------------------------------------------------------- */
        $teacher = User::updateOrCreate(
            ['email' => 'prof@ecole.fr'],
            ['name' => 'Prof Dupont', 'password' => 'password123', 'role' => User::ROLE_ENSEIGNANT]
        );

        /* ---------------------------------------------------------
         * 2) LES ÉTUDIANTS (10) — mot de passe : password123
         * --------------------------------------------------------- */
        $studentsData = [
            ['Alice Martin', 'alice.martin@ecole.fr'],
            ['Bruno Leclerc', 'bruno.leclerc@ecole.fr'],
            ['Clara Dubois', 'clara.dubois@ecole.fr'],
            ['Chloé Moreau', 'chloe.moreau@ecole.fr'],
            ['Emma Dubois', 'emma.dubois@ecole.fr'],
            ['Hugo Lemaire', 'hugo.lemaire@ecole.fr'],
            ['Jules Blanc', 'jules.blanc@ecole.fr'],
            ['Léa Roux', 'lea.roux@ecole.fr'],
            ['Nathan Michel', 'nathan.michel@ecole.fr'],
            ['Inès Roux', 'ines.roux@ecole.fr'],
        ];

        $students = collect($studentsData)->map(function ($s) {
            return User::updateOrCreate(
                ['email' => $s[1]],
                ['name' => $s[0], 'password' => 'password123', 'role' => User::ROLE_ETUDIANT]
            );
        })->values();

        /* ---------------------------------------------------------
         * 3) LES QUIZ + QUESTIONS + RÉPONSES
         *    Chaque quiz totalise 20 points (pour que score = note/20).
         * --------------------------------------------------------- */

        // -- Mathématiques (actif) : 5 questions × 4 pts
        $maths = $this->makeQuiz($teacher, [
            'title' => 'Évaluation de Mathématiques',
            'description' => 'Test de calcul et de géométrie de base.',
            'duration_minutes' => 30,
            'expires_at' => now()->addMonths(6),
            'grading_system' => Quiz::GRADING_STANDARD,
        ], [
            ['Combien font 7 × 8 ?', 4, ['54', '56', '48', '64'], 1],
            ['Quelle est la racine carrée de 144 ?', 4, ['11', '12', '13', '14'], 1],
            ['Combien font 15 % de 200 ?', 4, ['30', '25', '20', '35'], 0],
            ['Quel est le périmètre d\'un carré de côté 5 ?', 4, ['20', '25', '10', '15'], 0],
            ['Combien font 3² + 4² ?', 4, ['25', '24', '7', '49'], 0],
        ]);

        // -- Sciences de la vie (actif) : points 7, 7, 6
        $sciences = $this->makeQuiz($teacher, [
            'title' => 'Sciences de la vie — La cellule',
            'description' => 'Structure et fonctionnement de la cellule.',
            'duration_minutes' => 25,
            'expires_at' => now()->addMonths(3),
            'grading_system' => Quiz::GRADING_STANDARD,
        ], [
            ['Quel organite produit l\'énergie de la cellule ?', 7, ['Mitochondrie', 'Noyau', 'Ribosome', 'Membrane'], 0],
            ['Où se trouve l\'ADN dans une cellule eucaryote ?', 7, ['Noyau', 'Cytoplasme', 'Mitochondrie', 'Paroi'], 0],
            ['Quelle structure contrôle les échanges cellulaires ?', 6, ['Membrane plasmique', 'Noyau', 'Ribosome', 'Vacuole'], 0],
        ]);

        // -- Histoire (expiré) : 2 questions × 10 pts
        $histoire = $this->makeQuiz($teacher, [
            'title' => 'Histoire — La Révolution française',
            'description' => 'Les grandes dates de 1789.',
            'duration_minutes' => 45,
            'expires_at' => now()->subMonths(8), // date passée => statut "Expiré"
            'grading_system' => Quiz::GRADING_STANDARD,
        ], [
            ['En quelle année débute la Révolution française ?', 10, ['1789', '1799', '1769', '1804'], 0],
            ['Quel événement marque le début de la Révolution ?', 10, ['La prise de la Bastille', 'Le sacre de Napoléon', 'La bataille de Waterloo', 'La fête de la Fédération'], 0],
        ]);

        // -- Physique (brouillon) : AUCUNE question
        $physique = $this->makeQuiz($teacher, [
            'title' => 'Physique — Mécanique newtonienne',
            'description' => 'Quiz en préparation.',
            'duration_minutes' => 60,
            'expires_at' => now()->addMonths(2),
            'grading_system' => Quiz::GRADING_CANADIEN,
        ], []); // pas de questions => brouillon

        /* ---------------------------------------------------------
         * 4) AFFECTATIONS (10 étudiants distincts au total)
         * --------------------------------------------------------- */
        $this->assign($maths, $students, [0, 1, 2, 3]);
        $this->assign($histoire, $students, [4, 5]);
        $this->assign($physique, $students, [6]);
        $this->assign($sciences, $students, [7, 8, 9]);

        /* ---------------------------------------------------------
         * 5) SESSIONS TERMINÉES (avec réponses + score)
         *    Format : [index étudiant, [indices des questions réussies]]
         * --------------------------------------------------------- */
        $this->completeSession($maths, $students[0], [0, 1, 2, 3, 4]); // 20
        $this->completeSession($maths, $students[1], [0, 1, 2, 3]);    // 16
        $this->completeSession($maths, $students[2], [0, 1, 2]);       // 12
        $this->completeSession($maths, $students[3], [0, 1]);          // 8

        $this->completeSession($sciences, $students[7], [0, 1, 2]);    // 20
        $this->completeSession($sciences, $students[8], [0, 1]);       // 14
        $this->completeSession($sciences, $students[9], [0]);          // 7

        $this->completeSession($histoire, $students[4], [0, 1]);       // 20
        $this->completeSession($histoire, $students[5], [0]);          // 10

        $this->command->info('✔ Données de démonstration créées pour prof@ecole.fr (mot de passe : password123).');
    }

    /* ============================================================
     *  HELPERS
     * ============================================================ */

    /**
     * Crée un quiz avec ses questions et réponses.
     * $questions : [ [texte, points, [réponses...], indexBonneRéponse], ... ]
     */
    private function makeQuiz(User $teacher, array $attributes, array $questions): Quiz
    {
        $quiz = Quiz::firstOrCreate(
            ['title' => $attributes['title'], 'user_id' => $teacher->id],
            $attributes
        );

        // On n'ajoute les questions que si le quiz vient d'être créé (évite les doublons).
        if ($quiz->questions()->count() === 0) {
            foreach ($questions as [$text, $points, $answers, $correctIndex]) {
                $question = $quiz->questions()->create([
                    'text_content' => $text,
                    'points' => $points,
                    'penalty_points' => 0,
                ]);

                foreach ($answers as $i => $answerText) {
                    $question->answers()->create([
                        'text_content' => $answerText,
                        'is_correct' => $i === $correctIndex,
                    ]);
                }
            }
        }

        return $quiz->fresh(['questions.answers']);
    }

    /** Affecte des étudiants (par index) à un quiz. */
    private function assign(Quiz $quiz, $students, array $indexes): void
    {
        foreach ($indexes as $i) {
            QuizAssignment::firstOrCreate([
                'quiz_id' => $quiz->id,
                'user_id' => $students[$i]->id,
            ]);
        }
    }

    /**
     * Crée une session TERMINÉE pour un étudiant, avec ses réponses,
     * et calcule le score (somme des points des questions réussies).
     */
    private function completeSession(Quiz $quiz, User $student, array $correctQuestionIndexes): void
    {
        // Garde-fou : ne pas recréer une session existante.
        $exists = QuizSession::where('quiz_id', $quiz->id)
            ->where('user_id', $student->id)
            ->exists();
        if ($exists) {
            return;
        }

        $questions = $quiz->questions()->with('answers')->get();

        $session = QuizSession::create([
            'started_at' => now()->subHours(rand(1, 72)),
            'status' => QuizSession::STATUS_TERMINE,
            'score' => 0,
            'user_id' => $student->id,
            'quiz_id' => $quiz->id,
            'current_question_id' => null,
        ]);

        $score = 0;

        foreach ($questions as $index => $question) {
            $answerCorrectly = in_array($index, $correctQuestionIndexes, true);

            $chosen = $answerCorrectly
                ? $question->answers->firstWhere('is_correct', true)
                : $question->answers->firstWhere('is_correct', false);

            if (! $chosen) {
                continue;
            }

            StudentResponse::create([
                'answered_at' => now(),
                'session_id' => $session->id,
                'question_id' => $question->id,
                'answer_id' => $chosen->id,
            ]);

            if ($chosen->is_correct) {
                $score += $question->points;
            }
        }

        $session->update(['score' => $score]);
    }
}