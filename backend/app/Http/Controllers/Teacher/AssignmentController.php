<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreAssignmentRequest;
use App\Models\Quiz;
use App\Models\QuizAssignment;
use App\Models\User;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * Liste les étudiants assignés à un quiz.
     */
    public function index(Request $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        $students = $quiz->assignedUsers()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'assigned_at' => $user->pivot->created_at->toDateTimeString(),
            ]);

        return response()->json(['assignments' => $students]);
    }

    /**
     * Assigne un quiz à un ou plusieurs étudiants.
     */
    public function store(StoreAssignmentRequest $request, Quiz $quiz)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        if ($quiz->questions()->count() === 0) {
            return response()->json([
                'message' => 'Ajoutez au moins une question avant d\'assigner ce quiz.',
            ], 422);
        }

        $userIds = $request->validated()['user_ids'];
        $students = User::whereIn('id', $userIds)
            ->where('role', User::ROLE_ETUDIANT)
            ->get();

        if ($students->count() !== count($userIds)) {
            return response()->json([
                'message' => 'Un ou plusieurs utilisateurs sélectionnés ne sont pas des étudiants.',
            ], 422);
        }

        $alreadyAssigned = $quiz->assignedUsers()
            ->whereIn('users.id', $userIds)
            ->pluck('users.id')
            ->toArray();

        $newStudentIds = array_diff($userIds, $alreadyAssigned);

        foreach ($newStudentIds as $studentId) {
            QuizAssignment::create([
                'quiz_id' => $quiz->id,
                'user_id' => $studentId,
            ]);
        }

        $assigned = $quiz->assignedUsers()
            ->whereIn('users.id', $userIds)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'assigned_at' => $user->pivot->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'message' => count($newStudentIds) > 0
                ? count($newStudentIds) . ' étudiant(s) assigné(s) avec succès.'
                : 'Ces étudiants étaient déjà assignés à ce quiz.',
            'assigned_count' => count($newStudentIds),
            'assignments' => $assigned,
        ], count($newStudentIds) > 0 ? 201 : 200);
    }

    /**
     * Retire l'assignation d'un étudiant.
     */
    public function destroy(Request $request, Quiz $quiz, User $user)
    {
        if ($response = $this->denyUnlessOwner($request, $quiz)) {
            return $response;
        }

        if ($user->role !== User::ROLE_ETUDIANT) {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un étudiant.'], 422);
        }

        $deleted = QuizAssignment::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Cet étudiant n\'est pas assigné à ce quiz.'], 404);
        }

        return response()->json(['message' => 'Assignation supprimée avec succès.']);
    }

    private function denyUnlessOwner(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return null;
    }
}
