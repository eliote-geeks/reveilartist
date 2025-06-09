<?php

// Test du nouveau formulaire de son
echo "=== TEST FORMULAIRE SON ===\n\n";

// Charger Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Sound;
use App\Models\Category;

echo "🔍 TEST 1: Validation des catégories\n";
echo "====================================\n";

try {
    $categories = Category::where('is_active', true)->get(['id', 'name']);
    echo "✅ Catégories disponibles: " . $categories->count() . "\n";
    foreach ($categories as $cat) {
        echo "   - ID: {$cat->id}, Nom: {$cat->name}\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

echo "\n🔍 TEST 2: Validation formulaire minimal\n";
echo "========================================\n";

$minimalData = [
    'title' => 'Test Son Minimal',
    'category_id' => 1,
    'audio_file' => 'test.mp3',
];

$validator = Validator::make($minimalData, [
    'title' => 'required|string|max:255',
    'category_id' => 'required|exists:categories,id',
    'audio_file' => 'required',
]);

if ($validator->fails()) {
    echo "❌ Validation échouée:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "   - $error\n";
    }
} else {
    echo "✅ Validation réussie pour le formulaire minimal\n";
}

echo "\n🔍 TEST 3: Structure BDD - Colonnes sounds\n";
echo "==========================================\n";

try {
    $columns = DB::select("SELECT column_name, data_type, is_nullable, column_default
                          FROM information_schema.columns
                          WHERE table_name = 'sounds'
                          ORDER BY ordinal_position");

    echo "Colonnes de la table 'sounds':\n";
    foreach ($columns as $column) {
        $nullable = $column->is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        $default = $column->column_default ? " DEFAULT: {$column->column_default}" : '';
        echo "   - {$column->column_name} ({$column->data_type}) {$nullable}{$default}\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}

echo "\n✅ Tests terminés!\n";

?>
