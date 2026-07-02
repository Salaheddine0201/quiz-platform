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
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Crée un jeu de données complet pour tester l'espace étudiant :
     * - 1 enseignant + 1 étudiant
     * - 3 quiz (Maths, Physique, Histoire) avec 5 questions chacun
     * - Affectations quiz → étudiant
     * - 1 session terminée (pour tester les résultats)
     */
    public function run(): void
    {
        // ================================================================
        // 1. UTILISATEURS
        // ================================================================

        $enseignant = User::create([
            'name' => 'Prof. Ahmed Benali',
            'email' => 'prof@quizmaster.com',
            'password' => Hash::make('Password1'),
            'role' => User::ROLE_ENSEIGNANT,
        ]);

        $etudiant = User::create([
            'name' => 'Sophie Martin',
            'email' => 'etudiant@quizmaster.com',
            'password' => Hash::make('Password1'),
            'role' => User::ROLE_ETUDIANT,
        ]);

        // ================================================================
        // 2. QUIZ DE MATHÉMATIQUES (standard, 30 min, expire dans 30 jours)
        // ================================================================

        $quizMaths = Quiz::create([
            'title' => 'Mathématiques — Chapitre 4',
            'description' => 'Évaluation sur les fonctions trigonométriques et les limites.',
            'duration_minutes' => 30,
            'starts_at' => now()->subDays(1),
            'expires_at' => now()->addDays(30),
            'grading_system' => Quiz::GRADING_STANDARD,
            'user_id' => $enseignant->id,
        ]);

        $this->createMathQuestions($quizMaths);

        // ================================================================
        // 3. QUIZ DE PHYSIQUE (canadien avec pénalités, 60 min)
        // ================================================================

        $quizPhysique = Quiz::create([
            'title' => 'Physique — Mécanique newtonienne',
            'description' => 'Quiz sur les lois de Newton et la cinématique.',
            'duration_minutes' => 45,
            'starts_at' => now()->subDays(2),
            'expires_at' => now()->addDays(15),
            'grading_system' => Quiz::GRADING_CANADIEN,
            'user_id' => $enseignant->id,
        ]);

        $this->createPhysicsQuestions($quizPhysique);

        // ================================================================
        // 4. QUIZ D'HISTOIRE (standard, 25 min)
        // ================================================================

        $quizHistoire = Quiz::create([
            'title' => 'Histoire — La Révolution française',
            'description' => 'Évaluation sur les événements majeurs de la Révolution française.',
            'duration_minutes' => 25,
            'starts_at' => now()->addDays(2),
            'expires_at' => now()->addDays(45),
            'grading_system' => Quiz::GRADING_STANDARD,
            'user_id' => $enseignant->id,
        ]);

        $this->createHistoryQuestions($quizHistoire);

        // ================================================================
        // 5. AFFECTATIONS (RG-04 : quiz → étudiant)
        // ================================================================

        QuizAssignment::create(['quiz_id' => $quizMaths->id, 'user_id' => $etudiant->id]);
        QuizAssignment::create(['quiz_id' => $quizPhysique->id, 'user_id' => $etudiant->id]);
        QuizAssignment::create(['quiz_id' => $quizHistoire->id, 'user_id' => $etudiant->id]);

        // ================================================================
        // 6. SESSION TERMINÉE (pour tester la page résultats)
        // ================================================================

        $this->createCompletedSession($quizHistoire, $etudiant);

        // ================================================================
        // RÉSUMÉ
        // ================================================================

        $this->command->info('');
        $this->command->info('╔═══════════════════════════════════════════════════╗');
        $this->command->info('║          🎓 SEED TERMINÉ AVEC SUCCÈS !           ║');
        $this->command->info('╠═══════════════════════════════════════════════════╣');
        $this->command->info('║                                                   ║');
        $this->command->info('║  👨‍🏫 Enseignant :                                 ║');
        $this->command->info('║     Email : prof@quizmaster.com                   ║');
        $this->command->info('║     MDP   : Password1                             ║');
        $this->command->info('║                                                   ║');
        $this->command->info('║  👩‍🎓 Étudiant :                                   ║');
        $this->command->info('║     Email : etudiant@quizmaster.com               ║');
        $this->command->info('║     MDP   : Password1                             ║');
        $this->command->info('║                                                   ║');
        $this->command->info('║  📝 3 Quiz créés (Maths, Physique, Histoire)      ║');
        $this->command->info('║  📊 1 Session terminée (Histoire) pour résultats  ║');
        $this->command->info('║  🎯 2 Quiz en attente à passer                   ║');
        $this->command->info('║                                                   ║');
        $this->command->info('╚═══════════════════════════════════════════════════╝');
        $this->command->info('');
    }

    // ====================================================================
    // QUESTIONS DE MATHÉMATIQUES (5 questions, 4 points chacune = 20 pts)
    // ====================================================================

    private function createMathQuestions(Quiz $quiz): void
    {
        // Question 1
        $q1 = Question::create(['text_content' => 'Combien vaut π arrondi à deux décimales ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '3.12', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '3.14', 'is_correct' => true, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '3.16', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '3.41', 'is_correct' => false, 'question_id' => $q1->id]);

        // Question 2
        $q2 = Question::create(['text_content' => 'Quelle est la dérivée de f(x) = x² ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'f\'(x) = x', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'f\'(x) = 2x', 'is_correct' => true, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'f\'(x) = 2', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'f\'(x) = x²', 'is_correct' => false, 'question_id' => $q2->id]);

        // Question 3
        $q3 = Question::create(['text_content' => 'Résoudre : 2x + 6 = 0', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'x = 3', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'x = -3', 'is_correct' => true, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'x = 6', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'x = -6', 'is_correct' => false, 'question_id' => $q3->id]);

        // Question 4
        $q4 = Question::create(['text_content' => 'Quelle est la limite de 1/x quand x → +∞ ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '1', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '+∞', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '0', 'is_correct' => true, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '-∞', 'is_correct' => false, 'question_id' => $q4->id]);

        // Question 5
        $q5 = Question::create(['text_content' => 'Combien vaut sin(π/2) ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '0', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => '1', 'is_correct' => true, 'question_id' => $q5->id]);
        Answer::create(['text_content' => '-1', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => '√2/2', 'is_correct' => false, 'question_id' => $q5->id]);
    }

    // ====================================================================
    // QUESTIONS DE PHYSIQUE (5 questions, système canadien avec pénalités)
    // ====================================================================

    private function createPhysicsQuestions(Quiz $quiz): void
    {
        // Question 1
        $q1 = Question::create(['text_content' => 'Quelle est l\'unité de la force dans le SI ?', 'points' => 4, 'penalty_points' => 1, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'Joule', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => 'Newton', 'is_correct' => true, 'question_id' => $q1->id]);
        Answer::create(['text_content' => 'Watt', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => 'Pascal', 'is_correct' => false, 'question_id' => $q1->id]);

        // Question 2
        $q2 = Question::create(['text_content' => 'F = m × a est la formulation de quelle loi ?', 'points' => 4, 'penalty_points' => 1, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'Première loi de Newton', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Deuxième loi de Newton', 'is_correct' => true, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Troisième loi de Newton', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Loi de la gravitation', 'is_correct' => false, 'question_id' => $q2->id]);

        // Question 3
        $q3 = Question::create(['text_content' => 'Quelle est la valeur de g sur Terre (m/s²) ?', 'points' => 4, 'penalty_points' => 1, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '8.81', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => '9.81', 'is_correct' => true, 'question_id' => $q3->id]);
        Answer::create(['text_content' => '10.81', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => '9.18', 'is_correct' => false, 'question_id' => $q3->id]);

        // Question 4
        $q4 = Question::create(['text_content' => 'Quel est le poids d\'un objet de 10 kg sur Terre ?', 'points' => 4, 'penalty_points' => 1, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '10 N', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '98.1 N', 'is_correct' => true, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '100 N', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => '9.81 N', 'is_correct' => false, 'question_id' => $q4->id]);

        // Question 5
        $q5 = Question::create(['text_content' => 'Qu\'est-ce que l\'inertie ?', 'points' => 4, 'penalty_points' => 1, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'La capacité à accélérer', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'La résistance au changement de mouvement', 'is_correct' => true, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'La force de friction', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'L\'énergie cinétique', 'is_correct' => false, 'question_id' => $q5->id]);
    }

    // ====================================================================
    // QUESTIONS D'HISTOIRE (5 questions, 4 points chacune = 20 pts)
    // ====================================================================

    private function createHistoryQuestions(Quiz $quiz): void
    {
        // Question 1
        $q1 = Question::create(['text_content' => 'En quelle année a eu lieu la prise de la Bastille ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => '1787', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '1789', 'is_correct' => true, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '1791', 'is_correct' => false, 'question_id' => $q1->id]);
        Answer::create(['text_content' => '1793', 'is_correct' => false, 'question_id' => $q1->id]);

        // Question 2
        $q2 = Question::create(['text_content' => 'Qui était le roi de France au début de la Révolution ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'Louis XIV', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Louis XV', 'is_correct' => false, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Louis XVI', 'is_correct' => true, 'question_id' => $q2->id]);
        Answer::create(['text_content' => 'Napoléon', 'is_correct' => false, 'question_id' => $q2->id]);

        // Question 3
        $q3 = Question::create(['text_content' => 'Quel document proclame les droits fondamentaux en 1789 ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'Le Code civil', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'La Déclaration des droits de l\'homme et du citoyen', 'is_correct' => true, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'La Constitution de 1791', 'is_correct' => false, 'question_id' => $q3->id]);
        Answer::create(['text_content' => 'Le Traité de Versailles', 'is_correct' => false, 'question_id' => $q3->id]);

        // Question 4
        $q4 = Question::create(['text_content' => 'Quel événement marque le début de la Terreur ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'La prise de la Bastille', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => 'L\'exécution de Louis XVI', 'is_correct' => true, 'question_id' => $q4->id]);
        Answer::create(['text_content' => 'Le serment du Jeu de Paume', 'is_correct' => false, 'question_id' => $q4->id]);
        Answer::create(['text_content' => 'La fuite à Varennes', 'is_correct' => false, 'question_id' => $q4->id]);

        // Question 5
        $q5 = Question::create(['text_content' => 'Qui était le leader du Comité de salut public pendant la Terreur ?', 'points' => 4, 'penalty_points' => 0, 'quiz_id' => $quiz->id]);
        Answer::create(['text_content' => 'Danton', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'Robespierre', 'is_correct' => true, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'Marat', 'is_correct' => false, 'question_id' => $q5->id]);
        Answer::create(['text_content' => 'Lafayette', 'is_correct' => false, 'question_id' => $q5->id]);
    }

    // ====================================================================
    // SESSION TERMINÉE (Histoire — note 17/20 pour tester les résultats)
    // ====================================================================

    private function createCompletedSession(Quiz $quiz, User $etudiant): void
    {
        $questions = $quiz->questions()->orderBy('id')->get();

        $session = QuizSession::create([
            'started_at' => now()->subHours(2),
            'status' => QuizSession::STATUS_TERMINE,
            'score' => 0, // sera calculé ci-dessous
            'user_id' => $etudiant->id,
            'quiz_id' => $quiz->id,
            'current_question_id' => null,
        ]);

        $score = 0;

        foreach ($questions as $index => $question) {
            $answers = $question->answers;

            // L'étudiant répond correctement aux 4 premières, se trompe sur la 5ème
            if ($index < 4) {
                $selectedAnswer = $answers->firstWhere('is_correct', true);
                $score += $question->points;
            } else {
                $selectedAnswer = $answers->firstWhere('is_correct', false);
            }

            StudentResponse::create([
                'answered_at' => now()->subHours(2)->addMinutes(($index + 1) * 4),
                'session_id' => $session->id,
                'question_id' => $question->id,
                'answer_id' => $selectedAnswer->id,
            ]);
        }

        // Mettre à jour le score (16/20 points bruts = 16.0 sur 20)
        $session->update(['score' => $score]);
    }
}
