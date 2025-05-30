import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Badge, Nav, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faDownload, faHeart, faMusic, faSearch, faArrowRight,
    faVolumeUp, faPause, faFire, faStopwatch, faCalendarAlt,
    faUsers, faMapMarkerAlt, faClock, faEuroSign, faTicketAlt,
    faFilter, faStar, faEye, faHeadphones, faPlus
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Home = () => {
    const [playingId, setPlayingId] = useState(null);
    const [activeTab, setActiveTab] = useState('populaires');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // États pour les données
    const [sounds, setSounds] = useState([]);
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({});
    const [likedSounds, setLikedSounds] = useState(new Set());

    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadSounds();
    }, [activeTab]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Charger toutes les données en parallèle
            const [statsRes, categoriesRes, eventsRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/categories'),
                fetch('/api/events?active=1')
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
            let endpoint = '';
            switch (activeTab) {
                case 'populaires':
                    endpoint = '/api/sounds/popular?limit=8';
                    break;
                case 'recents':
                    endpoint = '/api/sounds/recent?limit=8';
                    break;
                case 'gratuits':
                    endpoint = '/api/sounds?price=free&limit=8';
                    break;
                case 'premium':
                    endpoint = '/api/sounds?price=premium&limit=8';
                    break;
                default:
                    endpoint = '/api/sounds/popular?limit=8';
            }

            const response = await fetch(endpoint, {
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

    const handleExploreNow = () => {
        navigate('/catalog');
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

    const handlePlayPause = (sound) => {
        const audio = audioRef.current;

        if (currentPlaying?.id === sound.id && isPlaying) {
            // Pause
            audio.pause();
            setIsPlaying(false);
        } else {
            // Play
            audio.src = sound.preview_url || sound.file_url;
            audio.play()
                .then(() => {
                    setCurrentPlaying(sound);
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.error('Erreur lors de la lecture:', error);
                    toast.error('Erreur', 'Impossible de lire ce son');
                });
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

    return (
        <div className="bg-light min-vh-100">
            {/* Lecteur audio invisible */}
            <audio
                ref={audioRef}
                preload="metadata"
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentPlaying(null);
                }}
            />

            {/* Hero Section Moderne */}
            <section className="hero-gradient text-white">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <AnimatedElement animation="fadeIn" delay={100}>
                                {/* Logo Section */}
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
                                            Réveillez votre talent artistique
                                        </h1>
                                    </AnimatedElement>
                                    <AnimatedElement animation="slideInUp" delay={600}>
                                        <p className="fs-6 text-white opacity-75">
                                            avec <span className="fw-semibold">reveilart</span>
                                        </p>
                                    </AnimatedElement>
                                </div>

                                {/* Subheading */}
                                <AnimatedElement animation="fadeIn" delay={700}>
                                    <p className="mb-4 opacity-90 text-sm">
                                        Découvrez les sons les plus authentiques du Cameroun
                                    </p>
                                </AnimatedElement>

                                {/* Search Bar */}
                                <AnimatedElement animation="slideInUp" delay={750}>
                                    <Row className="justify-content-center mb-4">
                                        <Col lg={6} md={8}>
                                            <div className="search-container">
                                                <InputGroup size="lg" className="search-input-group">
                                                    <div className="search-input-wrapper">
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="search-icon"
                                                        />
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Rechercher des sons, artistes, événements..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                            className="search-input"
                                                        />
                                                        <Button
                                                            variant="warning"
                                                            onClick={handleSearch}
                                                            className="search-button"
                                                            disabled={!searchTerm.trim()}
                                                        >
                                                            <FontAwesomeIcon icon={faArrowRight} />
                                                        </Button>
                                                    </div>
                                                </InputGroup>
                                            </div>
                                        </Col>
                                    </Row>
                                </AnimatedElement>

                                {/* Action Buttons */}
                                <AnimatedElement animation="slideInUp" delay={800}>
                                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="px-3 py-2 fw-medium rounded-lg btn-glow"
                                            onClick={handleExploreNow}
                                        >
                                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                                            Explorer maintenant
                                        </Button>
                                        <Button
                                            as={Link}
                                            to="/events"
                                            variant="outline-light"
                                            size="sm"
                                            className="px-3 py-2 fw-medium rounded-lg btn-pulse"
                                        >
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Événements
                                        </Button>
                                    </div>
                                </AnimatedElement>
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
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={300}>
                                <div className="stat-card">
                                    <div className="stat-number">{formatNumber(stats.total_artists || 0)}</div>
                                    <div className="stat-label">Artistes</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                        <Col md={3} sm={6}>
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

            {/* Actions rapides Section */}
            <section className="section-padding">
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={100}>
                                <div className="text-center">
                                    <h2 className="h4 fw-bold mb-2">Partagez votre talent</h2>
                                    <p className="text-secondary text-sm">Ajoutez vos créations sur reveilart</p>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <AnimatedElement animation="slideInLeft" delay={200}>
                                        <Card className="quick-action-card h-100 border-0 shadow-sm">
                                            <Card.Body className="text-center p-4">
                                                <div className="quick-action-icon mb-3">
                                                    <FontAwesomeIcon icon={faMusic} className="fa-2x text-primary" />
                                                </div>
                                                <Card.Title className="h5 mb-2">Ajouter un Son</Card.Title>
                                                <Card.Text className="text-secondary mb-3">
                                                    Partagez vos beats, instrumentales et compositions musicales
                                                </Card.Text>
                                                <Button
                                                    as={Link}
                                                    to="/add-sound"
                                                    variant="primary"
                                                    className="btn-action-quick"
                                                >
                                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                                    Ajouter un son
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                                <Col md={6}>
                                    <AnimatedElement animation="slideInRight" delay={300}>
                                        <Card className="quick-action-card h-100 border-0 shadow-sm">
                                            <Card.Body className="text-center p-4">
                                                <div className="quick-action-icon mb-3">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="fa-2x text-success" />
                                                </div>
                                                <Card.Title className="h5 mb-2">Créer un Événement</Card.Title>
                                                <Card.Text className="text-secondary mb-3">
                                                    Organisez concerts, showcases et événements musicaux
                                                </Card.Text>
                                                <Button
                                                    as={Link}
                                                    to="/add-event"
                                                    variant="success"
                                                    className="btn-action-quick"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                    Créer un événement
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Section avec vraies données */}
            <section className="section-padding">
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={100}>
                                <div className="text-center">
                                    <h2 className="h4 fw-bold mb-2">Explorez par catégories</h2>
                                    <p className="text-secondary text-sm">Trouvez le son parfait pour votre projet</p>
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
                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                    {categories.map((category, index) => (
                                        <AnimatedElement key={category.id} animation="bounceIn" delay={200 + (index * 100)}>
                                            <Link
                                                to={`/catalog?category=${category.id}`}
                                                className="category-pill category-pill-animated text-decoration-none"
                                            >
                                                {category.name}
                                                <Badge bg="light" text="dark" className="ms-2 text-xs">
                                                    {category.sounds_count || 0}
                                                </Badge>
                                            </Link>
                                        </AnimatedElement>
                                    ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Sons populaires avec vraies données */}
            <section className="section-padding bg-white">
                <Container>
                    <Row className="mb-4">
                        <Col md={8}>
                            <AnimatedElement animation="slideInLeft" delay={100}>
                                <h3 className="h5 fw-bold mb-2">Sons populaires</h3>
                                <p className="text-secondary text-sm">Les créations les plus appréciées de la communauté</p>
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
                                    Voir tout
                                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                </Button>
                            </AnimatedElement>
                        </Col>
                    </Row>

                    {/* Navigation Pills avec tri fonctionnel */}
                    <Row className="mb-3">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={300}>
                                <Nav variant="pills" className="nav-fill">
                                    {[
                                        { key: 'populaires', label: 'Populaires', icon: faFire },
                                        { key: 'recents', label: 'Récents', icon: faStopwatch },
                                        { key: 'gratuits', label: 'Gratuits', icon: faHeart },
                                        { key: 'premium', label: 'Premium', icon: faStar }
                                    ].map((tab) => (
                                        <Nav.Item key={tab.key}>
                                            <Nav.Link
                                                active={activeTab === tab.key}
                                                className="text-sm rounded-lg nav-pill-animated"
                                                onClick={() => setActiveTab(tab.key)}
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

                    {/* Sounds Grid avec vraies données */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" size="lg" />
                        </div>
                    ) : (
                        <Row className="g-3">
                            {sounds.map((sound, index) => (
                                <Col key={sound.id} lg={3} md={4} sm={6}>
                                    <AnimatedElement
                                        animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
                                        delay={400 + (index * 150)}
                                    >
                                        <Card className="sound-card sound-card-enhanced h-100">
                                            <div className="position-relative">
                                                <Card.Img
                                                    variant="top"
                                                    src={sound.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop`}
                                                    alt={sound.title}
                                                    className="sound-image"
                                                />
                                                <div className="sound-play-overlay">
                                                    <Button
                                                        className="play-button play-button-enhanced"
                                                        onClick={() => handlePlayPause(sound)}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                                        />
                                                    </Button>
                                                </div>
                                                {sound.is_free && (
                                                    <Badge
                                                        bg="success"
                                                        className="position-absolute top-0 start-0 m-2 text-xs badge-pulse"
                                                    >
                                                        Gratuit
                                                    </Badge>
                                                )}
                                                {sound.is_featured && (
                                                    <Badge
                                                        bg="danger"
                                                        className="position-absolute top-0 end-0 m-2 text-xs badge-fire"
                                                    >
                                                        <FontAwesomeIcon icon={faFire} className="me-1" />
                                                        Vedette
                                                    </Badge>
                                                )}
                                            </div>

                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="flex-grow-1">
                                                        <Card.Title className="h6 mb-1 text-truncate">
                                                            {sound.title}
                                                        </Card.Title>
                                                        <Card.Text className="small text-muted mb-2">
                                                            par {sound.artist}
                                                        </Card.Text>
                                                    </div>
                                                    <Badge bg="light" text="dark" className="text-xs badge-category">
                                                        {sound.category}
                                                    </Badge>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className={`p-0 stat-item ${likedSounds.has(sound.id) ? 'text-danger' : 'text-muted'}`}
                                                            onClick={() => handleLike(sound.id)}
                                                        >
                                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                            {formatNumber(sound.likes || 0)}
                                                        </Button>
                                                        <small className="text-muted stat-item">
                                                            <FontAwesomeIcon icon={faPlay} className="me-1 text-primary" />
                                                            {formatNumber(sound.plays || 0)}
                                                        </small>
                                                    </div>
                                                    <Button
                                                        as={Link}
                                                        to={`/sound/${sound.id}`}
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="btn-view"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="text-end">
                                                        {sound.is_free ? (
                                                            <span className="fw-bold text-success small price-tag">
                                                                Gratuit
                                                            </span>
                                                        ) : (
                                                            <span className="fw-bold text-primary small price-tag">
                                                                {formatCurrency(sound.price || 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        {sound.duration || '0:00'}
                                                    </small>
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

            {/* Section des événements à venir */}
            {events.length > 0 && (
                <section className="section-padding">
                    <Container>
                        <Row className="mb-4">
                            <Col md={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <h3 className="h5 fw-bold mb-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                        Événements à venir
                                    </h3>
                                    <p className="text-secondary text-sm">Ne manquez pas les prochains événements musicaux</p>
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

                        <Row className="g-4">
                            {events.slice(0, 4).map((event, index) => (
                                <Col key={event.id} lg={6} md={6}>
                                    <AnimatedElement animation="slideInUp" delay={300 + (index * 150)}>
                                        <Card className="event-card border-0 shadow-sm h-100">
                                            <Row className="g-0 h-100">
                                                <Col md={5}>
                                                    <img
                                                        src={event.poster_image ? `/storage/${event.poster_image}` : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=200&fit=crop'}
                                                        alt={event.title}
                                                        className="img-fluid h-100"
                                                        style={{ objectFit: 'cover', borderRadius: '8px 0 0 8px' }}
                                                    />
                                                </Col>
                                                <Col md={7}>
                                                    <Card.Body className="h-100 d-flex flex-column p-3">
                                                        <div>
                                                            <Badge bg="primary" className="mb-2">
                                                                {event.category}
                                                            </Badge>
                                                            <h6 className="fw-bold mb-2">{event.title}</h6>
                                                            <p className="text-muted small mb-2">
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                {event.venue}, {event.city}
                                                            </p>
                                                            <p className="text-muted small mb-2">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {new Date(event.event_date).toLocaleDateString('fr-FR')}
                                                            </p>
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <small className="text-primary">
                                                                    <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                                                                    {event.is_free ? 'Gratuit' : formatCurrency(event.ticket_price)}
                                                                </small>
                                                                {event.max_attendees && (
                                                                    <small className="text-muted">
                                                                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                                        {event.max_attendees} places
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mt-auto">
                                                            <Button
                                                                as={Link}
                                                                to={`/event/${event.id}`}
                                                                variant="primary"
                                                                size="sm"
                                                                className="w-100"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                Voir les détails
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </section>
            )}

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

                .category-pill {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    margin: 0.25rem;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 25px;
                    color: #8B5CF6;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
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
            `}</style>
        </div>
    );
};

export default Home;
