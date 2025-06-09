<?php

// Script de test simple pour reproduire les erreurs de production
echo "=== TEST PRODUCTION SIMPLE ===\n\n";

// Test 1: Simuler la création d'événement avec données manquantes (reproduire 422)
echo "🔍 TEST 1: Reproduire l'erreur 422 (données manquantes)\n";
echo "==================================================\n";

$data_incomplete = [
    'title' => 'Test Event',
    'description' => 'Test description',
    'category' => 'concert',
    'venue' => 'Test Venue',
    // MANQUE: location (obligatoire)
    'address' => 'Test Address',
    'city' => 'Yaoundé',
    'event_date' => '2024-12-31',
    'start_time' => '20:00',
    'contact_email' => 'test@test.com',
    'contact_phone' => '+237600000000'
];

$url = 'https://reveilart4arist.com/api/events';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($data_incomplete),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Authorization: Bearer test-token',
        'Content-Type: application/x-www-form-urlencoded'
    ]
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Status HTTP: {$http_code}\n";
if ($error) {
    echo "❌ Erreur cURL: {$error}\n";
} else {
    echo "📄 Réponse: " . substr($response, 0, 500) . "\n";

    $json = json_decode($response, true);
    if ($json && isset($json['errors'])) {
        echo "🔍 Erreurs détectées:\n";
        foreach ($json['errors'] as $field => $messages) {
            echo "   - {$field}: " . implode(', ', $messages) . "\n";
        }
    }
}

echo "\n" . str_repeat("=", 60) . "\n\n";

// Test 2: Test avec toutes les données obligatoires
echo "🔍 TEST 2: Test avec données complètes\n";
echo "=====================================\n";

$data_complete = [
    'title' => 'Test Event Complete',
    'description' => 'Test description complete',
    'category' => 'concert',
    'venue' => 'Test Venue',
    'location' => 'Centre-ville', // AJOUTÉ LE CHAMP OBLIGATOIRE
    'address' => 'Test Address Complete',
    'city' => 'Yaoundé',
    'country' => 'Cameroun',
    'event_date' => '2024-12-31',
    'start_time' => '20:00',
    'end_time' => '23:00',
    'is_free' => '1',
    'contact_email' => 'test@test.com',
    'contact_phone' => '+237600000000'
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($data_complete),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Authorization: Bearer test-token',
        'Content-Type: application/x-www-form-urlencoded'
    ]
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Status HTTP: {$http_code}\n";
if ($error) {
    echo "❌ Erreur cURL: {$error}\n";
} else {
    echo "📄 Réponse: " . substr($response, 0, 500) . "\n";
}

echo "\n" . str_repeat("=", 60) . "\n\n";

// Test 3: Vérifier les routes disponibles
echo "🔍 TEST 3: Vérifier la disponibilité de l'API\n";
echo "===========================================\n";

$test_routes = [
    'GET /api/events' => 'https://reveilart4arist.com/api/events',
    'GET /api/sounds' => 'https://reveilart4arist.com/api/sounds',
    'GET /api/user' => 'https://reveilart4arist.com/api/user'
];

foreach ($test_routes as $name => $route_url) {
    echo "Testing {$name}... ";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $route_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json'
        ]
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code == 200) {
        echo "✅ OK ({$http_code})\n";
    } else {
        echo "❌ Erreur ({$http_code})\n";
    }
}

echo "\n=== FIN DES TESTS ===\n";
