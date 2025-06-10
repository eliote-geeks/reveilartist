import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Badge, Nav, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faDownload, faHeart, faMusic, faSearch, faArrowRight,
    faVolumeUp, faPause, faFire, faStopwatch, faCalendarAlt,
    faUsers, faMapMarkerAlt, faClock, faEuroSign, faTicketAlt,
    faFilter, faStar, faEye, faHeadphones, faPlus, faStop,
    faStepForward, faStepBackward, faVolumeDown, faVolumeMute,
    faUserPlus, faShoppingCart, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import SoundDetailsModal from '../common/SoundDetailsModal';
import { usePurchasedSounds } from '../../hooks/usePurchasedSounds';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
    const [playingId, setPlayingId] = useState(null);
    const [activeTab, setActiveTab] = useState('populaires');
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [soundsLoading, setSoundsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [volume, setVolume] = useState(1);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSound, setSelectedSound] = useState(null);

    // États pour les données
    const [sounds, setSounds] = useState([]);
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({});
    const [likedSounds, setLikedSounds] = useState(new Set());
    const [followedArtists, setFollowedArtists] = useState(new Set());
    const [cartItems, setCartItems] = useState([]);
    const [downloadingTracks, setDownloadingTracks] = useState(new Map());

    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();
    const { addToCart, cartItems: contextCartItems } = useCart();
    const { purchasedSounds, checkIfPurchased } = usePurchasedSounds();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadSounds();
    }, [activeTab, activeCategory]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Charger toutes les données en parallèle
            const [statsRes, categoriesRes, eventsRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/categories'),
                fetch('/api/events?status=active&limit=4')
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats || {});
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData.categories || []);
            }

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData.events || []);
            }

            // Charger les sons initiaux
            await loadSounds();

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            toast.error('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const loadSounds = async () => {
        try {
            setSoundsLoading(true);
            let endpoint = '';
            let params = new URLSearchParams();
            params.append('limit', '12'); // Plus de sons pour le feed

            // Si une catégorie est sélectionnée, on filtre par cette catégorie
            if (activeCategory) {
                endpoint = '/api/sounds';
                params.append('category', activeCategory);
            } else {
                // Sinon on utilise les filtres par défaut avec les bonnes APIs
                switch (activeTab) {
                    case 'populaires':
                        endpoint = '/api/sounds/popular';
                        break;
                    case 'recents':
                        endpoint = '/api/sounds/recent';
                        break;
                    case 'gratuits':
                        endpoint = '/api/sounds';
                        params.append('price', 'free');
                        break;
                    case 'premium':
                        endpoint = '/api/sounds';
                        params.append('price', 'premium');
                        break;
                    default:
                        endpoint = '/api/sounds/popular';
                }
            }

            const response = await fetch(`${endpoint}?${params}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSounds(data.sounds || []);

                // Charger l'état des likes si connecté
                if (user && token && data.sounds && data.sounds.length > 0) {
                    loadLikesStatus(data.sounds.map(s => s.id));
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des sons:', error);
        } finally {
            setSoundsLoading(false);
        }
    };

    const loadLikesStatus = async (soundIds) => {
        try {
            const response = await fetch('/api/sounds/likes/status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sound_ids: soundIds })
            });

            if (response.ok) {
                const data = await response.json();
                setLikedSounds(new Set(data.likes || []));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des likes:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error('Erreur', 'Veuillez saisir un terme de recherche');
            return;
        }

        navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
    };

    const handleLike = async (soundId) => {
        if (!user || !token) {
            toast.error('Connexion requise', 'Vous devez être connecté pour aimer un son');
            return;
        }

        try {
            const response = await fetch(`/api/sounds/${soundId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Mettre à jour l'état local
                setLikedSounds(prev => {
                    const newSet = new Set(prev);
                    if (data.is_liked) {
                        newSet.add(soundId);
                    } else {
                        newSet.delete(soundId);
                    }
                    return newSet;
                });

                // Mettre à jour le compteur dans la liste
                setSounds(prev => prev.map(sound =>
                    sound.id === soundId
                        ? { ...sound, likes: data.likes_count }
                        : sound
                ));

                toast.success('Succès', data.message);
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const handleFollowArtist = async (artistId) => {
        if (!user || !token) {
            toast.error('Connexion requise', 'Vous devez être connecté pour suivre un artiste');
            return;
        }

        try {
            const response = await fetch(`/api/artists/${artistId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                setFollowedArtists(prev => {
                    const newSet = new Set(prev);
                    if (data.is_following) {
                        newSet.add(artistId);
                    } else {
                        newSet.delete(artistId);
                    }
                    return newSet;
                });

                toast.success('Succès', data.message);
            }
        } catch (error) {
            console.error('Erreur lors du follow:', error);
        }
    };

    const handlePlayPause = async (sound, index) => {
        const audio = audioRef.current;

        try {
            if (currentPlaying?.id === sound.id && isPlaying) {
                // Pause
                await audio.pause();
                setIsPlaying(false);
            } else {
                // Play
                if (currentPlaying?.id !== sound.id) {
                    // Utiliser preview_url pour les sons payants, file_url pour les gratuits
                    const audioSource = sound.is_free || sound.price === 0
                        ? (sound.file_url || sound.preview_url)
                        : (sound.preview_url || sound.file_url);

                    audio.src = audioSource;
                    audio.volume = volume;

                    // Supprimer les anciens écouteurs
                    audio.removeEventListener('timeupdate', audio.previewHandler);

                    // Ajouter un écouteur pour limiter la prévisualisation selon le type de son
                    const isFreeSong = sound.is_free || sound.price === 0;

                    if (!isFreeSong) {
                        // Pour les sons payants : limiter à 20 secondes
                        audio.previewHandler = () => {
                        if (audio.currentTime >= 20) {
                            audio.pause();
                            setIsPlaying(false);
                                toast.info('Prévisualisation limitée', 'Prévisualisation de 20 secondes pour les sons payants. Achetez le son pour l\'écouter en entier.');
                        }
                        };
                        audio.addEventListener('timeupdate', audio.previewHandler);
                    } else {
                        // Pour les sons gratuits : lecture complète autorisée
                        audio.previewHandler = null;
                        toast.success('Son gratuit', 'Lecture complète disponible');
                    }
                }

                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setCurrentPlaying(sound);
                            setCurrentSoundIndex(index);
                            setIsPlaying(true);
                            setShowAudioPlayer(true);
                        })
                        .catch(error => {
                            console.error('Erreur lors de la lecture:', error);
                            if (error.name !== 'AbortError') {
                                toast.error('Erreur', 'Impossible de lire ce son');
                            }
                            setIsPlaying(false);
                            setCurrentPlaying(null);
                        });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
            if (error.name !== 'AbortError') {
                toast.error('Erreur', 'Impossible de lire ce son');
            }
            setIsPlaying(false);
            setCurrentPlaying(null);
        }
    };

    const playNextSound = () => {
        const nextIndex = (currentSoundIndex + 1) % sounds.length;
        const nextSound = sounds[nextIndex];
        if (nextSound) {
            handlePlayPause(nextSound, nextIndex);
        }
    };

    const playPreviousSound = () => {
        const prevIndex = currentSoundIndex === 0 ? sounds.length - 1 : currentSoundIndex - 1;
        const prevSound = sounds[prevIndex];
        if (prevSound) {
            handlePlayPause(prevSound, prevIndex);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCategoryFilter = (categoryId) => {
        setActiveCategory(categoryId);
        setActiveTab(null);
    };

    const handleTabFilter = (tab) => {
        setActiveTab(tab);
        setActiveCategory(null);
    };

    const clearFilters = () => {
        setActiveCategory(null);
        setActiveTab('populaires');
    };

    const handleViewDetails = (sound) => {
        setSelectedSound(sound);
        setShowModal(true);
    };

    const handleAddToCart = (sound) => {
        if (!user || !token) {
            toast.warning(
                'Connexion requise',
                'Vous devez être connecté pour ajouter des articles au panier'
            );
            return;
        }

        // Vérifier si le son est déjà acheté
        if (checkIfPurchased(sound.id)) {
            toast.info(
                'Son déjà acheté',
                'Vous avez déjà acheté ce son. Vous pouvez le télécharger directement depuis votre profil.'
            );
            return;
        }

        // Si le son est gratuit, proposer le téléchargement direct
        if (sound.is_free || sound.price === 0) {
            toast.info(
                'Son gratuit',
                'Ce son est gratuit, vous pouvez le télécharger directement.'
            );
            return;
        }

        // Vérifier si le son est déjà dans le panier
        const isAlreadyInCart = contextCartItems.some(item => item.id === sound.id && item.type === 'sound');

        if (isAlreadyInCart) {
            toast.warning(
                'Déjà dans le panier',
                `"${sound.title}" est déjà dans votre panier`
            );
            return;
        }

        const cartItem = {
            id: sound.id,
            type: 'sound',
            title: sound.title,
            artist: sound.artist,
            artistId: sound.artistId,
            price: sound.price,
            is_free: sound.is_free,
            cover: sound.cover,
            duration: sound.duration,
            category: sound.category,
            quantity: 1
        };

        addToCart(cartItem);
        toast.success(
            'Ajouté au panier',
            `"${sound.title}" a été ajouté à votre panier`,
            {
                icon: '🛒',
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            }
        );

        // Animation d'ajout au panier
        const cartButton = document.querySelector(`#cart-button-${sound.id}`);
        if (cartButton) {
            cartButton.classList.add('cart-animation');
            setTimeout(() => {
                cartButton.classList.remove('cart-animation');
            }, 1000);
        }
    };

    const handleDownload = async (sound) => {
        if (!sound) return;

        try {
            // Vérifier si le son est gratuit ou acheté
            if (!sound.is_free && !purchasedSounds.includes(sound.id)) {
                toast.error('Téléchargement impossible', 'Vous devez acheter ce son avant de pouvoir le télécharger');
                return;
            }

            setDownloadingTracks(prev => new Set([...prev, sound.id]));

            // Démarrer le téléchargement
            const response = await fetch(`/api/download/${sound.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors du téléchargement');
            }

            // Créer un blob à partir de la réponse
            const blob = await response.blob();

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sound.title}.zip`;
            document.body.appendChild(a);
            a.click();

            // Nettoyer
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Téléchargement réussi', 'Le son a été téléchargé avec succès');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            toast.error('Erreur', error.message || 'Une erreur est survenue lors du téléchargement');
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(sound.id);
                return newSet;
            });
        }
    };

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/events');
            const data = await response.json();

            if (data && Array.isArray(data)) {
                const adaptedEvents = data
                    .filter(event => new Date(event.event_date) >= new Date().setHours(0, 0, 0, 0))
                    .map(event => ({
                        ...event,
                        poster_image_url: event.poster_image ? `/storage/${event.poster_image}` : null,
                        artists_array: event.artists ? (
                            typeof event.artists === 'string' ? JSON.parse(event.artists) : event.artists
                        ) : [],
                        remaining_spots: (event.max_attendees || 0) - (event.current_attendees || 0)
                    }));
                setEvents(adaptedEvents);
            } else if (data && data.events) {
                const adaptedEvents = data.events
                    .filter(event => new Date(event.event_date) >= new Date().setHours(0, 0, 0, 0))
                    .map(event => ({
                        ...event,
                        poster_image_url: event.poster_image ? `/storage/${event.poster_image}` : null,
                        artists_array: event.artists ? (
                            typeof event.artists === 'string' ? JSON.parse(event.artists) : event.artists
                        ) : [],
                        remaining_spots: (event.max_attendees || 0) - (event.current_attendees || 0)
                    }));
                setEvents(adaptedEvents);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 avoid-header-overlap">
            {/* Lecteur audio invisible */}
            <audio
                ref={audioRef}
                preload="metadata"
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => {
                    playNextSound(); // Auto-play du son suivant
                }}
                onError={(e) => {
                    console.error('Erreur audio:', e);
                    setIsPlaying(false);
                    setCurrentPlaying(null);
                }}
            />

            {/* Hero Section Feed */}
            <section className="hero-gradient text-white">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <AnimatedElement animation="fadeIn" delay={100}>
                                <div className="mb-4">
                                    <AnimatedElement animation="bounceIn" delay={300}>
                                        <img
                                            src="/images/reveilart-logo.svg"
                                            alt="reveilart"
                                            style={{ height: '40px' }}
                                            className="mb-3"
                                        />
                                    </AnimatedElement>
                                    <AnimatedElement animation="slideInUp" delay={500}>
                                        <h1 className="display-6 fw-bold text-white mb-3">
                                            Découvrez la musique camerounaise
                                        </h1>
                                    </AnimatedElement>
                                    <AnimatedElement animation="slideInUp" delay={600}>
                                        <p className="fs-6 text-white opacity-75">
                                            Feed musical interactif avec lecteur intégré
                                        </p>
                                    </AnimatedElement>
                                </div>

                                {/* Search Bar */}

                            </AnimatedElement>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Stats Section avec vraies données */}
            <section className="section-padding bg-white">
                <Container>
                    <Row className="text-center g-3">
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={200}>
                                <div className="stat-card">
                                    <div className="stat-number">{formatNumber(stats.total_sounds || 0)}</div>
                                    <div className="stat-label">Sons disponibles</div>
                                </div>
                            </AnimatedElement>
                        </Col>

                        <Col md={6} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={400}>
                                <div className="stat-card">
                                    <div className="stat-number">{formatNumber(stats.total_events || 0)}</div>
                                    <div className="stat-label">Événements</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={500}>
                                <div className="stat-card">
                                    <div className="stat-number">{formatNumber(stats.total_users || 0)}</div>
                                    <div className="stat-label">Utilisateurs</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Section avec slider */}
            <section className="section-padding">
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={100}>
                                <div className="text-center">
                                    <h2 className="h4 fw-bold mb-2">Explorer par catégories</h2>
                                    <p className="text-secondary text-sm">Filtrez le feed par style musical</p>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <div className="categories-container">
                                    <div className="categories-scroll">
                                        <button
                                            onClick={clearFilters}
                                            className={`category-pill ${!activeCategory && activeTab === 'populaires' ? 'active' : ''}`}
                                        >
                                            Tous les sons
                                            <Badge bg="light" text="dark" className="ms-2 text-xs">
                                                {stats.total_sounds || 0}
                                            </Badge>
                                        </button>

                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryFilter(category.id)}
                                                className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
                                            >
                                                {category.name}
                                                <Badge bg="light" text="dark" className="ms-2 text-xs">
                                                    {category.sounds_count || 0}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Feed Principal des Sons */}
            <section className="section-padding bg-white">
                <Container>
                    <Row className="mb-4">
                        <Col md={8}>
                            <AnimatedElement animation="slideInLeft" delay={100}>
                                <h3 className="h4 fw-bold mb-2">
                                    <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                    Feed Musical
                                    {activeCategory && ` - ${categories.find(c => c.id === activeCategory)?.name}`}
                                </h3>
                                <p className="text-secondary text-sm">
                                    Découvrez, écoutez et interagissez avec les dernières créations
                                </p>
                            </AnimatedElement>
                        </Col>
                        <Col md={4} className="text-md-end">
                            <AnimatedElement animation="slideInRight" delay={200}>
                                <Button
                                    as={Link}
                                    to="/catalog"
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-lg btn-hover-lift"
                                >
                                    Voir tout le catalogue
                                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                </Button>
                            </AnimatedElement>
                        </Col>
                    </Row>

                    {/* Navigation Pills pour le tri */}
                    {!activeCategory && (
                        <Row className="mb-4">
                            <Col>
                                <AnimatedElement animation="slideInUp" delay={300}>
                                    <Nav variant="pills" className="nav-fill justify-content-center">
                                        {[
                                            { key: 'populaires', label: 'Populaires', icon: faFire },
                                            { key: 'recents', label: 'Récents', icon: faStopwatch },
                                            { key: 'gratuits', label: 'Gratuits', icon: faHeart },
                                            { key: 'premium', label: 'Premium', icon: faStar }
                                        ].map((tab) => (
                                            <Nav.Item key={tab.key} className="mx-1">
                                                <Nav.Link
                                                    active={activeTab === tab.key}
                                                    className="text-sm rounded-lg nav-pill-animated"
                                                    onClick={() => handleTabFilter(tab.key)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <FontAwesomeIcon icon={tab.icon} className="me-2" />
                                                    {tab.label}
                                                </Nav.Link>
                                            </Nav.Item>
                                        ))}
                                    </Nav>
                                </AnimatedElement>
                            </Col>
                        </Row>
                    )}

                    {/* Feed des Sons */}
                    {soundsLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" size="lg" />
                            <p className="mt-2 text-muted">Chargement du feed...</p>
                        </div>
                    ) : sounds.length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun son trouvé</h5>
                            <p className="text-muted">Aucun son ne correspond à vos critères.</p>
                            <Button variant="outline-primary" onClick={clearFilters}>
                                <FontAwesomeIcon icon={faArrowRight} className="me-2" />
                                Voir tous les sons
                            </Button>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {sounds.map((sound, index) => (
                                <Col key={sound.id} lg={3} md={4} sm={6}>
                                    <AnimatedElement
                                        animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
                                        delay={400 + (index * 100)}
                                    >
                                        <Card className="sound-feed-card border-0 shadow-sm h-100 hover-lift">
                                            {/* Header de la carte */}
                                            <div className="p-3 border-bottom bg-light">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {sound.created_at} • {sound.category}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image et lecteur */}
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={sound.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop`}
                                                    alt={sound.title}
                                                    className="sound-feed-image"
                                                    style={{ height: '180px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZCNzI4MCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjxwYXRoIGQ9Ik0xMiA2djEwbDMuNTgtMi4xNCAxLjQyLjg0VjcuM2wtMS40Mi44NEwxMiA2eiIvPjwvc3ZnPg==';
                                                    }}
                                                />
                                                <div className="sound-overlay">
                                                    <Button
                                                        className="play-button-large rounded-circle"
                                                        onClick={() => handlePlayPause(sound, index)}
                                                        style={{ width: '50px', height: '50px' }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                                            size="sm"
                                                        />
                                                    </Button>
                                                </div>
                                                {sound.is_free && (
                                                    <Badge bg="success" className="position-absolute top-0 start-0 m-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                        Gratuit
                                                    </Badge>
                                                )}
                                                {sound.is_featured && (
                                                    <Badge bg="danger" className="position-absolute top-0 end-0 m-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                        <FontAwesomeIcon icon={faFire} className="me-1" />
                                                        Vedette
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Contenu */}
                                            <Card.Body className="p-3">
                                                <h6 className="fw-bold mb-2">
                                                    <Link
                                                        to={`/sounds/${sound.id}`}
                                                        className="text-decoration-none text-dark hover-link"
                                                        title="Voir les détails complets"
                                                    >
                                                        {sound.title}
                                                    </Link>
                                                </h6>

                                                {/* Artiste */}
                                                {sound.artist && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">
                                                            Par{' '}
                                                            {sound.artist_id ? (
                                                                <Link
                                                                    to={`/artists/${sound.artist_id}`}
                                                                    className="text-decoration-none text-primary hover-link"
                                                                >
                                                                    <strong>{sound.artist}</strong>
                                                                </Link>
                                                            ) : (
                                                                <strong>{sound.artist}</strong>
                                                            )}
                                                        </small>
                                                    </div>
                                                )}

                                                {/* Métadonnées du son */}
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    {sound.genre && (
                                                        <Badge bg="light" text="dark" className="genre-badge rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                            {sound.genre}
                                                        </Badge>
                                                    )}
                                                    {sound.bpm && (
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                                                            {sound.bpm} BPM
                                                        </small>
                                                    )}
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                        {sound.duration}
                                                    </small>
                                                </div>

                                                {/* Prix */}
                                                <div className="mb-3">
                                                    {sound.is_free ? (
                                                        <span className="h6 text-success fw-bold">Gratuit</span>
                                                    ) : (
                                                        <span className="h6 text-primary fw-bold">
                                                            {formatCurrency(sound.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Statistiques et actions */}
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex gap-3">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className={`p-0 stat-button ${likedSounds.has(sound.id) ? 'text-danger' : 'text-muted'}`}
                                                            onClick={() => handleLike(sound.id)}
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                            {formatNumber(sound.likes || 0)}
                                                        </Button>
                                                        <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                            {formatNumber(sound.plays || 0)}
                                                        </span>
                                                        <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                            {formatNumber(sound.downloads || 0)}
                                                        </span>
                                                    </div>

                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            as={Link}
                                                            to={`/sounds/${sound.id}`}
                                                            variant="primary"
                                                            size="sm"
                                                            className="btn-details-compact"
                                                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                                            Voir
                                                        </Button>

                                                        {!sound.is_free && sound.price > 0 && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                className="btn-cart-compact"
                                                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                                onClick={() => handleAddToCart(sound)}
                                                                id={`cart-button-${sound.id}`}
                                                            >
                                                                <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                                                Panier
                                                            </Button>
                                                        )}

                                                        {(sound.is_free || sound.price === 0) && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                className="btn-download-compact"
                                                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                                onClick={() => handleDownload(sound)}
                                                                disabled={downloadingTracks.has(sound.id)}
                                                            >
                                                                {downloadingTracks.has(sound.id) ? (
                                                                    <Spinner as="span" animation="border" size="sm" className="me-1" />
                                                                ) : (
                                                                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                                )}
                                                                {downloadingTracks.has(sound.id) ? '...' : 'DL'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </section>

            {/* Section Événements à venir */}
            {events.length > 0 && (
                <section className="section-padding">
                    <Container>
                        <Row className="mb-4">
                            <Col md={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <h3 className="h5 fw-bold mb-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                                        Événements à venir
                                    </h3>
                                    <p className="text-secondary text-sm">
                                        Ne ratez pas les prochains événements musicaux
                                    </p>
                                </AnimatedElement>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <Button
                                        as={Link}
                                        to="/events"
                                        variant="outline-success"
                                        size="sm"
                                        className="rounded-lg btn-hover-lift"
                                    >
                                        Tous les événements
                                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                    </Button>
                                </AnimatedElement>
                            </Col>
                        </Row>
                        <Row className="g-3">
                            {events.map((event, index) => (
                                <Col key={event.id} lg={4} md={6}>
                                    <AnimatedElement animation="slideInUp" delay={300 + (index * 100)}>
                                        <Card className="event-card border-0 shadow-sm h-100">
                                            <div className="position-relative">
                                                <div className="event-date-badge bg-primary text-white p-3 text-center" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <div className="fw-bold" style={{ fontSize: '1.5rem' }}>
                                                        {new Date(event.event_date).getDate()}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'long' })}
                                                    </div>
                                                </div>
                                                <div className="event-date-badge position-absolute top-0 end-0 m-2">
                                                    {event.is_free ? (
                                                        <Badge bg="success">Gratuit</Badge>
                                                    ) : (
                                                        <Badge bg="primary">
                                                            {formatCurrency(event.ticket_price)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Card.Body className="p-2">
                                                <h6 className="fw-bold mb-1 small">{event.title}</h6>
                                                <div className="mb-1">
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                        {event.venue || event.location} • {event.city}
                                                    </small>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                                            {event.start_time}
                                                        </small>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                            {event.current_attendees}/{event.capacity}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        {event.is_free ? (
                                                            <span className="h6 text-success fw-bold small">Gratuit</span>
                                                        ) : (
                                                            <span className="h6 text-primary fw-bold small">
                                                                {formatCurrency(event.ticket_price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        as={Link}
                                                        to={`/events/${event.id}`}
                                                        variant="primary"
                                                        size="sm"
                                                        className="py-0 px-2"
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                                                        Réserver
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>
            )}

            {/* Lecteur Audio Flottant */}
            {showAudioPlayer && currentPlaying && (
                <div className="audio-player-floating position-fixed bottom-0 start-50 translate-middle-x"
                     style={{
                         zIndex: 1050,
                         width: '500px',
                         maxWidth: '95vw',
                         marginBottom: '20px'
                     }}>
                    <Card className="audio-player-card shadow-lg border-0">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src={currentPlaying.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop`}
                                    alt={currentPlaying.title}
                                    className="rounded me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1">{currentPlaying.title}</h6>
                                    <div className="d-flex gap-2 align-items-center">
                                    {currentPlaying.genre && (
                                        <Badge bg="light" text="dark" className="small">
                                            {currentPlaying.genre}
                                        </Badge>
                                    )}
                                        {(currentPlaying.is_free || currentPlaying.price === 0) ? (
                                            <Badge bg="success" className="small">
                                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                Gratuit - Lecture complète
                                            </Badge>
                                        ) : (
                                            <Badge bg="warning" className="small">
                                                <FontAwesomeIcon icon={faStopwatch} className="me-1" />
                                                Prévisualisation 20s
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        setShowAudioPlayer(false);
                                        setIsPlaying(false);
                                        setCurrentPlaying(null);
                                        if (audioRef.current) {
                                            audioRef.current.pause();
                                        }
                                    }}
                                    className="rounded-circle"
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </div>

                            {/* Barre de progression */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                                <div
                                    className="progress audio-progress"
                                    style={{ height: '6px', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        if (audioRef.current && duration > 0) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const pos = (e.clientX - rect.left) / rect.width;
                                            const newTime = pos * duration;
                                            audioRef.current.currentTime = newTime;
                                            setCurrentTime(newTime);
                                        }
                                    }}
                                >
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Contrôles */}
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={playPreviousSound}
                                        className="rounded-circle control-btn"
                                        disabled={sounds.length <= 1}
                                    >
                                        <FontAwesomeIcon icon={faStepBackward} />
                                    </Button>
                                    <Button
                                        variant={isPlaying ? "danger" : "primary"}
                                        size="lg"
                                        onClick={() => {
                                            if (isPlaying) {
                                                audioRef.current?.pause();
                                                setIsPlaying(false);
                                            } else {
                                                audioRef.current?.play();
                                                setIsPlaying(true);
                                            }
                                        }}
                                        className="rounded-circle play-pause-btn"
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={playNextSound}
                                        className="rounded-circle control-btn"
                                        disabled={sounds.length <= 1}
                                    >
                                        <FontAwesomeIcon icon={faStepForward} />
                                    </Button>
                                </div>

                                {/* Contrôle du volume */}
                                <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                                    <FontAwesomeIcon
                                        icon={volume === 0 ? faVolumeMute : volume < 0.5 ? faVolumeDown : faVolumeUp}
                                        className="text-muted"
                                        style={{ fontSize: '14px' }}
                                    />
                                    <Form.Range
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => {
                                            const newVolume = parseFloat(e.target.value);
                                            setVolume(newVolume);
                                            if (audioRef.current) {
                                                audioRef.current.volume = newVolume;
                                            }
                                        }}
                                        className="flex-grow-1"
                                        style={{ height: '4px' }}
                                    />
                                </div>
                            </div>

                            {/* Actions supplémentaires */}
                            <div className="d-flex justify-content-center gap-2 mt-3">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleLike(currentPlaying.id)}
                                    className={likedSounds.has(currentPlaying.id) ? 'text-danger' : ''}
                                >
                                    <FontAwesomeIcon icon={faHeart} className="me-1" />
                                    {likedSounds.has(currentPlaying.id) ? 'Aimé' : 'J\'aime'}
                                </Button>

                                <Button
                                    as={Link}
                                    to={`/sounds/${currentPlaying.id}`}
                                    variant="outline-primary"
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    Page complète
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {/* Modal de détails du son */}
            <SoundDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                sound={selectedSound}
                onLike={handleLike}
                onAddToCart={handleAddToCart}
                onDownload={handleDownload}
                isLiked={selectedSound ? likedSounds.has(selectedSound.id) : false}
                isInCart={selectedSound ? cartItems.some(item => item.id === selectedSound.id && item.type === 'sound') : false}
                isPurchased={selectedSound ? purchasedSounds.includes(selectedSound.id) : false}
                downloading={selectedSound ? downloadingTracks.has(selectedSound.id) : false}
            />

            <style jsx>{`
                /* Enhanced animations and effects */
                .btn-glow {
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-glow:hover {
                    box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
                    transform: translateY(-2px);
                }

                .btn-pulse {
                    animation: pulse 2s infinite;
                }

                .btn-hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
                }

                .stat-card {
                    padding: 1rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    background: rgba(139, 92, 246, 0.05);
                    border: 1px solid rgba(139, 92, 246, 0.1);
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(139, 92, 246, 0.1);
                    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
                }

                .stat-number {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #8B5CF6;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: #6B7280;
                    font-size: 0.9rem;
                }

                .category-slider {
                    padding: 20px 0;
                }

                .category-slider .swiper-slide {
                    height: auto;
                }

                .category-pill {
                    display: block;
                    width: 100%;
                    padding: 0.8rem 1.2rem;
                    margin: 0;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 25px;
                    color: #8B5CF6;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .category-pill.active {
                    background: #8B5CF6;
                    color: white;
                    border-color: #8B5CF6;
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
                }

                .category-pill:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25);
                }

                .category-pill-animated {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    overflow: hidden;
                }

                .category-pill-animated::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .category-pill-animated:hover::before {
                    left: 100%;
                }

                .category-pill-animated:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25);
                    color: white;
                    background: #8B5CF6;
                }

                .quick-action-card {
                    transition: all 0.3s ease;
                    border-radius: 15px;
                }

                .quick-action-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                }

                .quick-action-icon {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    background: rgba(139, 92, 246, 0.1);
                }

                .nav-pill-animated {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .nav-pill-animated::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 3px;
                    background: var(--bs-primary);
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-pill-animated:hover::after,
                .nav-pill-animated.active::after {
                    width: 80%;
                }

                .sound-card-enhanced {
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform-origin: center;
                    will-change: transform;
                    border-radius: 15px;
                    overflow: hidden;
                }

                .sound-card-enhanced:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
                }

                .sound-image {
                    height: 160px;
                    object-fit: cover;
                    transition: all 0.3s ease;
                }

                .sound-play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .sound-card:hover .sound-play-overlay {
                    opacity: 1;
                }

                .play-button-enhanced {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.9);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    backdrop-filter: blur(10px);
                }

                .play-button-enhanced:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
                    background: rgba(139, 92, 246, 1);
                }

                .badge-pulse {
                    animation: badgePulse 2s infinite;
                }

                .badge-fire {
                    animation: fire 1.5s infinite alternate;
                }

                .badge-category {
                    transition: all 0.3s ease;
                }

                .sound-card-enhanced:hover .badge-category {
                    background: var(--bs-primary) !important;
                    color: white !important;
                    transform: scale(1.1);
                }

                .stat-item {
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: none;
                    background: none;
                }

                .stat-item:hover {
                    transform: scale(1.1);
                }

                .price-tag {
                    font-weight: 600;
                }

                .btn-view {
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: all 0.3s ease;
                }

                .btn-view:hover {
                    transform: scale(1.1);
                }

                .event-card {
                    transition: all 0.3s ease;
                    border-radius: 12px;
                }

                .event-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
                }

                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 4rem 0;
                }

                .section-padding {
                    padding: 3rem 0;
                }

                /* Styles pour la barre de recherche moderne */
                .search-container {
                    position: relative;
                }

                .search-input-group {
                    border-radius: 50px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    background: white;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                .search-input-group:hover {
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                    border-color: rgba(245, 158, 11, 0.5);
                    transform: translateY(-2px);
                }

                .search-input-wrapper {
                    display: flex;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    background: white;
                    border-radius: 50px;
                }

                .search-icon {
                    position: absolute;
                    left: 20px;
                    color: #8B5CF6;
                    font-size: 1.1rem;
                    z-index: 2;
                    transition: all 0.3s ease;
                }

                .search-input {
                    border: none !important;
                    background: transparent !important;
                    padding: 18px 20px 18px 55px !important;
                    font-size: 1rem !important;
                    color: #2D3748 !important;
                    border-radius: 50px !important;
                    box-shadow: none !important;
                    outline: none !important;
                    flex: 1;
                    font-weight: 500;
                }

                .search-input::placeholder {
                    color: #A0AEC0 !important;
                    font-weight: 400;
                }

                .search-input:focus {
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                }

                .search-input:focus + .search-button {
                    background: #F59E0B !important;
                        transform: scale(1.05);
                }

                .search-button {
                    background: #FDB930 !important;
                    border: none !important;
                    border-radius: 50% !important;
                    width: 50px !important;
                    height: 50px !important;
                    position: absolute !important;
                    right: 5px !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                    z-index: 3;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3) !important;
                }

                .search-button:hover {
                    background: #F59E0B !important;
                    transform: translateY(-50%) scale(1.1) !important;
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
                }

                .search-button:active {
                    transform: translateY(-50%) scale(0.95) !important;
                }

                .search-button:disabled {
                    background: #E5E7EB !important;
                    color: #9CA3AF !important;
                    cursor: not-allowed !important;
                    transform: translateY(-50%) !important;
                    box-shadow: none !important;
                }

                .search-container:focus-within .search-icon {
                    color: #F59E0B;
                    transform: scale(1.1);
                }

                .search-container:focus-within .search-input-group {
                    border-color: rgba(245, 158, 11, 0.6);
                    box-shadow: 0 15px 40px rgba(245, 158, 11, 0.2);
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                @keyframes badgePulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }

                @keyframes fire {
                    0% {
                        transform: scale(1) rotate(-1deg);
                    }
                    100% {
                        transform: scale(1.05) rotate(1deg);
                    }
                }

                /* Styles améliorés */
                .hover-lift {
                    transition: all 0.3s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                }

                .sound-feed-card {
                    border-radius: 15px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                .sound-feed-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                }

                .sound-feed-image {
                    transition: all 0.3s ease;
                    height: 180px;
                    object-fit: cover;
                }

                .sound-feed-card:hover .sound-feed-image {
                    transform: scale(1.05);
                }

                .sound-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .sound-feed-card:hover .sound-overlay {
                    opacity: 1;
                }

                .play-button-large {
                    background: rgba(139, 92, 246, 0.9);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    width: 50px;
                    height: 50px;
                }

                .play-button-large:hover {
                    transform: scale(1.1);
                    background: rgba(139, 92, 246, 1);
                }

                .genre-badge {
                    padding: 0.4rem 0.8rem;
                    font-weight: 500;
                    background: rgba(139, 92, 246, 0.1);
                    color: #8B5CF6;
                    border-radius: 20px;
                }

                .btn-follow {
                    transition: all 0.3s ease;
                    border-radius: 20px;
                    padding: 0.4rem 0.8rem;
                }

                .btn-follow:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                }

                .stat-button {
                    transition: all 0.3s ease;
                    color: #6B7280;
                }

                .stat-button:hover {
                    transform: scale(1.1);
                    color: #8B5CF6;
                }

                .btn-cart, .btn-details {
                    transition: all 0.3s ease;
                    padding: 0.4rem 0.8rem;
                }

                .btn-cart:hover, .btn-details:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                }

                .avatar-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid rgba(139, 92, 246, 0.2);
                    transition: all 0.3s ease;
                }

                .avatar-circle:hover {
                    transform: scale(1.1);
                    border-color: #8B5CF6;
                }

                .avatar-circle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sound-feed-card .card-body {
                    padding: 1.5rem;
                }

                .sound-feed-card h6 {
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                    color: #1F2937;
                }

                .sound-feed-card .text-muted {
                    color: #6B7280 !important;
                }

                .sound-feed-card .badge {
                    font-weight: 500;
                }

                .sound-feed-card .btn {
                    font-weight: 500;
                }

                .cart-animation {
                    animation: cartBounce 0.5s ease-in-out;
                }

                @keyframes cartBounce {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                /* Styles pour les liens hover */
                .hover-link {
                    transition: all 0.3s ease;
                }

                .hover-link:hover {
                    color: #8B5CF6 !important;
                    transform: translateY(-1px);
                }

                /* Style pour les badges de type de lecture */
                .audio-player-card .badge {
                    font-weight: 500;
                    font-size: 0.7rem;
                }

                .audio-player-card .badge.bg-success {
                    background-color: #10B981 !important;
                }

                .audio-player-card .badge.bg-warning {
                    background-color: #F59E0B !important;
                    color: white !important;
                }

                /* Styles pour le conteneur des catégories */
                .categories-container {
                    position: relative;
                    padding: 1rem 0;
                    overflow: hidden;
                }

                .categories-scroll {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding: 0.5rem;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-behavior: smooth;
                }

                .categories-scroll::-webkit-scrollbar {
                    display: none;
                }

                .category-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.8rem 1.5rem;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 50px;
                    color: #8B5CF6;
                    font-size: 0.875rem;
                    font-weight: 500;
                    white-space: nowrap;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: none;
                }

                .category-pill:hover {
                    background: rgba(139, 92, 246, 0.2);
                    transform: translateY(-2px);
                }

                .category-pill.active {
                    background: #8B5CF6;
                    color: white;
                    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
                }

                .category-pill .badge {
                    background: rgba(255, 255, 255, 0.2) !important;
                    color: inherit !important;
                    font-weight: 500;
                }

                .btn-details {
                    background: #8B5CF6;
                    border: none;
                    transition: all 0.3s ease;
                }

                .btn-details:hover {
                    background: #7C3AED;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                }

                .btn-details-compact {
                    background: #8B5CF6;
                    border: none;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    color: white;
                }

                .btn-details-compact:hover {
                    background: #7C3AED;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
                    color: white;
                }

                .btn-cart-compact {
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    border: 1px solid #10B981;
                    color: #10B981;
                }

                .btn-cart-compact:hover {
                    background: #10B981;
                    border-color: #10B981;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
                    color: white;
                }

                .btn-download-compact {
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    border: 1px solid #10B981;
                    color: #10B981;
                }

                .btn-download-compact:hover {
                    background: #10B981;
                    border-color: #10B981;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default Home;
