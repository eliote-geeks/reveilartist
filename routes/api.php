<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SoundController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\SoundController as ApiSoundController;

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

// Routes publiques pour les sons - NOUVELLE API
Route::prefix('sounds')->group(function () {
    Route::get('/', [ApiSoundController::class, 'index'])->name('api.sounds.index');
    Route::get('/popular', [ApiSoundController::class, 'popular'])->name('api.sounds.popular');
    Route::get('/recent', [ApiSoundController::class, 'recent'])->name('api.sounds.recent');
    Route::get('/search', [ApiSoundController::class, 'search'])->name('api.sounds.search');
    Route::get('/{id}', [ApiSoundController::class, 'show'])->name('api.sounds.show')->where('id', '[0-9]+');
    Route::get('/{id}/preview', [ApiSoundController::class, 'preview'])->name('api.sounds.preview')->where('id', '[0-9]+');

    // Routes authentifiées pour les likes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{id}/like', [ApiSoundController::class, 'toggleLike'])->name('api.sounds.like')->where('id', '[0-9]+');
        Route::post('/likes/status', [ApiSoundController::class, 'getLikesStatus'])->name('api.sounds.likes.status');

        // Routes CRUD pour la gestion des sons
        Route::post('/', [ApiSoundController::class, 'store'])->name('api.sounds.store');
        Route::put('/{id}', [ApiSoundController::class, 'update'])->name('api.sounds.update')->where('id', '[0-9]+');
        Route::delete('/{id}', [ApiSoundController::class, 'destroy'])->name('api.sounds.destroy')->where('id', '[0-9]+');
        Route::get('/{id}/download', [ApiSoundController::class, 'download'])->name('api.sounds.download')->where('id', '[0-9]+');
    });
});

// Routes publiques pour les sons - ANCIENNE API (maintenue pour compatibilité)
Route::get('/sounds-legacy', [SoundController::class, 'index']);
Route::get('/sounds-legacy/{sound}', [SoundController::class, 'show']);
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

    // Gestion des sons (utilisateurs authentifiés) - ANCIENNE API
    Route::post('/sounds-legacy', [SoundController::class, 'store']);
    Route::put('/sounds-legacy/{sound}', [SoundController::class, 'update']);
    Route::delete('/sounds-legacy/{sound}', [SoundController::class, 'destroy']);
    Route::get('/sounds-legacy/{sound}/download', [SoundController::class, 'download']);

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
