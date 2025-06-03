import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faHeart, faMusic, faSearch, faPause, faFire, faCalendarAlt,
    faMapMarkerAlt, faHeadphones, faDownload, faEye, faVideo, faTrophy,
    faUsers, faClock, faGem, faTimes, faShoppingCart, faGift, faVolumeUp,
    faStepForward, faStepBackward, faStar, faChartLine, faRandom, faUser
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sounds, setSounds] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [events, setEvents] = useState([]);
    const [clips, setClips] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [likedSounds, setLikedSounds] = useState(new Set());
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackEnded, setPlaybackEnded] = useState(false);
    const [stats, setStats] = useState({});
    const [hasPlayedFirstSound, setHasPlayedFirstSound] = useState(false);

    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();
    const { addToCart, isInCart } = useCart();

    useEffect(() => {
        loadFeedData();
    }, []);

    const loadFeedData = async () => {
        try {
            setLoading(true);
            const [soundsRes, eventsRes, clipsRes, competitionsRes, statsRes] = await Promise.all([
                fetch('/api/sounds?featured=true&limit=12'),
                fetch('/api/events?upcoming=true&limit=6'),
                fetch('/api/clips?limit=6'),
                fetch('/api/competitions?featured=true&limit=4'),
                fetch('/api/stats/platform')
            ]);

            const [soundsData, eventsData, clipsData, competitionsData, statsData] = await Promise.all([
                soundsRes.json(),
                eventsRes.json(),
                clipsRes.json(),
                competitionsRes.json(),
                statsRes.json()
            ]);

            setSounds(soundsData.sounds || []);
            setEvents(eventsData.events || []);
            setClips(clipsData.clips?.data || clipsData.clips || []);
            setCompetitions(competitionsData.competitions?.data || competitionsData.competitions || []);
            setStats(statsData.stats || {});

            // Charger les likes si utilisateur connecté
            if (token && soundsData.sounds?.length > 0) {
                loadLikesStatus(soundsData.sounds.map(s => s.id));
            }

        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendations = async () => {
        if (!hasPlayedFirstSound) return;
        
        try {
            const response = await fetch('/api/sounds/recommendations?limit=15', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await response.json();
            
            if (data.success) {
                setRecommendations(data.sounds);
                setShowRecommendations(true);
                
                // Animer le changement de vue
                setTimeout(() => {
                    document.querySelector('.youtube-recommendations')?.scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                }, 500);

                if (token && data.sounds?.length > 0) {
                    loadLikesStatus(data.sounds.map(s => s.id));
                }

                toast.success('Recommandations personnalisées', 
                    data.algorithm === 'personalized' 
                        ? 'Basées sur vos goûts musicaux' 
                        : 'Sons populaires et tendances'
                );
            }
        } catch (error) {
            console.error('Erreur chargement recommandations:', error);
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

    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
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

                // Mettre à jour dans toutes les listes
                const updateSoundLikes = (soundList) => 
                    soundList.map(sound => 
                        sound.id === soundId 
                            ? { ...sound, likes_count: data.likes_count }
                            : sound
                    );

                setSounds(updateSoundLikes);
                setRecommendations(updateSoundLikes);
            }
        } catch (error) {
            console.error('Erreur like:', error);
        }
    };

    const handleAddToCart = (sound) => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour acheter ce son');
            return;
        }

        if (sound.is_free || sound.price === 0) {
            toast.info('Son gratuit', 'Ce son est gratuit, vous pouvez le télécharger directement');
            return;
        }

        if (isInCart(sound.id, 'sound')) {
            toast.info('Déjà dans le panier', 'Ce son est déjà présent dans votre panier');
            return;
        }

        const cartItem = {
            id: sound.id,
            type: 'sound',
            title: sound.title,
            artist: sound.artist || sound.user?.name,
            price: sound.price,
            is_free: sound.is_free,
            cover: sound.cover,
            duration: sound.duration,
            category: sound.category
        };

        const success = addToCart(cartItem);
        if (success) {
            toast.success('Ajouté au panier', `"${sound.title}" a été ajouté à votre panier`);
        }
    };

    const handlePlayPause = (sound) => {
        const audio = audioRef.current;

        if (currentPlaying?.id === sound.id && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Stop any currently playing audio
            if (currentPlaying && currentPlaying.id !== sound.id) {
                audio.pause();
                setCurrentTime(0);
                setPlaybackEnded(false);
            }

            audio.src = sound.preview_url || sound.file_url;
            setCurrentPlaying(sound);

            audio.play()
                .then(() => {
                    setIsPlaying(true);
                    setShowAudioPlayer(true);
                    setPlaybackEnded(false);

                    // Première écoute déclenche les recommandations
                    if (!hasPlayedFirstSound) {
                        setHasPlayedFirstSound(true);
                        setTimeout(() => {
                            loadRecommendations();
                        }, 2000); // Délai pour laisser commencer l'écoute
                    }
                })
                .catch(error => {
                    console.error('Erreur lecture:', error);
                    toast.error('Erreur', 'Impossible de lire ce son');
                });
        }
    };

    // Gestion du lecteur audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setPlaybackEnded(true);

            // Si c'est un son payant et preview limitée à 20s
            if (currentPlaying && !currentPlaying.is_free && currentPlaying.price > 0) {
                toast.info('Aperçu terminé', 'Achetez le son complet pour continuer !');
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentPlaying]);

    // Limiter la lecture à 20s pour les sons payants
    useEffect(() => {
        if (currentPlaying && !currentPlaying.is_free && currentPlaying.price > 0 && currentTime >= 20) {
            const audio = audioRef.current;
            audio.pause();
            setIsPlaying(false);
            setPlaybackEnded(true);
            toast.warning('Aperçu terminé', 'Achetez le son complet pour écouter la suite !');
        }
    }, [currentTime, currentPlaying]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderSoundCard = (sound, index, isRecommendation = false) => (
        <Card 
            key={sound.id} 
            className="youtube-sound-card" 
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="sound-thumbnail">
                <img
                    src={sound.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=320&h=180&fit=crop`}
                    alt={sound.title}
                    className="thumbnail-image"
                />

                {/* Badge prix */}
                <div className="price-badge">
                    {sound.is_free || sound.price === 0 ? (
                        <Badge bg="success">
                            <FontAwesomeIcon icon={faGift} className="me-1" />
                            Gratuit
                        </Badge>
                    ) : (
                        <Badge bg="warning" text="dark">
                            {formatCurrency(sound.price)}
                        </Badge>
                    )}
                </div>

                {/* Durée */}
                <div className="duration-badge">
                    {sound.duration || '3:24'}
                </div>

                {/* Play overlay */}
                <div className="play-overlay">
                    <Button
                        variant="light"
                        className="play-btn-youtube"
                        onClick={() => handlePlayPause(sound)}
                    >
                        <FontAwesomeIcon
                            icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                        />
                    </Button>
                    {!sound.is_free && sound.price > 0 && (
                        <Badge bg="info" className="preview-badge mt-2">
                            Aperçu 20s
                        </Badge>
                    )}
                </div>
            </div>

            <Card.Body className="p-3">
                <div className="d-flex">
                    <div className="artist-avatar me-3">
                        <div className="avatar-circle">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="youtube-title mb-1">{sound.title}</h6>
                        <p className="youtube-artist mb-1">{sound.artist || sound.user?.name}</p>
                        <div className="youtube-stats">
                            <span className="stat-item me-3">
                                <FontAwesomeIcon icon={faHeadphones} className="me-1" />
                                {formatNumber(sound.plays_count || 0)} écoutes
                            </span>
                            <span className="stat-item">
                                il y a {Math.floor(Math.random() * 30)} jours
                            </span>
                        </div>
                    </div>
                </div>

                <div className="youtube-actions mt-3">
                    <Button
                        variant={likedSounds.has(sound.id) ? "danger" : "outline-secondary"}
                        size="sm"
                        onClick={() => handleLike(sound.id)}
                        className="action-btn me-2"
                    >
                        <FontAwesomeIcon icon={faHeart} className="me-1" />
                        {formatNumber(sound.likes_count || 0)}
                    </Button>

                    {sound.is_free || sound.price === 0 ? (
                        <Button
                            as={Link}
                            to={`/sounds/${sound.id}`}
                            variant="success"
                            size="sm"
                            className="action-btn"
                        >
                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                            Télécharger
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAddToCart(sound)}
                            disabled={isInCart(sound.id, 'sound')}
                            className="action-btn"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                            {isInCart(sound.id, 'sound') ? 'Dans le panier' : formatCurrency(sound.price)}
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );

    if (loading) {
        return (
            <div className="youtube-loading">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3">Chargement de vos contenus...</p>
            </div>
        );
    }

    return (
        <div className="youtube-home">
            {/* Header avec recherche */}
            <div className="youtube-header">
                <Container>
                    <Row className="align-items-center py-3">
                        <Col md={6}>
                            <h2 className="youtube-logo">
                                <FontAwesomeIcon icon={faMusic} className="me-2" />
                                Reveil<span className="text-primary">Artist</span>
                            </h2>
                        </Col>
                        <Col md={6}>
                            <InputGroup className="youtube-search">
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher sons, artistes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="outline-secondary" onClick={handleSearch}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-4">
                {/* Section principale */}
                {!showRecommendations ? (
                    <>
                        {/* Découverte */}
                        <div className="mb-5">
                            <div className="youtube-section-header">
                                <h4>
                                    <FontAwesomeIcon icon={faFire} className="me-2" />
                                    Sons en tendance
                                </h4>
                                <Button as={Link} to="/catalog" variant="outline-primary" size="sm">
                                    Voir tout
                                </Button>
                            </div>
                            
                            <div className="youtube-grid">
                                {sounds.slice(0, 8).map((sound, index) => 
                                    renderSoundCard(sound, index)
                                )}
                            </div>
                        </div>

                        {/* Sections secondaires en grille */}
                        <Row className="g-4">
                            <Col lg={6}>
                                <div className="youtube-section-header">
                                    <h5>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                        Événements
                                    </h5>
                                    <Button as={Link} to="/events" variant="outline-primary" size="sm">
                                        Voir tout
                                    </Button>
                                </div>
                                {events.slice(0, 3).map((event, index) => (
                                    <Card key={event.id} className="youtube-mini-card mb-3">
                                        <Card.Body className="p-3">
                                            <div className="d-flex">
                                                <div className="event-date-mini me-3">
                                                    <div className="date-number">{new Date(event.event_date).getDate()}</div>
                                                    <div className="date-month">{formatDate(event.event_date).split(' ')[1]}</div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{event.title}</h6>
                                                    <p className="text-muted small mb-2">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                        {event.venue}, {event.city}
                                                    </p>
                                                    <Badge bg={event.is_free ? "success" : "warning"}>
                                                        {event.is_free ? 'Gratuit' : formatCurrency(event.ticket_price || 0)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Col>

                            <Col lg={6}>
                                <div className="youtube-section-header">
                                    <h5>
                                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                                        Clips populaires
                                    </h5>
                                    <Button as={Link} to="/clips" variant="outline-primary" size="sm">
                                        Voir tout
                                    </Button>
                                </div>
                                {clips.slice(0, 3).map((clip, index) => (
                                    <Card key={clip.id} className="youtube-mini-card mb-3">
                                        <Card.Body className="p-3">
                                            <div className="d-flex">
                                                <div className="clip-thumb-mini me-3">
                                                    <FontAwesomeIcon icon={faVideo} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{clip.title}</h6>
                                                    <p className="text-muted small mb-1">par {clip.user?.name}</p>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="small text-muted">
                                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                                            {formatNumber(clip.views || 0)} vues
                                                        </span>
                                                        <Button
                                                            as={Link}
                                                            to={`/clips/${clip.id}`}
                                                            variant="outline-primary"
                                                            size="sm"
                                                        >
                                                            Regarder
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Col>
                        </Row>
                    </>
                ) : (
                    // Recommandations YouTube-style
                    <div className="youtube-recommendations">
                        <div className="youtube-section-header mb-4">
                            <h4>
                                <FontAwesomeIcon icon={faRandom} className="me-2" />
                                Recommandé pour vous
                                {user && (
                                    <Badge bg="success" className="ms-2">
                                        <FontAwesomeIcon icon={faUser} className="me-1" />
                                        Personnalisé
                                    </Badge>
                                )}
                            </h4>
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => setShowRecommendations(false)}
                            >
                                Retour à l'accueil
                            </Button>
                        </div>
                        
                        <div className="youtube-grid">
                            {recommendations.map((sound, index) => 
                                renderSoundCard(sound, index, true)
                            )}
                        </div>

                        {recommendations.length === 0 && (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                                <h5>Aucune recommandation disponible</h5>
                                <p className="text-muted">Écoutez quelques sons pour obtenir des recommandations personnalisées</p>
                            </div>
                        )}
                    </div>
                )}
            </Container>

            {/* Lecteur audio YouTube-style */}
            {showAudioPlayer && currentPlaying && (
                <div className="youtube-player">
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src={currentPlaying.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop`}
                                    alt={currentPlaying.title}
                                    className="player-cover me-3"
                                />
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-0">{currentPlaying.title}</h6>
                                    <p className="text-muted mb-0 small">{currentPlaying.artist || currentPlaying.user?.name}</p>
                                    {!currentPlaying.is_free && currentPlaying.price > 0 && (
                                        <Badge bg="warning" text="dark" className="mt-1">
                                            Aperçu limité à 20s
                                        </Badge>
                                    )}
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={isPlaying ? "danger" : "primary"}
                                        size="sm"
                                        onClick={() => {
                                            const audio = audioRef.current;
                                            if (isPlaying) {
                                                audio.pause();
                                                setIsPlaying(false);
                                            } else {
                                                audio.play();
                                                setIsPlaying(true);
                                            }
                                        }}
                                        className="control-btn"
                                    >
                                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                    </Button>

                                    {!currentPlaying.is_free && currentPlaying.price > 0 && !isInCart(currentPlaying.id, 'sound') && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleAddToCart(currentPlaying)}
                                            className="buy-btn"
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                            {formatCurrency(currentPlaying.price)}
                                        </Button>
                                    )}

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
                                        className="control-btn"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="progress-container">
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>
                                        {!currentPlaying.is_free && currentPlaying.price > 0
                                            ? '20s max'
                                            : formatTime(duration)
                                        }
                                    </span>
                                </div>
                                <ProgressBar
                                    now={duration > 0 ? (currentTime / duration) * 100 : 0}
                                    className="youtube-progress"
                                />
                                {playbackEnded && !currentPlaying.is_free && currentPlaying.price > 0 && (
                                    <div className="mt-2 text-center">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleAddToCart(currentPlaying)}
                                            disabled={isInCart(currentPlaying.id, 'sound')}
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                            Acheter le son complet - {formatCurrency(currentPlaying.price)}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            <audio
                ref={audioRef}
                onEnded={() => {
                    setIsPlaying(false);
                    setPlaybackEnded(true);
                }}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            />

            <style jsx>{`
                .youtube-home {
                    min-height: 100vh;
                    background: #f9f9f9;
                    padding-top: 80px;
                }

                .youtube-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #f9f9f9;
                }

                .youtube-header {
                    background: white;
                    border-bottom: 1px solid #e0e0e0;
                    position: sticky;
                    top: 76px;
                    z-index: 100;
                }

                .youtube-logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                    color: #333;
                }

                .youtube-search .form-control {
                    border-radius: 25px 0 0 25px;
                    border-right: none;
                    padding: 12px 20px;
                }

                .youtube-search .btn {
                    border-radius: 0 25px 25px 0;
                    border-left: none;
                    padding: 12px 20px;
                }

                .youtube-section-header {
                    display: flex;
                    justify-content: between;
                    align-items: center;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }

                .youtube-section-header h4,
                .youtube-section-header h5 {
                    margin: 0;
                    font-weight: 600;
                    color: #333;
                }

                .youtube-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .youtube-sound-card {
                    border: none;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    animation: fadeInUp 0.6s ease-out both;
                    background: white;
                }

                .youtube-sound-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .sound-thumbnail {
                    position: relative;
                    height: 180px;
                    overflow: hidden;
                    background: #000;
                }

                .thumbnail-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .youtube-sound-card:hover .thumbnail-image {
                    transform: scale(1.05);
                }

                .price-badge {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    z-index: 2;
                }

                .duration-badge {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .youtube-sound-card:hover .play-overlay {
                    opacity: 1;
                }

                .play-btn-youtube {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: none;
                    font-size: 1.5rem;
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    transition: all 0.3s ease;
                }

                .play-btn-youtube:hover {
                    transform: scale(1.1);
                    background: white;
                }

                .artist-avatar {
                    flex-shrink: 0;
                }

                .avatar-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                }

                .youtube-title {
                    font-weight: 600;
                    color: #333;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .youtube-artist {
                    color: #666;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .youtube-stats {
                    font-size: 0.85rem;
                    color: #999;
                }

                .youtube-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .action-btn {
                    border-radius: 20px;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .youtube-mini-card {
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }

                .youtube-mini-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .event-date-mini {
                    background: linear-gradient(135deg, #ffc107, #ff8f00);
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    text-align: center;
                    min-width: 50px;
                    font-size: 0.8rem;
                }

                .date-number {
                    font-weight: bold;
                    line-height: 1;
                }

                .date-month {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                }

                .clip-thumb-mini {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                }

                .youtube-player {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 500px;
                    z-index: 1050;
                    animation: slideInUp 0.5s ease-out;
                }

                .player-cover {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .control-btn, .buy-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .buy-btn {
                    width: auto;
                    padding: 0 15px;
                    border-radius: 20px;
                    font-weight: 600;
                }

                .youtube-progress {
                    height: 4px;
                    border-radius: 2px;
                    background: #e0e0e0;
                }

                .youtube-progress .progress-bar {
                    background: #ff0000;
                    border-radius: 2px;
                }

                .youtube-recommendations {
                    animation: fadeIn 0.8s ease-out;
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

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .youtube-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .youtube-header .row {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .youtube-section-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .youtube-player {
                        width: 95%;
                        bottom: 15px;
                    }

                    .youtube-actions {
                        justify-content: space-between;
                    }
                }

                @media (max-width: 480px) {
                    .sound-thumbnail {
                        height: 150px;
                    }

                    .youtube-actions .action-btn {
                        font-size: 0.8rem;
                        padding: 6px 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
