<?php

use Illuminate\Support\Facades\Route;

// Route principale pour l'application React SPA
Route::get('/', function () {
    return view('app');
});

// Routes API (optionnelles pour plus tard)
Route::prefix('api')->group(function () {
    // Routes API pour les sons, utilisateurs, etc.
    // Route::apiResource('sounds', SoundController::class);
    // Route::apiResource('categories', CategoryController::class);

    // Routes publiques (sans authentification)
    // Routes pour les paiements
    Route::apiResource('payments', \App\Http\Controllers\PaymentController::class);
    Route::get('payments/{payment}/complete', [\App\Http\Controllers\PaymentController::class, 'markAsCompleted'])->name('payments.complete');
    Route::post('payments/{payment}/refund', [\App\Http\Controllers\PaymentController::class, 'refund'])->name('payments.refund');
    Route::get('payments/stats/statistics', [\App\Http\Controllers\PaymentController::class, 'statistics'])->name('payments.statistics');
    Route::get('payments/export/csv', [\App\Http\Controllers\PaymentController::class, 'export'])->name('payments.export');

    // Routes pour les commissions
    Route::get('commissions', [\App\Http\Controllers\CommissionController::class, 'index'])->name('commissions.index');
    Route::post('commissions', [\App\Http\Controllers\CommissionController::class, 'store'])->name('commissions.store');
    Route::put('commissions/{commissionSetting}', [\App\Http\Controllers\CommissionController::class, 'update'])->name('commissions.update');
    Route::delete('commissions/{commissionSetting}', [\App\Http\Controllers\CommissionController::class, 'destroy'])->name('commissions.destroy');
    Route::post('commissions/{commissionSetting}/toggle', [\App\Http\Controllers\CommissionController::class, 'toggleStatus'])->name('commissions.toggle');
    Route::post('commissions/bulk-update', [\App\Http\Controllers\CommissionController::class, 'bulkUpdate'])->name('commissions.bulk-update');
    Route::post('commissions/calculate-preview', [\App\Http\Controllers\CommissionController::class, 'calculatePreview'])->name('commissions.calculate-preview');
    Route::get('commissions/history', [\App\Http\Controllers\CommissionController::class, 'history'])->name('commissions.history');
    Route::post('commissions/reset-defaults', [\App\Http\Controllers\CommissionController::class, 'resetToDefaults'])->name('commissions.reset-defaults');

    // Routes pour le dashboard (temporairement sans authentification pour tests)
    Route::get('dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('dashboard/sounds', [\App\Http\Controllers\DashboardController::class, 'getSounds'])->name('dashboard.sounds');
    Route::get('dashboard/events', [\App\Http\Controllers\DashboardController::class, 'getEvents'])->name('dashboard.events');
    Route::get('dashboard/users', [\App\Http\Controllers\DashboardController::class, 'getUsers'])->name('dashboard.users');
    Route::get('dashboard/commission-settings', [\App\Http\Controllers\DashboardController::class, 'getCommissionSettings'])->name('dashboard.commission-settings');
    Route::post('dashboard/commission-settings', [\App\Http\Controllers\DashboardController::class, 'updateCommissionSettings'])->name('dashboard.update-commission-settings');
    Route::get('dashboard/export-stats', [\App\Http\Controllers\DashboardController::class, 'exportStats'])->name('dashboard.export-stats');
    Route::post('dashboard/calculate-commission', [\App\Http\Controllers\DashboardController::class, 'calculateCommission'])->name('dashboard.calculate-commission');

    // Routes protégées par authentification Sanctum (pour plus tard)
    // Route::middleware(['auth:sanctum'])->group(function () {
        // Ici vous pourrez mettre les routes qui nécessitent une authentification
    // });
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

// Routes SPA - toutes les routes frontend sont gérées par React Router (sauf API)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
