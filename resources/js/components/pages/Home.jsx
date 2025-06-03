import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faHeart, faMusic, faSearch, faPause, faFire, faCalendarAlt,
    faMapMarkerAlt, faHeadphones, faDownload, faEye, faVideo, faTrophy,
    faUsers, faClock, faGem, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sounds, setSounds] = useState([]);
    const [events, setEvents] = useState([]);
    const [clips, setClips] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [likedSounds, setLikedSounds] = useState(new Set());
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);

    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadFeedData();
    }, []);

    const loadFeedData = async () => {
        try {
            setLoading(true);
            const [soundsRes, eventsRes, clipsRes, competitionsRes] = await Promise.all([
                fetch('/api/sounds?featured=true&limit=8'),
                fetch('/api/events?upcoming=true&limit=6'),
                fetch('/api/clips?limit=6'),
                fetch('/api/competitions?featured=true&limit=4')
            ]);

            const [soundsData, eventsData, clipsData, competitionsData] = await Promise.all([
                soundsRes.json(),
                eventsRes.json(),
                clipsRes.json(),
                competitionsRes.json()
            ]);

            setSounds(soundsData.sounds || []);
            setEvents(eventsData.events || []);
            setClips(clipsData.clips?.data || clipsData.clips || []);
            setCompetitions(competitionsData.competitions?.data || competitionsData.competitions || []);

        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
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
            }
        } catch (error) {
            console.error('Erreur like:', error);
        }
    };

    const handlePlayPause = (sound) => {
        const audio = audioRef.current;
        if (currentPlaying?.id === sound.id && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.src = sound.preview_url || sound.file_url;
            audio.play()
                .then(() => {
                    setCurrentPlaying(sound);
                    setIsPlaying(true);
                    setShowAudioPlayer(true);
                })
                .catch(error => {
                    console.error('Erreur lecture:', error);
                    toast.error('Erreur', 'Impossible de lire ce son');
                });
        }
    };

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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" size="lg" />
            </div>
        );
    }

    return (
        <div className="social-feed-home">
            {/* Header de recherche */}
            <div className="search-header">
                <Container>
                    <Row className="py-4">
                        <Col md={8} className="mx-auto">
                            <h2 className="text-center fw-bold mb-4">
                                Découvrez la musique <span className="text-primary">camerounaise</span>
                            </h2>
                            <InputGroup size="lg">
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher sons, événements, artistes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="border-0 shadow-sm"
                                    style={{ borderRadius: '25px 0 0 25px' }}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleSearch}
                                    style={{ borderRadius: '0 25px 25px 0' }}
                                >
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Feed principal */}
            <Container className="py-4" style={{ maxWidth: '700px' }}>

                {/* Sons populaires */}
                <div className="mb-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                        Sons populaires
                    </h5>
                    <div className="d-flex flex-column gap-3">
                        {sounds.slice(0, 5).map((sound, index) => (
                            <Card key={sound.id} className="border-0 shadow-sm post-card">
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col xs={2}>
                                            <div
                                                className="play-button"
                                                onClick={() => handlePlayPause(sound)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                                    className="text-white"
                                                />
                                            </div>
                                        </Col>
                                        <Col xs={7}>
                                            <h6 className="fw-bold mb-1">{sound.title}</h6>
                                            <p className="text-muted mb-2 small">par {sound.artist || sound.user?.name}</p>
                                            <div className="d-flex gap-3 small text-muted">
                                                <span>
                                                    <FontAwesomeIcon icon={faHeadphones} className="me-1" />
                                                    {formatNumber(sound.plays_count || 0)}
                                                </span>
                                                <span>
                                                    <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                    {formatNumber(sound.likes_count || 0)}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col xs={3} className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <Button
                                                    variant={likedSounds.has(sound.id) ? "danger" : "outline-secondary"}
                                                    size="sm"
                                                    onClick={() => handleLike(sound.id)}
                                                    className="action-btn"
                                                >
                                                    <FontAwesomeIcon icon={faHeart} />
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    to={`/sounds/${sound.id}`}
                                                    variant="primary"
                                                    size="sm"
                                                    className="rounded-pill"
                                                >
                                                    Écouter
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Button as={Link} to="/catalog" variant="outline-primary" className="rounded-pill">
                            Voir plus de sons
                        </Button>
                    </div>
                </div>

                {/* Événements */}
                <div className="mb-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                        Événements à venir
                    </h5>
                    <Row className="g-3">
                        {events.slice(0, 4).map((event, index) => (
                            <Col md={6} key={event.id}>
                                <Card className="border-0 shadow-sm post-card h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex">
                                            <div className="event-date me-3">
                                                <div className="date-badge">
                                                    {formatDate(event.event_date)}
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">{event.title}</h6>
                                                <p className="text-muted small mb-2">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                    {event.venue}, {event.city}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-success fw-bold small">
                                                        {event.is_free ? 'Gratuit' : `${formatCurrency(event.ticket_price || 0)}`}
                                                    </span>
                                                    <Button
                                                        as={Link}
                                                        to={`/events/${event.id}`}
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="rounded-pill"
                                                    >
                                                        Voir
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <div className="text-center mt-4">
                        <Button as={Link} to="/events" variant="outline-warning" className="rounded-pill">
                            Tous les événements
                        </Button>
                    </div>
                </div>

                {/* Clips */}
                <div className="mb-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <FontAwesomeIcon icon={faVideo} className="me-2 text-info" />
                        Clips tendances
                    </h5>
                    <Row className="g-3">
                        {clips.slice(0, 4).map((clip, index) => (
                            <Col md={6} key={clip.id}>
                                <Card className="border-0 shadow-sm post-card">
                                    <Card.Body className="p-3">
                                        <div className="d-flex">
                                            <div className="clip-thumb me-3">
                                                <FontAwesomeIcon icon={faVideo} className="text-white" />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1">{clip.title}</h6>
                                                <p className="text-muted small mb-2">par {clip.user?.name}</p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex gap-2 small text-muted">
                                                        <span>
                                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                                            {formatNumber(clip.views || 0)}
                                                        </span>
                                                        <span>
                                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                            {formatNumber(clip.likes || 0)}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        as={Link}
                                                        to={`/clips/${clip.id}`}
                                                        variant="outline-info"
                                                        size="sm"
                                                        className="rounded-pill"
                                                    >
                                                        Regarder
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <div className="text-center mt-4">
                        <Button as={Link} to="/clips" variant="outline-info" className="rounded-pill">
                            Voir plus de clips
                        </Button>
                    </div>
                </div>

                {/* Compétitions */}
                <div className="mb-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                        Compétitions ouvertes
                    </h5>
                    <div className="d-flex flex-column gap-3">
                        {competitions.slice(0, 3).map((competition, index) => (
                            <Card key={competition.id} className="border-0 shadow-sm post-card">
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col xs={2}>
                                            <div className="competition-icon">
                                                <FontAwesomeIcon icon={faTrophy} className="text-white" />
                                            </div>
                                        </Col>
                                        <Col xs={7}>
                                            <h6 className="fw-bold mb-1">{competition.title}</h6>
                                            <p className="text-muted mb-2 small">{competition.description?.substring(0, 60)}...</p>
                                            <div className="d-flex gap-3 small text-muted">
                                                <span>
                                                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                    {competition.current_participants || 0} participants
                                                </span>
                                                <span>
                                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                                    {competition.days_left || 'Bientôt'} jours
                                                </span>
                                            </div>
                                        </Col>
                                        <Col xs={3} className="text-end">
                                            <div className="text-warning fw-bold mb-2 small">
                                                <FontAwesomeIcon icon={faGem} className="me-1" />
                                                Prix
                                            </div>
                                            <Button
                                                as={Link}
                                                to={`/competitions/${competition.id}`}
                                                variant="warning"
                                                size="sm"
                                                className="rounded-pill"
                                            >
                                                Participer
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Button as={Link} to="/competitions" variant="outline-warning" className="rounded-pill">
                            Toutes les compétitions
                        </Button>
                    </div>
                </div>
            </Container>

            {/* Mini lecteur audio */}
            {showAudioPlayer && currentPlaying && (
                <div className="audio-player-mini">
                    <Card className="border-0 shadow-lg">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center">
                                <div className="play-button-mini me-3">
                                    <FontAwesomeIcon icon={faMusic} className="text-white" />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-0 small">{currentPlaying.title}</h6>
                                    <p className="text-muted mb-0 small">{currentPlaying.artist}</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={isPlaying ? "danger" : "primary"}
                                        size="sm"
                                        onClick={() => {
                                            if (isPlaying) {
                                                audioRef.current?.pause();
                                                setIsPlaying(false);
                                            } else {
                                                audioRef.current?.play();
                                                setIsPlaying(true);
                                            }
                                        }}
                                        className="action-btn"
                                    >
                                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                    </Button>
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
                                        className="action-btn"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}

            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
            />

            <style jsx>{`
                .social-feed-home {
                    min-height: 100vh;
                    background: #f8f9fa;
                    padding-top: 80px;
                }

                .search-header {
                    background: white;
                    border-bottom: 1px solid #e9ecef;
                }

                .post-card {
                    transition: all 0.3s ease;
                }

                .post-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }

                .play-button {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .play-button:hover {
                    transform: scale(1.05);
                }

                .date-badge {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 10px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 12px;
                    min-width: 50px;
                }

                .clip-thumb {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .competition-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    transition: all 0.3s ease;
                }

                .action-btn:hover {
                    transform: scale(1.1);
                }

                .audio-player-mini {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 300px;
                    z-index: 1050;
                }

                .play-button-mini {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 768px) {
                    .audio-player-mini {
                        width: 280px;
                        right: 10px;
                        bottom: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
