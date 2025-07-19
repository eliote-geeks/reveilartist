<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DownloadController;

// Route principale pour l'application React SPA
Route::get('/', function () {
    return view('app');
});


// Routes de retour de paiement Monetbil (publiques)
Route::get('/payment/return/{payment}', function (App\Models\Payment $payment) {
    return view('payment-return', compact('payment'));
})->name('payment.return');

Route::get('/payment/success', function (Illuminate\Http\Request $request) {
    $ref = $request->get('ref');
    $payment = App\Models\Payment::where('payment_reference', $ref)->first();
    
    if ($payment) {
        $payment->markAsCompleted();
        return redirect('/?payment=success&ref=' . $ref);
    }
    
    return redirect('/?payment=error');
})->name('payment.success');

Route::get('/payment/cancel', function (Illuminate\Http\Request $request) {
    $ref = $request->get('ref');
    $payment = App\Models\Payment::where('payment_reference', $ref)->first();
    
    if ($payment) {
        $payment->markAsFailed('Paiement annulé par l\'utilisateur');
        return redirect('/?payment=cancelled&ref=' . $ref);
    }
    
    return redirect('/?payment=error');
})->name('payment.cancel');

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
