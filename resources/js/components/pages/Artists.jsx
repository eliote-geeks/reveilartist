import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faMusic, faHeart, faSearch, faFilter, faUsers, faPlay,
    faMapMarkerAlt, faCheckCircle, faStar, faCalendarAlt, faPlus,
    faSpinner, faUserPlus, faUserCheck, faHeadphones, faEye, faDownload
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Artists = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterCity, setFilterCity] = useState('');
    const [filterGenre, setFilterGenre] = useState('');
    const [artists, setArtists] = useState([]);
    const [filters, setFilters] = useState({ cities: [], genres: [] });
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [followingArtists, setFollowingArtists] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(new Set());

    const { token, user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadArtists();
    }, [currentPage, filterRole, filterCity, filterGenre, searchTerm]);

    const loadArtists = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 12,
                ...(filterRole !== 'all' && { role: filterRole }),
                ...(filterCity && { city: filterCity }),
                ...(filterGenre && { genre: filterGenre }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`/api/artists?${params}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                setArtists(data.artists.data);
                setPagination(data.artists);
                setFilters(data.filters);

                // Marquer les artistes suivis depuis l'API
                if (user && token) {
                    const followedIds = new Set();
                    data.artists.data.forEach(artist => {
                        if (artist.is_following) {
                            followedIds.add(artist.id);
                        }
                    });
                    setFollowingArtists(followedIds);
                }
            } else {
                toast.error('Erreur', 'Impossible de charger les artistes');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des artistes:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (artistId) => {
        if (!user || !token) {
            toast.error('Connexion requise', 'Vous devez être connecté pour suivre un artiste');
            return;
        }

        try {
            setActionLoading(prev => new Set([...prev, artistId]));

            const response = await fetch(`/api/artists/${artistId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Mettre à jour les données de l'artiste dans la liste
                setArtists(prev => prev.map(artist =>
                    artist.id === artistId
                        ? {
                            ...artist,
                            followers_count: data.followers_count,
                            is_following: data.is_following
                        }
                        : artist
                ));

                // Mettre à jour le set des artistes suivis
                setFollowingArtists(prev => {
                    const newSet = new Set(prev);
                    if (data.is_following) {
                        newSet.add(artistId);
                    } else {
                        newSet.delete(artistId);
                    }
                    return newSet;
                });

                toast.success('Succès', data.message);
            } else {
                toast.error('Erreur', data.message);
            }
        } catch (error) {
            console.error('Erreur lors du suivi:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setActionLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(artistId);
                return newSet;
            });
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getRoleDisplayName = (role) => {
        const roles = {
            'artist': 'Artiste',
            'producer': 'Producteur'
        };
        return roles[role] || role;
    };

    const getRoleBadgeVariant = (role) => {
        const variants = {
            'artist': 'primary',
            'producer': 'success'
        };
        return variants[role] || 'secondary';
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
            {/* Hero Section */}
            <section className="hero-gradient text-white py-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <div className="slide-in">
                                <div className="mb-3">
                                    <FontAwesomeIcon
                                        icon={faUsers}
                                        className="float-animation text-white"
                                        style={{ fontSize: '2.5rem', opacity: 0.9 }}
                                    />
                                </div>
                                <h1 className="mb-3 fw-bold text-white">
                                    Découvre les
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> artistes</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Rencontre les talents créatifs derrière la musique camerounaise
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Search & Filter */}
            <section className="py-4 bg-white border-bottom">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <Row className="g-3">
                                <Col md={4}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-0">
                                            <FontAwesomeIcon icon={faSearch} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher un artiste..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-start-0 bg-light"
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={2}>
                                    <Form.Select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="bg-light border-0"
                                    >
                                        <option value="all">Tous les rôles</option>
                                        <option value="artist">Artistes</option>
                                        <option value="producer">Producteurs</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filterCity}
                                        onChange={(e) => setFilterCity(e.target.value)}
                                        className="bg-light border-0"
                                    >
                                        <option value="">Toutes les villes</option>
                                        {filters.cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filterGenre}
                                        onChange={(e) => setFilterGenre(e.target.value)}
                                        className="bg-light border-0"
                                    >
                                        <option value="">Tous les genres</option>
                                        {filters.genres.map(genre => (
                                            <option key={genre} value={genre}>{genre}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Artists Grid */}
            <section className="py-5">
                <Container>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
                            <h5 className="text-muted">Chargement des artistes...</h5>
                        </div>
                    ) : artists.length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucun artiste trouvé</h5>
                            <p className="text-muted">Essayez de modifier vos critères de recherche</p>
                        </div>
                    ) : (
                        <>
                            {/* Header avec stats */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">
                                        {pagination?.total || 0} artiste{(pagination?.total || 0) > 1 ? 's' : ''} trouvé{(pagination?.total || 0) > 1 ? 's' : ''}
                                    </h4>
                                    <p className="text-muted mb-0">
                                        Page {pagination?.current_page || 1} sur {pagination?.last_page || 1}
                                    </p>
                                </div>
                            </div>

                            {/* Artists Cards */}
                            <Row className="g-4">
                                {artists.map((artist) => (
                                    <Col lg={4} md={6} key={artist.id}>
                                        <Card className="artist-card border-0 shadow-sm h-100" style={{ borderRadius: '20px !important', overflow: 'hidden' }}>
                                            {/* Cover Image */}
                                            <div
                                                className="artist-cover position-relative"
                                                style={{
                                                    height: '120px',
                                                    background: `linear-gradient(45deg, #667eea 0%, #764ba2 100%)`,
                                                    borderTopLeftRadius: '20px',
                                                    borderTopRightRadius: '20px'
                                                }}
                                            >
                                                <div className="position-absolute top-0 end-0 p-3">
                                                    {artist.verified && (
                                                        <Badge bg="warning" className="mb-2">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                            Vérifié
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <Card.Body className="pt-0 px-3 pb-3">
                                                {/* Profile Picture */}
                                                <div className="text-center" style={{ marginTop: '-40px' }}>
                                                    <img
                                                        src={artist.profile_photo_url || artist.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&color=7F9CF5&background=EBF4FF&size=80`}
                                                        alt={artist.name}
                                                        className="rounded-circle border border-white border-3"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                    />
                                                </div>

                                                {/* Artist Info */}
                                                <div className="text-center mt-3">
                                                    <h5 className="fw-bold mb-1">{artist.name}</h5>
                                                    <div className="d-flex justify-content-center gap-2 mb-2">
                                                        <Badge bg={getRoleBadgeVariant(artist.role)} className="rounded-pill">
                                                            {getRoleDisplayName(artist.role)}
                                                        </Badge>
                                                        {artist.genre && (
                                                            <Badge bg="light" text="dark" className="rounded-pill">
                                                                {artist.genre}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {artist.city && (
                                                        <p className="text-muted small mb-2">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                            {artist.city}
                                                        </p>
                                                    )}
                                                    {artist.bio && (
                                                        <p className="text-muted small mb-3" style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {artist.bio}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Stats */}
                                                <Row className="text-center mb-3">
                                                    <Col xs={6} md={6}>
                                                        <div className="stat-box p-2 rounded-3 bg-light mb-2">
                                                            <FontAwesomeIcon icon={faMusic} className="text-primary mb-1" />
                                                            <div className="fw-bold text-primary">{artist.sounds_count || 0}</div>
                                                            <small className="text-muted fw-medium">Sons</small>
                                                        </div>
                                                    </Col>
                                                    <Col xs={6} md={6}>
                                                        <div className="stat-box p-2 rounded-3 bg-light mb-2">
                                                            <FontAwesomeIcon icon={faUsers} className="text-success mb-1" />
                                                            <div className="fw-bold text-success">{formatNumber(artist.followers_count || 0)}</div>
                                                            <small className="text-muted fw-medium">Followers</small>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* Statistiques secondaires */}
                                                <div className="stats-row mb-3 p-2 rounded-3" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' }}>
                                                    <Row className="text-center">
                                                        <Col xs={4}>
                                                            <div className="small">
                                                                <FontAwesomeIcon icon={faHeadphones} className="text-warning me-1" />
                                                                <div className="fw-bold">{formatNumber(artist.total_plays || 0)}</div>
                                                                <small className="text-muted">Écoutes</small>
                                                            </div>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <div className="small">
                                                                <FontAwesomeIcon icon={faHeart} className="text-danger me-1" />
                                                                <div className="fw-bold">{formatNumber(artist.total_likes || 0)}</div>
                                                                <small className="text-muted">J'aime</small>
                                                            </div>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <div className="small">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="text-info me-1" />
                                                                <div className="fw-bold">{artist.events_count || 0}</div>
                                                                <small className="text-muted">Events</small>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>

                                                {/* Top Tracks Preview */}
                                                {artist.sounds && artist.sounds.length > 0 && (
                                                    <div className="mb-3">
                                                        <h6 className="fw-bold mb-2 small text-primary">
                                                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                                                            Top sons :
                                                        </h6>
                                                        {artist.sounds.slice(0, 2).map((sound) => (
                                                            <div key={sound.id} className="d-flex align-items-center mb-2 p-2 rounded-3 bg-light">
                                                                <img
                                                                    src={sound.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=30&h=30&fit=crop`}
                                                                    alt={sound.title}
                                                                    className="rounded me-2"
                                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <div className="small fw-medium text-truncate">{sound.title}</div>
                                                                    <div className="small text-muted">{sound.genre || 'Non défini'}</div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <small className="text-primary">
                                                                        <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                                        {formatNumber(sound.plays_count || 0)}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Badges de statut */}
                                                <div className="d-flex justify-content-center gap-1 mb-3">
                                                    {artist.verified && (
                                                        <Badge bg="success" className="rounded-pill">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                            Vérifié
                                                        </Badge>
                                                    )}
                                                    {artist.recent_activity && new Date(artist.recent_activity) > new Date(Date.now() - 7*24*60*60*1000) && (
                                                        <Badge bg="primary" className="rounded-pill">
                                                            Actif
                                                        </Badge>
                                                    )}
                                                    {(artist.total_plays || 0) > 10000 && (
                                                        <Badge bg="warning" className="rounded-pill">
                                                            Populaire
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="d-grid gap-2">
                                                    <Row className="g-2">
                                                        <Col xs={8}>
                                                            <Button
                                                                variant={artist.is_following ? "outline-primary" : "primary"}
                                                                size="sm"
                                                                className="w-100"
                                                                onClick={() => handleFollow(artist.id)}
                                                                disabled={actionLoading.has(artist.id) || !user}
                                                            >
                                                                {actionLoading.has(artist.id) ? (
                                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                                ) : artist.is_following ? (
                                                                    <>
                                                                        <FontAwesomeIcon icon={faUserCheck} className="me-1" />
                                                                        Suivi
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                                                                        Suivre
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <Button
                                                                as={Link}
                                                                to={`/artists/${artist.id}`}
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="w-100"
                                                                onClick={() => {
                                                                    console.log('Redirection vers:', `/artists/${artist.id}`, 'Artist ID:', artist.id);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="d-flex justify-content-center mt-5">
                                    <nav>
                                        <ul className="pagination">
                                            {/* Previous */}
                                            <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                                    disabled={pagination.current_page === 1}
                                                >
                                                    Précédent
                                                </button>
                                            </li>

                                            {/* Pages */}
                                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                                const page = Math.max(1, Math.min(pagination.current_page - 2 + i, pagination.last_page - 4 + i));
                                                return (
                                                    <li key={page} className={`page-item ${pagination.current_page === page ? 'active' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                );
                                            })}

                                            {/* Next */}
                                            <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                                    disabled={pagination.current_page === pagination.last_page}
                                                >
                                                    Suivant
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>

            <style jsx>{`
                .artist-card {
                    transition: all 0.3s ease;
                    border-radius: 20px !important;
                    overflow: hidden;
                }

                .artist-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2) !important;
                }

                .artist-card .card-img-top {
                    transition: all 0.3s ease;
                }

                .artist-card:hover .card-img-top {
                    transform: scale(1.05);
                }

                .stat-box {
                    transition: all 0.3s ease;
                    border: 1px solid rgba(102, 126, 234, 0.1);
                }

                .stat-box:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)) !important;
                }

                .stats-row {
                    border: 1px solid rgba(102, 126, 234, 0.2);
                }

                .hero-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .text-gradient-light {
                    background: linear-gradient(45deg, #ffffff, #f8f9ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .slide-in {
                    animation: slideInUp 0.6s ease-out;
                }

                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .pagination .page-link {
                    border: none;
                    border-radius: 50px !important;
                    margin: 0 5px;
                    color: #667eea;
                    transition: all 0.3s ease;
                }

                .pagination .page-link:hover {
                    background-color: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    transform: translateY(-2px);
                }

                .pagination .page-item.active .page-link {
                    background-color: #667eea;
                    border-color: #667eea;
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Artists;
