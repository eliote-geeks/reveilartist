import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeadphones,
    faPlay,
    faMusic,
    faHeart,
    faMicrophone,
    faDrum,
    faHeartbeat,
    faHandsPraying,
    faBolt,
    faUsers,
    faSmile,
    faFire,
    faCloud,
    faLeaf
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Map des icônes FontAwesome
    const iconMap = {
        'faHeart': faHeart,
        'faMicrophone': faMicrophone,
        'faMusic': faMusic,
        'faDrum': faDrum,
        'faHeartbeat': faHeartbeat,
        'faHandsPraying': faHandsPraying,
        'faBolt': faBolt,
        'faUsers': faUsers,
        'faSmile': faSmile,
        'faFire': faFire,
        'faCloud': faCloud,
        'faLeaf': faLeaf,
    };

    // Images par défaut pour les catégories
    const defaultImages = [
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=250&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=250&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=250&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&crop=center"
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/categories?active=1');

            if (response.data.success) {
                // Ajouter des données d'affichage aux catégories
                const categoriesWithDisplay = response.data.categories.map((category, index) => ({
                    ...category,
                    image: category.image_url || defaultImages[index % defaultImages.length],
                    soundCount: category.sounds_count || 0, // Utiliser les vraies données de la BD
                    trending: category.sounds_count > 50 // Catégories avec plus de 50 sons sont tendance
                }));

                setCategories(categoriesWithDisplay);
            } else {
                setError('Erreur lors du chargement des catégories');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des catégories:', err);
            setError('Impossible de charger les catégories');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="text-muted">Chargement des catégories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Alert variant="danger" className="text-center">
                                <FontAwesomeIcon icon={faMusic} className="mb-2" size="2x" />
                                <h5>Oops !</h5>
                                <p>{error}</p>
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

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
                                    Explore par
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> catégories</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Découvre nos collections organisées par styles musicaux
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Grid */}
            <section className="py-4">
                <Container>
                    <Row className="g-3">
                        {categories.map(category => (
                            <Col key={category.id} lg={4} md={6} className="mb-3">
                                <Card
                                    as={Link}
                                    to={`/category/${category.id}`}
                                    className="category-card border-0 h-100 text-decoration-none"
                                    style={{ borderRadius: '16px' }}
                                >
                                    <div className="position-relative">
                                        <Card.Img
                                            variant="top"
                                            src={category.image}
                                            style={{ height: '180px', objectFit: 'cover' }}
                                        />

                                        {/* Overlay avec dégradé */}
                                        <div
                                            className="position-absolute top-0 start-0 w-100 h-100"
                                            style={{
                                                background: `linear-gradient(45deg, ${category.color}99, ${category.color}66)`,
                                                borderRadius: '16px 16px 0 0'
                                            }}
                                        ></div>

                                        {/* Badges */}
                                        <div className="position-absolute top-0 end-0 m-3">
                                            {category.trending && (
                                                <Badge
                                                    bg="warning"
                                                    className="me-2"
                                                    style={{ borderRadius: '8px', fontSize: '11px' }}
                                                >
                                                    Tendance
                                                </Badge>
                                            )}
                                            <Badge
                                                bg="light"
                                                className="text-dark"
                                                style={{ borderRadius: '8px', fontSize: '11px' }}
                                            >
                                                {category.soundCount} sons
                                            </Badge>
                                        </div>

                                        {/* Play Button */}
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow category-play-btn"
                                                style={{ width: '50px', height: '50px', opacity: 0, transition: 'all 0.2s ease' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={iconMap[category.icon] || faMusic}
                                                    style={{ color: category.color, fontSize: '18px' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Title Overlay */}
                                        <div className="position-absolute bottom-0 start-0 w-100 p-3">
                                            <h5 className="fw-bold text-white mb-1" style={{ fontSize: '18px' }}>
                                                {category.name}
                                            </h5>
                                            <p className="text-white mb-0 small opacity-90">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon
                                                    icon={faHeadphones}
                                                    className="me-2"
                                                    style={{ color: category.color, fontSize: '14px' }}
                                                />
                                                <span className="fw-medium text-dark" style={{ fontSize: '14px' }}>
                                                    Explorer
                                                </span>
                                            </div>
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    backgroundColor: `${category.color}20`,
                                                    color: category.color
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={iconMap[category.icon] || faMusic}
                                                    style={{ fontSize: '10px' }}
                                                />
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="py-4 bg-primary">
                <Container>
                    <Row className="text-center">
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation">
                                <div className="fs-2 fw-bold mb-1 text-white">{categories.length}</div>
                                <p className="small mb-0 opacity-90 text-white">Catégories Musicales</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '0.5s' }}>
                                <div className="fs-2 fw-bold mb-1 text-white">
                                    {categories.reduce((total, cat) => total + cat.soundCount, 0)}
                                </div>
                                <p className="small mb-0 opacity-90 text-white">Sons Disponibles</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '1s' }}>
                                <div className="fs-2 fw-bold mb-1 text-white">
                                    {categories.filter(cat => cat.trending).length}
                                </div>
                                <p className="small mb-0 opacity-90 text-white">Tendances Actuelles</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Categories;
