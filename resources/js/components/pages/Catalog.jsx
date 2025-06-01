import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Dropdown, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faMusic, faHeart, faShoppingCart, faSort, faRefresh, faPlay, faDownload, faEye, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import SoundDetailsModal from '../common/SoundDetailsModal';
import { usePurchasedSounds } from '../../hooks/usePurchasedSounds';

const Catalog = () => {
    const { token } = useAuth();
    const toast = useToast();
    const { addToCart } = useCart();
    const { purchasedSounds, checkIfPurchased } = usePurchasedSounds();
    const [sounds, setSounds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredSounds, setFilteredSounds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedSounds, setLikedSounds] = useState(new Set());
    const [downloadingTracks, setDownloadingTracks] = useState(new Map());
    const [showModal, setShowModal] = useState(false);
    const [selectedSound, setSelectedSound] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
        has_more: false
    });

    const priceRanges = [
        { value: 'all', label: 'Tous les prix' },
        { value: 'free', label: 'Gratuit' },
        { value: '0-2000', label: '0 - 2 000 FCFA' },
        { value: '2000-3000', label: '2 000 - 3 000 FCFA' },
        { value: '3000+', label: '3 000+ FCFA' }
    ];

    const sortOptions = [
        { value: 'popular', label: 'Plus populaires' },
        { value: 'recent', label: 'Plus récents' },
        { value: 'price-low', label: 'Prix croissant' },
        { value: 'price-high', label: 'Prix décroissant' },
        { value: 'likes', label: 'Plus aimés' }
    ];

    // Charger les catégories
    useEffect(() => {
        loadCategories();
    }, []);

    // Charger les sons
    useEffect(() => {
        loadSounds();
    }, [selectedCategory, selectedPrice, sortBy, searchTerm]);

    // Charger les statuts de likes
    useEffect(() => {
        if (token && sounds.length > 0) {
            loadLikesStatus();
        }
    }, [token, sounds]);

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();

            if (data.success) {
                const categoriesWithAll = [
                    { value: 'all', label: 'Toutes les catégories', name: 'Toutes les catégories' },
                    ...data.categories.map(cat => ({
                        value: cat.name,
                        label: cat.name,
                        name: cat.name,
                        id: cat.id
                    }))
                ];
                setCategories(categoriesWithAll);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        }
    };

    const loadSounds = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: pagination.per_page.toString(),
                sort: sortBy
            });

            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            if (selectedPrice !== 'all') {
                params.append('price', selectedPrice);
            }
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }

            const response = await fetch(`/api/sounds?${params}`);
            const data = await response.json();

            if (data.success) {
                setSounds(data.sounds);
                setFilteredSounds(data.sounds);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des sons:', error);
            setError('Erreur lors du chargement des sons. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const loadLikesStatus = async () => {
        if (!token) return;

        try {
            const soundIds = sounds.map(sound => sound.id);

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
            console.error('Erreur lors du chargement des likes:', error);
        }
    };

    const handleLike = async (soundId) => {
        if (!token) {
            toast.warning('Connexion requise', 'Veuillez vous connecter pour liker des sons');
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
                // Mettre à jour les likes localement
                const newLikedSounds = new Set(likedSounds);
                if (data.is_liked) {
                    newLikedSounds.add(soundId);
                } else {
                    newLikedSounds.delete(soundId);
                }
                setLikedSounds(newLikedSounds);

                // Mettre à jour le compteur de likes dans la liste des sons
                setSounds(prevSounds =>
                    prevSounds.map(sound =>
                        sound.id === soundId
                            ? { ...sound, likes: data.likes_count }
                            : sound
                    )
                );

                toast.success('Succès', data.is_liked ? 'Son ajouté aux favoris' : 'Son retiré des favoris');
            } else {
                toast.error('Erreur', data.message || 'Erreur lors du like');
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            toast.error('Erreur', 'Erreur lors du like. Veuillez réessayer.');
        }
    };

    const handleAddToCart = (sound) => {
        // Si le son est gratuit, proposer le téléchargement direct
        if (sound.is_free || sound.price === 0) {
            handleDownload(sound);
            return;
        }

        // Pour les sons payants, ajouter au panier
        const success = addToCart({
            id: sound.id,
            type: 'sound',
            title: sound.title,
            artist: sound.artist || sound.user?.name,
            price: sound.price,
            cover: sound.cover,
            duration: sound.duration,
            category: sound.category
        });

        if (success) {
            toast.success('Ajouté au panier', `"${sound.title}" a été ajouté à votre panier`);
        }
    };

    const handleDownload = async (sound) => {
        if (!token) {
            toast.error('Connexion requise', 'Veuillez vous connecter pour télécharger');
            return;
        }

        try {
            setDownloadingTracks(prev => new Map(prev.set(sound.id, { progress: 0, status: 'starting' })));

            // Utiliser l'endpoint correct qui incrémente automatiquement
            const response = await fetch(`/api/sounds/${sound.id}/download`, {
                method: 'POST', // Changé en POST pour incrémenter
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }

            const contentLength = response.headers.get('content-length');
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                if (contentLength) {
                    const progress = (receivedLength / contentLength) * 100;
                    setDownloadingTracks(prev => new Map(prev.set(sound.id, {
                        progress: Math.round(progress),
                        status: 'downloading'
                    })));
                }
            }

            // Créer le blob et télécharger
            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${sound.title}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Marquer comme téléchargé
            setDownloadingTracks(prev => new Map(prev.set(sound.id, {
                progress: 100,
                status: 'completed'
            })));

            toast.success('Téléchargement terminé', `"${sound.title}" a été téléchargé avec succès`);

            // Nettoyer après 3 secondes
            setTimeout(() => {
                setDownloadingTracks(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(sound.id);
                    return newMap;
                });
            }, 3000);

        } catch (error) {
            console.error('Erreur téléchargement:', error);
            toast.error('Erreur', 'Erreur lors du téléchargement');
            setDownloadingTracks(prev => {
                const newMap = new Map(prev);
                newMap.delete(sound.id);
                return newMap;
            });
        }
    };

    const handleViewDetails = (sound) => {
        setSelectedSound(sound);
        setShowModal(true);
    };

    const handleRefresh = () => {
        loadSounds(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePriceChange = (price) => {
        setSelectedPrice(price);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
    };

    const loadMoreSounds = () => {
        if (pagination.has_more) {
            loadSounds(pagination.current_page + 1);
        }
    };

    return (
        <div className="bg-light min-vh-100 avoid-header-overlap">
            {/* Hero Section */}
            <section className="hero-gradient text-white py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <div className="slide-in">
                                <div className="mb-3">
                                    <FontAwesomeIcon
                                        icon={faMusic}
                                        className="float-animation text-white"
                                        style={{ fontSize: '2.5rem', opacity: 0.9 }}
                                    />
                                </div>
                                <h1 className="mb-3 fw-bold text-white">
                                    Catalogue
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> Musical</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Découvrez des sons uniques créés par des artistes camerounais
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Filtres et recherche */}
            <section className="py-4 bg-white border-bottom">
                <Container>
                    <Row className="g-3 align-items-end">
                        {/* Recherche */}
                        <Col lg={4} md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium text-muted">Rechercher</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                        placeholder="Titre, artiste, genre..."
                                    value={searchTerm}
                                        onChange={handleSearchChange}
                                        style={{ borderRadius: '8px 0 0 8px' }}
                                    />
                                    <Button
                                        variant="primary"
                                        style={{ borderRadius: '0 8px 8px 0' }}
                                        disabled={loading}
                                    >
                                    <FontAwesomeIcon icon={faSearch} />
                                    </Button>
                            </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Catégorie */}
                        <Col lg={2} md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium text-muted">Catégorie</Form.Label>
                            <Form.Select
                                value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                ))}
                            </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Prix */}
                        <Col lg={2} md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium text-muted">Prix</Form.Label>
                            <Form.Select
                                value={selectedPrice}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                            >
                                {priceRanges.map(range => (
                                        <option key={range.value} value={range.value}>
                                            {range.label}
                                        </option>
                                ))}
                            </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Tri */}
                        <Col lg={2} md={6} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-medium text-muted">Trier par</Form.Label>
                            <Form.Select
                                value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    style={{ borderRadius: '8px' }}
                            >
                                {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                ))}
                            </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Actualiser */}
                        <Col lg={2} md={6} sm={6}>
                                <Button
                                variant="outline-secondary"
                                className="w-100"
                                onClick={handleRefresh}
                                disabled={loading}
                                    style={{ borderRadius: '8px' }}
                                >
                                <FontAwesomeIcon
                                    icon={faRefresh}
                                    spin={loading}
                                    className="me-2"
                                />
                                Actualiser
                                </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Liste des sons */}
            <section className="py-4">
                <Container>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold mb-0">
                            Sons disponibles ({pagination.total})
                        </h3>

                        <div className="d-flex gap-2">
                            {selectedCategory !== 'all' && (
                                <Badge bg="primary" className="d-flex align-items-center gap-1">
                                    {categories.find(c => c.value === selectedCategory)?.label}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-white"
                                        onClick={() => setSelectedCategory('all')}
                                        style={{ fontSize: '12px' }}
                                    >
                                        ×
                                    </Button>
                                </Badge>
                            )}
                            {selectedPrice !== 'all' && (
                                <Badge bg="info" className="d-flex align-items-center gap-1">
                                    {priceRanges.find(p => p.value === selectedPrice)?.label}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-white"
                                        onClick={() => setSelectedPrice('all')}
                                        style={{ fontSize: '12px' }}
                                    >
                                        ×
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    </div>

                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                            {error}
                            <Button
                                variant="link"
                                className="p-0 ms-2"
                                onClick={handleRefresh}
                            >
                                Réessayer
                            </Button>
                        </Alert>
                    )}

                    {loading && filteredSounds.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <h5 className="text-muted">Chargement des sons...</h5>
                        </div>
                    ) : filteredSounds.length === 0 && !loading ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon
                                icon={faMusic}
                                className="text-muted mb-3"
                                style={{ fontSize: '3rem' }}
                            />
                            <h5 className="text-muted">Aucun son trouvé</h5>
                            <p className="text-muted">Essayez de modifier vos critères de recherche</p>
                            <Button variant="primary" onClick={handleRefresh}>
                                Recharger le catalogue
                            </Button>
                        </div>
                    ) : (
                        <>
                        <Row className="g-4">
                            {filteredSounds.map((sound) => (
                                <Col
                                    key={sound.id}
                                    lg={viewMode === 'grid' ? 3 : 12}
                                    md={viewMode === 'grid' ? 4 : 12}
                                    sm={viewMode === 'grid' ? 6 : 12}
                                >
                                    <Card className="h-100 shadow-sm border-0 sound-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                        {/* Cover Image */}
                                        <div className="position-relative">
                                            <img
                                                src={sound.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop`}
                                                alt={sound.title}
                                                className="card-img-top"
                                                style={{
                                                    height: viewMode === 'grid' ? '200px' : '120px',
                                                    objectFit: 'cover'
                                                }}
                                            />

                                            {/* Prix ou Gratuit Badge */}
                                            <div className="position-absolute top-0 start-0 m-2">
                                                {sound.is_free || sound.price === 0 ? (
                                                    <Badge bg="success" className="rounded-pill shadow-sm">
                                                        Gratuit
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="primary" className="rounded-pill shadow-sm">
                                                        {new Intl.NumberFormat('fr-FR').format(sound.price)} XAF
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Overlay avec bouton play */}
                                            <div className="sound-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="rounded-circle shadow-lg"
                                                    style={{ width: '60px', height: '60px' }}
                                                    onClick={() => handleViewDetails(sound)}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} />
                                                </Button>
                                            </div>
                                        </div>

                                        <Card.Body className="p-3">
                                            {/* Titre avec lien vers détails */}
                                            <Card.Title className="mb-2">
                                                <Link
                                                    to={`/sounds/${sound.id}`}
                                                    className="text-decoration-none text-dark fw-bold"
                                                    style={{ fontSize: '16px' }}
                                                >
                                                    {sound.title}
                                                </Link>
                                            </Card.Title>

                                            {/* Artiste avec lien vers profil */}
                                            <Card.Text className="text-muted mb-2 small">
                                                par <Link
                                                    to={`/artists/${sound.artistId || sound.user_id}`}
                                                    className="text-decoration-none text-primary fw-medium"
                                                >
                                                    {sound.artist}
                                                </Link>
                                            </Card.Text>

                                            {/* Catégorie et genre */}
                                            <div className="mb-3">
                                                {sound.category && (
                                                    <Badge bg="light" text="dark" className="me-1 small">
                                                        {sound.category}
                                                    </Badge>
                                                )}
                                                {sound.genre && (
                                                    <Badge bg="outline-secondary" className="small">
                                                        {sound.genre}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="d-flex justify-content-between align-items-center mb-3 small text-muted">
                                                <span className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faHeart} className="me-1 text-danger" />
                                                    {sound.likes || 0}
                                                </span>
                                                <span className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faPlay} className="me-1 text-primary" />
                                                    {sound.plays || 0}
                                                </span>
                                                <span className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faDownload} className="me-1 text-success" />
                                                    {sound.downloads || 0}
                                                </span>
                                            </div>

                                            {/* Actions améliorées */}
                                            <div className="d-flex gap-2 align-items-center">
                                                {/* Bouton Like */}
                                                <Button
                                                    variant={likedSounds.has(sound.id) ? "danger" : "outline-danger"}
                                                    size="sm"
                                                    className="action-btn rounded-circle"
                                                    style={{ width: '38px', height: '38px', padding: 0 }}
                                                    onClick={() => handleLike(sound.id)}
                                                    disabled={!token}
                                                    title="Aimer ce son"
                                                >
                                                    <FontAwesomeIcon icon={faHeart} />
                                                </Button>

                                                {/* Bouton Voir détails */}
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="action-btn rounded-circle"
                                                    style={{ width: '38px', height: '38px', padding: 0 }}
                                                    onClick={() => handleViewDetails(sound)}
                                                    title="Voir les détails"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>

                                                {/* Bouton principal selon le statut */}
                                                {sound.is_free || sound.price === 0 ? (
                                                    // Son gratuit : bouton télécharger
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="flex-grow-1"
                                                        onClick={() => handleDownload(sound)}
                                                        disabled={downloadingTracks.has(sound.id)}
                                                        style={{ borderRadius: '20px' }}
                                                    >
                                                        {downloadingTracks.has(sound.id) ? (
                                                            <div className="w-100">
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <span className="small">Téléchargement...</span>
                                                                    <span className="small">{downloadingTracks.get(sound.id)?.progress || 0}%</span>
                                                                </div>
                                                                <ProgressBar
                                                                    now={downloadingTracks.get(sound.id)?.progress || 0}
                                                                    size="sm"
                                                                    style={{ height: '4px' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                                Télécharger
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : checkIfPurchased(sound.id) ? (
                                                    // Son acheté : bouton télécharger
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="flex-grow-1"
                                                        onClick={() => handleDownload(sound)}
                                                        disabled={downloadingTracks.has(sound.id)}
                                                        style={{ borderRadius: '20px' }}
                                                    >
                                                        {downloadingTracks.has(sound.id) ? (
                                                            <div className="w-100">
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <span className="small">Téléchargement...</span>
                                                                    <span className="small">{downloadingTracks.get(sound.id)?.progress || 0}%</span>
                                                                </div>
                                                                <ProgressBar
                                                                    now={downloadingTracks.get(sound.id)?.progress || 0}
                                                                    size="sm"
                                                                    style={{ height: '4px' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                                Télécharger
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    // Son payant : bouton ajouter au panier
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="flex-grow-1"
                                                        onClick={() => handleAddToCart(sound)}
                                                        style={{ borderRadius: '20px' }}
                                                    >
                                                        <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                                        Ajouter au panier
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                            {/* Pagination */}
                            {pagination.has_more && (
                                <div className="text-center mt-5">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={loadMoreSounds}
                                        disabled={loading}
                                        style={{ borderRadius: '12px', padding: '12px 30px' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Chargement...
                                            </>
                                        ) : (
                                            <>
                                                Charger plus de sons
                                                <Badge bg="light" text="dark" className="ms-2">
                                                    {pagination.current_page} / {pagination.last_page}
                                                </Badge>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>

            {/* Modal de détails du son */}
            {selectedSound && (
                <SoundDetailsModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    sound={selectedSound}
                    onLike={handleLike}
                    onAddToCart={handleAddToCart}
                    likedSounds={likedSounds}
                    hasPurchased={checkIfPurchased(selectedSound.id)}
                />
            )}

            <style jsx>{`
                .sound-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .sound-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2) !important;
                }

                .sound-overlay {
                    background: rgba(0, 0, 0, 0.6);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .sound-card:hover .sound-overlay {
                    opacity: 1;
                }

                .sound-overlay button {
                    transform: scale(0.8);
                    transition: all 0.3s ease;
                }

                .sound-card:hover .sound-overlay button {
                    transform: scale(1);
                }

                .action-btn {
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    transform: scale(1.1);
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

                .avoid-header-overlap {
                    padding-top: 80px;
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
            `}</style>
        </div>
    );
};

export default Catalog;
