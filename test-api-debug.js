// Script de test pour identifier l'erreur 500 exacte
// À exécuter dans la console du navigateur ou avec Node.js

const API_BASE_URL = window.location.origin;
const TOKEN = localStorage.getItem('auth_token') || 'YOUR_TOKEN_HERE';

const testEndpoints = [
    {
        name: 'Test API de base',
        url: '/api/test-simple',
        method: 'GET',
        needsAuth: false
    },
    {
        name: 'Test ultra simple avec auth',
        url: '/api/payments/monetbil/cart-simple-test',
        method: 'POST',
        needsAuth: true,
        data: { test: 'data' }
    },
    {
        name: 'Test debug level 1',
        url: '/api/payments/debug/level1',
        method: 'POST',
        needsAuth: true,
        data: { test: 'level1' }
    },
    {
        name: 'Test debug level 2',
        url: '/api/payments/debug/level2',
        method: 'POST',
        needsAuth: true,
        data: { test: 'level2' }
    },
    {
        name: 'Test debug level 3',
        url: '/api/payments/debug/level3',
        method: 'POST',
        needsAuth: true,
        data: { test: 'level3' }
    },
    {
        name: 'Test endpoint principal (problématique)',
        url: '/api/payments/monetbil/cart',
        method: 'POST',
        needsAuth: true,
        data: {
            user_id: 1,
            items: [{ id: 1, type: 'sound', quantity: 1, price: 1000 }],
            subtotal: 1000,
            total: 1000,
            payment_method: 'monetbil'
        }
    }
];

async function testEndpoint(test) {
    console.log(`🧪 Test: ${test.name}`);
    console.log(`📡 URL: ${test.url}`);
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (test.needsAuth) {
        headers['Authorization'] = `Bearer ${TOKEN}`;
    }
    
    const options = {
        method: test.method,
        headers: headers
    };
    
    if (test.data) {
        options.body = JSON.stringify(test.data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${test.url}`, options);
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        console.log(`📄 Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`✅ JSON Response:`, data);
        } else {
            const text = await response.text();
            console.log(`❌ Non-JSON Response (first 200 chars):`, text.substring(0, 200));
            
            // Chercher des indices dans la réponse HTML
            if (text.includes('<!-- file_')) {
                console.log('🔍 Détection d\'erreur Laravel avec stack trace');
                const match = text.match(/<!-- file_([^>]+) -->/);
                if (match) {
                    console.log(`📁 Fichier d'erreur: ${match[1]}`);
                }
            }
            
            if (text.includes('FatalErrorException') || text.includes('ErrorException')) {
                console.log('💥 Erreur PHP fatale détectée');
            }
            
            if (text.includes('Class ') && text.includes(' not found')) {
                console.log('🚫 Classe non trouvée');
            }
        }
        
    } catch (error) {
        console.log(`❌ Erreur réseau:`, error.message);
    }
    
    console.log('---');
}

async function runAllTests() {
    console.log('🚀 Début des tests de debug API');
    console.log(`🌐 Base URL: ${API_BASE_URL}`);
    console.log(`🔑 Token: ${TOKEN ? TOKEN.substring(0, 20) + '...' : 'NON DÉFINI'}`);
    console.log('');
    
    for (const test of testEndpoints) {
        await testEndpoint(test);
        await new Promise(resolve => setTimeout(resolve, 500)); // Pause entre les tests
    }
    
    console.log('✅ Tous les tests terminés');
}

// Instructions d'utilisation
console.log(`
📋 INSTRUCTIONS:
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Console
3. Copiez/collez ce script
4. Exécutez: runAllTests()
5. Analysez les résultats

💡 ALTERNATIVE CURL:
curl -X POST ${API_BASE_URL}/api/payments/monetbil/cart-simple-test \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"test":"data"}'
`);

// Fonction d'aide pour tester un seul endpoint
window.testSingleEndpoint = (index) => {
    if (testEndpoints[index]) {
        testEndpoint(testEndpoints[index]);
    } else {
        console.log('Index invalide. Endpoints disponibles:', testEndpoints.map((t, i) => `${i}: ${t.name}`));
    }
};

// Exporter la fonction principale
window.runAllTests = runAllTests;