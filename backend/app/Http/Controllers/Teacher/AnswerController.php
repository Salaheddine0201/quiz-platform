<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreAnswerRequest;
use App\Http\Requests\Teacher\UpdateAnswerRequest;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    /**
     * Ajoute une réponse à une question.
     */
    public function store(StoreAnswerRequest $request, Question $question)
    {
        if ($response = $this->denyUnlessQuestionOwner($request, $question)) {
            return $response;
        }

        $answer = $question->answers()->create($request->validated());

        return response()->json([
            'message' => 'Réponse ajoutée avec succès.',
            'answer' => $this->formatAnswer($answer),
        ], 201);
    }

    /**
     * Met à jour une réponse.
     */
    public function update(UpdateAnswerRequest $request, Answer $answer)
    {
        if ($response = $this->denyUnlessAnswerOwner($request, $answer)) {
            return $response;
        }

        $validated = $request->validated();

        // Empêcher de retirer la dernière bonne réponse
        if (isset($validated['is_correct']) && $validated['is_correct'] === false && $answer->is_correct) {
            $otherCorrectExists = $answer->question->answers()
                ->where('id', '!=', $answer->id)
                ->where('is_correct', true)
                ->exists();

            if (!$otherCorrectExists) {
                return response()->json([
                    'message' => 'La question doit avoir au moins une réponse correcte.',
                ], 422);
            }
        }

        $answer->update($validated);

        return response()->json([
            'message' => 'Réponse mise à jour avec succès.',
            'answer' => $this->formatAnswer($answer->fresh()),
        ]);
    }

    /**
     * Supprime une réponse.
     */
    public function destroy(Request $request, Answer $answer)
    {
        if ($response = $this->denyUnlessAnswerOwner($request, $answer)) {
            return $response;
        }

        if ($answer->question->answers()->count() <= 2) {
            return response()->json([
                'message' => 'Une question doit conserver au moins 2 réponses.',
            ], 422);
        }

        if ($answer->is_correct) {
            $otherCorrectExists = $answer->question->answers()
                ->where('id', '!=', $answer->id)
                ->where('is_correct', true)
                ->exists();

            if (!$otherCorrectExists) {
                return response()->json([
                    'message' => 'Impossible de supprimer la seule réponse correcte.',
                ], 422);
            }
        }

        $answer->delete();

        return response()->json(['message' => 'Réponse supprimée avec succès.']);
    }

    private function denyUnlessQuestionOwner(Request $request, Question $question)
    {
        $question->loadMissing('quiz');

        if ($question->quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function denyUnlessAnswerOwner(Request $request, Answer $answer)
    {
        $answer->loadMissing('question.quiz');

        if ($answer->question->quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }

    private function formatAnswer(Answer $answer): array
    {
        return [
            'id' => $answer->id,
            'text_content' => $answer->text_content,
            'is_correct' => $answer->is_correct,
        ];
    }
}
