<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SoundController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\SoundController as ApiSoundController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\ClipController;
use App\Http\Controllers\CompetitionController;
use App\Http\Controllers\CompetitionPaymentController;

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

// Route pour les statistiques générales (accueil)
Route::get('/stats', [ApiSoundController::class, 'getGlobalStats']);

// Routes publiques pour les sons - NOUVELLE API
Route::prefix('sounds')->group(function () {
    Route::get('/', [ApiSoundController::class, 'index'])->name('api.sounds.index');
    Route::get('/featured', [ApiSoundController::class, 'featured'])->name('api.sounds.featured');
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
        Route::post('/{id}/download', [ApiSoundController::class, 'download'])->name('api.sounds.download')->where('id', '[0-9]+');

        // Routes d'administration pour les sons (admin uniquement)
        Route::middleware('admin')->group(function () {
            Route::post('/{id}/approve', [ApiSoundController::class, 'approve'])->name('api.sounds.approve')->where('id', '[0-9]+');
            Route::post('/{id}/reject', [ApiSoundController::class, 'reject'])->name('api.sounds.reject')->where('id', '[0-9]+');
        });
    });
});

// Routes publiques pour les sons - ANCIENNE API (maintenue pour compatibilité)
Route::get('/sounds-legacy', [SoundController::class, 'index']);
Route::get('/sounds-legacy/{sound}', [SoundController::class, 'show']);
Route::get('/sounds/categories/list', [SoundController::class, 'getCategories']);

// Routes publiques pour les événements
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

// Routes publiques pour les clips vidéos
Route::prefix('clips')->group(function () {
    Route::get('/', [ClipController::class, 'index'])->name('api.clips.index');
    Route::get('/categories', [ClipController::class, 'getCategories'])->name('api.clips.categories');
    Route::get('/{id}', [ClipController::class, 'show'])->name('api.clips.show')->where('id', '[0-9]+');
    Route::post('/{id}/share', [ClipController::class, 'share'])->name('api.clips.share')->where('id', '[0-9]+');

    // Routes publiques pour les commentaires
    Route::get('/{id}/comments', [ClipController::class, 'getComments'])->name('api.clips.comments')->where('id', '[0-9]+');

    // Routes authentifiées pour les clips
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [ClipController::class, 'store'])->name('api.clips.store')->middleware('can_upload_clips');
        Route::put('/{id}', [ClipController::class, 'update'])->name('api.clips.update')->where('id', '[0-9]+');
        Route::delete('/{id}', [ClipController::class, 'destroy'])->name('api.clips.destroy')->where('id', '[0-9]+');
        Route::post('/{id}/like', [ClipController::class, 'toggleLike'])->name('api.clips.like')->where('id', '[0-9]+');
        Route::post('/{id}/bookmark', [ClipController::class, 'toggleBookmark'])->name('api.clips.bookmark')->where('id', '[0-9]+');

        // Routes pour les commentaires
        Route::post('/{id}/comments', [ClipController::class, 'addComment'])->name('api.clips.comments.store')->where('id', '[0-9]+');
    });
});

// Routes pour les commentaires (likes)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/comments/{id}/like', [ClipController::class, 'toggleCommentLike'])->name('api.comments.like')->where('id', '[0-9]+');
});

// Routes publiques pour les compétitions
Route::prefix('competitions')->group(function () {
    Route::get('/', [CompetitionController::class, 'index'])->name('api.competitions.index');
    Route::get('/categories', [CompetitionController::class, 'getCategories'])->name('api.competitions.categories');
    Route::get('/upcoming', [CompetitionController::class, 'upcoming'])->name('api.competitions.upcoming');
    Route::get('/popular', [CompetitionController::class, 'popular'])->name('api.competitions.popular');
    Route::get('/{id}', [CompetitionController::class, 'show'])->name('api.competitions.show')->where('id', '[0-9]+');

    // Routes authentifiées pour les compétitions
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [CompetitionController::class, 'store'])->name('api.competitions.store')->middleware('can_upload_clips');
        Route::put('/{id}', [CompetitionController::class, 'update'])->name('api.competitions.update')->where('id', '[0-9]+');
        Route::delete('/{id}', [CompetitionController::class, 'destroy'])->name('api.competitions.destroy')->where('id', '[0-9]+');
        Route::post('/{id}/register', [CompetitionController::class, 'register'])->name('api.competitions.register')->where('id', '[0-9]+');
        Route::delete('/{id}/unregister', [CompetitionController::class, 'unregister'])->name('api.competitions.unregister')->where('id', '[0-9]+');
    });
});

