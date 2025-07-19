#!/bin/bash

echo "=== CORRECTION AUTOMATIQUE ERREUR 500 ==="
echo "Date: $(date)"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Détection du serveur web
if pgrep apache2 > /dev/null; then
    WEB_USER="www-data"
    WEB_SERVICE="apache2"
elif pgrep nginx > /dev/null; then
    WEB_USER="www-data"
    WEB_SERVICE="nginx"
else
    WEB_USER="www-data"
    WEB_SERVICE="apache2"
fi

echo -e "${YELLOW}1. CORRECTION DES PERMISSIONS${NC}"
echo "================================="

# Créer les dossiers manquants
echo "📁 Création des dossiers nécessaires..."
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/app/public
mkdir -p bootstrap/cache

# Correction des propriétaires
echo "👤 Correction des propriétaires..."
chown -R $WEB_USER:$WEB_USER storage
chown -R $WEB_USER:$WEB_USER bootstrap/cache

# Correction des permissions
echo "🔐 Correction des permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod -R 775 storage/logs
chmod -R 775 storage/framework/cache
chmod -R 775 storage/framework/sessions
chmod -R 775 storage/framework/views

# Fichier de log spécifique
touch storage/logs/laravel.log
chown $WEB_USER:$WEB_USER storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

echo -e "${GREEN}✅ Permissions corrigées${NC}"

echo ""
echo -e "${YELLOW}2. NETTOYAGE DES CACHES LARAVEL${NC}"
echo "=================================="

# Nettoyage des caches
echo "🧹 Nettoyage des caches..."
php artisan config:clear 2>/dev/null && echo "  ✅ Config cache cleared" || echo "  ⚠️ Config cache failed"
php artisan cache:clear 2>/dev/null && echo "  ✅ App cache cleared" || echo "  ⚠️ App cache failed"
php artisan view:clear 2>/dev/null && echo "  ✅ View cache cleared" || echo "  ⚠️ View cache failed"
php artisan route:clear 2>/dev/null && echo "  ✅ Route cache cleared" || echo "  ⚠️ Route cache failed"

# Optimization (optionnel en production)
echo "⚡ Optimisation..."
php artisan config:cache 2>/dev/null && echo "  ✅ Config cached" || echo "  ⚠️ Config cache failed"
php artisan route:cache 2>/dev/null && echo "  ✅ Routes cached" || echo "  ⚠️ Route cache failed"

echo ""
echo -e "${YELLOW}3. VÉRIFICATION DE LA CONFIGURATION${NC}"
echo "===================================="

# Vérification du fichier .env
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"
    
    if grep -q "MONETBIL_SERVICE_KEY" .env; then
        echo "✅ MONETBIL_SERVICE_KEY configurée"
    else
        echo "⚠️ MONETBIL_SERVICE_KEY manquante"
        echo ""
        echo "Ajoutez ces lignes à votre fichier .env:"
        echo "MONETBIL_SERVICE_KEY=9SiC3m3h0CD4PuVHqYIrW7Z7j4iW2lPs"
        echo "MONETBIL_SERVICE_SECRET=xNksRpLCRWmG67bVXUb3YGITftKIbtkNXRp2gKLj9jWi3lySOa1Dnhg5l4LToZ98"
        echo "MONETBIL_CURRENCY=XAF"
        echo "MONETBIL_COUNTRY=CM"
        echo "MONETBIL_LANG=fr"
    fi
    
    if grep -q "APP_DEBUG=true" .env; then
        echo "✅ APP_DEBUG activé (bon pour debug)"
    else
        echo "⚠️ APP_DEBUG désactivé"
        echo "Pour debug, définissez: APP_DEBUG=true"
    fi
else
    echo "❌ Fichier .env manquant"
    echo "Copiez .env.example vers .env et configurez-le"
fi

echo ""
echo -e "${YELLOW}4. TEST DE L'API${NC}"
echo "================="

# Test de l'API status
echo "🔍 Test de l'API de base..."
if command -v curl > /dev/null; then
    DOMAIN=$(grep APP_URL .env | cut -d '=' -f2 | tr -d '"' 2>/dev/null || echo "http://localhost")
    
    echo "  Testing: $DOMAIN/api/status"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/status" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ API de base fonctionne (HTTP $HTTP_CODE)"
    else
        echo "  ❌ API de base échoue (HTTP $HTTP_CODE)"
    fi
    
    echo "  Testing: $DOMAIN/api/test-simple"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/test-simple" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ API de test fonctionne (HTTP $HTTP_CODE)"
    else
        echo "  ❌ API de test échoue (HTTP $HTTP_CODE)"
    fi
else
    echo "  ⚠️ curl non disponible pour les tests"
fi

echo ""
echo -e "${YELLOW}5. REDÉMARRAGE DU SERVEUR WEB${NC}"
echo "=================================="

echo "🔄 Redémarrage de $WEB_SERVICE..."
systemctl restart $WEB_SERVICE 2>/dev/null && echo "  ✅ $WEB_SERVICE redémarré" || echo "  ⚠️ Échec redémarrage $WEB_SERVICE"

echo ""
echo -e "${GREEN}=== CORRECTION TERMINÉE ===${NC}"
echo ""
echo "📋 ÉTAPES SUIVANTES:"
echo "1. Vérifiez les logs: tail -f storage/logs/laravel.log"
echo "2. Testez l'API: curl http://votre-domaine.com/api/status"
echo "3. Testez le paiement debug: POST /api/payments/monetbil/cart-debug"
echo "4. Si tout fonctionne, utilisez: POST /api/payments/monetbil/cart"
echo ""
echo "🔍 ENDPOINTS DE DEBUG DISPONIBLES:"
echo "   GET  /api/test-simple"
echo "   POST /api/test-monetbil-payment"
echo "   POST /api/payments/monetbil/cart-debug"
echo ""

# Créer un fichier de vérification final
echo "$(date): Correction automatique exécutée" > storage/logs/fix-500-completed.log
chown $WEB_USER:$WEB_USER storage/logs/fix-500-completed.log

echo -e "${GREEN}🎉 Script de correction terminé avec succès!${NC}"