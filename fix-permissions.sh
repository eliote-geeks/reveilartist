#!/bin/bash

echo "=== DIAGNOSTIC DES PERMISSIONS LARAVEL ==="
echo "Date: $(date)"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== INFORMATIONS SYSTÈME ===${NC}"
echo "Utilisateur actuel: $(whoami)"
echo "Groupe actuel: $(groups)"
echo "Serveur web détecté:"
if pgrep apache2 > /dev/null; then
    echo "  - Apache2 détecté"
    WEB_USER="www-data"
elif pgrep nginx > /dev/null; then
    echo "  - Nginx détecté"
    WEB_USER="www-data"
else
    echo "  - Serveur web non détecté"
    WEB_USER="www-data"
fi
echo "Utilisateur du serveur web: $WEB_USER"
echo ""

echo -e "${YELLOW}=== VÉRIFICATION DES DOSSIERS CRITIQUES ===${NC}"

# Fonction pour vérifier les permissions
check_permissions() {
    local path=$1
    local name=$2
    
    if [ -d "$path" ]; then
        local perms=$(stat -c "%a" "$path" 2>/dev/null)
        local owner=$(stat -c "%U:%G" "$path" 2>/dev/null)
        echo "📁 $name:"
        echo "   Chemin: $path"
        echo "   Permissions: $perms"
        echo "   Propriétaire: $owner"
        
        if [ "$perms" = "775" ] || [ "$perms" = "755" ]; then
            echo -e "   Status: ${GREEN}✓ OK${NC}"
        else
            echo -e "   Status: ${RED}✗ PROBLÈME${NC}"
        fi
    else
        echo -e "📁 $name: ${RED}✗ DOSSIER MANQUANT${NC}"
    fi
    echo ""
}

# Vérification des dossiers
check_permissions "storage" "Storage"
check_permissions "storage/logs" "Storage/Logs"
check_permissions "storage/framework" "Storage/Framework"
check_permissions "storage/framework/cache" "Storage/Framework/Cache"
check_permissions "storage/framework/sessions" "Storage/Framework/Sessions"
check_permissions "storage/framework/views" "Storage/Framework/Views"
check_permissions "storage/app" "Storage/App"
check_permissions "bootstrap/cache" "Bootstrap/Cache"

echo -e "${YELLOW}=== VÉRIFICATION DES FICHIERS ===${NC}"
if [ -f "storage/logs/laravel.log" ]; then
    local perms=$(stat -c "%a" "storage/logs/laravel.log" 2>/dev/null)
    local owner=$(stat -c "%U:%G" "storage/logs/laravel.log" 2>/dev/null)
    echo "📄 Laravel Log:"
    echo "   Permissions: $perms"
    echo "   Propriétaire: $owner"
else
    echo -e "📄 Laravel Log: ${YELLOW}Fichier n'existe pas${NC}"
fi
echo ""

echo -e "${YELLOW}=== SOLUTION RECOMMANDÉE ===${NC}"
echo "Pour corriger les permissions, exécutez les commandes suivantes:"
echo ""
echo -e "${GREEN}# 1. Définir le propriétaire correct${NC}"
echo "sudo chown -R $WEB_USER:$WEB_USER storage bootstrap/cache"
echo ""
echo -e "${GREEN}# 2. Définir les permissions${NC}"
echo "sudo chmod -R 775 storage"
echo "sudo chmod -R 775 bootstrap/cache"
echo ""
echo -e "${GREEN}# 3. Si vous développez en local, ajoutez votre utilisateur au groupe${NC}"
echo "sudo usermod -a -G $WEB_USER \$(whoami)"
echo ""
echo -e "${GREEN}# 4. Alternative pour développement local${NC}"
echo "sudo chmod -R 777 storage bootstrap/cache"
echo ""

echo -e "${YELLOW}=== COMMANDES AUTOMATIQUES ===${NC}"
echo "Voulez-vous que ce script applique automatiquement les corrections ?"
echo "Appuyez sur 'y' pour oui, ou toute autre touche pour non:"
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Application des corrections...${NC}"
    
    # Création des dossiers si manquants
    sudo mkdir -p storage/logs
    sudo mkdir -p storage/framework/cache
    sudo mkdir -p storage/framework/sessions
    sudo mkdir -p storage/framework/views
    sudo mkdir -p storage/app/public
    sudo mkdir -p bootstrap/cache
    
    # Application des permissions
    sudo chown -R $WEB_USER:$WEB_USER storage bootstrap/cache
    sudo chmod -R 775 storage
    sudo chmod -R 775 bootstrap/cache
    
    # Création du fichier de log s'il n'existe pas
    sudo touch storage/logs/laravel.log
    sudo chown $WEB_USER:$WEB_USER storage/logs/laravel.log
    sudo chmod 664 storage/logs/laravel.log
    
    echo -e "${GREEN}✓ Corrections appliquées !${NC}"
    
    # Vérification finale
    echo ""
    echo -e "${YELLOW}=== VÉRIFICATION FINALE ===${NC}"
    check_permissions "storage" "Storage"
    check_permissions "bootstrap/cache" "Bootstrap/Cache"
else
    echo "Aucune correction appliquée."
fi

echo ""
echo -e "${YELLOW}=== COMMANDES LARAVEL UTILES ===${NC}"
echo "Après correction, exécutez:"
echo "php artisan config:clear"
echo "php artisan cache:clear"
echo "php artisan view:clear"
echo "php artisan route:clear"