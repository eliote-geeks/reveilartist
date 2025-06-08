/**
 * Gestionnaire d'erreurs pour les uploads de fichiers audio
 * RéveilArt4Artist - https://reveilart4arist.com/
 */

class UploadErrorHandler {

    /**
     * Gère les erreurs de réponse HTTP
     */
    static async handleResponse(response) {
        if (!response.ok) {
            const errorData = await this.parseErrorResponse(response);
            throw new Error(this.getErrorMessage(response.status, errorData));
        }
        return response;
    }

    /**
     * Parse la réponse d'erreur (JSON ou HTML)
     */
    static async parseErrorResponse(response) {
        try {
            const text = await response.text();

            // Essayer de parser comme JSON
            try {
                return JSON.parse(text);
            } catch (jsonError) {
                // Si ce n'est pas du JSON, c'est probablement du HTML
                return {
                    html_error: true,
                    content: text,
                    status: response.status
                };
            }
        } catch (error) {
            return { error: 'Impossible de lire la réponse du serveur' };
        }
    }

    /**
     * Génère un message d'erreur utilisateur approprié
     */
    static getErrorMessage(status, errorData) {
        switch (status) {
            case 413:
                return 'Fichier trop volumineux. Taille maximale autorisée : 50MB.\n' +
                    'Conseils :\n' +
                    '• Compressez votre fichier audio\n' +
                    '• Utilisez un format MP3 avec un bitrate plus faible\n' +
                    '• Vérifiez que votre fichier fait moins de 50MB';

            case 422:
                if (errorData.errors) {
                    const errors = Object.values(errorData.errors).flat();
                    return 'Erreurs de validation :\n' + errors.join('\n');
                }
                return 'Données invalides. Vérifiez votre fichier et réessayez.';

            case 500:
                return 'Erreur serveur. Veuillez réessayer dans quelques minutes.';

            case 401:
                return 'Session expirée. Veuillez vous reconnecter.';

            case 404:
                return 'Endpoint non trouvé. Contactez le support technique.';

            case 502:
            case 503:
            case 504:
                return 'Serveur temporairement indisponible. Réessayez dans quelques minutes.';

            default:
                if (errorData.html_error) {
                    // Extraire le titre de la page d'erreur HTML si possible
                    const titleMatch = errorData.content.match(/<title>(.*?)<\/title>/i);
                    const title = titleMatch ? titleMatch[1] : 'Erreur serveur';
                    return `Erreur ${status}: ${title}`;
                }

                return errorData.message ||
                    `Erreur ${status}: ${errorData.error || 'Erreur inconnue'}`;
        }
    }

    /**
     * Vérifie la taille du fichier avant l'upload
     */
    static validateFileSize(file, maxSizeMB = 50) {
        const maxBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxBytes) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            throw new Error(
                `Fichier trop volumineux (${fileSizeMB}MB).\n` +
                `Taille maximale autorisée : ${maxSizeMB}MB.`
            );
        }

        return true;
    }

    /**
     * Vérifie le type de fichier
     */
    static validateFileType(file, allowedTypes = ['mp3', 'wav', 'm4a', 'aac']) {
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(extension)) {
            throw new Error(
                `Type de fichier non autorisé (${extension}).\n` +
                `Types autorisés : ${allowedTypes.join(', ')}.`
            );
        }

        return true;
    }

    /**
     * Affiche une notification d'erreur à l'utilisateur
     */
    static showErrorNotification(message) {
        // Adapter selon votre système de notifications
        if (typeof toast !== 'undefined') {
            toast.error(message);
        } else if (typeof alert !== 'undefined') {
            alert(message);
        } else {
            console.error('Erreur upload:', message);
        }
    }

    /**
     * Upload avec gestion d'erreurs complète
     */
    static async uploadWithErrorHandling(url, formData, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: options.headers || {},
                ...options
            });

            await this.handleResponse(response);
            return await response.json();

        } catch (error) {
            this.showErrorNotification(error.message);
            throw error;
        }
    }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.UploadErrorHandler = UploadErrorHandler;
}

// Exemple d'utilisation
/*
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('audio_file');
    const file = fileInput.files[0];

    try {
        // Validation côté client
        UploadErrorHandler.validateFileSize(file, 50);
        UploadErrorHandler.validateFileType(file);

        // Préparation des données
        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('title', document.getElementById('title').value);

        // Upload avec gestion d'erreurs
        const result = await UploadErrorHandler.uploadWithErrorHandling(
            'https://reveilart4arist.com/api/sounds',
            formData,
            {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Accept': 'application/json'
                }
            }
        );

        console.log('Upload réussi:', result);

    } catch (error) {
        console.error('Erreur upload:', error.message);
    }
});
*/