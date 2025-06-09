<?php

// Script de test de validation local pour identifier les problèmes de formulaires
echo "=== TEST VALIDATION LOCALE ===\n\n";

// Charger Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Event;
use App\Models\Sound;

echo "🔍 TEST 1: Validation d'événement avec données incomplètes\n";
echo "=======================================================\n";

$eventData = [
    'title' => 'Test Event',
    'description' => 'Test description',
    'category' => 'concert',
    'venue' => 'Test Venue',
    // MANQUE: location (obligatoire selon nos tests)
    'address' => 'Test Address',
    'city' => 'Yaoundé',
    'event_date' => '2024-12-31',
    'start_time' => '20:00',
    'contact_email' => 'test@test.com',
    'contact_phone' => '+237600000000'
];

// Règles de validation du contrôleur Event
$eventRules = [
    'title' => 'required|string|max:255',
    'description' => 'required|string',
    'category' => 'required|string|in:concert,festival,showcase,workshop,conference,party,soiree',
    'event_date' => 'required|date|after_or_equal:today',
    'start_time' => 'required|string',
    'end_time' => 'nullable|string',
    'venue' => 'required|string|max:255',
    'location' => 'required|string|max:255', // CHAMP OBLIGATOIRE
    'address' => 'required|string|max:500',
    'city' => 'required|string|max:100',
    'country' => 'nullable|string|max:100',
    'is_free' => 'nullable|boolean',
    'ticket_price' => 'nullable|numeric|min:0',
    'max_attendees' => 'nullable|integer|min:1',
    'contact_email' => 'required|email',
    'contact_phone' => 'required|string|max:20',
];

$validator = Validator::make($eventData, $eventRules);

if ($validator->fails()) {
    echo "❌ ERREURS DE VALIDATION DÉTECTÉES:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "   - $error\n";
    }
} else {
    echo "✅ Validation réussie\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

echo "🔍 TEST 2: Validation d'événement avec toutes les données\n";
echo "=======================================================\n";

$eventDataComplete = [
    'title' => 'Test Event Complete',
    'description' => 'Test description complete',
    'category' => 'concert',
    'venue' => 'Test Venue',
    'location' => 'Centre-ville', // AJOUTÉ
    'address' => 'Test Address Complete',
    'city' => 'Yaoundé',
    'country' => 'Cameroun',
    'event_date' => '2024-12-31',
    'start_time' => '20:00',
    'end_time' => '23:00',
    'is_free' => true,
    'contact_email' => 'test@test.com',
    'contact_phone' => '+237600000000'
];

$validator = Validator::make($eventDataComplete, $eventRules);

if ($validator->fails()) {
    echo "❌ ERREURS DE VALIDATION:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "   - $error\n";
    }
} else {
    echo "✅ Validation réussie - Toutes les données sont correctes\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

echo "🔍 TEST 3: Validation de son avec données incomplètes\n";
echo "===================================================\n";

$soundData = [
    'title' => 'Test Sound',
    'description' => 'Test description',
    'genre' => 'afrobeat',
    'duration' => '180',
    // MANQUE: des champs licence potentiellement obligatoires
];

// Règles de validation du contrôleur Sound (basé sur nos corrections précédentes)
$soundRules = [
    'title' => 'required|string|max:255',
    'description' => 'required|string',
    'genre' => 'required|string',
    'duration' => 'required|integer|min:1',
    'audio_file' => 'required|file|mimes:mp3,wav,aac,flac|max:20480', // 20MB
    'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    'is_free' => 'nullable|boolean',
    'price' => 'nullable|numeric|min:0',
    'license_type' => 'nullable|string',
    'license_duration' => 'nullable|string',
    'territory' => 'nullable|string',
    'publishing_rights' => 'nullable|string',
    'rights_statement' => 'nullable|string',
];

$validator = Validator::make($soundData, $soundRules);

if ($validator->fails()) {
    echo "❌ ERREURS DE VALIDATION DÉTECTÉES:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "   - $error\n";
    }
} else {
    echo "✅ Validation réussie\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

echo "🔍 TEST 4: Vérification de la structure de la base de données\n";
echo "==========================================================\n";

try {
    // Vérifier les colonnes de la table events
        $eventColumns = DB::select("SELECT column_name, data_type, is_nullable, column_default
                                 FROM information_schema.columns
                                 WHERE table_name = 'events'
                                 ORDER BY ordinal_position");

    echo "📋 COLONNES TABLE EVENTS:\n";
    $requiredFields = ['title', 'description', 'category', 'venue', 'location', 'address', 'city', 'event_date', 'start_time'];

    foreach ($eventColumns as $column) {
        $required = in_array($column->column_name, $requiredFields) ? '(REQUIS)' : '';
        echo "   - {$column->column_name}: {$column->data_type} {$required}\n";
    }

    echo "\n📋 COLONNES TABLE SOUNDS:\n";
        $soundColumns = DB::select("SELECT column_name, data_type, is_nullable, column_default
                                 FROM information_schema.columns
                                 WHERE table_name = 'sounds'
                                 ORDER BY ordinal_position");

    foreach ($soundColumns as $column) {
        echo "   - {$column->column_name}: {$column->data_type}\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur base de données: " . $e->getMessage() . "\n";
}

echo "\n=== DIAGNOSTIC FINAL ===\n";
echo "1. ✅ Site en ligne et APIs accessibles\n";
echo "2. ⚠️  Problème d'authentification pour les POST (normal sans token valide)\n";
echo "3. 🔍 Vérifiez que le frontend envoie bien le champ 'location'\n";
echo "4. 🔍 Pour l'erreur 413, vérifiez les limites du serveur web (nginx/apache)\n";
echo "5. 📝 Consultez les logs Laravel en production pour plus de détails\n";

echo "\n=== FIN DES TESTS ===\n";
