<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreQuestionRequest;
use App\Http\Requests\Teacher\UpdateQuestionRequest;
use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /**
     * Ajoute une question (avec ses réponses) à un quiz.
     */
    public function store(StoreQuestionRequest $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessQuizOwner($request, $quiz)) {
            return $response;
        }

        $validated = $request->validated();

        $question = DB::transaction(function () use ($quiz, $validated) {
            $question = $quiz->questions()->create([
                'text_content' => $validated['text_content'],
                'points' => $validated['points'],
                'penalty_points' => $validated['penalty_points'] ?? 0,
            ]);

            foreach ($validated['answers'] as $answerData) {
                $question->answers()->create([
                    'text_content' => $answerData['text_content'],
                    'is_correct' => $answerData['is_correct'],
                ]);
            }

            return $question->load('answers');
        });

        return response()->json([
            'message' => 'Question ajoutée avec succès.',
            'question' => $this->formatQuestion($question),
        ], 201);
    }

    /**
     * Met à jour une question.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        if ($response = $this->denyUnlessQuestionOwner($request, $question)) {
            return $response;
        }

        $question->update($request->validated());

        return response()->json([
            'message' => 'Question mise à jour avec succès.',
            'question' => $this->formatQuestion($question->fresh()->load('answers')),
        ]);
    }

    /**
     * Supprime une question et ses réponses.
     */
    public function destroy(Request $request, Question $question)
    {
        if ($response = $this->denyUnlessQuestionOwner($request, $question)) {
            return $response;
        }

        $question->delete();

        return response()->json(['message' => 'Question supprimée avec succès.']);
    }

    private function denyUnlessQuizOwner(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function denyUnlessQuestionOwner(Request $request, Question $question)
    {
        $question->loadMissing('quiz');

        if ($question->quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function formatQuestion(Question $question): array
    {
        return [
            'id' => $question->id,
            'text_content' => $question->text_content,
            'points' => $question->points,
            'penalty_points' => $question->penalty_points,
            'answers' => $question->answers->map(fn (Answer $answer) => [
                'id' => $answer->id,
                'text_content' => $answer->text_content,
                'is_correct' => $answer->is_correct,
            ]),
        ];
    }
}
