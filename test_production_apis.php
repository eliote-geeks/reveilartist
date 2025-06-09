<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TEST APIS EN PRODUCTION ===\n\n";

function testEventCreationAPI() {
    echo "🎪 TEST API CRÉATION ÉVÉNEMENTS (/api/events)\n";
    echo "================================================\n";

    try {
        // Simuler une requête exactement comme le frontend
        $user = \App\Models\User::first();
        if (!$user) {
            echo "❌ Aucun utilisateur trouvé\n";
            return;
        }

        // Créer un token pour les tests
        $token = $user->createToken('test-token')->plainTextToken;

        // Données exactement comme envoyées par AddEvent.jsx
        $postData = [
            'title' => 'Test Event API ' . time(),
            'description' => 'Description complète du test API',
            'category' => 'concert',
            'venue' => 'Test Venue API',
            'location' => 'Zone Test API',
            'address' => '123 API Test Street',
            'city' => 'Yaoundé',
            'country' => 'Cameroun',
            'event_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '20:00',
            'end_time' => '23:00',
            'is_free' => '0',
            'ticket_price' => '5000',
            'max_attendees' => '500',
            'contact_email' => 'test@api.com',
            'contact_phone' => '+237123456789',
            'artists' => ['Artiste Test 1', 'Artiste Test 2'],
            'sponsors' => ['Sponsor Test'],
            'requirements' => 'Test requirements'
        ];

        echo "Données à envoyer :\n";
        foreach ($postData as $key => $value) {
            if (is_array($value)) {
                echo "   $key: " . implode(', ', $value) . "\n";
            } else {
                echo "   $key: $value\n";
            }
        }
        echo "\n";

        // Test via le contrôleur directement
        $request = new \Illuminate\Http\Request();
        $request->merge($postData);

        // Simuler l'authentification
        \Illuminate\Support\Facades\Auth::login($user);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $controller = new \App\Http\Controllers\Api\EventController();
        $response = $controller->store($request);

        $statusCode = $response->getStatusCode();
        $content = $response->getContent();
        $data = json_decode($content, true);

        echo "🔍 RÉSULTAT TEST ÉVÉNEMENT:\n";
        echo "Status Code: $statusCode\n";

        if ($statusCode === 201) {
            echo "✅ SUCCÈS - Événement créé\n";
            echo "ID: " . ($data['event']['id'] ?? 'N/A') . "\n";

            // Nettoyer
            if (isset($data['event']['id'])) {
                \App\Models\Event::find($data['event']['id'])?->delete();
                echo "🧹 Événement de test supprimé\n";
            }
        } else {
            echo "❌ ÉCHEC\n";
            echo "Contenu de la réponse:\n";
            if ($data) {
                if (isset($data['message'])) {
                    echo "Message: " . $data['message'] . "\n";
                }
                if (isset($data['errors'])) {
                    echo "Erreurs de validation:\n";
                    foreach ($data['errors'] as $field => $errors) {
                        echo "   $field: " . (is_array($errors) ? implode(', ', $errors) : $errors) . "\n";
                    }
                }
                if (isset($data['error'])) {
                    echo "Erreur: " . $data['error'] . "\n";
                }
            } else {
                echo "Réponse brute: " . substr($content, 0, 500) . "...\n";
            }
        }

    } catch (\Exception $e) {
        echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
        echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
        echo "Trace: " . substr($e->getTraceAsString(), 0, 1000) . "...\n";
    }

    echo "\n";
}

