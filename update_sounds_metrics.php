<?php

require 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Sound;

echo "Mise à jour des métriques des sons...\n";

$sounds = Sound::take(5)->get();

foreach ($sounds as $sound) {
    $playsCount = rand(1500, 15000);
    $downloadsCount = rand(1200, 12000);
    $likesCount = rand(100, 1000);

    $sound->update([
        'plays_count' => $playsCount,
        'downloads_count' => $downloadsCount,
        'likes_count' => $likesCount
    ]);

    echo "Son {$sound->id} - {$sound->title} mis à jour:\n";
    echo "  - Lectures: {$playsCount}\n";
    echo "  - Téléchargements: {$downloadsCount}\n";
    echo "  - Likes: {$likesCount}\n\n";
}

echo "Sons mis à jour avec des métriques de certification !\n";
