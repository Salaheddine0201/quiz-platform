<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Recherche des étudiants pour l'assignation de quiz.
     *
     * Query params :
     * - search : filtre par nom ou email
     * - quiz_id : exclut les étudiants déjà assignés à ce quiz
     */
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'quiz_id' => ['nullable', 'integer', 'exists:quizzes,id'],
        ]);

        $query = User::where('role', User::ROLE_ETUDIANT);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($quizId = $request->query('quiz_id')) {
            $quiz = Quiz::find($quizId);

            if (!$quiz || $quiz->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Quiz introuvable.'], 404);
            }

            $assignedIds = $quiz->assignedUsers()->pluck('users.id');
            $query->whereNotIn('id', $assignedIds);
        }

        $students = $query->orderBy('name')->limit(20)->get(['id', 'name', 'email']);

        return response()->json(['students' => $students]);
    }
}
