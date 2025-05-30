<?php

use Illuminate\Support\Facades\Route;

// Route principale pour l'application React SPA
Route::get('/', function () {
    return view('app');
});

// Routes SPA - toutes les routes frontend sont gérées par React Router
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Routes API (optionnelles pour plus tard)
Route::prefix('api')->group(function () {
    // Routes API pour les sons, utilisateurs, etc.
    // Route::apiResource('sounds', SoundController::class);
    // Route::apiResource('categories', CategoryController::class);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});
