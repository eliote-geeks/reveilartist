#!/bin/bash

# Script de correction des permissions pour la production
# À exécuter sur le serveur de production avec sudo

echo "=== CORRECTION DES PERMISSIONS LARAVEL - PRODUCTION ==="
echo "Date: $(date)"
echo ""

# Détection du serveur web
if pgrep apache2 > /dev/null; then
    WEB_USER="www-data"
    echo "✓ Apache2 détecté - Utilisateur: $WEB_USER"
elif pgrep nginx > /dev/null; then
    WEB_USER="www-data" 
    echo "✓ Nginx détecté - Utilisateur: $WEB_USER"
else
    WEB_USER="www-data"
    echo "⚠ Serveur web non détecté - Utilisation par défaut: $WEB_USER"
fi

echo ""
echo "🔧 Création des dossiers manquants..."

# Création des dossiers nécessaires
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions  
mkdir -p storage/framework/views
mkdir -p storage/app/public
mkdir -p bootstrap/cache

echo "✓ Dossiers créés"

echo ""
echo "🔐 Application des propriétaires..."

# Application des propriétaires
chown -R $WEB_USER:$WEB_USER storage
chown -R $WEB_USER:$WEB_USER bootstrap/cache

echo "✓ Propriétaires appliqués"

echo ""
echo "📁 Application des permissions..."

# Application des permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Permissions spéciales pour les logs et cache
chmod -R 775 storage/logs
chmod -R 775 storage/framework/cache
chmod -R 775 storage/framework/sessions
chmod -R 775 storage/framework/views

echo "✓ Permissions appliquées"

echo ""
echo "📄 Gestion du fichier de log..."

# Création et configuration du fichier de log
touch storage/logs/laravel.log
chown $WEB_USER:$WEB_USER storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

echo "✓ Fichier de log configuré"

echo ""
echo "🧹 Nettoyage du cache Laravel..."

# Nettoyage des caches Laravel
if [ -f "artisan" ]; then
    php artisan config:clear 2>/dev/null || echo "⚠ Impossible de vider config:clear"
    php artisan cache:clear 2>/dev/null || echo "⚠ Impossible de vider cache:clear"  
    php artisan view:clear 2>/dev/null || echo "⚠ Impossible de vider view:clear"
    php artisan route:clear 2>/dev/null || echo "⚠ Impossible de vider route:clear"
    echo "✓ Cache Laravel nettoyé"
else
    echo "⚠ Fichier artisan non trouvé - nettoyage manuel requis"
fi

echo ""
echo "🔍 Vérification finale..."

# Vérification finale
echo "Storage permissions: $(stat -c "%a" storage 2>/dev/null || echo 'N/A')"
echo "Bootstrap/cache permissions: $(stat -c "%a" bootstrap/cache 2>/dev/null || echo 'N/A')"
echo "Laravel log permissions: $(stat -c "%a" storage/logs/laravel.log 2>/dev/null || echo 'N/A')"

echo ""
echo "✅ CORRECTION TERMINÉE !"
echo ""
echo "📝 Commandes utiles pour tester:"
echo "   tail -f storage/logs/laravel.log    # Surveiller les logs"
echo "   ls -la storage/                     # Vérifier les permissions"
echo "   ls -la bootstrap/cache/             # Vérifier les permissions"
echo ""
echo "🌐 Redémarrage du serveur web recommandé:"
echo "   sudo systemctl restart apache2     # Pour Apache"
echo "   sudo systemctl restart nginx       # Pour Nginx"