function testSoundCreationAPI() {
    echo "🎵 TEST API CRÉATION SONS (/api/sounds)\n";
    echo "===========================================\n";

    try {
        $user = \App\Models\User::first();
        if (!$user) {
            echo "❌ Aucun utilisateur trouvé\n";
            return;
        }

        // Créer un fichier audio de test très petit
        $testAudioContent = str_repeat('audio_test_data', 100); // ~1.3KB
        $tempAudioFile = tempnam(sys_get_temp_dir(), 'test_audio') . '.mp3';
        file_put_contents($tempAudioFile, $testAudioContent);

        // Créer un fichier image de test très petit
        $testImageContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        $tempImageFile = tempnam(sys_get_temp_dir(), 'test_image') . '.png';
        file_put_contents($tempImageFile, $testImageContent);

        // Données exactement comme envoyées par AddSound.jsx
        $postData = [
            'title' => 'Test Sound API ' . time(),
            'description' => 'Description test son API',
            'category_id' => '1',
            'genre' => 'Test Genre',
            'is_free' => '1',
            'bpm' => '120',
            'key' => 'C',
            'credits' => 'Test credits',
            'license_type' => 'royalty_free',
            'copyright_owner' => 'Test Owner',
            'composer' => 'Test Composer',
            'commercial_use' => '1',
            'attribution_required' => '0',
            'modifications_allowed' => '1',
            'distribution_allowed' => '1',
            'license_duration' => 'perpetual',
            'territory' => 'worldwide'
        ];

        echo "Données son à envoyer :\n";
        foreach ($postData as $key => $value) {
            echo "   $key: $value\n";
        }
        echo "   audio_file: {$tempAudioFile} (" . filesize($tempAudioFile) . " bytes)\n";
        echo "   cover_image: {$tempImageFile} (" . filesize($tempImageFile) . " bytes)\n";
        echo "\n";

        // Test avec des fichiers très petits d'abord
        echo "🔍 Test avec fichiers très petits...\n";

        $request = new \Illuminate\Http\Request();
        $request->merge($postData);

        // Simuler les fichiers uploadés
        $audioFile = new \Illuminate\Http\UploadedFile(
            $tempAudioFile,
            'test.mp3',
            'audio/mpeg',
            null,
            true
        );

        $imageFile = new \Illuminate\Http\UploadedFile(
            $tempImageFile,
            'test.png',
            'image/png',
            null,
            true
        );

        $request->files->set('audio_file', $audioFile);
        $request->files->set('cover_image', $imageFile);

        // Simuler l'authentification
        \Illuminate\Support\Facades\Auth::login($user);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $controller = new \App\Http\Controllers\Api\SoundController();
        $response = $controller->store($request);

        $statusCode = $response->getStatusCode();
        $content = $response->getContent();
        $data = json_decode($content, true);

        echo "🔍 RÉSULTAT TEST SON:\n";
        echo "Status Code: $statusCode\n";

        if ($statusCode === 201) {
            echo "✅ SUCCÈS - Son créé\n";
            echo "ID: " . ($data['sound']['id'] ?? 'N/A') . "\n";

            // Nettoyer
            if (isset($data['sound']['id'])) {
                \App\Models\Sound::find($data['sound']['id'])?->delete();
                echo "🧹 Son de test supprimé\n";
            }
        } else {
            echo "❌ ÉCHEC\n";
            echo "Contenu de la réponse:\n";
            if ($data) {
                if (isset($data['message'])) {
                    echo "Message: " . $data['message'] . "\n";
                }
                if (isset($data['errors'])) {
                    echo "Erreurs de validation:\n";
                    foreach ($data['errors'] as $field => $errors) {
                        echo "   $field: " . (is_array($errors) ? implode(', ', $errors) : $errors) . "\n";
                    }
                }
                if (isset($data['error'])) {
                    echo "Erreur: " . $data['error'] . "\n";
                }
            } else {
                echo "Réponse brute: " . substr($content, 0, 500) . "...\n";
            }
        }

        // Nettoyer les fichiers temporaires
        unlink($tempAudioFile);
        unlink($tempImageFile);

    } catch (\Exception $e) {
        echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
        echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
    }

    echo "\n";
}

function checkServerLimits() {
    echo "⚙️ VÉRIFICATION LIMITES SERVEUR\n";
    echo "================================\n";

    echo "PHP upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
    echo "PHP post_max_size: " . ini_get('post_max_size') . "\n";
    echo "PHP max_execution_time: " . ini_get('max_execution_time') . "\n";
    echo "PHP memory_limit: " . ini_get('memory_limit') . "\n";
    echo "PHP max_input_vars: " . ini_get('max_input_vars') . "\n";

    // Vérifier les routes
    echo "\n🛣️ VÉRIFICATION ROUTES:\n";
    $routes = \Illuminate\Support\Facades\Route::getRoutes();

    $eventRoutes = $routes->match(new \Illuminate\Http\Request(['POST'], '/api/events'));
    $soundRoutes = $routes->match(new \Illuminate\Http\Request(['POST'], '/api/sounds'));

    echo "Route POST /api/events: " . ($eventRoutes ? "✅ Trouvée" : "❌ Manquante") . "\n";
    echo "Route POST /api/sounds: " . ($soundRoutes ? "✅ Trouvée" : "❌ Manquante") . "\n";

    echo "\n";
}

// Exécuter les tests
try {
    checkServerLimits();
    testEventCreationAPI();
    testSoundCreationAPI();

    echo "✅ Tests terminés\n";

} catch (\Exception $e) {
    echo "❌ ERREUR GLOBALE: " . $e->getMessage() . "\n";
}
