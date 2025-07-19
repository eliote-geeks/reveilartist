#!/bin/bash

echo "=== TESTS DE DIAGNOSTIC POUR reveilart4arist.com ==="
echo ""

BASE_URL="http://reveilart4arist.com"

echo "🧪 Test 1: API de base (sans authentification)"
echo "================================================"
curl -X GET "$BASE_URL/api/test-simple" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s
echo ""

echo "🔑 Test 2: Authentification (remplacez YOUR_TOKEN)"
echo "=================================================="
echo "curl -X GET \"$BASE_URL/api/test-auth\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\""
echo ""

echo "🚀 Test 3: Endpoint ultra-simple (avec votre token)"
echo "=================================================="
echo "curl -X POST \"$BASE_URL/api/payments/monetbil/cart-simple-test\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"test\":\"data\"}'"
echo ""

echo "🔍 Test 4: Diagnostic complet (avec votre token et user_id)"
echo "=========================================================="
echo "curl -X POST \"$BASE_URL/api/payments/monetbil/cart-diagnostic\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":1,\"items\":[{\"id\":1,\"type\":\"sound\",\"quantity\":1,\"price\":1000}],\"total\":1000}'"
echo ""

echo "💥 Test 5: Endpoint problématique original (avec vos vraies données)"
echo "=================================================================="
echo "curl -X POST \"$BASE_URL/api/payments/monetbil/cart\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":1,\"items\":[{\"id\":1,\"type\":\"sound\",\"quantity\":1,\"price\":1000}],\"subtotal\":1000,\"total\":1000,\"payment_method\":\"monetbil\"}'"
echo ""

echo "📋 INSTRUCTIONS:"
echo "1. Remplacez YOUR_TOKEN par votre vrai token d'auth"
echo "2. Remplacez user_id par votre vrai ID utilisateur"
echo "3. Exécutez les commandes une par une"
echo "4. Notez à quel test l'erreur 500 commence"
echo ""

echo "🔧 Pour obtenir votre token:"
echo "1. Connectez-vous sur $BASE_URL"
echo "2. Ouvrez DevTools (F12) > Console"
echo "3. Tapez: localStorage.getItem('auth_token')"
echo "4. Copiez le token affiché"
echo ""

echo "📊 Pour vérifier votre user_id:"
echo "curl -X GET \"$BASE_URL/api/user\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\""