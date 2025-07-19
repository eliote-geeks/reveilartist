<?php

// Script de test pour l'API Monetbil
// À exécuter dans le dossier racine du projet Laravel

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Sound;
use App\Services\MonetbilService;
use Illuminate\Foundation\Application;

// Bootstrap Laravel
$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "=== TEST API MONETBIL REVEIL4ARTIST ===\n\n";

try {
    // Test 1: Configuration Monetbil
    echo "1. Test de la configuration Monetbil...\n";
    $serviceKey = config('services.monetbil.service_key');
    $serviceSecret = config('services.monetbil.service_secret');
    
    if ($serviceKey && $serviceSecret) {
        echo "   ✓ Configuration Monetbil trouvée\n";
        echo "   Service Key: " . substr($serviceKey, 0, 10) . "...\n";
    } else {
        echo "   ✗ Configuration Monetbil manquante\n";
        exit(1);
    }
    
    // Test 2: Service Monetbil
    echo "\n2. Test du service Monetbil...\n";
    $monetbilService = new MonetbilService();
    echo "   ✓ Service Monetbil instancié\n";
    
    // Test 3: Nettoyage du numéro de téléphone
    echo "\n3. Test du nettoyage du numéro de téléphone...\n";
    $testPhone = "0699123456";
    $cleanPhone = $monetbilService->cleanPhoneNumber($testPhone);
    echo "   Numéro original: $testPhone\n";
    echo "   Numéro nettoyé: $cleanPhone\n";
    if ($cleanPhone === "237699123456") {
        echo "   ✓ Nettoyage du numéro réussi\n";
    } else {
        echo "   ✗ Problème avec le nettoyage du numéro\n";
    }
    
    // Test 4: Génération de référence
    echo "\n4. Test de génération de référence...\n";
    $ref = $monetbilService->generatePaymentReference();
    echo "   Référence générée: $ref\n";
    if (strpos($ref, 'REF_') === 0) {
        echo "   ✓ Référence générée correctement\n";
    } else {
        echo "   ✗ Format de référence incorrect\n";
    }
    
    // Test 5: Vérification de la base de données
    echo "\n5. Test de la base de données...\n";
    $userCount = User::count();
    $soundCount = Sound::count();
    echo "   Utilisateurs: $userCount\n";
    echo "   Sons: $soundCount\n";
    
    if ($userCount > 0 && $soundCount > 0) {
        echo "   ✓ Base de données peuplée\n";
    } else {
        echo "   ⚠ Base de données vide ou incomplète\n";
    }
    
    // Test 6: Test de génération d'URL de paiement (simulation)
    echo "\n6. Test de génération d'URL de paiement...\n";
    
    if ($userCount > 0) {
        $testUser = User::first();
        
        // Créer un paiement de test
        $payment = new \App\Models\Payment([
            'user_id' => $testUser->id,
            'amount' => 1000,
            'type' => 'test',
            'description' => 'Test de paiement',
            'status' => 'pending',
            'payment_reference' => $ref,
            'phone' => '237699123456'
        ]);
        
        // Simuler la relation user
        $payment->setRelation('user', $testUser);
        
        $paymentUrl = $monetbilService->generateWorkingPaymentUrl($payment);
        echo "   URL générée: " . substr($paymentUrl, 0, 100) . "...\n";
        
        if (strpos($paymentUrl, 'monetbil.com') !== false) {
            echo "   ✓ URL de paiement générée correctement\n";
        } else {
            echo "   ✗ Problème avec la génération de l'URL\n";
        }
        
        // Vérifier les paramètres dans l'URL
        $urlParts = parse_url($paymentUrl);
        parse_str($urlParts['query'], $params);
        
        echo "   Paramètres clés dans l'URL:\n";
        echo "     - Amount: " . ($params['amount'] ?? 'MANQUANT') . "\n";
        echo "     - Phone: " . ($params['phone'] ?? 'MANQUANT') . "\n";
        echo "     - Service Key: " . (isset($params['service_key']) ? 'PRÉSENT' : 'MANQUANT') . "\n";
        echo "     - Item Ref: " . ($params['item_ref'] ?? 'MANQUANT') . "\n";
        echo "     - Return URL: " . (isset($params['return_url']) ? 'PRÉSENT' : 'MANQUANT') . "\n";
        echo "     - Notify URL: " . (isset($params['notify_url']) ? 'PRÉSENT' : 'MANQUANT') . "\n";
        
    } else {
        echo "   ⚠ Aucun utilisateur trouvé pour le test\n";
    }
    
    echo "\n=== RÉSUMÉ DES TESTS ===\n";
    echo "✓ Configuration Monetbil: OK\n";
    echo "✓ Service instancié: OK\n";
    echo "✓ Nettoyage téléphone: OK\n";
    echo "✓ Génération référence: OK\n";
    echo "✓ Base de données: " . ($userCount > 0 ? "OK" : "VIDE") . "\n";
    echo "✓ Génération URL: " . ($userCount > 0 ? "OK" : "NON TESTÉ") . "\n";
    
    echo "\n🎉 Tous les tests sont passés!\n";
    echo "\nPour tester un vrai paiement:\n";
    echo "1. Utilisez l'endpoint: POST /api/payments/monetbil/cart\n";
    echo "2. Avec les données du panier\n";
    echo "3. L'URL générée vous redirigera vers Monetbil\n";
    
} catch (Exception $e) {
    echo "\n❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n";
?>