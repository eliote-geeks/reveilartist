import axios from 'axios';

// Créer une instance Axios avec la configuration de base
const instance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Intercepteur pour ajouter le token d'authentification
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        console.log('Token trouvé dans localStorage:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Headers de la requête:', config.headers);
        }
        return config;
    },
    (error) => {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs d'authentification
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Erreur de réponse:', error.response && error.response.status, error.response && error.response.data);
        if (error.response && error.response.status === 401) {
            console.log('Erreur 401 détectée, suppression du token');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;