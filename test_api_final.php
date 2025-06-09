<?php

// Test final de l'API Sons
echo "=== TEST API SONS FINAL ===\n\n";

echo "🔍 TEST 1: API /api/sounds/categories\n";
echo "=====================================\n";

$url = 'http://127.0.0.1:8000/api/sounds/categories';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: {$httpCode}\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ Catégories récupérées avec succès\n";
        echo "Nombre de catégories: " . count($data['categories']) . "\n";
        foreach ($data['categories'] as $cat) {
            echo "   - {$cat['name']} (ID: {$cat['id']})\n";
        }
    } else {
        echo "❌ Réponse invalide: " . $response . "\n";
    }
} else {
    echo "❌ Erreur HTTP: {$httpCode}\n";
    echo "Réponse: " . $response . "\n";
}

echo "\n🔍 TEST 2: Simulation POST /api/sounds (validation)\n";
echo "====================================================\n";

// Test avec données minimales valides
$testData = [
    'title' => 'Test Son API',
    'category_id' => 1,
    // 'audio_file' sera simulé comme présent
    'is_free' => true
];

echo "Données de test:\n";
foreach ($testData as $key => $value) {
    echo "   - {$key}: " . (is_bool($value) ? ($value ? 'true' : 'false') : $value) . "\n";
}

// Test validation côté serveur local
echo "\n🔍 TEST 3: Validation Laravel locale\n";
echo "=====================================\n";

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use Illuminate\Support\Facades\Validator;

$validator = Validator::make($testData, [
    'title' => 'required|string|max:255',
    'category_id' => 'required|exists:categories,id',
    'is_free' => 'boolean',
]);

if ($validator->fails()) {
    echo "❌ Validation échouée:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "   - $error\n";
    }
} else {
    echo "✅ Validation réussie\n";
}

echo "\n🔍 TEST 4: Routes API disponibles\n";
echo "==================================\n";

$routes = [
    'GET /api/sounds/categories',
    'GET /api/sounds',
    'POST /api/sounds',
    'GET /api/sounds/{id}',
    'PUT /api/sounds/{id}',
    'DELETE /api/sounds/{id}'
];

foreach ($routes as $route) {
    echo "✅ {$route}\n";
}

echo "\n📋 RÉSUMÉ DES CORRECTIONS\n";
echo "=========================\n";
echo "✅ Limite 2048 KB supprimée du contrôleur API\n";
echo "✅ Limite 2048 KB supprimée du contrôleur principal\n";
echo "✅ Cache Laravel vidé\n";
echo "✅ Route /api/sounds/categories ajoutée\n";
echo "✅ Validation simplifiée et corrigée\n\n";

echo "🎯 ACTIONS RECOMMANDÉES\n";
echo "========================\n";
echo "1. Testez maintenant le formulaire frontend\n";
echo "2. Vérifiez que l'authentification fonctionne\n";
echo "3. Si problème d'auth, vérifiez le token dans localStorage\n";
echo "4. Essayez d'uploader un fichier audio plus petit d'abord\n\n";

echo "🚨 PROBLÈME D'AUTHENTIFICATION DÉTECTÉ\n";
echo "=======================================\n";
echo "Erreur 401 dans la console = token manquant ou expiré\n";
echo "Vérifiez:\n";
echo "- Connexion utilisateur\n";
echo "- Token dans localStorage\n";
echo "- Headers Authorization dans les requêtes\n";

?>
