<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Espace Enseignant
    Route::middleware('role:enseignant')->group(function () {
        // Ajouter ici les routes réservées aux enseignants (ex: CRUD des quiz)
    });

    // Espace Étudiant
    Route::middleware('role:etudiant')->group(function () {
        // Ajouter ici les routes réservées aux étudiants (ex: Passer un quiz)
    });
});
