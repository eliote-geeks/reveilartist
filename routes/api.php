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
use App\Http\Controllers\UserClipController;
use App\Http\Controllers\SoundDownloadController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserProfileController;

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

// Routes de diagnostic (à supprimer en production)
Route::prefix('diagnostic')->group(function () {
    Route::get('/sounds', [App\Http\Controllers\DiagnosticController::class, 'testSounds']);
    Route::get('/events', [App\Http\Controllers\DiagnosticController::class, 'testEvents']);
    Route::get('/profile', [App\Http\Controllers\DiagnosticController::class, 'testCompleteProfile']);
    Route::get('/database', [App\Http\Controllers\DiagnosticController::class, 'testDatabase']);
});

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

// Routes authentifiées pour les événements
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events/{event}/favorite', [EventController::class, 'toggleFavorite']);
    Route::get('/events/{event}/favorite', [EventController::class, 'checkFavoriteStatus']);
});

// Routes pour le dashboard admin (en dehors du groupe auth:sanctum principal)
Route::middleware(['auth:sanctum'])->prefix('dashboard')->group(function () {
    Route::get('/stats', [DashboardController::class, 'getStats']);
    Route::get('/sounds', [DashboardController::class, 'getSounds']);
    Route::get('/events', [DashboardController::class, 'getEvents']);
    Route::get('/users', [DashboardController::class, 'getUsers']);
    Route::get('/users-revenue', [DashboardController::class, 'getUsersRevenue']);

    // Routes pour la gestion des paiements dans le dashboard
    Route::get('/users/{userId}/payments', [DashboardController::class, 'getUserPayments']);
    Route::post('/payments/{paymentId}/approve', [DashboardController::class, 'approvePayment']);
    Route::post('/payments/{paymentId}/cancel', [DashboardController::class, 'cancelPayment']);
    Route::post('/payments/{paymentId}/refund', [DashboardController::class, 'refundPayment']);
    Route::post('/payments/batch-action', [DashboardController::class, 'batchPaymentAction']);

    // Routes commission simplifiées
    Route::get('/commission', [DashboardController::class, 'getCommission']);
    Route::post('/commission', [DashboardController::class, 'updateCommission']);
});

