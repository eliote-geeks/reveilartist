import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMusic,
    faPlay,
    faPause,
    faHeart,
    faDownload,
    faShoppingCart,
    faArrowLeft,
    faSearch,
    faTh,
    faList,
    faFilter,
    faEye,
    faHeadphones,
    faClock,
    faFire,
    faStopwatch,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import LoadingScreen from '../common/LoadingScreen';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const CategoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [sounds, setSounds] = useState([]);
    const [filteredSounds, setFilteredSounds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [likedSounds, setLikedSounds] = useState(new Set());

    const { addToCart } = useCart();
    const toast = useToast();
    const { token, user } = useAuth();

    const sortOptions = [
        { value: 'recent', label: 'Plus récents', icon: faStopwatch },
        { value: 'popular', label: 'Plus populaires', icon: faFire },
        { value: 'downloads', label: 'Plus téléchargés', icon: faDownload },
        { value: 'name', label: 'Alphabétique', icon: faMusic },
        { value: 'price_asc', label: 'Prix croissant', icon: faStar },
        { value: 'price_desc', label: 'Prix décroissant', icon: faStar }
    ];

    useEffect(() => {
        loadCategoryData();
    }, [id]);

    useEffect(() => {
        if (token) {
            loadLikesStatus();
        }
    }, [sounds, token]);

    useEffect(() => {
        filterAndSortSounds();
    }, [sounds, searchTerm, sortBy]);

    const loadCategoryData = async () => {
        try {
            setLoading(true);

            // Charger les informations de la catégorie
            const categoryResponse = await fetch(`/api/categories/${id}`);
            const categoryData = await categoryResponse.json();

            if (!categoryData.success) {
                toast.error('Erreur', 'Catégorie non trouvée');
                navigate('/categories');
                return;
            }

            setCategory(categoryData.category);

            // Charger les sons de cette catégorie
            const soundsResponse = await fetch(`/api/sounds?category=${id}&limit=50`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            const soundsData = await soundsResponse.json();

            if (soundsData.success) {
                setSounds(soundsData.sounds || []);
            }

        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            toast.error('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const loadLikesStatus = async () => {
        if (!sounds.length) return;

        try {
            const response = await fetch('/api/sounds/likes/status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sound_ids: sounds.map(s => s.id) })
            });

            if (response.ok) {
                const data = await response.json();
                setLikedSounds(new Set(data.likes || []));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des likes:', error);
        }
    };

    const filterAndSortSounds = () => {
        let filtered = [...sounds];

        // Filtrer par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(sound =>
                sound.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sound.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sound.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Trier
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.plays || 0) - (a.plays || 0);
                case 'downloads':
                    return (b.downloads || 0) - (a.downloads || 0);
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'price_asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price_desc':
                    return (b.price || 0) - (a.price || 0);
                case 'recent':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        setFilteredSounds(filtered);
    };

    const handleLike = async (soundId) => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour aimer un son');
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
                setLikedSounds(prev => {
                    const newSet = new Set(prev);
                    if (data.is_liked) {
                        newSet.add(soundId);
                    } else {
                        newSet.delete(soundId);
                    }
                    return newSet;
                });

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

    const handleAddToCart = (sound) => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour acheter');
            return;
        }

        addToCart({
            id: sound.id,
            type: 'sound',
            title: sound.title,
            artist: sound.artist,
            price: sound.price || 0,
            cover: sound.cover_image,
            duration: sound.duration,
            quantity: 1
        });

        toast.success('Ajouté au panier', `"${sound.title}" a été ajouté au panier`);
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

    if (loading) {
        return <LoadingScreen />;
    }

    if (!category) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center avoid-header-overlap">
                <div className="text-center">
                    <h3>Catégorie non trouvée</h3>
                    <Button as={Link} to="/categories" variant="primary">
                        Retour aux catégories
                    </Button>
                </div>
            </div>
        );
    }

    const SoundCard = ({ sound, index }) => (
        <AnimatedElement animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"} delay={100 + (index * 50)}>
            <Card className="sound-card-modern h-100 border-0 shadow-sm">
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={sound.cover_image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop`}
                        className="sound-image"
                        style={{ height: '180px', objectFit: 'cover' }}
                    />

                    {/* Play Overlay */}
                    <div className="sound-play-overlay">
                        <Button
                            className="play-button-modern"
                            onClick={() => {
                                setCurrentlyPlaying(sound);
                                setIsPlaying(!isPlaying || currentlyPlaying?.id !== sound.id);
                            }}
                        >
                            <FontAwesomeIcon
                                icon={currentlyPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                            />
                        </Button>
                    </div>

                    {/* Badges */}
                    {sound.is_free && (
                        <Badge bg="success" className="position-absolute top-0 start-0 m-3 badge-modern">
                            Gratuit
                        </Badge>
                    )}
                    {sound.is_featured && (
                        <Badge bg="warning" className="position-absolute top-0 end-0 m-3 badge-modern">
                            <FontAwesomeIcon icon={faFire} className="me-1" />
                            Vedette
                        </Badge>
                    )}
                </div>

                <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                            <Card.Title className="h6 mb-1 text-truncate">{sound.title}</Card.Title>
                            <Card.Text className="small text-muted mb-2">par {sound.artist}</Card.Text>
                        </div>
                        <Button
                            variant={likedSounds.has(sound.id) ? "danger" : "outline-danger"}
                            size="sm"
                            className="btn-heart"
                            onClick={() => handleLike(sound.id)}
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </Button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <small className="text-muted">
                                <FontAwesomeIcon icon={faPlay} className="me-1 text-primary" />
                                {formatNumber(sound.plays || 0)}
                            </small>
                            <small className="text-muted">
                                <FontAwesomeIcon icon={faDownload} className="me-1 text-success" />
                                {formatNumber(sound.downloads || 0)}
                            </small>
                        </div>
                        <small className="text-muted">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {sound.duration || '0:00'}
                        </small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {sound.is_free ? (
                                <span className="fw-bold text-success">Gratuit</span>
                            ) : (
                                <span className="fw-bold text-primary">
                                    {formatCurrency(sound.price || 0)}
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-1">
                            <Button
                                as={Link}
                                to={`/sound/${sound.id}`}
                                variant="outline-primary"
                                size="sm"
                                className="btn-action"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="btn-action"
                                onClick={() => handleAddToCart(sound)}
                            >
                                <FontAwesomeIcon icon={faShoppingCart} />
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Hero Section */}
            <section className="category-hero" style={{
                background: `linear-gradient(135deg, ${category.color || '#8b5cf6'}15, ${category.color || '#8b5cf6'}25)`,
                borderBottom: `3px solid ${category.color || '#8b5cf6'}30`
            }}>
                <Container>
                    <div className="py-5">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <div className="d-flex align-items-center mb-3">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => navigate('/categories')}
                                            className="me-3"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </Button>
                                        <Badge
                                            style={{ backgroundColor: category.color || '#8b5cf6' }}
                                            className="badge-modern"
                                        >
                                            Catégorie
                                        </Badge>
                                    </div>
                                    <h1 className="display-5 fw-bold mb-3" style={{ color: category.color || '#8b5cf6' }}>
                                        {category.name}
                                    </h1>
                                    <p className="lead text-muted mb-4">
                                        {category.description || 'Découvrez les sons de cette catégorie'}
                                    </p>
                                    <div className="d-flex gap-4 flex-wrap">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                            <span className="fw-medium">{sounds.length} sons</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faHeadphones} className="me-2 text-success" />
                                            <span className="fw-medium">
                                                {formatNumber(sounds.reduce((total, sound) => total + (sound.plays || 0), 0))} écoutes
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faDownload} className="me-2 text-warning" />
                                            <span className="fw-medium">
                                                {formatNumber(sounds.reduce((total, sound) => total + (sound.downloads || 0), 0))} téléchargements
                                            </span>
                                        </div>
                                    </div>
                                </AnimatedElement>
                            </Col>
                            <Col lg={4}>
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <div className="text-end">
                                        <div className="category-icon-large mb-3">
                                            <FontAwesomeIcon
                                                icon={faMusic}
                                                style={{
                                                    fontSize: '4rem',
                                                    color: category.color || '#8b5cf6',
                                                    opacity: 0.3
                                                }}
                                            />
                                        </div>
                                    </div>
                                </AnimatedElement>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            {/* Filters Section */}
            <section className="py-4 bg-white shadow-sm">
                <Container>
                    <Row className="g-3 align-items-center">
                        <Col lg={4} md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher dans cette catégorie..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={3} md={4}>
                            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col lg={3} md={6}>
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
                                    <FontAwesomeIcon icon={faList} />
                                </Button>
                            </div>
                        </Col>
                        <Col lg={2} md={6}>
                            <small className="text-muted">
                                {filteredSounds.length} résultat{filteredSounds.length > 1 ? 's' : ''}
                            </small>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Sounds Section */}
            <section className="py-4">
                <Container>
                    {filteredSounds.length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                            <h4 className="text-muted">Aucun son trouvé</h4>
                            <p className="text-secondary">
                                {searchTerm
                                    ? 'Essayez avec des mots-clés différents'
                                    : 'Cette catégorie ne contient pas encore de sons'
                                }
                            </p>
                            {searchTerm && (
                                <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                                    Effacer la recherche
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Row className="g-4">
                            {filteredSounds.map((sound, index) => (
                                <Col
                                    key={sound.id}
                                    lg={viewMode === 'grid' ? 3 : 12}
                                    md={viewMode === 'grid' ? 4 : 12}
                                    sm={viewMode === 'grid' ? 6 : 12}
                                >
                                    <SoundCard sound={sound} index={index} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </section>

            <style jsx>{`
                .category-hero {
                    position: relative;
                    overflow: hidden;
                }

                .sound-card-modern {
                    transition: all 0.3s ease;
                    border-radius: 15px;
                    overflow: hidden;
                }

                .sound-card-modern:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
                }

                .sound-image {
                    transition: transform 0.3s ease;
                }

                .sound-card-modern:hover .sound-image {
                    transform: scale(1.05);
                }

                .sound-play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .sound-card-modern:hover .sound-play-overlay {
                    opacity: 1;
                }

                .play-button-modern {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.9);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .play-button-modern:hover {
                    background: rgba(139, 92, 246, 1);
                    transform: scale(1.1);
                    box-shadow: 0 0 25px rgba(139, 92, 246, 0.5);
                }

                .badge-modern {
                    font-weight: 500;
                    font-size: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                }

                .btn-heart {
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: all 0.3s ease;
                }

                .btn-heart:hover {
                    transform: scale(1.1);
                }

                .btn-action {
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: all 0.3s ease;
                }

                .btn-action:hover {
                    transform: scale(1.1);
                }

                @media (max-width: 768px) {
                    .category-hero {
                        padding: 2rem 0 !important;
                    }

                    .display-5 {
                        font-size: 2rem !important;
                    }

                    .sound-card-modern:hover {
                        transform: translateY(-2px);
                    }
                }
            `}</style>
        </div>
    );
};

export default CategoryDetail;
