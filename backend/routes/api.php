<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\QuizController;
use App\Http\Controllers\Student\ResultController;
use App\Http\Controllers\Teacher\AnswerController as TeacherAnswerController;
use App\Http\Controllers\Teacher\AssignmentController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\QuestionController;
use App\Http\Controllers\Teacher\QuizController as TeacherQuizController;
use App\Http\Controllers\Teacher\SessionController;
use App\Http\Controllers\Teacher\StudentController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Espace Enseignant
    Route::middleware('role:enseignant')->prefix('teacher')->group(function () {

        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);

        Route::get('/quizzes', [TeacherQuizController::class, 'index']);
        Route::post('/quizzes', [TeacherQuizController::class, 'store']);
        Route::get('/quizzes/{quiz}', [TeacherQuizController::class, 'show']);
        Route::put('/quizzes/{quiz}', [TeacherQuizController::class, 'update']);
        Route::delete('/quizzes/{quiz}', [TeacherQuizController::class, 'destroy']);

        Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store']);
        Route::put('/questions/{question}', [QuestionController::class, 'update']);
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);

        Route::post('/questions/{question}/answers', [TeacherAnswerController::class, 'store']);
        Route::put('/answers/{answer}', [TeacherAnswerController::class, 'update']);
        Route::delete('/answers/{answer}', [TeacherAnswerController::class, 'destroy']);

        Route::get('/quizzes/{quiz}/assignments', [AssignmentController::class, 'index']);
        Route::post('/quizzes/{quiz}/assignments', [AssignmentController::class, 'store']);
        Route::delete('/quizzes/{quiz}/assignments/{user}', [AssignmentController::class, 'destroy']);

        Route::get('/students', [StudentController::class, 'index']);

        Route::get('/quizzes/{quiz}/sessions', [SessionController::class, 'index']);
        Route::get('/quizzes/{quiz}/sessions/{session}', [SessionController::class, 'show']);
    });

    // Espace Étudiant
    Route::middleware('role:etudiant')->prefix('student')->group(function () {

        // Tableau de bord
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Quiz — Passation
        Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
        Route::post('/quizzes/{quiz}/start', [QuizController::class, 'start']);
        Route::get('/sessions/{session}/questions/{question}', [QuizController::class, 'getQuestion']);
        Route::post('/sessions/{session}/questions/{question}/answer', [QuizController::class, 'submitAnswer']);
        Route::post('/sessions/{session}/finish', [QuizController::class, 'finish']);

        // Résultats
        Route::get('/results', [ResultController::class, 'index']);
        Route::get('/results/{session}', [ResultController::class, 'show']);
    });
});
