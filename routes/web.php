<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DownloadController;

// Route principale pour l'application React SPA
Route::get('/', function () {
    return view('app');
});


Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/download/{soundId}', [DownloadController::class, 'downloadSound'])->name('sound.download');
});

// Routes SPA - toutes les routes frontend sont gérées par React Router (sauf API)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
