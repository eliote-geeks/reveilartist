<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TEST CRÉATION ÉVÉNEMENT ===\n\n";

try {
    // Test des colonnes existantes
    echo "1. Vérification des colonnes...\n";
    $columns = \Illuminate\Support\Facades\DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position");
    foreach ($columns as $column) {
        echo "   - " . $column->column_name . " (" . $column->data_type . ")" . ($column->is_nullable === 'NO' ? " REQUIRED" : "") . "\n";
    }
    echo "\n";

    // Test avec données complètes
    echo "2. Test création avec toutes les données requises...\n";

    $user = \App\Models\User::first();
    if (!$user) {
        echo "❌ Aucun utilisateur trouvé\n";
        exit;
    }

    $testData = [
        'title' => 'Event Test ' . time(),
        'slug' => 'event-test-' . time(),
        'description' => 'Test description',
        'user_id' => $user->id,
        'venue' => 'Test Venue',
        'location' => 'Test Location',  // AJOUT DU CHAMP MANQUANT
        'address' => '123 Test St',
        'city' => 'Yaoundé',
        'country' => 'Cameroun',
        'event_date' => now()->addDays(1)->format('Y-m-d'),
        'start_time' => '20:00:00',
        'category' => 'concert',
        'status' => 'pending',
        'is_featured' => false,
        'featured' => false,
        'is_free' => true,
        'current_attendees' => 0,
        'views_count' => 0,
        'contact_email' => 'test@example.com',
        'contact_phone' => '+237123456789'
    ];

    echo "Données à créer :\n";
    foreach ($testData as $key => $value) {
        echo "   $key: $value\n";
    }
    echo "\n";

    $event = \App\Models\Event::create($testData);
    echo "✓ Événement créé avec succès (ID: {$event->id})\n";

    // Suppression pour le nettoyage
    $event->delete();
    echo "✓ Événement supprimé\n";

} catch (\Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
}
