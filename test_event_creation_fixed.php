<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TEST CRÉATION ÉVÉNEMENT CORRIGÉ ===\n\n";

try {
    // Simuler une authentification
    $user = \App\Models\User::first();
    if (!$user) {
        echo "❌ Aucun utilisateur trouvé\n";
        exit;
    }

    // Simuler l'authentification avec Sanctum
    \Illuminate\Support\Facades\Auth::login($user);

    // Créer une requête simulée avec tous les champs nécessaires
    $request = new \Illuminate\Http\Request();
    $request->merge([
        'title' => 'Événement Test API ' . time(),
        'description' => 'Description complète de l\'événement de test',
        'category' => 'concert',
        'event_date' => now()->addDays(3)->format('Y-m-d'),
        'start_time' => '20:00',
        'end_time' => '23:00',
        'venue' => 'Palais des Sports de Yaoundé',
        'location' => 'Yaoundé Centre',  // CHAMP OBLIGATOIRE
        'address' => 'Avenue Kennedy, Yaoundé',
        'city' => 'Yaoundé',
        'country' => 'Cameroun',
        'is_free' => false,
        'ticket_price' => 5000,
        'max_attendees' => 500,
        'contact_email' => 'test@reveilart.com',
        'contact_phone' => '+237670123456',
        'website_url' => 'https://reveilart.com'
    ]);

    // Simuler l'utilisateur authentifié
    $request->setUserResolver(function () use ($user) {
        return $user;
    });

    echo "1. Test de création via le contrôleur API...\n";
    echo "Données envoyées :\n";
    foreach ($request->all() as $key => $value) {
        echo "   $key: $value\n";
    }
    echo "\n";

    // Tester le contrôleur API
    $controller = new \App\Http\Controllers\Api\EventController();
    $response = $controller->store($request);

    $statusCode = $response->getStatusCode();
    $content = json_decode($response->getContent(), true);

    echo "Code de réponse: $statusCode\n";

    if ($statusCode === 201) {
        echo "✅ Création réussie !\n";
        echo "ID de l'événement: " . $content['event']['id'] . "\n";
        echo "Titre: " . $content['event']['title'] . "\n";
        echo "Statut: " . $content['event']['status'] . "\n";

        // Nettoyer
        $event = \App\Models\Event::find($content['event']['id']);
        if ($event) {
            $event->delete();
            echo "✅ Événement de test supprimé\n";
        }
    } else {
        echo "❌ Échec de la création\n";
        if (isset($content['message'])) {
            echo "Message: " . $content['message'] . "\n";
        }
        if (isset($content['errors'])) {
            echo "Erreurs de validation:\n";
            foreach ($content['errors'] as $field => $errors) {
                echo "   $field: " . implode(', ', $errors) . "\n";
            }
        }
        if (isset($content['error'])) {
            echo "Erreur: " . $content['error'] . "\n";
        }
    }

} catch (\Exception $e) {
    echo "❌ ERREUR CRITIQUE: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
}
