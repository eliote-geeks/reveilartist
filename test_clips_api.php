<?php

require_once 'vendor/autoload.php';

use App\Models\Clip;

// Charger l'application Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Test API Clips ===\n\n";

// Test 1: Compter les clips
$clipCount = Clip::count();
echo "Nombre de clips en base: {$clipCount}\n\n";

// Test 2: Afficher les clips avec récompenses
echo "Clips avec récompenses:\n";
echo "----------------------\n";

$clips = Clip::with('user')->get();

foreach ($clips as $clip) {
    $reward = $clip->reward_type ?? 'Aucune';
    $views = $clip->formatted_views;
    echo "• {$clip->title}\n";
    echo "  Artiste: {$clip->user->name}\n";
    echo "  Vues: {$views}\n";
    echo "  Récompense: {$reward}\n";
    echo "  Catégorie: {$clip->category}\n\n";
}

// Test 3: Test des catégories
echo "Catégories disponibles:\n";
echo "----------------------\n";
$controller = new \App\Http\Controllers\ClipController();
$categories = $controller->getCategories()->getData()->categories;
foreach ($categories as $category) {
    echo "• {$category}\n";
}

echo "\n=== Tests terminés ===\n";
