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
    $status = $request->get('status', 'success'); // Statut depuis Monetbil
    $transaction_id = $request->get('transaction_id');
    
    $payment = App\Models\Payment::where('payment_reference', $ref)->first();
    
    if ($payment) {
        \Log::info('Payment success URL hit', [
            'ref' => $ref,
            'payment_id' => $payment->id,
            'monetbil_status' => $status,
            'transaction_id' => $transaction_id
        ]);
        
        // Traiter selon le vrai statut de Monetbil
        if (in_array(strtolower($status), ['success', 'completed', 'ok'])) {
            // Seulement si le paiement est vraiment réussi
            if ($payment->status === 'pending') {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'external_payment_id' => $transaction_id,
                    'metadata' => json_encode(array_merge(
                        json_decode($payment->metadata, true) ?? [],
                        [
                            'success_url_hit' => true,
                            'monetbil_status' => $status,
                            'success_timestamp' => now()->toISOString()
                        ]
                    ))
                ]);
                
                // Traiter les actions post-paiement
                if (method_exists(\App\Http\Controllers\PaymentController::class, 'processSuccessfulPayment')) {
                    $controller = new \App\Http\Controllers\PaymentController(app(\App\Services\MonetbilService::class));
                    $reflection = new \ReflectionClass($controller);
                    $method = $reflection->getMethod('processSuccessfulPayment');
                    $method->setAccessible(true);
                    $method->invokeArgs($controller, [$payment, [
                        'status' => $status,
                        'transaction_id' => $transaction_id,
                        'source' => 'return_url'
                    ]]);
                }
            }
            
            return redirect('/?payment=success&ref=' . $ref);
        } else {
            // Rediriger vers l'erreur si le statut n'est pas succès
            return redirect('/?payment=error&ref=' . $ref . '&reason=' . urlencode($status));
        }
    }
    
    return redirect('/?payment=error&reason=payment_not_found');
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
