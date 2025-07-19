<?php

echo "=== DEBUG ERREUR 500 API MONETBIL ===\n\n";

// 1. Vérification des permissions
echo "1. VÉRIFICATION DES PERMISSIONS\n";
echo "=================================\n";

$directories = [
    'storage' => storage_path(),
    'storage/logs' => storage_path('logs'),
    'storage/framework' => storage_path('framework'),
    'storage/framework/cache' => storage_path('framework/cache'),
    'storage/framework/sessions' => storage_path('framework/sessions'),
    'storage/framework/views' => storage_path('framework/views'),
    'bootstrap/cache' => base_path('bootstrap/cache')
];

foreach ($directories as $name => $path) {
    if (file_exists($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -3);
        $owner = function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($path))['name'] : 'inconnu';
        echo "📁 $name: $perms ($owner)\n";
        
        if (!is_writable($path)) {
            echo "   ❌ NON WRITABLE\n";
        } else {
            echo "   ✅ WRITABLE\n";
        }
    } else {
        echo "📁 $name: ❌ MANQUANT\n";
    }
}

// 2. Vérification du log Laravel
echo "\n2. VÉRIFICATION DES LOGS LARAVEL\n";
echo "=================================\n";

$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    echo "📄 Fichier de log trouvé: $logFile\n";
    echo "📊 Taille: " . number_format(filesize($logFile)) . " bytes\n";
    
    if (is_readable($logFile)) {
        echo "👀 Dernières lignes du log:\n";
        echo "---\n";
        $lines = file($logFile);
        $lastLines = array_slice($lines, -20);
        foreach ($lastLines as $line) {
            if (strpos($line, 'ERROR') !== false || strpos($line, 'Exception') !== false) {
                echo "🔴 " . trim($line) . "\n";
            }
        }
        echo "---\n";
    } else {
        echo "❌ Fichier de log non lisible\n";
    }
} else {
    echo "❌ Fichier de log manquant\n";
}

// 3. Test de l'autoload et des classes
echo "\n3. TEST DES CLASSES\n";
echo "====================\n";

try {
    echo "🔍 Test autoload Composer...\n";
    if (file_exists('vendor/autoload.php')) {
        require_once 'vendor/autoload.php';
        echo "✅ Autoload OK\n";
    } else {
        echo "❌ vendor/autoload.php manquant\n";
    }
    
    echo "🔍 Test classe MonetbilService...\n";
    if (class_exists('App\\Services\\MonetbilService')) {
        echo "✅ MonetbilService trouvée\n";
    } else {
        echo "❌ MonetbilService manquante\n";
    }
    
    echo "🔍 Test classe PaymentController...\n";
    if (class_exists('App\\Http\\Controllers\\PaymentController')) {
        echo "✅ PaymentController trouvée\n";
    } else {
        echo "❌ PaymentController manquante\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test des classes: " . $e->getMessage() . "\n";
}

// 4. Test de création de fichier temporaire
echo "\n4. TEST D'ÉCRITURE\n";
echo "===================\n";

$testFile = storage_path('logs/test_write.tmp');
try {
    file_put_contents($testFile, "Test d'écriture " . date('Y-m-d H:i:s'));
    if (file_exists($testFile)) {
        echo "✅ Écriture dans storage/logs OK\n";
        unlink($testFile);
    } else {
        echo "❌ Impossible d'écrire dans storage/logs\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur d'écriture: " . $e->getMessage() . "\n";
}

// 5. Vérification de la configuration
echo "\n5. CONFIGURATION\n";
echo "=================\n";

$envFile = '.env';
if (file_exists($envFile)) {
    echo "📄 Fichier .env trouvé\n";
    
    $envContent = file_get_contents($envFile);
    if (strpos($envContent, 'MONETBIL_SERVICE_KEY') !== false) {
        echo "✅ MONETBIL_SERVICE_KEY configurée\n";
    } else {
        echo "⚠️ MONETBIL_SERVICE_KEY non trouvée dans .env\n";
    }
    
    if (strpos($envContent, 'APP_DEBUG=true') !== false) {
        echo "✅ APP_DEBUG activé\n";
    } else {
        echo "⚠️ APP_DEBUG désactivé\n";
    }
    
} else {
    echo "❌ Fichier .env manquant\n";
}

// 6. Commandes de correction
echo "\n6. COMMANDES DE CORRECTION\n";
echo "===========================\n";

echo "Si des problèmes sont détectés, exécutez:\n\n";

echo "# Correction des permissions:\n";
echo "sudo chown -R www-data:www-data storage bootstrap/cache\n";
echo "sudo chmod -R 775 storage bootstrap/cache\n";
echo "sudo chmod 664 storage/logs/laravel.log\n\n";

echo "# Nettoyage des caches:\n";
echo "php artisan config:clear\n";
echo "php artisan cache:clear\n";
echo "php artisan view:clear\n";
echo "php artisan route:clear\n\n";

echo "# Recréation des dossiers:\n";
echo "mkdir -p storage/logs storage/framework/{cache,sessions,views}\n\n";

echo "# Test de l'API:\n";
echo "curl -X GET http://votre-domaine.com/api/status\n";

echo "\n=== FIN DU DIAGNOSTIC ===\n";

?>