import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Badge, Nav, Spinner, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faDownload, faHeart, faMusic, faSearch, faArrowRight,
    faVolumeUp, faPause, faFire, faStopwatch, faCalendarAlt,
    faUsers, faMapMarkerAlt, faClock, faEuroSign, faTicketAlt,
    faFilter, faStar, faEye, faHeadphones, faPlus, faStop,
    faStepForward, faStepBackward, faVolumeDown, faVolumeMute,
    faUserPlus, faShoppingCart, faTimes, faCheck, faArrowUp, faGem,
    faShare, faVideo, faTrophy, faUser
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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

    // États pour les données
    const [sounds, setSounds] = useState([]);
    const [artists, setArtists] = useState([]);
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [clips, setClips] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [stats, setStats] = useState({});
    const [likedSounds, setLikedSounds] = useState(new Set());
    const [followingArtists, setFollowingArtists] = useState(new Set());
    const [activeFilter, setActiveFilter] = useState('trending');

    // États pour la recherche
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState({
        sounds: [],
        artists: [],
        clips: [],
        competitions: [],
        events: []
    });
    const [showSearchResults, setShowSearchResults] = useState(false);

    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadSounds();
    }, [activeTab, activeCategory]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [soundsRes, artistsRes, eventsRes, categoriesRes, clipsRes, competitionsRes] = await Promise.all([
                fetch('/api/sounds?featured=true&limit=12'),
                fetch('/api/artists?featured=true&limit=8'),
                fetch('/api/events?upcoming=true&limit=6'),
                fetch('/api/categories'),
                fetch('/api/clips?limit=6'),
                fetch('/api/competitions?featured=true&limit=6')
            ]);

            const [soundsData, artistsData, eventsData, categoriesData, clipsData, competitionsData] = await Promise.all([
                soundsRes.json(),
                artistsRes.json(),
                eventsRes.json(),
                categoriesRes.json(),
                clipsRes.json(),
                competitionsRes.json()
            ]);

            // Sons
            if (soundsData.success) {
                setSounds(soundsData.sounds || []);
            } else {
                // Fallback sons
                setSounds([
                    { id: 1, title: "Afrobeat Vibes", artist: "Artist 1", genre: "Afrobeat", plays_count: 12500, likes_count: 890, downloads_count: 234 },
                    { id: 2, title: "Makossa Modern", artist: "Artist 2", genre: "Makossa", plays_count: 8900, likes_count: 567, downloads_count: 123 }
                ]);
            }

            // Artistes
            if (artistsData.success) {
                setArtists(artistsData.artists || []);
            } else {
                // Fallback artistes
                setArtists([
                    { id: 1, name: "Artist 1", followers_count: 12500 },
                    { id: 2, name: "Artist 2", followers_count: 8900 }
                ]);
            }

            // Événements
            if (eventsData.success) {
                setEvents(eventsData.events || []);
            } else {
                // Fallback événements
                setEvents([
                    { id: 1, title: "Concert Live", city: "Douala", event_date: "2024-04-15" },
                    { id: 2, title: "Festival de Musique", city: "Yaoundé", event_date: "2024-04-20" }
                ]);
            }

            // Catégories
            if (categoriesData.success) {
                setCategories(categoriesData.categories || []);
            } else {
                // Fallback catégories
                setCategories([
                    { id: 1, name: "Afrobeat" },
                    { id: 2, name: "Rap" },
                    { id: 3, name: "Makossa" },
                    { id: 4, name: "Gospel" }
                ]);
            }

            // Clips
            if (clipsData && (clipsData.clips || clipsData.data)) {
                setClips(clipsData.clips?.data || clipsData.clips || clipsData.data || []);
            } else {
                // Fallback clips
                setClips([
                    {
                        id: 1,
                        title: "Afrobeat Vibes - Clip Official",
                        user: { id: 1, name: "Artist 1" },
                        views: 125000,
                        likes: 8500,
                        duration: "3:45",
                        category: "Afrobeat",
                        thumbnail_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop",
                        created_at: "2024-03-15"
                    },
                    {
                        id: 2,
                        title: "Rap Camerounais",
                        user: { id: 2, name: "Artist 2" },
                        views: 89000,
                        likes: 6200,
                        duration: "4:12",
                        category: "Rap",
                        thumbnail_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop",
                        created_at: "2024-03-10"
                    }
                ]);
            }

            // Compétitions
            if (competitionsData && (competitionsData.competitions || competitionsData.data)) {
                setCompetitions(competitionsData.competitions?.data || competitionsData.competitions || competitionsData.data || []);
            } else {
                // Fallback compétitions
                setCompetitions([
                    {
                        id: 1,
                        title: "Battle Rap Cameroun 2024",
                        description: "Compétition de rap ouvert à tous les artistes camerounais",
                        user: { id: 1, name: "Organisateur 1" },
                        current_participants: 25,
                        max_participants: 50,
                        total_prize_pool: 500000,
                        entry_fee: 10000,
                        end_date: "2024-04-30",
                        days_left: "20",
                        status: "active",
                        category: "Rap",
                        image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop"
                    },
                    {
                        id: 2,
                        title: "Concours Makossa Fusion",
                        description: "Fusion makossa moderne",
                        user: { id: 2, name: "Organisateur 2" },
                        current_participants: 18,
                        max_participants: 30,
                        total_prize_pool: 300000,
                        entry_fee: 8000,
                        end_date: "2024-05-15",
                        days_left: "35",
                        status: "active",
                        category: "Makossa",
                        image_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=250&fit=crop"
                    }
                ]);
            }

            if (token && (soundsData.sounds || sounds.length > 0)) {
                loadLikesStatus((soundsData.sounds || sounds).map(s => s.id));
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
            // En cas d'erreur totale, utiliser des données minimales
            setSounds([]);
            setArtists([]);
            setEvents([]);
            setCategories([]);
            setClips([]);
            setCompetitions([]);
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
        if (!token || soundIds.length === 0) return;

        try {
            const response = await fetch('/api/sounds/likes/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sound_ids: soundIds })
            });

            const data = await response.json();
            if (data.success) {
                setLikedSounds(new Set(data.likes));
            }
        } catch (error) {
            console.error('Erreur chargement likes:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error('Erreur', 'Veuillez saisir un terme de recherche');
            return;
        }

        try {
            setIsSearching(true);
            setShowSearchResults(true);

            // Recherche parallèle dans toutes les catégories
            const searchPromises = [
                fetch(`/api/sounds/search?q=${encodeURIComponent(searchTerm)}&limit=6`, {
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }), 'Content-Type': 'application/json' }
                }),
                fetch(`/api/artists/search?q=${encodeURIComponent(searchTerm)}&limit=6`, {
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }), 'Content-Type': 'application/json' }
                }),
                fetch(`/api/clips/search?q=${encodeURIComponent(searchTerm)}&limit=6`, {
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }), 'Content-Type': 'application/json' }
                }),
                fetch(`/api/competitions/search?q=${encodeURIComponent(searchTerm)}&limit=6`, {
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }), 'Content-Type': 'application/json' }
                }),
                fetch(`/api/events/search?q=${encodeURIComponent(searchTerm)}&limit=6`, {
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }), 'Content-Type': 'application/json' }
                })
            ];

            const responses = await Promise.all(searchPromises);
            const [soundsRes, artistsRes, clipsRes, competitionsRes, eventsRes] = responses;

            const results = {
                sounds: [],
                artists: [],
                clips: [],
                competitions: [],
                events: []
            };

            // Parser les résultats
            if (soundsRes.ok) {
                const soundsData = await soundsRes.json();
                results.sounds = soundsData.sounds || soundsData.data || [];
            }

            if (artistsRes.ok) {
                const artistsData = await artistsRes.json();
                results.artists = artistsData.artists || artistsData.data || [];
            }

            if (clipsRes.ok) {
                const clipsData = await clipsRes.json();
                results.clips = clipsData.clips || clipsData.data || [];
            }

            if (competitionsRes.ok) {
                const competitionsData = await competitionsRes.json();
                results.competitions = competitionsData.competitions || competitionsData.data || [];
            }

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                results.events = eventsData.events || eventsData.data || [];
            }

            setSearchResults(results);

            const totalResults = Object.values(results).reduce((total, items) => total + items.length, 0);
            if (totalResults === 0) {
                toast.info('Recherche', 'Aucun résultat trouvé pour cette recherche');
            } else {
                toast.success('Recherche', `${totalResults} résultat(s) trouvé(s)`);
            }

        } catch (error) {
            console.error('Erreur recherche:', error);
            toast.error('Erreur', 'Erreur lors de la recherche');

            // Fallback vers la page catalog
            navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLike = async (soundId) => {
        if (!token) {
            toast.warning('Connexion requise', 'Connectez-vous pour aimer ce son');
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

            const data = await response.json();
            if (data.success) {
                const newLikedSounds = new Set(likedSounds);
                if (data.is_liked) {
                    newLikedSounds.add(soundId);
                } else {
                    newLikedSounds.delete(soundId);
                }
                setLikedSounds(newLikedSounds);

                setSounds(prev => prev.map(sound =>
                    sound.id === soundId
                        ? { ...sound, likes_count: data.likes_count }
                        : sound
                ));
            }
        } catch (error) {
            console.error('Erreur like:', error);
        }
    };

    const handleFollowArtist = async (artistId) => {
        if (!token) {
            toast.warning('Connexion requise', 'Connectez-vous pour suivre cet artiste');
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

            const data = await response.json();
            if (data.success) {
                const newFollowing = new Set(followingArtists);
                if (data.is_following) {
                    newFollowing.add(artistId);
                } else {
                    newFollowing.delete(artistId);
                }
                setFollowingArtists(newFollowing);

                setArtists(prev => prev.map(artist =>
                    artist.id === artistId
                        ? { ...artist, followers_count: data.followers_count }
                        : artist
                ));
            }
        } catch (error) {
            console.error('Erreur follow:', error);
        }
    };

    const handlePlayPause = (sound, index) => {
        const audio = audioRef.current;

        if (currentPlaying?.id === sound.id && isPlaying) {
            // Pause
            audio.pause();
            setIsPlaying(false);
        } else {
            // Play
            audio.src = sound.preview_url || sound.file_url;
            audio.volume = volume;

            audio.play()
                .then(() => {
                    setCurrentPlaying(sound);
                    setCurrentSoundIndex(index);
                    setIsPlaying(true);
                    setShowAudioPlayer(true);
                })
                .catch(error => {
                    console.error('Erreur lors de la lecture:', error);
                    toast.error('Erreur', 'Impossible de lire ce son');
                });
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

    const FilterButton = ({ filter, icon, label, count, isActive, onClick }) => (
        <Button
            variant={isActive ? "primary" : "light"}
            size="sm"
            className={`filter-btn ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <FontAwesomeIcon icon={icon} className="me-2" />
            {label}
            {count && <Badge bg="secondary" className="ms-2">{count}</Badge>}
        </Button>
    );

    if (loading) {
        return (
            <div className="feed-loading">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6} className="text-center py-5">
                            <div className="loading-animation">
                                <Spinner animation="border" variant="primary" size="lg" />
                                <h5 className="mt-3 text-muted">Chargement du feed...</h5>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    return (
        <div className="social-feed">
            {/* Header épuré */}
            <div className="feed-header">
                <Container>
                    <Row className="align-items-center py-3">
                        <Col md={6}>
                            <div className="search-container">
                                <InputGroup size="lg">
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher sons, artistes, événements..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        variant="primary"
                                        className="search-btn"
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                    >
                                        {isSearching ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <FontAwesomeIcon icon={faSearch} />
                                        )}
                                    </Button>
                                </InputGroup>
                            </div>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end">
                            <div className="filter-tabs">
                                <FilterButton
                                    filter="trending"
                                    icon={faArrowUp}
                                    label="Tendances"
                                    isActive={activeFilter === 'trending'}
                                    onClick={() => setActiveFilter('trending')}
                                />
                                <FilterButton
                                    filter="new"
                                    icon={faGem}
                                    label="Nouveautés"
                                    isActive={activeFilter === 'new'}
                                    onClick={() => setActiveFilter('new')}
                                />
                                <FilterButton
                                    filter="popular"
                                    icon={faFire}
                                    label="Populaires"
                                    isActive={activeFilter === 'popular'}
                                    onClick={() => setActiveFilter('popular')}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Résultats de recherche */}
            {showSearchResults && (
                <Container className="search-results-section">
                    <Row>
                        <Col xs={12}>
                            <div className="search-results-header">
                                <h4 className="fw-bold mb-3">
                                    <FontAwesomeIcon icon={faSearch} className="me-2 text-primary" />
                                    Résultats de recherche pour "{searchTerm}"
                                </h4>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        setShowSearchResults(false);
                                        setSearchTerm('');
                                        setSearchResults({
                                            sounds: [],
                                            artists: [],
                                            clips: [],
                                            competitions: [],
                                            events: []
                                        });
                                    }}
                                    className="close-search-btn"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                                    Fermer
                                </Button>
                            </div>

                            {/* Résultats Sons */}
                            {searchResults.sounds.length > 0 && (
                                <div className="search-category-section">
                                    <h6 className="category-title">
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Sons ({searchResults.sounds.length})
                                    </h6>
                                    <Row className="g-3">
                                        {searchResults.sounds.map((sound, index) => (
                                            <Col md={4} sm={6} key={sound.id}>
                                                <Card className="search-result-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="result-icon-container me-3">
                                                                <FontAwesomeIcon icon={faMusic} className="result-icon" />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="result-title">{sound.title}</h6>
                                                                <p className="result-subtitle">par {sound.artist || sound.user?.name}</p>
                                                                <div className="result-stats">
                                                                    <span className="me-3">
                                                                        <FontAwesomeIcon icon={faHeadphones} className="me-1" />
                                                                        {formatNumber(sound.plays_count || 0)}
                                                                    </span>
                                                                    <span>
                                                                        <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                                        {formatNumber(sound.likes_count || 0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handlePlayPause(sound, index)}
                                                                className="result-action-btn"
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Résultats Artistes */}
                            {searchResults.artists.length > 0 && (
                                <div className="search-category-section">
                                    <h6 className="category-title">
                                        <FontAwesomeIcon icon={faUser} className="me-2" />
                                        Artistes ({searchResults.artists.length})
                                    </h6>
                                    <Row className="g-3">
                                        {searchResults.artists.map((artist, index) => (
                                            <Col md={4} sm={6} key={artist.id}>
                                                <Card className="search-result-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="result-icon-container me-3">
                                                                <FontAwesomeIcon icon={faUser} className="result-icon" />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="result-title">{artist.name}</h6>
                                                                <p className="result-subtitle">{artist.role || 'Artiste'}</p>
                                                                <div className="result-stats">
                                                                    <span className="me-3">
                                                                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                                        {formatNumber(artist.followers_count || 0)} followers
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                as={Link}
                                                                to={`/artists/${artist.id}`}
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="result-action-btn"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Résultats Clips avec icônes verticales */}
                            {searchResults.clips.length > 0 && (
                                <div className="search-category-section">
                                    <h6 className="category-title">
                                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                                        Clips ({searchResults.clips.length})
                                    </h6>
                                    <Row className="g-3">
                                        {searchResults.clips.map((clip, index) => (
                                            <Col md={4} sm={6} key={clip.id}>
                                                <Card className="search-result-card clip-result-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex align-items-start">
                                                            <div className="clip-icon-stack me-3">
                                                                <div className="clip-icon-container">
                                                                    <FontAwesomeIcon icon={faVideo} className="clip-main-icon" />
                                                                </div>
                                                                <div className="clip-icons-vertical">
                                                                    <div className="clip-icon-item">
                                                                        <FontAwesomeIcon icon={faPlay} className="clip-sub-icon" />
                                                                    </div>
                                                                    <div className="clip-icon-item">
                                                                        <FontAwesomeIcon icon={faEye} className="clip-sub-icon" />
                                                                        <span className="icon-count">{formatNumber(clip.views || 0)}</span>
                                                                    </div>
                                                                    <div className="clip-icon-item">
                                                                        <FontAwesomeIcon icon={faHeart} className="clip-sub-icon" />
                                                                        <span className="icon-count">{formatNumber(clip.likes || 0)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="result-title">{clip.title}</h6>
                                                                <p className="result-subtitle">par {clip.user?.name}</p>
                                                                <div className="clip-metadata">
                                                                    <span className="clip-duration">
                                                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                        {clip.duration || '0:00'}
                                                                    </span>
                                                                    {clip.category && (
                                                                        <Badge bg="light" text="dark" className="ms-2">
                                                                            {clip.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                as={Link}
                                                                to={`/clips/${clip.id}`}
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="result-action-btn"
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Résultats Compétitions avec icônes */}
                            {searchResults.competitions.length > 0 && (
                                <div className="search-category-section">
                                    <h6 className="category-title">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                        Compétitions ({searchResults.competitions.length})
                                    </h6>
                                    <Row className="g-3">
                                        {searchResults.competitions.map((competition, index) => (
                                            <Col md={4} sm={6} key={competition.id}>
                                                <Card className="search-result-card competition-result-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex align-items-start">
                                                            <div className="competition-icon-stack me-3">
                                                                <div className="competition-icon-container">
                                                                    <FontAwesomeIcon icon={faTrophy} className="competition-main-icon" />
                                                                </div>
                                                                <div className="competition-icons-vertical">
                                                                    <div className="competition-icon-item">
                                                                        <FontAwesomeIcon icon={faUsers} className="competition-sub-icon" />
                                                                        <span className="icon-count">{competition.current_participants || 0}</span>
                                                                    </div>
                                                                    <div className="competition-icon-item">
                                                                        <FontAwesomeIcon icon={faClock} className="competition-sub-icon" />
                                                                        <span className="icon-count">{competition.days_left || 'Bientôt'}</span>
                                                                    </div>
                                                                    <div className="competition-icon-item">
                                                                        <FontAwesomeIcon icon={faGem} className="competition-sub-icon" />
                                                                        <span className="icon-count">Prix</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="result-title">{competition.title}</h6>
                                                                <p className="result-subtitle">
                                                                    {competition.description?.substring(0, 60) || 'Compétition ouverte'}...
                                                                </p>
                                                                <div className="competition-metadata">
                                                                    <div className="prize-info">
                                                                        <FontAwesomeIcon icon={faGem} className="me-1 text-warning" />
                                                                        <span className="prize-amount">
                                                                            {competition.formatted_total_prize_pool || 'Prix à gagner'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="participants-info">
                                                                        <FontAwesomeIcon icon={faUsers} className="me-1 text-primary" />
                                                                        <span>
                                                                            {competition.current_participants || 0}/{competition.max_participants || '∞'} participants
                                                                        </span>
                                                                    </div>
                                                                    <div className="time-info">
                                                                        <FontAwesomeIcon icon={faClock} className="me-1 text-danger" />
                                                                        <span>
                                                                            {competition.days_left || 'Bientôt'} jours restants
                                                                        </span>
                                                                    </div>
                                                                    {competition.category && (
                                                                        <Badge bg="warning" className="category-badge">
                                                                            <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                                                            {competition.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="competition-actions mt-3">
                                                                    <Button
                                                                        as={Link}
                                                                        to={`/competitions/${competition.id}`}
                                                                        variant="warning"
                                                                        size="sm"
                                                                        className="w-100"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                                                        Participer maintenant
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Résultats Événements */}
                            {searchResults.events.length > 0 && (
                                <div className="search-category-section">
                                    <h6 className="category-title">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                        Événements ({searchResults.events.length})
                                    </h6>
                                    <Row className="g-3">
                                        {searchResults.events.map((event, index) => (
                                            <Col md={4} sm={6} key={event.id}>
                                                <Card className="search-result-card">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="result-icon-container me-3">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="result-icon" />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <h6 className="result-title">{event.title}</h6>
                                                                <p className="result-subtitle">{event.city}</p>
                                                                <div className="result-stats">
                                                                    <span>
                                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                        {new Date(event.event_date).toLocaleDateString('fr-FR')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                as={Link}
                                                                to={`/events/${event.id}`}
                                                                variant="outline-warning"
                                                                size="sm"
                                                                className="result-action-btn"
                                                            >
                                                                <FontAwesomeIcon icon={faTicketAlt} />
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* Aucun résultat */}
                            {Object.values(searchResults).every(items => items.length === 0) && !isSearching && (
                                <div className="no-results">
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted mb-3" />
                                        <h5 className="text-muted">Aucun résultat trouvé</h5>
                                        <p className="text-muted">Essayez avec d'autres mots-clés</p>
                                        <Button
                                            as={Link}
                                            to="/catalog"
                                            variant="primary"
                                        >
                                            Explorer le catalogue
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            )}

            <Container fluid className="feed-container">
                <Row className="g-0">
                    {/* Sidebar gauche - Artistes à suivre */}
                    <Col xl={3} lg={4} className="sidebar-left d-none d-lg-block">
                        <div className="sticky-sidebar">
                            <Card className="artist-suggestions">
                                <Card.Header className="border-0 bg-transparent">
                                    <h6 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                                        Artistes suggérés
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {(artists && Array.isArray(artists) ? artists : []).slice(0, 5).map((artist, index) => (
                                        <div key={artist.id} className="artist-suggestion-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="d-flex align-items-center p-3">
                                                <img
                                                    src={artist.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=50`}
                                                    alt={artist.name}
                                                    className="artist-avatar"
                                                />
                                                <div className="flex-grow-1 ms-3">
                                                    <h6 className="mb-1">{artist.name}</h6>
                                                    <small className="text-muted">{formatNumber(artist.followers_count)} followers</small>
                                                </div>
                                                <Button
                                                    variant={followingArtists.has(artist.id) ? "outline-primary" : "primary"}
                                                    size="sm"
                                                    className="follow-btn"
                                                    onClick={() => handleFollowArtist(artist.id)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={followingArtists.has(artist.id) ? faUsers : faUserPlus}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 border-top">
                                        <Button
                                            as={Link}
                                            to="/artists"
                                            variant="outline-primary"
                                            size="sm"
                                            className="w-100"
                                        >
                                            Voir tous les artistes
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Catégories rapides */}
                            <Card className="categories-quick mt-4">
                                <Card.Header className="border-0 bg-transparent">
                                    <h6 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-success" />
                                        Genres populaires
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="category-tags">
                                        {(categories && Array.isArray(categories) ? categories : []).slice(0, 8).map((category, index) => (
                                            <Badge
                                                key={category.id}
                                                as={Link}
                                                to={`/category/${category.id}`}
                                                bg="light"
                                                text="dark"
                                                className="category-tag"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    {/* Contenu principal - Feed */}
                    <Col xl={6} lg={8} className="main-feed">
                        <div className="feed-content">
                            {/* Hero section simplifié */}
                            <div className="hero-card">
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="text-center py-5">
                                        <div className="hero-content">
                                            <h2 className="fw-bold mb-3">
                                                Découvrez la musique
                                                <span className="text-primary"> camerounaise</span>
                                            </h2>
                                            <p className="text-muted mb-4">
                                                Explorez les talents locaux et soutenez la créativité
                                            </p>
                                            <div className="hero-actions">
                                                <Button
                                                    as={Link}
                                                    to="/catalog"
                                                    variant="primary"
                                                    size="lg"
                                                    className="me-3"
                                                >
                                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                                    Explorer les sons
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    to="/events"
                                                    variant="outline-primary"
                                                    size="lg"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                    Événements
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>

                            {/* Feed des sons */}
                            <div className="sounds-feed">
                                <h5 className="feed-section-title">
                                    <FontAwesomeIcon icon={faHeadphones} className="me-2" />
                                    Sons tendances
                                </h5>

                                <div className="sounds-grid">
                                    {(sounds && Array.isArray(sounds) ? sounds : []).map((sound, index) => (
                                        <Card key={sound.id} className="sound-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="sound-cover">
                                                <div className="music-icon-cover">
                                                    <FontAwesomeIcon
                                                        icon={faMusic}
                                                        className="music-icon-large"
                                                    />
                                                </div>
                                                <div className="play-overlay">
                                                    <Button
                                                        variant="light"
                                                        className="play-btn"
                                                        size="lg"
                                                        onClick={() => handlePlayPause(sound, index)}
                                                    >
                                                        <FontAwesomeIcon icon={faPlay} />
                                                    </Button>
                                                </div>
                                            </div>

                                            <Card.Body className="p-3">
                                                <div className="sound-info">
                                                    <h6 className="sound-title">{sound.title}</h6>
                                                    <p className="sound-artist">par {sound.artist || sound.user?.name}</p>

                                                    <div className="sound-stats">
                                                        <span className="stat-item">
                                                            <FontAwesomeIcon icon={faHeadphones} />
                                                            {formatNumber(sound.plays_count || 0)}
                                                        </span>
                                                        <span className="stat-item">
                                                            <FontAwesomeIcon icon={faHeart} />
                                                            {formatNumber(sound.likes_count || 0)}
                                                        </span>
                                                        <span className="stat-item">
                                                            <FontAwesomeIcon icon={faDownload} />
                                                            {formatNumber(sound.downloads_count || 0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="sound-actions">
                                                    <Button
                                                        variant={likedSounds.has(sound.id) ? "danger" : "outline-secondary"}
                                                        size="sm"
                                                        className="action-btn"
                                                        onClick={() => handleLike(sound.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faHeart} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="action-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faShare} />
                                                    </Button>
                                                    <Button
                                                        as={Link}
                                                        to={`/sounds/${sound.id}`}
                                                        variant="primary"
                                                        size="sm"
                                                        className="flex-grow-1 ms-2"
                                                    >
                                                        Écouter
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>

                                <div className="text-center mt-4">
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        variant="outline-primary"
                                        size="lg"
                                    >
                                        Voir plus de sons
                                    </Button>
                                </div>
                            </div>

                            {/* Feed des clips */}
                            <div className="clips-feed mt-5">
                                <h5 className="feed-section-title">
                                    <FontAwesomeIcon icon={faVideo} className="me-2" />
                                    Clips tendances
                                </h5>

                                <div className="clips-grid">
                                    {(clips && Array.isArray(clips) ? clips : []).slice(0, 6).map((clip, index) => (
                                        <Card key={clip.id} className="clip-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-start">
                                                    <div className="clip-icon-stack me-3">
                                                        <div className="clip-icon-container">
                                                            <FontAwesomeIcon icon={faVideo} className="clip-main-icon" />
                                                        </div>
                                                        <div className="clip-icons-vertical">
                                                            <div className="clip-icon-item">
                                                                <FontAwesomeIcon icon={faPlay} className="clip-sub-icon" />
                                                            </div>
                                                            <div className="clip-icon-item">
                                                                <FontAwesomeIcon icon={faEye} className="clip-sub-icon" />
                                                                <span className="icon-count">{formatNumber(clip.views || 0)}</span>
                                                            </div>
                                                            <div className="clip-icon-item">
                                                                <FontAwesomeIcon icon={faHeart} className="clip-sub-icon" />
                                                                <span className="icon-count">{formatNumber(clip.likes || 0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="clip-title">{clip.title}</h6>
                                                        <div className="clip-artist">
                                                            <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
                                                            par {clip.user?.name}
                                                        </div>

                                                        <div className="clip-metadata">
                                                            <span className="clip-duration">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {clip.duration || '0:00'}
                                                            </span>
                                                            {clip.category && (
                                                                <Badge bg="light" text="dark" className="ms-2">
                                                                    <FontAwesomeIcon icon={faVideo} className="me-1" />
                                                                    {clip.category}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="clip-actions mt-3">
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="action-btn me-2"
                                                                title="J'aime"
                                                            >
                                                                <FontAwesomeIcon icon={faHeart} />
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="action-btn me-2"
                                                                title="Partager"
                                                            >
                                                                <FontAwesomeIcon icon={faShare} />
                                                            </Button>
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="action-btn me-2"
                                                                title="Ajouter aux favoris"
                                                            >
                                                                <FontAwesomeIcon icon={faStar} />
                                                            </Button>
                                                            <Button
                                                                as={Link}
                                                                to={`/clips/${clip.id}`}
                                                                variant="primary"
                                                                size="sm"
                                                                className="flex-grow-1"
                                                            >
                                                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                                Regarder
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>

                                <div className="text-center mt-4">
                                    <Button
                                        as={Link}
                                        to="/clips"
                                        variant="outline-primary"
                                        size="lg"
                                    >
                                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                                        Voir plus de clips
                                    </Button>
                                </div>
                            </div>

                            {/* Feed des compétitions */}
                            <div className="competitions-feed mt-5">
                                <h5 className="feed-section-title">
                                    <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                    Compétitions ouvertes
                                </h5>

                                <div className="competitions-grid">
                                    {(competitions && Array.isArray(competitions) ? competitions : []).slice(0, 4).map((competition, index) => (
                                        <Card key={competition.id} className="competition-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-start">
                                                    <div className="competition-icon-stack me-3">
                                                        <div className="competition-icon-container">
                                                            <FontAwesomeIcon icon={faTrophy} className="competition-main-icon" />
                                                        </div>
                                                        <div className="competition-icons-vertical">
                                                            <div className="competition-icon-item">
                                                                <FontAwesomeIcon icon={faUsers} className="competition-sub-icon" />
                                                                <span className="icon-count">{competition.current_participants || 0}</span>
                                                            </div>
                                                            <div className="competition-icon-item">
                                                                <FontAwesomeIcon icon={faClock} className="competition-sub-icon" />
                                                                <span className="icon-count">{competition.days_left || 'Bientôt'}</span>
                                                            </div>
                                                            <div className="competition-icon-item">
                                                                <FontAwesomeIcon icon={faGem} className="competition-sub-icon" />
                                                                <span className="icon-count">Prix</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <h6 className="competition-title">{competition.title}</h6>
                                                        <p className="competition-description">
                                                            {competition.description?.substring(0, 80) || 'Participez à cette compétition'}...
                                                        </p>

                                                        <div className="competition-metadata">
                                                            <div className="prize-info">
                                                                <FontAwesomeIcon icon={faGem} className="me-1 text-warning" />
                                                                <span className="prize-amount">
                                                                    {competition.formatted_total_prize_pool || 'Prix à gagner'}
                                                                </span>
                                                            </div>
                                                            <div className="participants-info">
                                                                <FontAwesomeIcon icon={faUsers} className="me-1 text-primary" />
                                                                <span>
                                                                    {competition.current_participants || 0}/{competition.max_participants || '∞'} participants
                                                                </span>
                                                            </div>
                                                            <div className="time-info">
                                                                <FontAwesomeIcon icon={faClock} className="me-1 text-danger" />
                                                                <span>
                                                                    {competition.days_left || 'Bientôt'} jours restants
                                                                </span>
                                                            </div>
                                                            {competition.category && (
                                                                <Badge bg="warning" className="category-badge">
                                                                    <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                                                    {competition.category}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="competition-actions mt-3">
                                                            <Button
                                                                as={Link}
                                                                to={`/competitions/${competition.id}`}
                                                                variant="warning"
                                                                size="sm"
                                                                className="w-100"
                                                            >
                                                                <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                                                Participer maintenant
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>

                                <div className="text-center mt-4">
                                    <Button
                                        as={Link}
                                        to="/competitions"
                                        variant="outline-warning"
                                        size="lg"
                                    >
                                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                        Voir toutes les compétitions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Sidebar droite - Événements */}
                    <Col xl={3} className="sidebar-right d-none d-xl-block">
                        <div className="sticky-sidebar">
                            <Card className="events-sidebar">
                                <Card.Header className="border-0 bg-transparent">
                                    <h6 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                                        Événements à venir
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {(events && Array.isArray(events) ? events : []).slice(0, 4).map((event, index) => (
                                        <div key={event.id} className="event-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="p-3 border-bottom">
                                                <div className="d-flex">
                                                    <div className="event-date">
                                                        <div className="date-day">{new Date(event.event_date).getDate()}</div>
                                                        <div className="date-month">
                                                            {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow-1 ms-3">
                                                        <h6 className="event-title">{event.title}</h6>
                                                        <p className="event-location">{event.city}</p>
                                                        <Button
                                                            as={Link}
                                                            to={`/events/${event.id}`}
                                                            variant="outline-primary"
                                                            size="sm"
                                                        >
                                                            Détails
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3">
                                        <Button
                                            as={Link}
                                            to="/events"
                                            variant="outline-warning"
                                            size="sm"
                                            className="w-100"
                                        >
                                            Tous les événements
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>

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
                                    <p className="text-muted mb-0 small">{currentPlaying.artist}</p>
                                    {currentPlaying.genre && (
                                        <Badge bg="light" text="dark" className="small">
                                            {currentPlaying.genre}
                                        </Badge>
                                    )}
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
                                    variant="outline-primary"
                                    size="sm"
                                    className="btn-cart"
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                    Ajouter au panier
                                </Button>
                                <Button
                                    as={Link}
                                    to={`/sound/${currentPlaying.id}`}
                                    variant="outline-primary"
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    Voir détails
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            <style jsx>{`
                .social-feed {
                    min-height: 100vh;
                    background: #f8f9fa;
                    padding-top: 80px;
                }

                .feed-header {
                    background: white;
                    border-bottom: 1px solid #e9ecef;
                    position: sticky;
                    top: 70px;
                    z-index: 10;
                }

                /* Styles pour la recherche */
                .search-results-section {
                    background: white;
                    border-bottom: 1px solid #e9ecef;
                    padding: 20px 0;
                    animation: slideInDown 0.5s ease-out;
                }

                .search-results-header {
                    display: flex;
                    justify-content: between;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .close-search-btn {
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }

                .close-search-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .search-category-section {
                    margin-bottom: 40px;
                    animation: fadeInUp 0.6s ease-out;
                }

                .category-title {
                    color: #333;
                    font-weight: 600;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #667eea;
                }

                .search-result-card {
                    border: none;
                    border-radius: 15px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                    animation: slideInUp 0.5s ease-out;
                }

                .search-result-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .result-icon-container {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .result-icon {
                    color: white;
                    font-size: 20px;
                }

                .result-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                    font-size: 16px;
                }

                .result-subtitle {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .result-stats {
                    font-size: 12px;
                    color: #999;
                }

                .result-action-btn {
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .result-action-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                /* Styles spéciaux pour les clips avec icônes verticales */
                .clip-result-card, .clip-card {
                    min-height: 200px;
                }

                .clip-icon-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .clip-icon-container {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }

                .clip-main-icon {
                    color: white;
                    font-size: 28px;
                }

                .clip-icons-vertical {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: center;
                }

                .clip-icon-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 6px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    min-width: 50px;
                    transition: all 0.3s ease;
                }

                .clip-icon-item:hover {
                    background: #e9ecef;
                    transform: scale(1.05);
                }

                .clip-sub-icon {
                    color: #667eea;
                    font-size: 14px;
                }

                .icon-count {
                    font-size: 10px;
                    color: #666;
                    font-weight: 500;
                    line-height: 1;
                }

                .clip-metadata {
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .clip-duration {
                    color: #666;
                    font-size: 14px;
                }

                .clip-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                /* Styles spéciaux pour les compétitions avec icônes */
                .competition-result-card, .competition-card {
                    min-height: 220px;
                }

                .competition-icon-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .competition-icon-container {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }

                .competition-main-icon {
                    color: white;
                    font-size: 28px;
                }

                .competition-icons-vertical {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    align-items: center;
                }

                .competition-icon-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 4px 6px;
                    background: #fff3cd;
                    border-radius: 6px;
                    min-width: 45px;
                    transition: all 0.3s ease;
                    border: 1px solid #ffeaa7;
                }

                .competition-icon-item:hover {
                    background: #ffeaa7;
                    transform: scale(1.05);
                }

                .competition-sub-icon {
                    color: #f39c12;
                    font-size: 12px;
                }

                .competition-metadata {
                    margin: 15px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .prize-info, .participants-info, .time-info {
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                }

                .prize-amount {
                    font-weight: 600;
                    color: #f39c12;
                }

                .category-badge {
                    margin-top: 10px;
                    align-self: flex-start;
                }

                .no-results {
                    animation: fadeInUp 0.8s ease-out;
                }

                .search-input {
                    border: none;
                    border-radius: 25px 0 0 25px;
                    padding: 12px 20px;
                    font-size: 16px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .search-btn {
                    border-radius: 0 25px 25px 0;
                    border: none;
                    padding: 12px 20px;
                    transition: all 0.3s ease;
                }

                .search-btn:disabled {
                    opacity: 0.7;
                }

                .filter-tabs {
                    display: flex;
                    gap: 10px;
                }

                .filter-btn {
                    border-radius: 20px;
                    padding: 8px 16px;
                    border: none;
                    transition: all 0.3s ease;
                    animation: slideInRight 0.5s ease-out;
                }

                .filter-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                .filter-btn.active {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                }

                .feed-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .sidebar-left, .sidebar-right {
                    padding: 0 15px;
                }

                .sticky-sidebar {
                    position: sticky;
                    top: 150px;
                }

                .main-feed {
                    padding: 0 15px;
                }

                .hero-card {
                    margin-bottom: 30px;
                    animation: fadeInUp 0.8s ease-out;
                }

                .hero-content {
                    animation: slideInUp 0.8s ease-out 0.2s both;
                }

                .hero-actions {
                    animation: slideInUp 0.8s ease-out 0.4s both;
                }

                .artist-suggestions, .categories-quick, .events-sidebar {
                    border: none;
                    border-radius: 15px;
                    box-shadow: 0 2px 15px rgba(0,0,0,0.08);
                }

                .artist-suggestion-item {
                    transition: all 0.3s ease;
                    animation: slideInLeft 0.5s ease-out both;
                    border-bottom: 1px solid #f8f9fa;
                }

                .artist-suggestion-item:hover {
                    background: #f8f9fa;
                    transform: translateX(5px);
                }

                .artist-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #e9ecef;
                }

                .follow-btn {
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .follow-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                .category-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .category-tag {
                    padding: 6px 12px;
                    border-radius: 15px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    animation: slideInUp 0.5s ease-out both;
                    border: 1px solid #e9ecef !important;
                }

                .category-tag:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    background: #667eea !important;
                    color: white !important;
                }

                .feed-section-title {
                    margin: 30px 0 20px 0;
                    color: #333;
                    font-weight: 600;
                    animation: slideInLeft 0.6s ease-out;
                }

                .sounds-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .clips-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .competitions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .sound-card, .clip-card, .competition-card {
                    border: none;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 2px 15px rgba(0,0,0,0.08);
                    transition: all 0.4s ease;
                    animation: slideInUp 0.6s ease-out both;
                }

                .sound-card:hover, .clip-card:hover, .competition-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                }

                .sound-cover, .clip-cover, .competition-cover {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .music-icon-cover {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                .music-icon-large {
                    font-size: 4rem;
                    color: rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                .sound-card:hover .music-icon-large {
                    color: rgba(255, 255, 255, 0.5);
                    transform: scale(1.1);
                }

                .cover-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }

                .sound-card:hover .cover-image,
                .clip-card:hover .cover-image,
                .competition-card:hover .cover-image {
                    transform: scale(1.1);
                }

                .play-overlay, .competition-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .sound-card:hover .play-overlay,
                .clip-card:hover .play-overlay {
                    opacity: 1;
                }

                .competition-overlay {
                    opacity: 1;
                    background: linear-gradient(45deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
                    justify-content: flex-end;
                    align-items: flex-start;
                    padding: 15px;
                }

                .prize-badge {
                    background: rgba(255,215,0,0.9);
                    color: #333;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 12px;
                }

                .video-duration {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }

                .clip-badges {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    right: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .clip-category-badge {
                    background: rgba(102, 126, 234, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .clip-artist {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }

                .stat-icon {
                    margin-right: 4px;
                    color: #999;
                    font-size: 12px;
                }

                .sound-title {
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: #333;
                }

                .sound-artist {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .sound-stats {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .stat-item {
                    font-size: 12px;
                    color: #999;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .sound-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .action-btn {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .action-btn:hover {
                    transform: scale(1.1);
                }

                .event-item {
                    animation: slideInRight 0.5s ease-out both;
                    transition: all 0.3s ease;
                }

                .event-item:hover {
                    background: #f8f9fa;
                    transform: translateX(-5px);
                }

                .event-date {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 10px;
                    border-radius: 10px;
                    text-align: center;
                    min-width: 60px;
                }

                .date-day {
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 1;
                }

                .date-month {
                    font-size: 12px;
                    text-transform: uppercase;
                }

                .event-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: #333;
                }

                .event-location {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 10px;
                }

                .loading-animation {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                @media (max-width: 1200px) {
                    .sounds-grid {
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    }

                    .clips-grid {
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    }

                    .competitions-grid {
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .filter-tabs {
                        flex-wrap: wrap;
                        gap: 5px;
                    }

                    .filter-btn {
                        font-size: 12px;
                        padding: 6px 12px;
                    }

                    .sounds-grid, .clips-grid, .competitions-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }

                    .hero-actions {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .search-results-header {
                        flex-direction: column;
                        gap: 15px;
                        align-items: flex-start;
                    }

                    .clip-icon-stack, .competition-icon-stack {
                        flex-direction: row;
                        align-items: center;
                    }

                    .clip-icons-vertical, .competition-icons-vertical {
                        flex-direction: row;
                        gap: 5px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
