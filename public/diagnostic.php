<?php
/**
 * Script de diagnostic temporaire pour RéveilArt4Artist
 * À SUPPRIMER après diagnostic !
 */

// Sécurité basique
if (!isset($_GET['debug_key']) || $_GET['debug_key'] !== 'reveilart2025') {
    http_response_code(404);
    exit('Not found');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic Upload - RéveilArt4Artist</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .ok { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🔍 Diagnostic Upload - RéveilArt4Artist</h1>

    <div class="info">
        <strong>⚠️ IMPORTANT :</strong> Ce fichier doit être supprimé après diagnostic pour des raisons de sécurité !
    </div>

    <h2>📊 Configuration PHP Actuelle</h2>
    <table>
        <tr>
            <th>Paramètre</th>
            <th>Valeur Actuelle</th>
            <th>Recommandé</th>
            <th>Status</th>
        </tr>
        <?php
        $config = [
            'upload_max_filesize' => ['current' => ini_get('upload_max_filesize'), 'recommended' => '100M'],
            'post_max_size' => ['current' => ini_get('post_max_size'), 'recommended' => '120M'],
            'memory_limit' => ['current' => ini_get('memory_limit'), 'recommended' => '256M'],
            'max_execution_time' => ['current' => ini_get('max_execution_time'), 'recommended' => '300'],
            'max_input_time' => ['current' => ini_get('max_input_time'), 'recommended' => '300'],
            'max_file_uploads' => ['current' => ini_get('max_file_uploads'), 'recommended' => '20'],
        ];

        function convertToBytes($val) {
            $val = trim($val);
            $last = strtolower($val[strlen($val)-1]);
            $val = (int)$val;
            switch($last) {
                case 'g': $val *= 1024;
                case 'm': $val *= 1024;
                case 'k': $val *= 1024;
            }
            return $val;
        }

        foreach ($config as $key => $values) {
            $current = $values['current'];
            $recommended = $values['recommended'];

            if (in_array($key, ['upload_max_filesize', 'post_max_size', 'memory_limit'])) {
                $currentBytes = convertToBytes($current);
                $recommendedBytes = convertToBytes($recommended);
                $status = $currentBytes >= $recommendedBytes ? 'ok' : 'error';
            } else {
                $status = (int)$current >= (int)$recommended ? 'ok' : 'warning';
            }

            echo "<tr>";
            echo "<td><strong>$key</strong></td>";
            echo "<td>$current</td>";
            echo "<td>$recommended</td>";
            echo "<td class='$status'>" . ($status === 'ok' ? '✅ OK' : ($status === 'warning' ? '⚠️ Faible' : '❌ Trop bas')) . "</td>";
            echo "</tr>";
        }
        ?>
    </table>

    <h2>🌐 Informations Serveur Web</h2>
    <table>
        <tr><th>Paramètre</th><th>Valeur</th></tr>
        <tr><td>Serveur Web</td><td><?= $_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu' ?></td></tr>
        <tr><td>Version PHP</td><td><?= PHP_VERSION ?></td></tr>
        <tr><td>SAPI</td><td><?= php_sapi_name() ?></td></tr>
        <tr><td>Système</td><td><?= PHP_OS ?></td></tr>
        <tr><td>Fichier php.ini</td><td><?= php_ini_loaded_file() ?></td></tr>
    </table>

    <h2>📁 Test d'Upload</h2>
    <div class="info">
        <p>Testez avec un petit fichier audio (moins de 2MB) :</p>
        <form enctype="multipart/form-data" method="post">
            <input type="file" name="test_file" accept=".mp3,.wav,.m4a" />
            <button type="submit">Tester Upload</button>
        </form>

        <?php
        if ($_POST && isset($_FILES['test_file'])) {
            $file = $_FILES['test_file'];
            echo "<h3>Résultat du test :</h3>";
            echo "<table>";
            echo "<tr><td>Nom du fichier</td><td>{$file['name']}</td></tr>";
            echo "<tr><td>Taille</td><td>" . round($file['size'] / 1024 / 1024, 2) . " MB</td></tr>";
            echo "<tr><td>Type MIME</td><td>{$file['type']}</td></tr>";
            echo "<tr><td>Erreur upload</td><td>";

            switch ($file['error']) {
                case UPLOAD_ERR_OK:
                    echo "<span class='ok'>✅ Aucune erreur</span>";
                    break;
                case UPLOAD_ERR_INI_SIZE:
                    echo "<span class='error'>❌ Fichier trop gros (upload_max_filesize)</span>";
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    echo "<span class='error'>❌ Fichier trop gros (MAX_FILE_SIZE)</span>";
                    break;
                case UPLOAD_ERR_PARTIAL:
                    echo "<span class='warning'>⚠️ Upload partiel</span>";
                    break;
                case UPLOAD_ERR_NO_FILE:
                    echo "<span class='warning'>⚠️ Aucun fichier</span>";
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    echo "<span class='error'>❌ Dossier temporaire manquant</span>";
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    echo "<span class='error'>❌ Impossible d'écrire</span>";
                    break;
                case UPLOAD_ERR_EXTENSION:
                    echo "<span class='error'>❌ Extension bloquée</span>";
                    break;
                default:
                    echo "<span class='error'>❌ Erreur inconnue ({$file['error']})</span>";
            }
            echo "</td></tr>";
            echo "</table>";
        }
        ?>
    </div>

    <h2>🔧 Actions Recommandées</h2>
    <div class="info">
        <h3>1. Configuration PHP (php.ini)</h3>
        <pre>upload_max_filesize = 100M
post_max_size = 120M
memory_limit = 256M
max_execution_time = 300
max_input_time = 300</pre>

        <h3>2. Configuration Nginx</h3>
        <pre>client_max_body_size 100M;
client_body_timeout 300;
client_header_timeout 300;</pre>

        <h3>3. Redémarrer les services</h3>
        <pre>sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm</pre>
    </div>

    <h2>📞 Support</h2>
    <p>Une fois le diagnostic terminé, supprimez ce fichier et contactez votre administrateur serveur avec ces informations.</p>

    <script>
        // Auto-refresh toutes les 30 secondes pour voir les changements
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
