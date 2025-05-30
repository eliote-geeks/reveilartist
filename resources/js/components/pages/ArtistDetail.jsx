import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Nav, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faMusic, faHeart, faPlay, faDownload, faShare,
    faMapMarkerAlt, faCalendar, faCheckCircle, faUsers,
    faHeadphones, faPlus, faUserPlus, faUserCheck, faSpinner,
    faTicketAlt, faClock, faEuroSign, faArrowLeft, faEye, faStar,
    faChartLine, faTrophy, faFire, faCrown, faGem, faThumbsUp,
    faRocket, faAward, faShield, faBolt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ArtistDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [artist, setArtist] = useState(null);
    const [stats, setStats] = useState({});
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [popularSounds, setPopularSounds] = useState([]);
    const [recentSounds, setRecentSounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const { token, user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadArtist();
    }, [id]);

    const loadArtist = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/artists/${id}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setArtist(data.artist);
                setStats(data.stats);
                setIsFollowing(data.is_following);
                setUpcomingEvents(data.upcoming_events);
                setPopularSounds(data.popular_sounds);
                setRecentSounds(data.recent_sounds);
            } else {
                toast.error('Erreur', 'Artiste non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'artiste:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user || !token) {
            toast.error('Connexion requise', 'Vous devez être connecté pour suivre un artiste');
            return;
        }

        try {
            setActionLoading(true);

            const response = await fetch(`/api/artists/${id}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setIsFollowing(data.is_following);
                setArtist(prev => ({
                    ...prev,
                    followers_count: data.followers_count
                }));
                toast.success('Succès', data.message);
            } else {
                toast.error('Erreur', data.message);
            }
        } catch (error) {
            console.error('Erreur lors du suivi:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setActionLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getRoleDisplayName = (role) => {
        const roles = {
            'artist': 'Artiste',
            'producer': 'Producteur'
        };
        return roles[role] || role;
    };

    const getPopularityLevel = (plays) => {
        if (plays > 100000) return { level: 'Légende', color: '#FFD700', icon: faCrown };
        if (plays > 50000) return { level: 'Star', color: '#FF6B6B', icon: faStar };
        if (plays > 10000) return { level: 'Populaire', color: '#4ECDC4', icon: faFire };
        if (plays > 5000) return { level: 'Montant', color: '#45B7D1', icon: faRocket };
        return { level: 'Émergent', color: '#96CEB4', icon: faBolt };
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
                    <h5 className="text-muted">Chargement des détails...</h5>
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <h5 className="text-muted">Artiste non trouvé</h5>
                    <Button as={Link} to="/artists" variant="primary" className="mt-3">
                        Retour aux artistes
                    </Button>
                </div>
            </div>
        );
    }

    const popularityData = getPopularityLevel(stats.total_plays || 0);

    return (
        <div className="bg-light min-vh-100">
            {/* Header Section avec image de couverture */}
            <section className="position-relative">
                <div
                    className="artist-cover"
                    style={{
                        height: '400px',
                        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background: 'linear-gradient(45deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
                        }}
                    ></div>

                    {/* Back button */}
                    <div className="position-absolute top-0 start-0 p-4">
                        <Button
                            as={Link}
                            to="/artists"
                            variant="outline-light"
                            className="rounded-circle"
                            style={{ width: '50px', height: '50px' }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Button>
                    </div>

                    {/* Informations principales */}
                    <Container className="h-100">
                        <Row className="h-100 align-items-end">
                            <Col lg={8} className="text-white pb-4">
                                <div className="d-flex align-items-center mb-4">
                                    <img
                                        src={artist.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&color=7F9CF5&background=EBF4FF&size=120`}
                                        alt={artist.name}
                                        className="rounded-circle border border-white border-4 me-4"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <h1 className="display-5 fw-bold mb-2 text-white">{artist.name}</h1>
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <Badge bg="primary" className="rounded-pill px-3 py-2 fs-6">
                                                {getRoleDisplayName(artist.role)}
                                            </Badge>
                                            {artist.verified && (
                                                <Badge bg="success" className="rounded-pill px-3 py-2 fs-6">
                                                    <FontAwesomeIcon icon={faShield} className="me-1" />
                                                    Vérifié
                                                </Badge>
                                            )}
                                            <Badge
                                                className="rounded-pill px-3 py-2 fs-6"
                                                style={{ backgroundColor: popularityData.color, color: 'white' }}
                                            >
                                                <FontAwesomeIcon icon={popularityData.icon} className="me-1" />
                                                {popularityData.level}
                                            </Badge>
                                        </div>
                                        <p className="text-white-50 mb-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            {artist.city || 'Localisation non renseignée'}
                                        </p>
                                        <p className="text-white-50 small">
                                            Membre depuis {new Date(artist.created_at).toLocaleDateString('fr-FR', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col lg={4} className="text-end pb-4">
                                <Button
                                    variant={isFollowing ? "outline-light" : "light"}
                                    size="lg"
                                    onClick={handleFollow}
                                    className="mb-3 fw-medium px-4"
                                    style={{ borderRadius: '25px' }}
                                    disabled={actionLoading || !user}
                                >
                                    {actionLoading ? (
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                    ) : isFollowing ? (
                                        <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                    )}
                                    {isFollowing ? 'Suivi' : 'Suivre'}
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </section>

            {/* Statistiques en cartes flottantes */}
            <section className="py-5" style={{ marginTop: '-60px' }}>
                <Container>
                    <Row className="g-4">
                        <Col lg={3} md={6}>
                            <Card className="border-0 shadow-lg text-center h-100" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-4">
                                    <div className="text-primary mb-3">
                                        <FontAwesomeIcon icon={faHeadphones} size="2x" />
                                    </div>
                                    <h2 className="fw-bold text-primary mb-1">{formatNumber(stats.total_plays || 0)}</h2>
                                    <p className="text-muted mb-0">Écoutes totales</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="border-0 shadow-lg text-center h-100" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-4">
                                    <div className="text-success mb-3">
                                        <FontAwesomeIcon icon={faUsers} size="2x" />
                                    </div>
                                    <h2 className="fw-bold text-success mb-1">{formatNumber(artist.followers_count || 0)}</h2>
                                    <p className="text-muted mb-0">Followers</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="border-0 shadow-lg text-center h-100" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-4">
                                    <div className="text-warning mb-3">
                                        <FontAwesomeIcon icon={faMusic} size="2x" />
                                    </div>
                                    <h2 className="fw-bold text-warning mb-1">{artist.sounds_count || 0}</h2>
                                    <p className="text-muted mb-0">Sons publiés</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={3} md={6}>
                            <Card className="border-0 shadow-lg text-center h-100" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-4">
                                    <div className="text-info mb-3">
                                        <FontAwesomeIcon icon={faCalendar} size="2x" />
                                    </div>
                                    <h2 className="fw-bold text-info mb-1">{artist.events_count || 0}</h2>
                                    <p className="text-muted mb-0">Événements</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Statistiques détaillées */}
                    <Row className="mt-4">
                        <Col lg={6}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                <Card.Header className="bg-gradient-primary text-white border-0" style={{ borderRadius: '15px 15px 0 0' }}>
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                        Performances
                                    </h5>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <Row className="g-3">
                                        <Col xs={6}>
                                            <div className="text-center p-3 rounded-3 bg-light">
                                                <FontAwesomeIcon icon={faDownload} className="text-success h4 mb-2" />
                                                <div className="fw-bold text-success h5 mb-1">{formatNumber(stats.total_downloads || 0)}</div>
                                                <small className="text-muted">Téléchargements</small>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="text-center p-3 rounded-3 bg-light">
                                                <FontAwesomeIcon icon={faHeart} className="text-danger h4 mb-2" />
                                                <div className="fw-bold text-danger h5 mb-1">{formatNumber(stats.total_likes || 0)}</div>
                                                <small className="text-muted">J'aime reçus</small>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="text-center p-3 rounded-3 bg-light">
                                                <FontAwesomeIcon icon={faStar} className="text-warning h4 mb-2" />
                                                <div className="fw-bold text-warning h5 mb-1">{stats.average_rating || 0}/5</div>
                                                <small className="text-muted">Note moyenne</small>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="text-center p-3 rounded-3 bg-light">
                                                <FontAwesomeIcon icon={faEuroSign} className="text-primary h4 mb-2" />
                                                <div className="fw-bold text-primary h5 mb-1">{formatCurrency(stats.total_revenue || 0)}</div>
                                                <small className="text-muted">Revenus générés</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                <Card.Header className="bg-gradient-info text-white border-0" style={{ borderRadius: '15px 15px 0 0' }}>
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faAward} className="me-2" />
                                        Réalisations
                                    </h5>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="achievement-item mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Popularité</span>
                                            <Badge
                                                className="rounded-pill"
                                                style={{ backgroundColor: popularityData.color }}
                                            >
                                                {popularityData.level}
                                            </Badge>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((stats.total_plays || 0) / 1000, 100)}
                                            className="mt-2"
                                            style={{ height: '8px', borderRadius: '4px' }}
                                        />
                                    </div>

                                    <div className="achievement-item mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Engagement</span>
                                            <span className="fw-bold text-success">
                                                {Math.round(((stats.total_likes || 0) / Math.max(stats.total_plays || 1, 1)) * 100)}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            now={Math.min(((stats.total_likes || 0) / Math.max(stats.total_plays || 1, 1)) * 100, 100)}
                                            variant="success"
                                            className="mt-2"
                                            style={{ height: '8px', borderRadius: '4px' }}
                                        />
                                    </div>

                                    <div className="achievement-item">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Activité</span>
                                            <span className="fw-bold text-warning">
                                                {stats.active_events || 0} événements actifs
                                            </span>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((stats.active_events || 0) * 20, 100)}
                                            variant="warning"
                                            className="mt-2"
                                            style={{ height: '8px', borderRadius: '4px' }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Content Tabs */}
            <section className="py-5">
                <Container>
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="pills" className="justify-content-center mb-5">
                            <Nav.Item>
                                <Nav.Link eventKey="overview" className="rounded-pill px-4 mx-2">
                                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                    Vue d'ensemble
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="sounds" className="rounded-pill px-4 mx-2">
                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                    Sons ({popularSounds.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="events" className="rounded-pill px-4 mx-2">
                                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                    Événements ({upcomingEvents.length})
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>

                        <Tab.Content>
                            {/* Overview Tab */}
                            <Tab.Pane eventKey="overview">
                                <Row className="g-4">
                                    <Col lg={8}>
                                        {/* À propos */}
                                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                            <Card.Body className="p-4">
                                                <h5 className="fw-bold mb-3">À propos de {artist.name}</h5>
                                                <p className="text-muted">
                                                    {artist.bio || 'Aucune biographie disponible pour cet artiste.'}
                                                </p>

                                                <hr className="my-4" />

                                                <Row className="g-3">
                                                    <Col sm={6}>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Genre principal :</span>
                                                            <span className="fw-medium">{artist.genre || 'Non défini'}</span>
                                                        </div>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Statut :</span>
                                                            <span className="fw-medium">
                                                                {artist.verified ? (
                                                                    <Badge bg="success">Vérifié</Badge>
                                                                ) : (
                                                                    <Badge bg="secondary">Non vérifié</Badge>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>

                                        {/* Top Songs Preview */}
                                        {popularSounds.length > 0 && (
                                            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                                <Card.Header className="bg-transparent border-0 pt-4 px-4">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <h5 className="fw-bold mb-0">
                                                            <FontAwesomeIcon icon={faTrophy} className="text-warning me-2" />
                                                            Top Sons
                                                        </h5>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => setActiveTab('sounds')}
                                                        >
                                                            Voir tout
                                                        </Button>
                                                    </div>
                                                </Card.Header>
                                                <Card.Body className="p-4 pt-0">
                                                    {popularSounds.slice(0, 4).map((sound, index) => (
                                                        <div key={sound.id} className="d-flex align-items-center p-3 rounded-3 mb-2 bg-light">
                                                            <div className="me-3">
                                                                <Badge
                                                                    bg={index === 0 ? "warning" : index === 1 ? "secondary" : "light"}
                                                                    text={index === 2 ? "dark" : "white"}
                                                                    className="rounded-circle"
                                                                    style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    {index + 1}
                                                                </Badge>
                                                            </div>
                                                            <img
                                                                src={sound.cover_image_url}
                                                                alt={sound.title}
                                                                className="rounded me-3"
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-grow-1">
                                                                <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                                <small className="text-muted">{sound.genre}</small>
                                                            </div>
                                                            <div className="text-end">
                                                                <div className="fw-bold text-primary">{formatNumber(sound.plays_count || 0)}</div>
                                                                <small className="text-muted">écoutes</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </Col>
                                    <Col lg={4}>
                                        {/* Contact et actions */}
                                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                            <Card.Body className="p-4">
                                                <h6 className="fw-bold mb-3">Contact</h6>
                                                <div className="d-grid gap-2">
                                                    {artist.email && (
                                                        <Button variant="outline-primary" size="sm">
                                                            Envoyer un message
                                                        </Button>
                                                    )}
                                                    <Button variant="outline-secondary" size="sm">
                                                        Signaler le profil
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>

                                        {/* Événements à venir */}
                                        {upcomingEvents.length > 0 && (
                                            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                                <Card.Body className="p-4">
                                                    <h6 className="fw-bold mb-3">
                                                        <FontAwesomeIcon icon={faCalendar} className="text-info me-2" />
                                                        Prochains événements
                                                    </h6>
                                                    {upcomingEvents.slice(0, 3).map((event) => (
                                                        <div key={event.id} className="mb-3 p-3 rounded-3 bg-light">
                                                            <h6 className="fw-bold mb-1">{event.title}</h6>
                                                            <p className="text-muted small mb-2">
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                {event.city}
                                                            </p>
                                                            <p className="text-muted small mb-0">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {new Date(event.event_date).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {upcomingEvents.length > 3 && (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="w-100"
                                                            onClick={() => setActiveTab('events')}
                                                        >
                                                            Voir tous les événements
                                                        </Button>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        )}
                                    </Col>
                                </Row>
                            </Tab.Pane>

                            {/* Autres tabs... (même contenu que ArtistProfile.jsx) */}
                            <Tab.Pane eventKey="sounds">
                                {popularSounds.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                                        <h5 className="text-muted">Aucun son disponible</h5>
                                        <p className="text-muted">Cet artiste n'a pas encore publié de sons</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Sons populaires */}
                                        <div className="mb-5">
                                            <div className="d-flex align-items-center justify-content-between mb-4">
                                                <h4 className="fw-bold mb-0">
                                                    <FontAwesomeIcon icon={faTrophy} className="text-warning me-2" />
                                                    Sons populaires
                                                </h4>
                                                <Badge bg="warning" className="rounded-pill">
                                                    {popularSounds.length} son{popularSounds.length > 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                            <Row className="g-4">
                                                {popularSounds.map((sound, index) => (
                                                    <Col lg={3} md={4} sm={6} key={sound.id}>
                                                        <Card className="sound-card border-0 shadow-sm h-100 overflow-hidden">
                                                            <div className="position-relative">
                                                                <img
                                                                    src={sound.cover_image_url}
                                                                    alt={sound.title}
                                                                    className="card-img-top"
                                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                                />
                                                                <div className="position-absolute top-0 start-0 p-2">
                                                                    <Badge
                                                                        bg={index < 3 ? "warning" : "dark"}
                                                                        className="rounded-pill opacity-90"
                                                                    >
                                                                        #{index + 1}
                                                                    </Badge>
                                                                </div>
                                                                <div className="position-absolute top-0 end-0 p-2">
                                                                    {sound.is_featured && (
                                                                        <Badge bg="success" className="rounded-pill">
                                                                            Vedette
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant="light"
                                                                    className="position-absolute top-50 start-50 translate-middle rounded-circle shadow-sm play-btn"
                                                                    style={{ width: '60px', height: '60px', opacity: 0.9 }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlay} className="text-primary" />
                                                                </Button>
                                                            </div>
                                                            <Card.Body className="p-3">
                                                                <h6 className="fw-bold mb-2 text-truncate">{sound.title}</h6>
                                                                <p className="text-muted small mb-2">{sound.genre || 'Non défini'}</p>
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <div className="d-flex gap-3">
                                                                        <small className="text-primary">
                                                                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                                            {formatNumber(sound.plays_count || 0)}
                                                                        </small>
                                                                        <small className="text-danger">
                                                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                                            {formatNumber(sound.likes_count || 0)}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div className="fw-bold text-success">
                                                                        {sound.formatted_price || (sound.is_free ? 'Gratuit' : formatCurrency(sound.price || 0))}
                                                                    </div>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        as={Link}
                                                                        to={`/sound/${sound.id}`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                        Voir
                                                                    </Button>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>

                                        {/* Sons récents */}
                                        {recentSounds.length > 0 && (
                                            <div>
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <h4 className="fw-bold mb-0">
                                                        <FontAwesomeIcon icon={faClock} className="text-info me-2" />
                                                        Nouveautés
                                                    </h4>
                                                    <Badge bg="info" className="rounded-pill">
                                                        {recentSounds.length} nouveau{recentSounds.length > 1 ? 'x' : ''}
                                                    </Badge>
                                                </div>
                                                <Row className="g-4">
                                                    {recentSounds.map((sound) => (
                                                        <Col lg={3} md={4} sm={6} key={sound.id}>
                                                            <Card className="sound-card border-0 shadow-sm h-100 overflow-hidden">
                                                                <div className="position-relative">
                                                                    <img
                                                                        src={sound.cover_image_url}
                                                                        alt={sound.title}
                                                                        className="card-img-top"
                                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                                    />
                                                                    <div className="position-absolute top-0 start-0 p-2">
                                                                        <Badge bg="dark" className="rounded-pill opacity-75">
                                                                            {sound.formatted_duration || '0:00'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="position-absolute top-0 end-0 p-2">
                                                                        <Badge bg="info" className="rounded-pill">
                                                                            Nouveau
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        variant="light"
                                                                        className="position-absolute top-50 start-50 translate-middle rounded-circle shadow-sm play-btn"
                                                                        style={{ width: '60px', height: '60px', opacity: 0.9 }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlay} className="text-primary" />
                                                                    </Button>
                                                                </div>
                                                                <Card.Body className="p-3">
                                                                    <h6 className="fw-bold mb-2 text-truncate">{sound.title}</h6>
                                                                    <p className="text-muted small mb-2">{sound.genre || 'Non défini'}</p>
                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                        <small className="text-muted">
                                                                            Publié le {new Date(sound.created_at).toLocaleDateString('fr-FR')}
                                                                        </small>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                        <div className="d-flex gap-3">
                                                                            <small className="text-primary">
                                                                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                                                {formatNumber(sound.plays_count || 0)}
                                                                            </small>
                                                                            <small className="text-danger">
                                                                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                                                {formatNumber(sound.likes_count || 0)}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <div className="fw-bold text-success">
                                                                            {sound.formatted_price || (sound.is_free ? 'Gratuit' : formatCurrency(sound.price || 0))}
                                                                        </div>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            as={Link}
                                                                            to={`/sound/${sound.id}`}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                            Voir
                                                                        </Button>
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="events">
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faCalendar} size="3x" className="text-muted mb-3" />
                                        <h5 className="text-muted">Aucun événement à venir</h5>
                                        <p className="text-muted">Cet artiste n'a pas d'événements prévus</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <h4 className="fw-bold mb-0">
                                                <FontAwesomeIcon icon={faCalendar} className="text-primary me-2" />
                                                Événements à venir
                                            </h4>
                                            <Badge bg="primary" className="rounded-pill">
                                                {upcomingEvents.length} événement{upcomingEvents.length > 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <Row className="g-4">
                                            {upcomingEvents.map((event) => (
                                                <Col lg={6} key={event.id}>
                                                    <Card className="event-card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                                        <Row className="g-0 h-100">
                                                            <Col md={4}>
                                                                <img
                                                                    src={event.poster_image || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=200&fit=crop`}
                                                                    alt={event.title}
                                                                    className="img-fluid h-100"
                                                                    style={{ objectFit: 'cover', borderRadius: '15px 0 0 15px' }}
                                                                />
                                                            </Col>
                                                            <Col md={8}>
                                                                <Card.Body className="h-100 d-flex flex-column p-4">
                                                                    <div>
                                                                        <h5 className="fw-bold mb-2">{event.title}</h5>
                                                                        <p className="text-muted mb-2">
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                                            {event.venue}, {event.city}
                                                                        </p>
                                                                        <p className="text-muted mb-2">
                                                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                                                            {new Date(event.event_date).toLocaleDateString('fr-FR')} à {event.start_time}
                                                                        </p>
                                                                        <div className="d-flex align-items-center gap-3 mb-3">
                                                                            <small className="text-primary">
                                                                                <FontAwesomeIcon icon={faUsers} className="me-1" />
                                                                                {event.current_attendees || 0}/{event.max_attendees || 'Illimité'}
                                                                            </small>
                                                                            <div className="fw-bold text-success">
                                                                                {event.is_free ? 'Gratuit' : formatCurrency(event.ticket_price || 0)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-auto">
                                                                        <Button
                                                                            as={Link}
                                                                            to={`/event/${event.id}`}
                                                                            variant="primary"
                                                                            className="w-100"
                                                                            style={{ borderRadius: '10px' }}
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} className="me-2" />
                                                                            Voir l'événement
                                                                        </Button>
                                                                    </div>
                                                                </Card.Body>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Container>
            </section>

            <style jsx>{`
                .sound-card {
                    transition: all 0.3s ease;
                    border-radius: 15px !important;
                }

                .sound-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2) !important;
                }

                .sound-card .play-btn {
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .sound-card:hover .play-btn {
                    opacity: 1 !important;
                }

                .event-card {
                    transition: all 0.3s ease;
                    border-radius: 15px !important;
                }

                .event-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15) !important;
                }

                .nav-pills .nav-link {
                    color: #6c757d;
                    background-color: transparent;
                    border: 1px solid #dee2e6;
                    transition: all 0.3s ease;
                }

                .nav-pills .nav-link:hover {
                    color: #667eea;
                    background-color: rgba(102, 126, 234, 0.1);
                    transform: translateY(-2px);
                }

                .nav-pills .nav-link.active {
                    color: white;
                    background-color: #667eea;
                    border-color: #667eea;
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }

                .bg-gradient-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                }

                .bg-gradient-info {
                    background: linear-gradient(135deg, #17a2b8 0%, #6610f2 100%) !important;
                }

                .achievement-item {
                    padding: 12px;
                    border-radius: 8px;
                    background: rgba(102, 126, 234, 0.05);
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }
            `}</style>
        </div>
    );
};

export default ArtistDetail;