// Routes publiques pour les artistes
Route::prefix('artists')->group(function () {
    Route::get('/', [UserController::class, 'getArtists'])->name('api.artists.index');
    Route::get('/{id}', [UserController::class, 'getArtist'])->name('api.artists.show')->where('id', '[0-9]+');
    Route::get('/{id}/clips', [ClipController::class, 'getArtistClips'])->name('api.artists.clips')->where('id', '[0-9]+');
    Route::get('/{id}/competitions', [CompetitionController::class, 'getArtistCompetitions'])->name('api.artists.competitions')->where('id', '[0-9]+');

    // Routes authentifiées pour les artistes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{id}/follow', [UserController::class, 'toggleFollow'])->name('api.artists.follow')->where('id', '[0-9]+');
    });
});

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

    // Routes pour l'utilisateur connecté
    Route::prefix('user')->group(function () {
        Route::get('/clips', [ClipController::class, 'getUserClips'])->name('api.user.clips');
        Route::get('/competitions', [CompetitionController::class, 'getUserCompetitions'])->name('api.user.competitions');
        Route::get('/sounds', [ApiSoundController::class, 'getUserSounds'])->name('api.user.sounds');
        Route::get('/purchases', [ApiSoundController::class, 'getUserPurchases'])->name('api.user.purchases');
        Route::get('/favorites', [ApiSoundController::class, 'getUserFavorites'])->name('api.user.favorites');
        Route::get('/stats', [UserController::class, 'getUserStats'])->name('api.user.stats');

        // Ajouter les routes manquantes pour le Profile
        Route::get('/purchased-sounds', [UserController::class, 'getPurchasedSounds'])->name('api.user.purchased-sounds');
        Route::get('/favorite-sounds', [UserController::class, 'getFavoriteSounds'])->name('api.user.favorite-sounds');
        Route::get('/followed-artists', [UserController::class, 'getFollowedArtists'])->name('api.user.followed-artists');
        Route::get('/purchased-events', [UserController::class, 'getPurchasedEvents'])->name('api.user.purchased-events');
    });

    // Routes d'administration (admin uniquement)
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        // Gestion des sons
        Route::post('/sounds/{id}/approve', [AdminController::class, 'approveSound']);
        Route::post('/sounds/{id}/reject', [AdminController::class, 'rejectSound']);

        // Gestion des utilisateurs
        Route::get('/users', [UserController::class, 'index'])->name('api.admin.users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('api.admin.users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('api.admin.users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('api.admin.users.destroy');
    });

    // Gestion des sons (utilisateurs authentifiés) - ANCIENNE API
    Route::post('/sounds-legacy', [SoundController::class, 'store']);
    Route::put('/sounds-legacy/{sound}', [SoundController::class, 'update']);
    Route::delete('/sounds-legacy/{sound}', [SoundController::class, 'destroy']);
    Route::get('/sounds-legacy/{sound}/download', [SoundController::class, 'download']);
});

// Routes de test pour développement uniquement
if (config('app.debug')) {
    Route::get('/test-auth', function (Request $request) {
        try {
            $user = $request->user();
            return response()->json([
                'success' => true,
                'message' => 'Test d\'authentification réussi',
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ] : null,
                'authenticated' => !!$user,
                'token_present' => $request->bearerToken() ? 'YES' : 'NO'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur test auth',
                'error' => $e->getMessage()
            ], 500);
        }
    })->middleware('auth:sanctum');
}

// Route pour vérifier le statut de l'API
Route::get('/status', function () {
    return response()->json([
        'status' => 'active',
        'message' => 'API Reveil4artist fonctionnelle',
        'version' => '1.0.0',
        'timestamp' => now()
    ]);
});
