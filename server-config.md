# Configuration Serveur pour Upload Audio - RéveilArt4Artist

## Problème actuel
Erreur 413 (Request Entity Too Large) lors de l'upload de fichiers audio sur https://reveilart4arist.com/

## Configurations à appliquer

### 1. Configuration PHP (`php.ini`)

Localisez votre fichier `php.ini` et modifiez les valeurs suivantes :

```ini
; Taille maximale des fichiers uploadés
upload_max_filesize = 100M

; Taille maximale des données POST (doit être >= upload_max_filesize)
post_max_size = 120M

; Limite de mémoire PHP
memory_limit = 256M

; Temps d'exécution maximum
max_execution_time = 300

; Temps d'attente pour les uploads
max_input_time = 300

; Nombre maximum de fichiers uploadés simultanément
max_file_uploads = 20
```

### 2. Configuration Nginx (si vous utilisez Nginx)

Dans votre configuration de site (`/etc/nginx/sites-available/reveilart4arist.com`) :

```nginx
server {
    # ... autres configurations ...
    
    # Limite de taille pour les uploads
    client_max_body_size 100M;
    
    # Timeouts pour les gros uploads
    client_body_timeout 300;
    client_header_timeout 300;
    
    # Buffer pour les uploads
    client_body_buffer_size 128k;
    
    location ~ \.php$ {
        # ... configuration PHP-FPM ...
        
        # Timeouts spécifiques pour PHP
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }
}
```

### 3. Configuration Apache (si vous utilisez Apache)

Dans votre `.htaccess` ou configuration de site :

```apache
# Limite de taille pour les uploads
LimitRequestBody 104857600  # 100MB en bytes

# Dans php.ini ou .htaccess
php_value upload_max_filesize 100M
php_value post_max_size 120M
php_value memory_limit 256M
php_value max_execution_time 300
php_value max_input_time 300
```

### 4. Configuration Laravel

Dans `config/filesystems.php`, vous pouvez ajouter :

```php
'upload_limits' => [
    'max_file_size' => '100M',
    'allowed_types' => 'mp3,wav,m4a,aac,flac',
],
```

### 5. Validation côté application

Votre validation actuelle dans `Api/SoundController.php` est déjà correcte :

```php
'audio_file' => 'required|file|mimes:mp3,wav,m4a|max:51200', // Max 50MB
```

## Commandes à exécuter sur le serveur

```bash
# 1. Redémarrer PHP-FPM (si applicable)
sudo systemctl restart php8.1-fpm  # ou php8.2-fpm selon votre version

# 2. Redémarrer Nginx
sudo systemctl restart nginx

# 3. Redémarrer Apache (si applicable)
sudo systemctl restart apache2

# 4. Vérifier la configuration PHP
php -i | grep -E "(upload_max_filesize|post_max_size|memory_limit)"

# 5. Vider le cache Laravel
php artisan config:clear
php artisan cache:clear
```

## Tests de vérification

### Test 1: Vérifier les limites PHP
Créez un fichier `phpinfo.php` temporaire :

```php
<?php
phpinfo();
```

Consultez : https://reveilart4arist.com/phpinfo.php
Recherchez : `upload_max_filesize`, `post_max_size`, `memory_limit`

**IMPORTANT** : Supprimez ce fichier après vérification pour la sécurité !

### Test 2: Test d'upload via API
```bash
curl -X POST https://reveilart4arist.com/api/sounds \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio_file=@test_audio.mp3" \
  -F "title=Test Upload" \
  -F "category_id=1"
```

## Valeurs recommandées par taille de fichier

| Type de fichier | Taille moyenne | Configuration recommandée |
|----------------|----------------|---------------------------|
| MP3 standard   | 5-15 MB       | 50MB max                  |
| WAV haute qualité | 30-80 MB   | 100MB max                 |
| Audio professionnel | 50-200 MB | 250MB max                |

## Messages d'erreur et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| 413 Request Entity Too Large | Serveur web | Augmenter `client_max_body_size` |
| Memory limit exceeded | PHP | Augmenter `memory_limit` |
| Maximum execution time exceeded | PHP | Augmenter `max_execution_time` |
| File too large | Laravel | Vérifier validation `max:` | 
