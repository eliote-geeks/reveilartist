import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay,
    faVideo,
    faEye,
    faHeart,
    faShare,
    faPlus,
    faSearch,
    faFilter,
    faTrophy,
    faAward,
    faStar,
    faCrown,
    faMusic,
    faUser,
    faCalendarAlt,
    faClock,
    faFire,
    faThumbsUp,
    faComment,
    faDownload,
    faListUl,
    faTh
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ClipsVideos = () => {
    const [loading, setLoading] = useState(true);
    const [clips, setClips] = useState([]);
    const [filteredClips, setFilteredClips] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid'); // grid ou list
    const [activeTab, setActiveTab] = useState('all');

    const toast = useToast();
    const { user, token } = useAuth();

    // Données mockées avec système de récompenses
    const mockClips = [
        {
            id: 1,
            title: "Cameroun Mon Beau Pays",
            description: "Un clip magnifique célébrant la beauté du Cameroun avec des paysages époustouflants.",
            artist: "Bella Voix",
            artist_id: 1,
            artist_avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=100&h=100&fit=crop&crop=face",
            thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
            video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            duration: "3:45",
            views: 1250000,
            likes: 45600,
            comments: 2300,
            shares: 890,
            category: "Afrobeat",
            release_date: "2024-01-15T10:00:00",
            featured: true,
            tags: ["Cameroun", "Patriotique", "Afrobeat"]
        },
        {
            id: 2,
            title: "Flow de Minuit",
            description: "Un rap hardcore avec des paroles percutantes sur la vie urbaine de Douala.",
            artist: "MC Thunder",
            artist_id: 2,
            artist_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
            video_url: "#",
            duration: "4:12",
            views: 750000,
            likes: 32100,
            comments: 1450,
            shares: 520,
            category: "Rap",
            release_date: "2024-01-12T18:30:00",
            featured: false,
            tags: ["Rap", "Urbain", "Douala"]
        },
        {
            id: 3,
            title: "Makossa Revolution",
            description: "Une fusion moderne du makossa traditionnel avec des éléments contemporains.",
            artist: "Papa Makossa",
            artist_id: 3,
            artist_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            thumbnail: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=225&fit=crop",
            video_url: "#",
            duration: "5:20",
            views: 380000,
            likes: 18900,
            comments: 890,
            shares: 340,
            category: "Makossa",
            release_date: "2024-01-10T14:00:00",
            featured: false,
            tags: ["Makossa", "Traditionnel", "Fusion"]
        },
        {
            id: 4,
            title: "Gospel Victory",
            description: "Un message d'espoir et de foi avec une production musicale exceptionnelle.",
            artist: "Divine Voice",
            artist_id: 4,
            artist_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=225&fit=crop",
            video_url: "#",
            duration: "6:15",
            views: 120000,
            likes: 8500,
            comments: 450,
            shares: 280,
            category: "Gospel",
            release_date: "2024-01-08T09:00:00",
            featured: false,
            tags: ["Gospel", "Spirituel", "Inspiration"]
        },
        {
            id: 5,
            title: "Zouk Passion",
            description: "Une mélodie romantique avec des arrangements zouk sophistiqués.",
            artist: "Love Singer",
            artist_id: 5,
            artist_avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face",
            thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
            video_url: "#",
            duration: "4:33",
            views: 85000,
            likes: 5200,
            comments: 320,
            shares: 150,
            category: "Zouk",
            release_date: "2024-01-05T16:20:00",
            featured: false,
            tags: ["Zouk", "Romance", "Amour"]
        }
    ];

    const categories = ['Tous', 'Afrobeat', 'Rap', 'Makossa', 'Gospel', 'Zouk', 'Jazz', 'Pop'];

    useEffect(() => {
        loadClips();
    }, []);

    useEffect(() => {
        filterClips();
    }, [clips, searchQuery, selectedCategory, sortBy, activeTab]);

    const loadClips = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setClips(mockClips);
        } catch (error) {
            console.error('Erreur lors du chargement des clips:', error);
            if (toast) {
                toast.error('Erreur', 'Erreur de connexion au serveur');
            }
        } finally {
            setLoading(false);
        }
    };

    const filterClips = () => {
        let filtered = clips;

        // Filtrer par onglet
        switch (activeTab) {
            case 'featured':
                filtered = filtered.filter(clip => clip.featured);
                break;
            case 'trending':
                filtered = filtered.filter(clip => clip.views > 500000);
                break;
            case 'recent':
                filtered = filtered.filter(clip => {
                    const releaseDate = new Date(clip.release_date);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return releaseDate >= weekAgo;
                });
                break;
            default:
                break;
        }

        // Filtrer par recherche
        if (searchQuery) {
            filtered = filtered.filter(clip =>
                clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clip.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clip.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrer par catégorie
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(clip => clip.category === selectedCategory);
        }

        // Trier
        switch (sortBy) {
            case 'views':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'likes':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                break;
        }

        setFilteredClips(filtered);
    };

    const getRewardBadge = (views) => {
        if (views >= 1000000) {
            return { type: 'Diamant', icon: faCrown, color: 'primary', bgColor: 'linear-gradient(45deg, #b9f2ff, #00d4ff)' };
        } else if (views >= 500000) {
            return { type: 'Platine', icon: faTrophy, color: 'secondary', bgColor: 'linear-gradient(45deg, #e8e8e8, #c0c0c0)' };
        } else if (views >= 100000) {
            return { type: 'Or', icon: faAward, color: 'warning', bgColor: 'linear-gradient(45deg, #ffd700, #ffed4e)' };
        } else if (views >= 50000) {
            return { type: 'Argent', icon: faStar, color: 'light', bgColor: 'linear-gradient(45deg, #f8f9fa, #e9ecef)' };
        } else if (views >= 10000) {
            return { type: 'Bronze', icon: faTrophy, color: 'warning', bgColor: 'linear-gradient(45deg, #cd7f32, #b8860b)' };
        }
        return null;
    };

    const formatViews = (views) => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    const formatDuration = (duration) => {
        return duration;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light avoid-header-overlap d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <h5 className="text-muted">Chargement des clips vidéos...</h5>
                </div>
            </div>
        );
    }

    const ClipCard = ({ clip, index, isListView = false }) => {
        const reward = getRewardBadge(clip.views);

        if (isListView) {
            return (
                <AnimatedElement animation="slideInLeft" delay={100 + (index * 50)}>
                    <Card className="clip-card-list border-0 shadow-sm mb-3">
                        <Row className="g-0">
                            <Col md={4}>
                                <div className="clip-thumbnail-container">
                                    <img
                                        src={clip.thumbnail}
                                        alt={clip.title}
                                        className="clip-thumbnail"
                                    />
                                    <div className="play-overlay">
                                        <Button variant="light" className="play-btn-large">
                                            <FontAwesomeIcon icon={faPlay} />
                                        </Button>
                                    </div>
                                    <div className="duration-badge">{clip.duration}</div>
                                    {reward && (
                                        <div className="reward-badge-absolute">
                                            <Badge
                                                className="reward-badge"
                                                style={{ background: reward.bgColor }}
                                            >
                                                <FontAwesomeIcon icon={reward.icon} className="me-1" />
                                                {reward.type}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={8}>
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-start mb-2">
                                        <div className="flex-grow-1">
                                            <h5 className="card-title fw-bold mb-1">
                                                <Link to={`/clips/${clip.id}`} className="text-decoration-none text-dark">
                                                    {clip.title}
                                                </Link>
                                            </h5>
                                            <div className="d-flex align-items-center mb-2">
                                                <img
                                                    src={clip.artist_avatar}
                                                    alt={clip.artist}
                                                    className="rounded-circle me-2"
                                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                />
                                                <Link to={`/artists/${clip.artist_id}`} className="text-primary text-decoration-none fw-bold">
                                                    {clip.artist}
                                                </Link>
                                            </div>
                                        </div>
                                        <Badge bg="light" text="dark">{clip.category}</Badge>
                                    </div>

                                    <p className="text-muted small mb-3 line-clamp-2">
                                        {clip.description}
                                    </p>

                                    <div className="clip-stats mb-3">
                                        <Row className="g-3 small">
                                            <Col xs={6} md={3}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faEye} className="text-primary me-1" />
                                                    <span>{formatViews(clip.views)} vues</span>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faThumbsUp} className="text-success me-1" />
                                                    <span>{formatViews(clip.likes)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faComment} className="text-info me-1" />
                                                    <span>{formatViews(clip.comments)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-1" />
                                                    <span>{formatDate(clip.release_date)}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button as={Link} to={`/clips/${clip.id}`} variant="primary" size="sm">
                                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                                            Regarder
                                        </Button>
                                        <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faHeart} />
                                        </Button>
                                        <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faShare} />
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>
                </AnimatedElement>
            );
        }

        return (
            <AnimatedElement animation="slideInUp" delay={200 + (index * 100)}>
                <Card className="clip-card h-100 border-0 shadow-sm">
                    <div className="clip-thumbnail-container">
                        <img
                            src={clip.thumbnail}
                            alt={clip.title}
                            className="clip-thumbnail"
                        />
                        <div className="play-overlay">
                            <Button variant="light" className="play-btn">
                                <FontAwesomeIcon icon={faPlay} />
                            </Button>
                        </div>
                        <div className="duration-badge">{clip.duration}</div>
                        {clip.featured && (
                            <div className="featured-badge">
                                <Badge bg="danger">
                                    <FontAwesomeIcon icon={faFire} className="me-1" />
                                    Populaire
                                </Badge>
                            </div>
                        )}
                        {reward && (
                            <div className="reward-badge-absolute">
                                <Badge
                                    className="reward-badge"
                                    style={{ background: reward.bgColor }}
                                >
                                    <FontAwesomeIcon icon={reward.icon} className="me-1" />
                                    {reward.type}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <Card.Body className="p-3">
                        <h6 className="card-title fw-bold mb-2 line-clamp-2">
                            <Link to={`/clips/${clip.id}`} className="text-decoration-none text-dark">
                                {clip.title}
                            </Link>
                        </h6>

                        <div className="d-flex align-items-center mb-2">
                            <img
                                src={clip.artist_avatar}
                                alt={clip.artist}
                                className="rounded-circle me-2"
                                style={{ width: '25px', height: '25px', objectFit: 'cover' }}
                            />
                            <Link to={`/artists/${clip.artist_id}`} className="text-primary text-decoration-none small fw-bold">
                                {clip.artist}
                            </Link>
                        </div>

                        <div className="clip-stats mb-2">
                            <div className="d-flex justify-content-between align-items-center small text-muted">
                                <span>
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    {formatViews(clip.views)}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faThumbsUp} className="me-1" />
                                    {formatViews(clip.likes)}
                                </span>
                                <span>{formatDate(clip.release_date)}</span>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="light" text="dark" className="small">{clip.category}</Badge>
                            <div className="d-flex gap-1">
                                <Button variant="outline-primary" size="sm">
                                    <FontAwesomeIcon icon={faHeart} />
                                </Button>
                                <Button variant="outline-primary" size="sm">
                                    <FontAwesomeIcon icon={faShare} />
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </AnimatedElement>
        );
    };

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Hero Section */}
            <div className="hero-gradient-clips text-white">
                <Container>
                    <div className="py-5">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <div className="d-flex align-items-center mb-3">
                                        <FontAwesomeIcon icon={faVideo} size="2x" className="me-3 text-warning" />
                                        <h1 className="display-4 fw-bold mb-0">
                                            Clips Vidéos
                                        </h1>
                                    </div>
                                    <p className="lead mb-4">
                                        Découvrez les meilleurs clips musicaux camerounais et gagnez des récompenses ! 🎬✨
                                    </p>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faPlay} className="me-2 text-warning" />
                                            <span>{filteredClips.length} clips disponibles</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                            <span>Récompenses basées sur les vues</span>
                                        </div>
                                    </div>
                                </AnimatedElement>
                            </Col>
                            <Col lg={4}>
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <div className="text-end">
                                        {user && (user.role === 'artist' || user.role === 'producer') && (
                                            <Button
                                                as={Link}
                                                to="/add-clip"
                                                variant="warning"
                                                size="lg"
                                                className="text-dark fw-bold"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                Ajouter un clip
                                            </Button>
                                        )}
                                    </div>
                                </AnimatedElement>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Onglets et filtres */}
                <AnimatedElement animation="slideInUp" delay={300}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            {/* Onglets */}
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-3 nav-tabs-custom"
                            >
                                <Tab
                                    eventKey="all"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faVideo} className="me-2" />
                                            Tous les clips
                                        </span>
                                    }
                                />
                                <Tab
                                    eventKey="featured"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faFire} className="me-2" />
                                            Populaires
                                        </span>
                                    }
                                />
                                <Tab
                                    eventKey="trending"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                            Tendances
                                        </span>
                                    }
                                />
                                <Tab
                                    eventKey="recent"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                            Récents
                                        </span>
                                    }
                                />
                            </Tabs>

                            {/* Filtres et contrôles */}
                            <Row className="g-3 align-items-center">
                                <Col md={4}>
                                    <InputGroup>
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher des clips..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={2}>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">Toutes catégories</option>
                                        {categories.slice(1).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Form.Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="recent">Plus récents</option>
                                        <option value="views">Plus vus</option>
                                        <option value="likes">Plus aimés</option>
                                        <option value="title">Titre A-Z</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <FontAwesomeIcon icon={faTh} />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <FontAwesomeIcon icon={faListUl} />
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={2}>
                                    <div className="text-muted small">
                                        {filteredClips.length} clip{filteredClips.length > 1 ? 's' : ''}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </AnimatedElement>

                {/* Système de récompenses */}
                <AnimatedElement animation="slideInUp" delay={400}>
                    <Card className="border-0 shadow-sm mb-4 rewards-card">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                Système de Récompenses
                            </h5>
                            <Row className="g-3">
                                <Col lg={2} md={4} xs={6}>
                                    <div className="reward-item bronze">
                                        <FontAwesomeIcon icon={faTrophy} className="reward-icon" />
                                        <div className="fw-bold">Bronze</div>
                                        <small>10K+ vues</small>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} xs={6}>
                                    <div className="reward-item silver">
                                        <FontAwesomeIcon icon={faStar} className="reward-icon" />
                                        <div className="fw-bold">Argent</div>
                                        <small>50K+ vues</small>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} xs={6}>
                                    <div className="reward-item gold">
                                        <FontAwesomeIcon icon={faAward} className="reward-icon" />
                                        <div className="fw-bold">Or</div>
                                        <small>100K+ vues</small>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} xs={6}>
                                    <div className="reward-item platinum">
                                        <FontAwesomeIcon icon={faTrophy} className="reward-icon" />
                                        <div className="fw-bold">Platine</div>
                                        <small>500K+ vues</small>
                                    </div>
                                </Col>
                                <Col lg={2} md={4} xs={6}>
                                    <div className="reward-item diamond">
                                        <FontAwesomeIcon icon={faCrown} className="reward-icon" />
                                        <div className="fw-bold">Diamant</div>
                                        <small>1M+ vues</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </AnimatedElement>

                {/* Liste des clips */}
                {filteredClips.length === 0 ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faVideo} size="3x" className="text-muted mb-3" />
                        <h4 className="text-muted">Aucun clip trouvé</h4>
                        <p className="text-secondary">
                            {activeTab === 'featured' && "Aucun clip populaire pour le moment"}
                            {activeTab === 'trending' && "Aucun clip en tendance"}
                            {activeTab === 'recent' && "Aucun clip récent"}
                            {activeTab === 'all' && "Aucun clip ne correspond à votre recherche"}
                        </p>
                    </div>
                ) : (
                    viewMode === 'list' ? (
                        <div>
                            {filteredClips.map((clip, index) => (
                                <ClipCard key={clip.id} clip={clip} index={index} isListView={true} />
                            ))}
                        </div>
                    ) : (
                        <Row className="g-4">
                            {filteredClips.map((clip, index) => (
                                <Col key={clip.id} lg={4} md={6}>
                                    <ClipCard clip={clip} index={index} isListView={false} />
                                </Col>
                            ))}
                        </Row>
                    )
                )}
            </Container>

            <style jsx>{`
                .hero-gradient-clips {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                }

                .hero-gradient-clips::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E");
                }

                .clip-card, .clip-card-list {
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .clip-card:hover, .clip-card-list:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
                }

                .clip-thumbnail-container {
                    position: relative;
                    overflow: hidden;
                    aspect-ratio: 16/9;
                }

                .clip-thumbnail {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .clip-card:hover .clip-thumbnail,
                .clip-card-list:hover .clip-thumbnail {
                    transform: scale(1.05);
                }

                .play-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .clip-card:hover .play-overlay,
                .clip-card-list:hover .play-overlay {
                    opacity: 1;
                }

                .play-btn, .play-btn-large {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: rgba(255, 255, 255, 0.9);
                    color: #667eea;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .play-btn-large {
                    width: 70px;
                    height: 70px;
                    font-size: 1.5rem;
                }

                .duration-badge {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .featured-badge {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    z-index: 2;
                }

                .reward-badge-absolute {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 2;
                }

                .reward-badge {
                    color: white !important;
                    font-weight: bold;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .rewards-card {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                }

                .reward-item {
                    text-align: center;
                    padding: 15px;
                    border-radius: 12px;
                    background: white;
                    border: 2px solid;
                    transition: all 0.3s ease;
                }

                .reward-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .reward-item.bronze {
                    border-color: #cd7f32;
                    background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(184, 134, 11, 0.1));
                }

                .reward-item.silver {
                    border-color: #c0c0c0;
                    background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(169, 169, 169, 0.1));
                }

                .reward-item.gold {
                    border-color: #ffd700;
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.1));
                }

                .reward-item.platinum {
                    border-color: #e5e4e2;
                    background: linear-gradient(135deg, rgba(229, 228, 226, 0.1), rgba(192, 192, 192, 0.1));
                }

                .reward-item.diamond {
                    border-color: #00d4ff;
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(185, 242, 255, 0.1));
                }

                .reward-icon {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                }

                .bronze .reward-icon { color: #cd7f32; }
                .silver .reward-icon { color: #c0c0c0; }
                .gold .reward-icon { color: #ffd700; }
                .platinum .reward-icon { color: #e5e4e2; }
                .diamond .reward-icon { color: #00d4ff; }

                .nav-tabs-custom .nav-link {
                    border: none;
                    color: #6c757d;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .nav-tabs-custom .nav-link:hover {
                    color: #495057;
                    background: rgba(102, 126, 234, 0.1);
                }

                .nav-tabs-custom .nav-link.active {
                    color: #667eea;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                    border-bottom: 3px solid #667eea;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .clip-card:hover, .clip-card-list:hover {
                        transform: translateY(-2px);
                    }

                    .reward-item {
                        padding: 10px;
                        margin-bottom: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ClipsVideos;
