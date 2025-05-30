import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faMusic, faHeart, faShoppingCart, faSort } from '@fortawesome/free-solid-svg-icons';
import SoundCard from '../common/SoundCard';

const Catalog = () => {
    const [sounds] = useState([
        {
            id: 1,
            title: "Beat Afro Moderne",
            artist: "DJ Cameroun",
            price: 2500,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            category: "Afrobeat",
            likes: 45,
            plays: 230
        },
        {
            id: 2,
            title: "Makossa Fusion",
            artist: "UrbanSonic",
            price: 3500,
            cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
            category: "Traditionnel",
            likes: 67,
            plays: 450
        },
        {
            id: 3,
            title: "Coupé-Décalé Beat",
            artist: "BeatMaker237",
            price: 0,
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
            category: "Coupé-Décalé",
            likes: 89,
            plays: 620
        },
        {
            id: 4,
            title: "Ndombolo Modern",
            artist: "SoundCraft",
            price: 2000,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            category: "Ndombolo",
            likes: 34,
            plays: 180
        },
        {
            id: 5,
            title: "Bikutsi Électro",
            artist: "DJ Yaoundé",
            price: 3000,
            cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
            category: "Bikutsi",
            likes: 78,
            plays: 390
        },
        {
            id: 6,
            title: "Assiko Moderne",
            artist: "ProducteurCM",
            price: 1500,
            cover: "https://images.unsplash.com/photo-1515169067868-5387ec047c51?w=400&h=400&fit=crop",
            category: "Assiko",
            likes: 56,
            plays: 270
        },
        {
            id: 7,
            title: "Mangambeu Beats",
            artist: "SoundMaster",
            price: 4000,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            category: "Mangambeu",
            likes: 92,
            plays: 540
        },
        {
            id: 8,
            title: "Ambiance Douala",
            artist: "CityBeats",
            price: 0,
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
            category: "Ambiant",
            likes: 123,
            plays: 780
        }
    ]);

    const [filteredSounds, setFilteredSounds] = useState(sounds);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid'); // grid ou list

    const categories = [
        { value: 'all', label: 'Toutes les catégories' },
        { value: 'Afrobeat', label: 'Afrobeat' },
        { value: 'Traditionnel', label: 'Traditionnel' },
        { value: 'Coupé-Décalé', label: 'Coupé-Décalé' },
        { value: 'Ndombolo', label: 'Ndombolo' },
        { value: 'Bikutsi', label: 'Bikutsi' },
        { value: 'Assiko', label: 'Assiko' }
    ];

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

    // Fonction de filtrage et tri
    useEffect(() => {
        let filtered = sounds.filter(sound => {
            const matchesSearch = sound.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 sound.artist.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || sound.category === selectedCategory;

            let matchesPrice = true;
            if (selectedPrice === 'free') {
                matchesPrice = sound.price === 0;
            } else if (selectedPrice === '0-2000') {
                matchesPrice = sound.price >= 0 && sound.price <= 2000;
            } else if (selectedPrice === '2000-3000') {
                matchesPrice = sound.price > 2000 && sound.price <= 3000;
            } else if (selectedPrice === '3000+') {
                matchesPrice = sound.price > 3000;
            }

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Tri
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return b.id - a.id; // Simuler par ID
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                case 'popular':
                default:
                    return (b.plays || 0) - (a.plays || 0);
            }
        });

        setFilteredSounds(filtered);
    }, [searchTerm, selectedCategory, selectedPrice, sortBy, sounds]);

    // Gestion des actions
    const handleLike = (soundId, isLiked) => {
        console.log(`${isLiked ? 'Liked' : 'Unliked'} sound ${soundId}`);
        // Ici, vous pourriez mettre à jour l'état ou faire un appel API
    };

    const handleAddToCart = (sound) => {
        console.log('Added to cart:', sound);
        // Ici, vous ajouteriez le son au panier
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
                            <Form.Label className="fw-medium small">Rechercher</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Titre ou artiste..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ borderRadius: '12px 0 0 12px' }}
                                />
                                <InputGroup.Text style={{ borderRadius: '0 12px 12px 0', background: 'var(--primary-orange)', border: 'none', color: 'white' }}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                            </InputGroup>
                        </Col>

                        {/* Catégorie */}
                        <Col lg={2} md={3} sm={6}>
                            <Form.Label className="fw-medium small">Catégorie</Form.Label>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Prix */}
                        <Col lg={2} md={3} sm={6}>
                            <Form.Label className="fw-medium small">Prix</Form.Label>
                            <Form.Select
                                value={selectedPrice}
                                onChange={(e) => setSelectedPrice(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            >
                                {priceRanges.map(range => (
                                    <option key={range.value} value={range.value}>{range.label}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Tri */}
                        <Col lg={2} md={6} sm={6}>
                            <Form.Label className="fw-medium small">Trier par</Form.Label>
                            <Form.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Mode d'affichage */}
                        <Col lg={2} md={6} sm={6}>
                            <Form.Label className="fw-medium small">Affichage</Form.Label>
                            <div className="d-flex gap-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'warning' : 'outline-secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Grille
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'warning' : 'outline-secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Liste
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Résultats */}
            <section className="py-4">
                <Container>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold mb-0">
                            Sons disponibles ({filteredSounds.length})
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

                    {filteredSounds.length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon
                                icon={faMusic}
                                className="text-muted mb-3"
                                style={{ fontSize: '3rem' }}
                            />
                            <h5 className="text-muted">Aucun son trouvé</h5>
                            <p className="text-muted">Essayez de modifier vos critères de recherche</p>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {filteredSounds.map((sound) => (
                                <Col
                                    key={sound.id}
                                    lg={viewMode === 'grid' ? 3 : 12}
                                    md={viewMode === 'grid' ? 4 : 12}
                                    sm={viewMode === 'grid' ? 6 : 12}
                                >
                                    <SoundCard
                                        sound={sound}
                                        onLike={handleLike}
                                        onAddToCart={handleAddToCart}
                                        isCompact={viewMode === 'list'}
                                        showPreview={true}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>
            </section>
        </div>
    );
};

export default Catalog;
