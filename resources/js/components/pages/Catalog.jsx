import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faMusic, faHeart, faShoppingCart, faSort, faRefresh } from '@fortawesome/free-solid-svg-icons';
import SoundCard from '../common/SoundCard';
import { useAuth } from '../../context/AuthContext';

const Catalog = () => {
    const { token } = useAuth();
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
            alert('Veuillez vous connecter pour liker des sons');
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
            } else {
                alert(data.message || 'Erreur lors du like');
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            alert('Erreur lors du like. Veuillez réessayer.');
        }
    };

    const handleAddToCart = (sound) => {
        // TODO: Implémenter l'ajout au panier
        console.log('Ajout au panier:', sound);
        alert(`"${sound.title}" ajouté au panier !`);
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
        <div className="bg-light min-vh-100">
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
                                        <SoundCard
                                            sound={{
                                                ...sound,
                                                isLiked: likedSounds.has(sound.id)
                                            }}
                                            onLike={handleLike}
                                            onAddToCart={handleAddToCart}
                                            isCompact={viewMode === 'list'}
                                            showPreview={true}
                                        />
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
        </div>
    );
};

export default Catalog;
