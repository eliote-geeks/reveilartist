<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TEST APIS REAL PRODUCTION ===\n\n";

function testEventAPI() {
    echo "🎪 TEST API ÉVÉNEMENTS\n";
    echo "======================\n";

    try {
        $user = \App\Models\User::first();
        if (!$user) {
            echo "❌ Aucun utilisateur trouvé\n";
            return;
        }

        // Test 1: Validation avec données manquantes (pour reproduire l'erreur 422)
        echo "1. Test avec données incomplètes (reproduire 422)...\n";

        $incompleteData = [
            'title' => 'Test Event',
            'description' => 'Description test',
            'category' => 'concert',
            'venue' => 'Test Venue',
            // 'location' => 'MANQUANT !', // Ce champ manque
            'address' => '123 Test Street',
            'city' => 'Yaoundé',
            'event_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '20:00',
            'contact_email' => 'test@example.com',
            'contact_phone' => '+237123456789'
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($incompleteData, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|in:concert,festival,showcase,workshop,conference,party,soiree',
            'event_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'venue' => 'required|string|max:255',
            'location' => 'required|string|max:255', // OBLIGATOIRE
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'contact_email' => 'required|email',
            'contact_phone' => 'required|string|max:20'
        ]);

        if ($validator->fails()) {
            echo "❌ ERREUR 422 REPRODUITE - Champs manquants:\n";
            foreach ($validator->errors()->all() as $error) {
                echo "   - $error\n";
            }
        } else {
            echo "✅ Pas d'erreur trouvée (bizarre)\n";
        }

        echo "\n2. Test avec données complètes...\n";

        // Test 2: Avec toutes les données
        $completeData = $incompleteData;
        $completeData['location'] = 'Centre-ville'; // AJOUT DU CHAMP MANQUANT

        $validator2 = \Illuminate\Support\Facades\Validator::make($completeData, [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|in:concert,festival,showcase,workshop,conference,party,soiree',
            'event_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'venue' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'contact_email' => 'required|email',
            'contact_phone' => 'required|string|max:20'
        ]);

        if ($validator2->passes()) {
            echo "✅ Validation réussie avec toutes les données\n";

            // Test de création réelle
            $completeData['user_id'] = $user->id;
            $completeData['slug'] = \Illuminate\Support\Str::slug($completeData['title']);
            $completeData['status'] = 'pending';
            $completeData['country'] = 'Cameroun';
            $completeData['is_featured'] = false;
            $completeData['featured'] = false;
            $completeData['is_free'] = true;
            $completeData['current_attendees'] = 0;
            $completeData['views_count'] = 0;
            $completeData['revenue'] = 0.00;

            $event = \App\Models\Event::create($completeData);
            echo "✅ Événement créé en BDD (ID: {$event->id})\n";

            // Nettoyage
            $event->delete();
            echo "🧹 Événement supprimé\n";

        } else {
            echo "❌ Erreurs même avec données complètes:\n";
            foreach ($validator2->errors()->all() as $error) {
                echo "   - $error\n";
            }
        }

    } catch (\Exception $e) {
        echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
    }

    echo "\n";
}

function testSoundAPI() {
    echo "🎵 TEST API SONS\n";
    echo "================\n";

    try {
        // Vérifier les limites upload
        echo "Limites upload:\n";
        echo "- upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
        echo "- post_max_size: " . ini_get('post_max_size') . "\n";
        echo "- memory_limit: " . ini_get('memory_limit') . "\n";

        // Tester le stockage
        $storagePath = storage_path('app/public');
        if (!is_dir($storagePath)) {
            echo "❌ Dossier storage manquant: $storagePath\n";
        } else {
            echo "✅ Dossier storage trouvé\n";
        }

        if (!is_writable($storagePath)) {
            echo "❌ Dossier storage non accessible en écriture\n";
        } else {
            echo "✅ Dossier storage accessible\n";
        }

        // Test validation données sons
        $user = \App\Models\User::first();
        $category = \App\Models\Category::first();

        if (!$category) {
            echo "❌ Aucune catégorie trouvée\n";
            return;
        }

        $soundData = [
            'title' => 'Test Sound',
            'category_id' => $category->id,
            'license_type' => 'royalty_free',
            'copyright_owner' => 'Test Owner',
            'composer' => 'Test Composer',
            'is_free' => true,
            'commercial_use' => true,
            'attribution_required' => false,
            'modifications_allowed' => true,
            'distribution_allowed' => true,
            'license_duration' => 'perpetual',
            'territory' => 'worldwide'
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($soundData, [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'license_type' => 'required|in:royalty_free,creative_commons,exclusive,custom',
            'copyright_owner' => 'required|string|max:255',
            'composer' => 'required|string|max:255',
            'commercial_use' => 'boolean',
            'attribution_required' => 'boolean',
            'modifications_allowed' => 'boolean',
            'distribution_allowed' => 'boolean',
            'license_duration' => 'required|in:perpetual,1_year,5_years,10_years',
            'territory' => 'required|in:worldwide,africa,cameroon,francophone'
        ]);

        if ($validator->passes()) {
            echo "✅ Validation sons réussie\n";
        } else {
            echo "❌ Erreurs validation sons:\n";
            foreach ($validator->errors()->all() as $error) {
                echo "   - $error\n";
            }
        }

    } catch (\Exception $e) {
        echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
    }

    echo "\n";
}

function checkControllers() {
    echo "🔍 VÉRIFICATION CONTRÔLEURS\n";
    echo "===========================\n";

    // Vérifier que les contrôleurs existent
    if (class_exists('\App\Http\Controllers\Api\EventController')) {
        echo "✅ EventController API trouvé\n";

        $controller = new \App\Http\Controllers\Api\EventController();
        if (method_exists($controller, 'store')) {
            echo "✅ Méthode store() trouvée\n";
        } else {
            echo "❌ Méthode store() manquante\n";
        }
    } else {
        echo "❌ EventController API manquant\n";
    }

    if (class_exists('\App\Http\Controllers\Api\SoundController')) {
        echo "✅ SoundController API trouvé\n";

        $controller = new \App\Http\Controllers\Api\SoundController();
        if (method_exists($controller, 'store')) {
            echo "✅ Méthode store() trouvée\n";
        } else {
            echo "❌ Méthode store() manquante\n";
        }
    } else {
        echo "❌ SoundController API manquant\n";
    }

    echo "\n";
}

// Exécuter les tests
checkControllers();
testEventAPI();
testSoundAPI();

echo "✅ Tests terminés\n";
echo "\n=== DIAGNOSTIC FINAL ===\n";
echo "L'erreur 422 vient probablement du champ 'location' manquant.\n";
echo "L'erreur 413 vient des limites de taille de fichier côté serveur web.\n";
echo "Vérifiez aussi les logs Laravel : storage/logs/laravel.log\n";