// Routes simplifiées pour l'analyse des achats (sans authentification complexe)
Route::prefix('dashboard')->group(function () {
    Route::get('/users-purchases', [DashboardController::class, 'getUsersPurchases']);
    Route::get('/payments/search', [DashboardController::class, 'searchPayments']);
    Route::get('/products/{type}/{productId}/payments', [DashboardController::class, 'getProductPayments']);
    Route::get('/payments/{paymentId}/receipt', [DashboardController::class, 'generateReceipt']);

    // Route de test simple
    Route::get('/test-payments', function () {
        try {
            $payments = \App\Models\Payment::limit(5)->get();
            return response()->json([
                'success' => true,
                'message' => 'Test réussi',
                'count' => $payments->count(),
                'payments' => $payments->map(function($p) {
                    return [
                        'id' => $p->id,
                        'transaction_id' => $p->transaction_id,
                        'amount' => $p->amount,
                        'status' => $p->status
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
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

    // Gestion des utilisateurs pour le dashboard
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('api.users.index');
        Route::get('/stats', [UserController::class, 'stats'])->name('api.users.stats');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('api.users.destroy')->where('id', '[0-9]+');
    });

    // Gestion des notifications utilisateur
    Route::prefix('notifications')->group(function () {
        Route::get('/', [UserController::class, 'getNotifications'])->name('api.notifications.index');
        Route::patch('/{id}/read', [UserController::class, 'markNotificationAsRead'])->name('api.notifications.read')->where('id', '[0-9a-f\-]+');
        Route::patch('/read-all', [UserController::class, 'markAllNotificationsAsRead'])->name('api.notifications.read-all');
        Route::delete('/{id}', [UserController::class, 'deleteNotification'])->name('api.notifications.delete')->where('id', '[0-9a-f\-]+');
    });

    // Routes d'administration (admin uniquement)
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        // Dashboard - Statistiques
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('api.dashboard.index');
        Route::get('/dashboard/export', [DashboardController::class, 'exportStats'])->name('api.dashboard.export');
        Route::get('/dashboard/calculate-commission', [DashboardController::class, 'calculateCommission'])->name('api.dashboard.calculate-commission');

        // Gestion des paiements
        Route::apiResource('payments', PaymentController::class);
        Route::post('/payments/{payment}/complete', [PaymentController::class, 'markAsCompleted'])->name('api.payments.complete');
        Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund'])->name('api.payments.refund');
        Route::get('/payments-stats', [PaymentController::class, 'statistics'])->name('api.payments.stats');
        Route::get('/payments-export', [PaymentController::class, 'export'])->name('api.payments.export');

        // Gestion des utilisateurs
        Route::get('/users', [UserController::class, 'index'])->name('api.admin.users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('api.admin.users.show');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('api.admin.users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('api.admin.users.destroy');

        // Gestion des commissions
        Route::apiResource('commissions', CommissionController::class);
    });

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
    Route::post('/events/{event}/approve', [EventController::class, 'approve']);

    // Routes du profil utilisateur
    Route::prefix('user')->group(function () {
        // Profil utilisateur complet avec achats, favoris, etc.
        Route::get('/profile-complete', [AuthController::class, 'getCompleteProfile'])->name('api.user.profile-complete');

        // Sons et achats de l'utilisateur
        Route::get('/purchased-sounds', [UserController::class, 'getPurchasedSounds'])->name('api.user.purchased-sounds');
        Route::get('/purchased-events', [UserController::class, 'getPurchasedEvents'])->name('api.user.purchased-events');
        Route::get('/sounds', [UserController::class, 'getUserSounds'])->name('api.user.sounds');
        Route::get('/mes-creations', [UserController::class, 'getUserSounds'])->name('api.user.mes-creations');

        // Événements créés par l'utilisateur
        Route::get('/events', [UserController::class, 'getUserEvents'])->name('api.user.events');

        // Revenus et gains de l'utilisateur
        Route::get('/earnings', [UserController::class, 'getUserEarnings'])->name('api.user.earnings');

        // Favoris et relations sociales
        Route::get('/favorite-sounds', [UserController::class, 'getFavoriteSounds'])->name('api.user.favorite-sounds');
        Route::get('/favorite-events', [UserController::class, 'getFavoriteEvents'])->name('api.user.favorite-events');
        Route::get('/followed-artists', [UserController::class, 'getFollowedArtists'])->name('api.user.followed-artists');

        // Statistiques détaillées de l'utilisateur
        Route::get('/stats', [UserController::class, 'getUserStats'])->name('api.user.stats');

        // Notifications (alias pour la route existante)
        Route::get('/notifications', [UserController::class, 'getNotifications'])->name('api.user.notifications');

        // Clips de l'utilisateur
        Route::get('/clips', [UserClipController::class, 'index']);

        // Sons achetés
        Route::get('/purchased-sounds', [UserProfileController::class, 'getPurchasedSounds']);

        // Sons favoris
        Route::post('/favorite-sounds/{soundId}', [UserProfileController::class, 'toggleFavoriteSound']);
        Route::delete('/favorite-sounds/{soundId}', [UserProfileController::class, 'toggleFavoriteSound']);

        // Profil complet avec toutes les statistiques
        Route::get('/complete-profile', [UserProfileController::class, 'getCompleteProfile']);
    });

    Route::get('/download/{soundId}', [SoundDownloadController::class, 'download']);
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

// Routes pour les artistes (publiques et protégées)
Route::prefix('artists')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\ArtistController::class, 'index']);
    Route::get('/popular', [App\Http\Controllers\Api\ArtistController::class, 'popular']);
    Route::get('/recommended', [App\Http\Controllers\Api\ArtistController::class, 'recommended']);
    Route::get('/{id}', [App\Http\Controllers\Api\ArtistController::class, 'show']);

    // Routes protégées pour l'authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{id}/follow', [App\Http\Controllers\Api\ArtistController::class, 'toggleFollow']);
    });
});

// Paiements de test (accessible à tous les utilisateurs connectés)
Route::post('/payments/test-payment', [PaymentController::class, 'processTestPayment'])->name('api.payments.test');

// Route de test pour l'authentification
Route::middleware('auth:sanctum')->get('/test-auth', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'success' => true,
        'message' => 'Authentification réussie',
        'user_id' => $user->id,
        'user_name' => $user->name,
        'user_role' => $user->role
    ]);
});

// Route de test simple sans authentification
Route::get('/test-simple', function () {
    return response()->json([
        'success' => true,
        'message' => 'API fonctionne correctement',
        'timestamp' => now(),
        'users_count' => App\Models\User::count()
    ]);
});

// Profil utilisateur complet avec achats, favoris, etc. (route ancienne pour compatibilité)
Route::get('/user/profile-complete', [AuthController::class, 'getCompleteProfile'])->name('api.user.profile-complete.legacy');

// Route pour le formulaire de contact
Route::post('/contact', [ContactController::class, 'send'])->name('contact.send');

Route::get('/sounds/categories', [SoundController::class, 'getCategories']);
