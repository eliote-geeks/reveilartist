import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Badge, ListGroup, ProgressBar, Form, InputGroup, Spinner, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faMusic,
    faShoppingBag,
    faHeart,
    faCog,
    faDownload,
    faCalendar,
    faStar,
    faEye,
    faHeadphones,
    faPlay,
    faPause,
    faEdit,
    faTrash,
    faPlus,
    faUpload,
    faCalendarAlt,
    faTicketAlt,
    faEuroSign,
    faUsers,
    faMapMarkerAlt,
    faClock,
    faSearch,
    faFilter,
    faSort,
    faChartLine,
    faShare,
    faBookmark,
    faBell,
    faPrint,
    faUserPlus,
    faCheckCircle,
    faInfoCircle,
    faExclamationTriangle,
    faTimesCircle,
    faPhone,
    faEnvelope,
    faTrophy,
    faGift,
    faCoins,
    faUserCheck,
    faVolumeUp,
    faVolumeMute,
    faForward,
    faBackward,
    faStop,
    faExternalLinkAlt,
    faUserMinus
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner, { LoadingOverlay } from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AudioPlayer from '../common/AudioPlayer';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('sounds');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileData, setProfileData] = useState(null);

    // Données des achats utilisateur
    const [purchasedSounds, setPurchasedSounds] = useState([]);
    const [purchasedEvents, setPurchasedEvents] = useState([]);

    // Données des favoris
    const [favoriteSounds, setFavoriteSounds] = useState([]);
    const [favoriteArtists, setFavoriteArtists] = useState([]);
    const [followedArtists, setFollowedArtists] = useState([]);

    // Données des créations
    const [mySounds, setMySounds] = useState([]);
    const [pendingSounds, setPendingSounds] = useState([]);

    // Notifications
    const [notifications, setNotifications] = useState([]);

    // Sons et favoris
    const [purchasedTickets, setPurchasedTickets] = useState([]);

    // Statistiques utilisateur
    const [userStats, setUserStats] = useState({
        totalPurchases: 0,
        totalSpent: 0,
        favoritesCount: 0,
        eventsAttended: 0
    });

    // Audio Player State
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [audioRef, setAudioRef] = useState(null);

    const { user, token, loading: authLoading, isAuthenticated } = useAuth();
    const toast = useToast();

    // Initialiser l'audio
    useEffect(() => {
        const audio = new Audio();
        audio.volume = volume;

        audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        audio.addEventListener('ended', () => {
            handleNextTrack();
        });

        setAudioRef(audio);

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Logs de débogage pour l'authentification
    useEffect(() => {
        console.log('🔐 État authentification Profile:', {
            user: user ? { id: user.id, name: user.name, role: user.role } : null,
            token: token ? 'TOKEN_PRÉSENT' : 'PAS_DE_TOKEN',
            authLoading,
            isAuthenticated,
            localStorage_token: localStorage.getItem('auth_token') ? 'PRÉSENT_LS' : 'ABSENT_LS'
        });
    }, [user, token, authLoading, isAuthenticated]);

    // Test de diagnostic d'authentification
    const runAuthDiagnostic = () => {
        console.log('🚀 DIAGNOSTIC AUTHENTIFICATION DÉTAILLÉ');
        console.log('================================');

        console.log('1. AuthContext State:');
        console.log('   - user:', user);
        console.log('   - token:', token);
        console.log('   - authLoading:', authLoading);
        console.log('   - isAuthenticated:', isAuthenticated);

        console.log('2. LocalStorage:');
        console.log('   - auth_token:', localStorage.getItem('auth_token'));
        console.log('   - user:', localStorage.getItem('user'));

        console.log('3. Cookies:', document.cookie);

        console.log('4. Axios headers:', window.axios?.defaults?.headers?.common);

        // Test d'une requête API directe
        if (token) {
            console.log('5. Test API direct...');
            fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                console.log('   - Statut:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('   - Données utilisateur:', data);
            })
            .catch(error => {
                console.error('   - Erreur API:', error);
            });
        } else {
            console.log('5. Pas de token pour tester l\'API');
        }

        console.log('================================');
        toast.info('Diagnostic', 'Vérifiez la console pour les détails (F12)');
    };

    // Simuler le chargement lors du changement d'onglet
    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setIsLoading(true);
            setTimeout(() => {
                setActiveTab(tab);
                setIsLoading(false);
            }, 800);
        }
    };

    // Charger les données depuis l'API - seulement après que l'authentification soit chargée
    useEffect(() => {
        // Attendre que l'authentification soit chargée
        if (authLoading) {
            console.log('⏳ Authentification en cours de chargement...');
            return;
        }

        // Vérifier que l'utilisateur est connecté
        if (!isAuthenticated || !user || !token) {
            console.log('❌ Utilisateur non authentifié:', { isAuthenticated, user: !!user, token: !!token });
            toast.error('Authentification requise', 'Veuillez vous connecter pour accéder à votre profil');
            return;
        }

        console.log('✅ Utilisateur authentifié, chargement des données...');
        loadUserData();
    }, [user, token, authLoading, isAuthenticated]);

    const loadUserData = async () => {
        setIsLoading(true);
        try {
            // Charger toutes les données en parallèle
            const [sounds, favorites, artists, tickets, stats] = await Promise.all([
                loadPurchasedSounds(),
                loadFavoriteSounds(),
                loadFollowedArtists(),
                loadPurchasedTickets(),
                loadUserStatsFromAPI()
            ]);

            // Si les statistiques de l'API sont disponibles, les utiliser
            if (stats) {
                setUserStats({
                    totalPurchases: stats.purchases.total_purchases,
                    totalSpent: stats.purchases.total_spent,
                    favoritesCount: stats.favorites.total,
                    eventsAttended: stats.purchases.events.count
                });
            } else {
                // Sinon, calculer les statistiques à partir des données chargées
                const totalSoundPurchases = sounds.reduce((sum, sound) => sum + (sound.purchase_price || sound.price || 0), 0);
                const totalEventPurchases = tickets.reduce((sum, ticket) => sum + (ticket.total_paid || ticket.ticket_price * ticket.quantity || 0), 0);

                const totalPurchases = sounds.length + tickets.length;
                const totalSpent = totalSoundPurchases + totalEventPurchases;
                const favoritesCount = favorites.length + artists.length;
                const eventsAttended = tickets.length;

                setUserStats({
                    totalPurchases,
                    totalSpent,
                    favoritesCount,
                    eventsAttended
                });
            }

            console.log('📊 Données chargées avec succès');

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            toast.error('Erreur', 'Impossible de charger vos données');
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserStatsFromAPI = async () => {
        try {
            const response = await fetch('/api/user/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Statistiques API reçues:', data.stats);
                return data.stats;
            }
        } catch (error) {
            console.error('Erreur statistiques API:', error);
        }
        return null;
    };

    const loadPurchasedSounds = async () => {
        try {
            const response = await fetch('/api/user/purchased-sounds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const sounds = Array.isArray(data) ? data : data.data || [];
                setPurchasedSounds(sounds);
                return sounds;
            }
        } catch (error) {
            console.error('Erreur purchased sounds:', error);
        }

        // Données de fallback
        const fallbackSounds = [
                {
                    id: 1,
                    title: "Beat Afro Moderne",
                    artist: "DJ Cameroun",
                    price: 2500,
                    purchase_date: "2024-03-15",
                    cover_image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
                audio_file_url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3",
                category: "Afrobeat",
                duration: "3:45",
                can_download: true
                },
                {
                    id: 2,
                    title: "Makossa Fusion",
                    artist: "UrbanSonic",
                    price: 3500,
                    purchase_date: "2024-03-10",
                    cover_image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
                audio_file_url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3",
                category: "Fusion",
                duration: "4:12",
                can_download: true
            }
        ];
        setPurchasedSounds(fallbackSounds);
        return fallbackSounds;
    };

    const loadFavoriteSounds = async () => {
        try {
            const response = await fetch('/api/user/favorite-sounds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const sounds = Array.isArray(data) ? data : data.data || [];
                setFavoriteSounds(sounds);
                return sounds;
            }
        } catch (error) {
            console.error('Erreur favorite sounds:', error);
        }

            // Données de fallback
        const fallbackFavorites = [
                {
                id: 3,
                    title: "Coupé-Décalé Beat",
                    artist: "BeatMaker237",
                price: 0, // Gratuit
                cover_image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
                audio_file_url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3",
                category: "Coupé-Décalé",
                duration: "3:20",
                is_free: true,
                can_play: true
            },
            {
                id: 4,
                    title: "Bikutsi Électro",
                    artist: "DJ Yaoundé",
                price: 2000, // Payant - ne peut pas jouer
                cover_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
                audio_file_url: null,
                category: "Bikutsi",
                duration: "3:55",
                is_free: false,
                can_play: false
            }
        ];
        setFavoriteSounds(fallbackFavorites);
        return fallbackFavorites;
    };

    const loadFollowedArtists = async () => {
        try {
            const response = await fetch('/api/user/followed-artists', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const artists = Array.isArray(data) ? data : data.data || [];
                setFollowedArtists(artists);
                return artists;
            }
        } catch (error) {
            console.error('Erreur followed artists:', error);
        }

        // Données de fallback
        const fallbackArtists = [
            {
                id: 1,
                name: "DJ Cameroun",
                profile_photo_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
                followers_count: 1250,
                sounds_count: 35,
                role: "artist",
                bio: "Producteur de beats afro modernes",
                location: "Douala, Cameroun",
                followed_at: "2024-03-15"
            },
            {
                id: 2,
                name: "UrbanSonic",
                profile_photo_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
                followers_count: 850,
                sounds_count: 22,
                role: "producer",
                bio: "Fusion makossa et sons urbains",
                location: "Yaoundé, Cameroun",
                followed_at: "2024-03-10"
            },
            {
                id: 3,
                name: "BeatMaker237",
                profile_photo_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
                followers_count: 675,
                sounds_count: 18,
                role: "artist",
                bio: "Spécialiste du coupé-décalé moderne",
                location: "Bafoussam, Cameroun",
                followed_at: "2024-02-28"
            }
        ];
        setFollowedArtists(fallbackArtists);
        return fallbackArtists;
    };

    const unfollowArtist = async (artistId) => {
        try {
            const response = await fetch(`/api/artists/${artistId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Retirer l'artiste de la liste
                setFollowedArtists(prev => prev.filter(artist => artist.id !== artistId));
                toast.success('Ne plus suivre', 'Vous ne suivez plus cet artiste');

                // Mettre à jour les statistiques
                setUserStats(prev => ({
                    ...prev,
                    favoritesCount: prev.favoritesCount - 1
                }));
            } else {
                toast.error('Erreur', 'Impossible de ne plus suivre cet artiste');
            }
        } catch (error) {
            console.error('Erreur unfollow:', error);
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const loadPurchasedTickets = async () => {
        try {
            const response = await fetch('/api/user/purchased-events', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const tickets = Array.isArray(data) ? data : data.data || [];
                setPurchasedTickets(tickets);
                return tickets;
            }
        } catch (error) {
            console.error('Erreur purchased tickets:', error);
        }

            // Données de fallback
        const fallbackTickets = [
                {
                    id: 1,
                title: "RéveilArt4artist Festival 2024",
                venue: "Stade Ahmadou Ahidjo",
                city: "Yaoundé",
                event_date: "2024-06-15",
                start_time: "20:00",
                ticket_price: 15000,
                quantity: 2,
                purchase_date: "2024-03-12",
                poster_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=200&fit=crop",
                order_number: "RVL-1710338400-GHI789",
                status: "confirmed"
            }
        ];
        setPurchasedTickets(fallbackTickets);
        return fallbackTickets;
    };

    // Audio Player Functions
    const buildPlaylist = () => {
        const playableSounds = [
            ...purchasedSounds.filter(sound => sound.audio_file_url),
            ...favoriteSounds.filter(sound => sound.can_play && sound.audio_file_url)
        ];
        setPlaylist(playableSounds);
        return playableSounds;
    };

    const playTrack = (sound, index = null) => {
        if (!audioRef) return;

        const currentPlaylist = buildPlaylist();
        const trackIndex = index !== null ? index : currentPlaylist.findIndex(s => s.id === sound.id);

        if (trackIndex === -1) {
            toast.warning('Lecture non disponible', 'Ce son n\'est pas disponible à la lecture');
            return;
        }

        audioRef.src = sound.audio_file_url;
        audioRef.load();

        setCurrentTrack(sound);
        setCurrentIndex(trackIndex);
        setPlaylist(currentPlaylist);

        audioRef.play().then(() => {
            setIsPlaying(true);
            toast.success('Lecture', `Lecture de "${sound.title}"`);
        }).catch(error => {
            console.error('Erreur de lecture:', error);
            toast.error('Erreur', 'Impossible de lire ce fichier audio');
        });
    };

    const togglePlayPause = () => {
        if (!audioRef || !currentTrack) return;

        if (isPlaying) {
            audioRef.pause();
            setIsPlaying(false);
        } else {
            audioRef.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error('Erreur de lecture:', error);
                toast.error('Erreur', 'Impossible de reprendre la lecture');
            });
        }
    };

    const stopTrack = () => {
        if (!audioRef) return;

        audioRef.pause();
        audioRef.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleNextTrack = () => {
        if (playlist.length === 0) return;

        const nextIndex = (currentIndex + 1) % playlist.length;
        playTrack(playlist[nextIndex], nextIndex);
    };

    const handlePreviousTrack = () => {
        if (playlist.length === 0) return;

        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        playTrack(playlist[prevIndex], prevIndex);
    };

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        if (audioRef) {
            audioRef.volume = newVolume;
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const downloadSound = (sound) => {
        if (!sound.can_download) {
            toast.error('Téléchargement non autorisé', 'Vous n\'avez pas les droits pour télécharger ce fichier');
            return;
        }

        const link = document.createElement('a');
        link.href = sound.audio_file_url || '#';
        link.download = `${sound.title}.mp3`;
        link.click();

        toast.success('Téléchargement', `${sound.title} est en cours de téléchargement`);
    };

    const printEventTicket = (event) => {
        const ticketWindow = window.open('', '_blank');
        const ticketHtml = generateTicketHTML(event);

        ticketWindow.document.write(ticketHtml);
        ticketWindow.document.close();
        ticketWindow.focus();
        ticketWindow.print();

        toast.success('Ticket imprimé', `Votre ticket pour ${event.title} est prêt`);
    };

    const generateTicketHTML = (event) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${event.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                    .ticket { border: 2px dashed #333; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
                    .ticket-header { text-align: center; margin-bottom: 20px; }
                    .event-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                    .ticket-info { margin-bottom: 15px; }
                    .ticket-info div { margin-bottom: 8px; }
                    .qr-placeholder { width: 80px; height: 80px; background: white; margin: 20px auto; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; }
                    .ticket-number { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 2px; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <div style="font-size: 24px;">🎵</div>
                        <div class="event-title">${event.title}</div>
                    </div>

                    <div class="ticket-info">
                        <div><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
                        <div><strong>🕒 Heure:</strong> ${event.start_time || '20:00'}</div>
                        <div><strong>📍 Lieu:</strong> ${event.venue}</div>
                        <div><strong>🏙️ Ville:</strong> ${event.city}</div>
                        <div><strong>🎫 Quantité:</strong> ${event.quantity} ticket(s)</div>
                        <div><strong>👤 Titulaire:</strong> ${user?.name}</div>
                    </div>

                    <div class="qr-placeholder">
                        QR CODE
                    </div>

                    <div class="ticket-number">
                        ${event.order_number}-${event.id}
                    </div>

                    <div style="text-align: center; margin-top: 15px; font-size: 12px;">
                        <p>Ticket valide - Présenter à l'entrée</p>
                        <p>Reveil4artist</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.warn('Erreur lors du marquage de la notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return faCheckCircle;
            case 'warning': return faExclamationTriangle;
            case 'error': return faTimesCircle;
            default: return faInfoCircle;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'text-success';
            case 'warning': return 'text-warning';
            case 'error': return 'text-danger';
            default: return 'text-info';
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'warning', text: 'En attente' },
            approved: { variant: 'success', text: 'Approuvé' },
            rejected: { variant: 'danger', text: 'Rejeté' },
            published: { variant: 'success', text: 'Publié' }
        };
        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const setSoundPrice = async (soundId, price) => {
        try {
            const response = await fetch(`/api/sounds/${soundId}/price`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: parseFloat(price) })
            });

            if (response.ok) {
                // Recharger les sons de l'utilisateur
                await loadUserData();
                toast.success('Prix défini', `Le prix de votre son a été mis à jour`);
            } else {
                toast.error('Erreur', 'Impossible de définir le prix');
            }
        } catch (error) {
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const handlePriceSubmit = (soundId) => {
        const priceInput = document.getElementById(`price-${soundId}`);
        const price = priceInput.value;

        if (!price || parseFloat(price) < 0) {
            toast.error('Erreur', 'Veuillez entrer un prix valide');
            return;
        }

        setSoundPrice(soundId, price);
    };

    const renderUserStats = () => (
        <Row className="g-3 mb-4">
            <Col md={3} sm={6}>
                <Card className="border-0 bg-primary text-white h-100" style={{ borderRadius: '12px' }}>
                        <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faCoins} className="mb-2" size="2x" />
                        <h4 className="fw-bold">{formatCurrency(userStats.totalSpent)}</h4>
                        <small>Total dépensé</small>
                        </Card.Body>
                    </Card>
                </Col>
            <Col md={3} sm={6}>
                <Card className="border-0 bg-success text-white h-100" style={{ borderRadius: '12px' }}>
                        <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faShoppingBag} className="mb-2" size="2x" />
                        <h4 className="fw-bold">{userStats.totalPurchases}</h4>
                        <small>Achats total</small>
                        </Card.Body>
                    </Card>
                </Col>
            <Col md={3} sm={6}>
                <Card className="border-0 bg-info text-white h-100" style={{ borderRadius: '12px' }}>
                        <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faHeart} className="mb-2" size="2x" />
                        <h4 className="fw-bold">{userStats.favoritesCount}</h4>
                        <small>Favoris</small>
                        </Card.Body>
                    </Card>
                </Col>
            <Col md={3} sm={6}>
                <Card className="border-0 bg-warning text-white h-100" style={{ borderRadius: '12px' }}>
                        <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faTicketAlt} className="mb-2" size="2x" />
                        <h4 className="fw-bold">{userStats.eventsAttended}</h4>
                        <small>Événements</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
    );

    const renderAudioPlayer = () => {
        if (!currentTrack) return null;

        return (
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <Card.Body>
                                            <div className="d-flex align-items-center">
                                                <img
                            src={currentTrack.cover_image_url}
                            alt={currentTrack.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                        <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{currentTrack.title}</h6>
                            <p className="text-muted mb-2 small">par {currentTrack.artist}</p>

                            <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handlePreviousTrack}
                                    disabled={playlist.length <= 1}
                                >
                                    <FontAwesomeIcon icon={faBackward} />
                                                        </Button>

                                            <Button
                                    variant={isPlaying ? "warning" : "success"}
                                                size="sm"
                                    onClick={togglePlayPause}
                                            >
                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                            </Button>

                                            <Button
                                    variant="outline-danger"
                                                size="sm"
                                    onClick={stopTrack}
                                            >
                                    <FontAwesomeIcon icon={faStop} />
                                            </Button>

                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleNextTrack}
                                    disabled={playlist.length <= 1}
                                >
                                    <FontAwesomeIcon icon={faForward} />
                        </Button>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <small>{formatTime(currentTime)}</small>
                                <div className="flex-grow-1 bg-light rounded" style={{ height: '4px' }}>
                                    <div
                                        className="bg-primary rounded"
                                        style={{
                                            width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                                            height: '100%'
                                        }}
                                    />
                                </div>
                                <small>{formatTime(duration)}</small>

                                <div className="d-flex align-items-center gap-1 ms-3">
                                    <FontAwesomeIcon
                                        icon={volume === 0 ? faVolumeMute : faVolumeUp}
                                        className="text-muted small"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        style={{ width: '60px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </Card.Body>
                </Card>
    );
    };

    const renderSounds = () => (
        <div className="fade-in">
            {renderUserStats()}
            {renderAudioPlayer()}

            {/* Sons achetés */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <Card.Header className="bg-white border-0">
                        <h5 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                            Sons achetés ({purchasedSounds.length})
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                    {purchasedSounds.length > 0 ? (
                        <Table className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 p-3">Son</th>
                                    <th className="border-0 p-3 text-center">Catégorie</th>
                                    <th className="border-0 p-3 text-center">Prix</th>
                                    <th className="border-0 p-3 text-center">Durée</th>
                                    <th className="border-0 p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchasedSounds.map(sound => (
                                    <tr key={sound.id} className="border-bottom">
                                        <td className="p-3">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={sound.cover_image_url}
                                                    alt={sound.title}
                                                    className="rounded me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-0 small">par {sound.artist}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg="light" text="dark">{sound.category}</Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="fw-bold">{formatCurrency(sound.purchase_price || sound.price)}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <small className="text-muted">{sound.duration}</small>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => playTrack(sound)}
                                                className="me-2"
                                                disabled={!sound.audio_file_url}
                                            >
                                                <FontAwesomeIcon icon={faPlay} />
                                            </Button>
                                            {sound.can_download && (
                                            <Button
                                                    variant="primary"
                                                size="sm"
                                                    onClick={() => downloadSound(sound)}
                                            >
                                                    <FontAwesomeIcon icon={faDownload} />
                                            </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center p-5">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun son acheté</h5>
                            <p className="text-muted mb-4">Explorez notre catalogue pour découvrir de nouveaux sons</p>
                        <Button as={Link} to="/catalog" variant="primary">
                            Explorer le catalogue
                        </Button>
                        </div>
                    )}
                    </Card.Body>
                </Card>

            {/* Sons favoris */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header className="bg-white border-0">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faHeart} className="me-2 text-danger" />
                        Sons favoris ({favoriteSounds.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {favoriteSounds.length > 0 ? (
                        <Table className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 p-3">Son</th>
                                    <th className="border-0 p-3 text-center">Catégorie</th>
                                    <th className="border-0 p-3 text-center">Prix</th>
                                    <th className="border-0 p-3 text-center">Statut</th>
                                    <th className="border-0 p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {favoriteSounds.map(sound => (
                                    <tr key={sound.id} className="border-bottom">
                                        <td className="p-3">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={sound.cover_image_url}
                                            alt={sound.title}
                                            className="rounded me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                                <div>
                                            <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-0 small">par {sound.artist}</p>
                                        </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg="light" text="dark">{sound.category}</Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={sound.is_free ? "text-success fw-bold" : "fw-bold"}>
                                                {sound.is_free ? "Gratuit" : formatCurrency(sound.price)}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg={sound.can_play ? "success" : "warning"}>
                                                {sound.can_play ? "Disponible" : "Payant"}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            {sound.can_play ? (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => playTrack(sound)}
                                                    className="me-2"
                                                >
                                                    <FontAwesomeIcon icon={faPlay} />
                                                </Button>
                                            ) : (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                as={Link}
                                                to={`/sound/${sound.id}`}
                                                    className="me-2"
                                            >
                                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </Button>
                                            )}
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                as={Link}
                                                to={`/sound/${sound.id}`}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center p-5">
                            <FontAwesomeIcon icon={faHeart} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun son favori</h5>
                            <p className="text-muted mb-4">Ajoutez des sons à vos favoris pour les retrouver facilement</p>
                            <Button as={Link} to="/catalog" variant="outline-primary">
                                Découvrir des sons
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderEvents = () => (
        <div className="fade-in">
            {renderUserStats()}

            {/* Billets achetés */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <Card.Header className="bg-white border-0">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-success" />
                        Billets achetés ({purchasedTickets.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {purchasedTickets.length > 0 ? (
                        <Table className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 p-3">Événement</th>
                                    <th className="border-0 p-3 text-center">Date</th>
                                    <th className="border-0 p-3 text-center">Lieu</th>
                                    <th className="border-0 p-3 text-center">Prix</th>
                                    <th className="border-0 p-3 text-center">Quantité</th>
                                    <th className="border-0 p-3 text-center">Statut</th>
                                    <th className="border-0 p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchasedTickets.map(ticket => (
                                    <tr key={ticket.id} className="border-bottom">
                                        <td className="p-3">
                                    <div className="d-flex align-items-center">
                                        <img
                                                    src={ticket.poster_url}
                                                    alt={ticket.title}
                                                    className="rounded me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                        <div>
                                                    <h6 className="fw-bold mb-1">{ticket.title}</h6>
                                                    <p className="text-muted mb-0 small">#{ticket.order_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="fw-medium">
                                                {new Date(ticket.event_date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <small className="text-muted">{ticket.start_time}</small>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="small">
                                                <div>{ticket.venue}</div>
                                                <div className="text-muted">{ticket.city}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="fw-bold">{formatCurrency(ticket.ticket_price)}</span>
                                            {ticket.total_paid && ticket.total_paid !== ticket.ticket_price && (
                                                <div className="small text-muted">
                                                    Total: {formatCurrency(ticket.total_paid)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg="info">{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg={ticket.status === 'confirmed' ? "success" : "warning"}>
                                                {ticket.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                as={Link}
                                                to={`/event/${ticket.id}`}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center p-5">
                            <FontAwesomeIcon icon={faTicketAlt} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun billet acheté</h5>
                            <p className="text-muted mb-4">Découvrez nos événements à venir</p>
                            <Button as={Link} to="/events" variant="primary">
                                Voir les événements
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Artistes suivis */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Header className="bg-white border-0">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                        Artistes suivis ({followedArtists.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {followedArtists.length > 0 ? (
                        <Table className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 p-3">Artiste</th>
                                    <th className="border-0 p-3 text-center">Rôle</th>
                                    <th className="border-0 p-3 text-center">Sons</th>
                                    <th className="border-0 p-3 text-center">Followers</th>
                                    <th className="border-0 p-3 text-center">Suivi depuis</th>
                                    <th className="border-0 p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {followedArtists.map(artist => (
                                    <tr key={artist.id} className="border-bottom">
                                        <td className="p-3">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={artist.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&color=7F9CF5&background=EBF4FF&size=50`}
                                                    alt={artist.name}
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{artist.name}</h6>
                                                    <p className="text-muted mb-0 small">{artist.bio || 'Artiste talentueux'}</p>
                                                    {artist.location && (
                                                        <div className="text-muted small">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                            {artist.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <Badge bg={artist.role === 'artist' ? 'primary' : artist.role === 'producer' ? 'success' : 'secondary'}>
                                                {artist.role === 'artist' ? 'Artiste' : artist.role === 'producer' ? 'Producteur' : 'Utilisateur'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="fw-medium">{artist.sounds_count}</div>
                                            <small className="text-muted">son{artist.sounds_count > 1 ? 's' : ''}</small>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="fw-medium">{artist.followers_count}</div>
                                            <small className="text-muted">follower{artist.followers_count > 1 ? 's' : ''}</small>
                                        </td>
                                        <td className="p-3 text-center">
                                            <small className="text-muted">
                                                {new Date(artist.followed_at).toLocaleDateString('fr-FR')}
                                            </small>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    as={Link}
                                                    to={`/artist/${artist.id}`}
                                                    title="Voir le profil"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => unfollowArtist(artist.id)}
                                                    title="Ne plus suivre"
                                                >
                                                    <FontAwesomeIcon icon={faUserMinus} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center p-5">
                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun artiste suivi</h5>
                            <p className="text-muted mb-4">Découvrez et suivez vos artistes favoris</p>
                            <Button as={Link} to="/artists" variant="outline-primary">
                                Découvrir des artistes
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sounds':
                return renderSounds();
            case 'events':
                return renderEvents();
            default:
                return renderSounds();
        }
    };

    if (authLoading) {
                return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Vérification de l'authentification...</p>
                                    </div>
                    </div>
                );
    }

    if (!isAuthenticated || !user) {
                return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <FontAwesomeIcon icon={faUser} size="3x" className="text-muted mb-3" />
                    <h4 className="text-muted">Authentification requise</h4>
                    <p className="text-muted mb-4">Veuillez vous connecter pour accéder à votre profil</p>
                    <Button as={Link} to="/login" variant="primary">
                        Se connecter
                                </Button>
                </div>
                    </div>
                );
    }

    return (
        <div className="bg-light min-vh-100" style={{ paddingTop: '80px' }}>
            {/* Hero Section */}
            <section className="bg-primary text-white py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <div>
                                <FontAwesomeIcon icon={faUser} className="mb-3" size="3x" />
                                <h1 className="mb-3 fw-bold">Mon Profil</h1>
                                <p className="mb-0">Bienvenue {user.name} - Gérez vos achats et favoris</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Navigation et Contenu */}
            <section className="py-4">
                <Container>
                    <Tab.Container activeKey={activeTab}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-white border-0 p-4">
                                <Nav variant="pills" className="justify-content-center">
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="sounds"
                                            onClick={() => setActiveTab('sounds')}
                                            className="px-4 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                                            Sons & Musiques
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="events"
                                            onClick={() => setActiveTab('events')}
                                            className="px-4 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                            Événements & Billets
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>

                            <Card.Body className="p-4 position-relative">
                                <LoadingOverlay show={isLoading} text="Chargement des données..." />
                                {!isLoading && renderTabContent()}
                            </Card.Body>
                        </Card>
                    </Tab.Container>
                </Container>
            </section>
        </div>
    );
};

export default Profile;
