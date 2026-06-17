<?php


namespace Database\Seeders;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use App\Models\QuizAssignment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class QuizPlatformTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a Teacher
        $teacher = User::create([
            'name' => 'Professor Smith',
            'email' => 'teacher@test.com',
            'password' => Hash::make('password123'),
            'role' => 'teacher',
        ]);

        // 2. Create a Student
        $student = User::create([
            'name' => 'Alex Doe',
            'email' => 'student@test.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
        ]);

        // 3. Attach the student to the teacher (Pivot Table)
        $teacher->students()->attach($student->id);

        // 4. Create a Quiz (Total potential points = 3)
        $quiz = Quiz::create([
            'teacher_id' => $teacher->id,
            'title' => 'Laravel Basics Quiz',
            'description' => 'A short test on fundamental Laravel concepts.',
            'time_limit' => 15,
        ]);

        // 5. Question 1 (Worth 1 point)
        $q1 = Question::create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Which tool is used to handle database migrations in Laravel?',
            'points' => 1,
        ]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => 'Composer', 'is_correct' => false]);
        Answer::create(['question_id' => $q1->id, 'answer_text' => 'Artisan', 'is_correct' => true]); // Correct
        Answer::create(['question_id' => $q1->id, 'answer_text' => 'NPM', 'is_correct' => false]);

        // 6. Question 2 (Worth 2 points)
        $q2 = Question::create([
            'quiz_id' => $quiz->id,
            'question_text' => 'What type of relationship is defined by the belongsToMany method?',
            'points' => 2,
        ]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => 'One-to-One', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => 'One-to-Many', 'is_correct' => false]);
        Answer::create(['question_id' => $q2->id, 'answer_text' => 'Many-to-Many', 'is_correct' => true]); // Correct

        // 7. Effect (Assign) the Quiz to the Student
        QuizAssignment::create([
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'score' => null, // Stays null until they submit
            'status' => 'assigned',
        ]);

        $this->command->info('Fake data populated successfully! Log in as student@test.com to test.');
    }
}
