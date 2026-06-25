<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Student\DashboardController;
use App\Http\Controllers\Student\QuizController;
use App\Http\Controllers\Student\ResultController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Espace Enseignant
    Route::middleware('role:enseignant')->group(function () {

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
