import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faPlay, faMusic } from '@fortawesome/free-solid-svg-icons';

const Categories = () => {
    const categories = [
        {
            id: 1,
            name: "Hip-Hop & Rap",
            description: "Beats urbains et flows authentiques",
            soundCount: 145,
            color: "#ff6b35",
            image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=250&fit=crop&crop=center",
            trending: true
        },
        {
            id: 2,
            name: "Électro",
            description: "Sonorités électroniques modernes",
            soundCount: 98,
            color: "#3b82f6",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=250&fit=crop&crop=center",
            trending: false
        },
        {
            id: 3,
            name: "Afrobeat",
            description: "Rythmes africains contemporains",
            soundCount: 78,
            color: "#10b981",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&crop=center",
            trending: true
        },
        {
            id: 4,
            name: "Ambiance",
            description: "Sons d'atmosphère et d'ambiance",
            soundCount: 203,
            color: "#8b5cf6",
            image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop&crop=center",
            trending: false
        },
        {
            id: 5,
            name: "Drill",
            description: "Sons drill et trap hardcore",
            soundCount: 67,
            color: "#ec4899",
            image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=250&fit=crop&crop=center",
            trending: true
        },
        {
            id: 6,
            name: "R&B",
            description: "Mélodies douces et sensuelles",
            soundCount: 112,
            color: "#f59e0b",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&crop=center",
            trending: false
        }
    ];

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
                                    to={`/catalog?category=${category.name}`}
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
                                                    icon={faPlay}
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
                                                <FontAwesomeIcon icon={faPlay} style={{ fontSize: '10px' }} />
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
            <section className="section-stats text-white py-4">
                <Container>
                    <Row className="text-center">
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation">
                                <div className="fs-2 fw-bold mb-1">6</div>
                                <p className="small mb-0 opacity-90">Catégories Musicales</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '0.5s' }}>
                                <div className="fs-2 fw-bold mb-1">803</div>
                                <p className="small mb-0 opacity-90">Sons Disponibles</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '1s' }}>
                                <div className="fs-2 fw-bold mb-1">3</div>
                                <p className="small mb-0 opacity-90">Tendances Actuelles</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Categories;
