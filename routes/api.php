<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SoundController;
use App\Http\Controllers\EventController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes d'authentification publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes publiques pour les catégories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Routes publiques pour les sons
Route::get('/sounds', [SoundController::class, 'index']);
Route::get('/sounds/{sound}', [SoundController::class, 'show']);
Route::get('/sounds/categories/list', [SoundController::class, 'getCategories']);

// Routes publiques pour les événements
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

// Routes protégées par l'authentification
Route::middleware('auth:sanctum')->group(function () {
    // Informations utilisateur
    Route::get('/user', [AuthController::class, 'user']);

    // Déconnexion
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    // Gestion du profil
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/photo', [AuthController::class, 'updateProfilePhoto']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Gestion des catégories (admin uniquement)
    Route::middleware('admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::post('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus']);
        Route::post('/categories/reorder', [CategoryController::class, 'reorder']);
    });

    // Gestion des sons (utilisateurs authentifiés)
    Route::post('/sounds', [SoundController::class, 'store']);
    Route::put('/sounds/{sound}', [SoundController::class, 'update']);
    Route::delete('/sounds/{sound}', [SoundController::class, 'destroy']);
    Route::get('/sounds/{sound}/download', [SoundController::class, 'download']);

    // Gestion des événements (utilisateurs authentifiés)
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);
    Route::post('/events/{event}/register', [EventController::class, 'register']);
});

// Route pour vérifier le statut de l'API
Route::get('/status', function () {
    return response()->json([
        'status' => 'active',
        'message' => 'API Reveil4artist fonctionnelle',
        'version' => '1.0.0',
        'timestamp' => now()
    ]);
});

// Route de test pour vérifier le stockage
Route::get('/test-storage', function () {
    $publicPath = public_path('storage');
    $storagePath = storage_path('app/public');

    return response()->json([
        'public_path_exists' => file_exists($publicPath),
        'storage_path_exists' => file_exists($storagePath),
        'public_path' => $publicPath,
        'storage_path' => $storagePath,
        'is_link' => is_link($publicPath),
        'php_os' => PHP_OS_FAMILY
    ]);
});
