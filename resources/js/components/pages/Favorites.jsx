import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlay, faDownload, faTrash, faMusic } from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';

const Favorites = () => {
    const [activeTab, setActiveTab] = useState('sons');

    const favoriteSounds = [
        {
            id: 1,
            title: "Urban Fire",
            artist: "BeatMaster237",
            duration: "3:24",
            price: 3500,
            category: "Hip-Hop",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop&crop=center",
            addedDate: "2024-01-15"
        },
        {
            id: 2,
            title: "Makossa Vibes",
            artist: "CamerBeats",
            duration: "4:12",
            price: 0,
            category: "Afrobeat",
            cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=280&h=160&fit=crop&crop=center",
            addedDate: "2024-01-10"
        }
    ];

    const favoriteArtists = [
        {
            id: 1,
            name: "BeatMaster237",
            genre: "Hip-Hop/Afrobeat",
            followers: 15420,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=center",
            verified: true
        },
        {
            id: 2,
            name: "CamerBeats",
            genre: "Afrobeat",
            followers: 8930,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c134?w=80&h=80&fit=crop&crop=center",
            verified: false
        }
    ];

    return (
        <div className="bg-light min-vh-100" style={{ paddingTop: '80px' }}>
            <Container>
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <AnimatedElement animation="slideInUp" delay={100}>
                            <div className="text-center mb-4">
                                <h1 className="h3 fw-bold mb-2">
                                    <FontAwesomeIcon icon={faHeart} className="text-danger me-2" />
                                    Mes Favoris
                                </h1>
                                <p className="text-secondary">Retrouvez tous vos sons et artistes préférés</p>
                            </div>
                        </AnimatedElement>
                    </Col>
                </Row>

                {/* Navigation Tabs */}
                <Row className="mb-4">
                    <Col>
                        <AnimatedElement animation="slideInUp" delay={200}>
                            <Nav variant="pills" className="justify-content-center">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'sons'}
                                        onClick={() => setActiveTab('sons')}
                                        className="rounded-pill px-4"
                                    >
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Sons ({favoriteSounds.length})
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'artistes'}
                                        onClick={() => setActiveTab('artistes')}
                                        className="rounded-pill px-4"
                                    >
                                        <FontAwesomeIcon icon={faHeart} className="me-2" />
                                        Artistes ({favoriteArtists.length})
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </AnimatedElement>
                    </Col>
                </Row>

                {/* Content */}
                {activeTab === 'sons' && (
                    <Row className="g-4">
                        {favoriteSounds.map((sound, index) => (
                            <Col key={sound.id} lg={6} md={6}>
                                <AnimatedElement animation="slideInUp" delay={300 + (index * 100)}>
                                    <Card className="h-100 shadow-sm border-0">
                                        <Row className="g-0">
                                            <Col md={4}>
                                                <Card.Img
                                                    src={sound.cover}
                                                    alt={sound.title}
                                                    style={{ height: '120px', objectFit: 'cover' }}
                                                />
                                            </Col>
                                            <Col md={8}>
                                                <Card.Body className="d-flex flex-column h-100">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <Card.Title className="h6 mb-1">{sound.title}</Card.Title>
                                                                <Card.Text className="small text-muted mb-1">
                                                                    par {sound.artist}
                                                                </Card.Text>
                                                            </div>
                                                            <Badge bg="light" text="dark" className="small">
                                                                {sound.category}
                                                            </Badge>
                                                        </div>
                                                        <p className="small text-muted mb-2">
                                                            Ajouté le {new Date(sound.addedDate).toLocaleDateString('fr-FR')}
                                                        </p>
                                                        <div className="text-end">
                                                            {sound.price > 0 ? (
                                                                <span className="fw-bold text-primary">
                                                                    {sound.price.toLocaleString()} F
                                                                </span>
                                                            ) : (
                                                                <span className="fw-bold text-success">Gratuit</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 mt-2">
                                                        <Button variant="outline-primary" size="sm" className="flex-grow-1">
                                                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                            Écouter
                                                        </Button>
                                                        <Button variant="outline-success" size="sm">
                                                            <FontAwesomeIcon icon={faDownload} />
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm">
                                                            <FontAwesomeIcon icon={faTrash} />
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
                )}

                {activeTab === 'artistes' && (
                    <Row className="g-4">
                        {favoriteArtists.map((artist, index) => (
                            <Col key={artist.id} lg={4} md={6}>
                                <AnimatedElement animation="slideInUp" delay={300 + (index * 100)}>
                                    <Card className="text-center h-100 shadow-sm border-0">
                                        <Card.Body>
                                            <img
                                                src={artist.avatar}
                                                alt={artist.name}
                                                className="rounded-circle mb-3"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                            <Card.Title className="h6">
                                                {artist.name}
                                                {artist.verified && (
                                                    <Badge bg="primary" className="ms-2 small">Vérifié</Badge>
                                                )}
                                            </Card.Title>
                                            <Card.Text className="small text-muted mb-2">
                                                {artist.genre}
                                            </Card.Text>
                                            <Card.Text className="small text-muted mb-3">
                                                {artist.followers.toLocaleString()} abonnés
                                            </Card.Text>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-primary" size="sm" className="flex-grow-1">
                                                    Voir profil
                                                </Button>
                                                <Button variant="outline-danger" size="sm">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </AnimatedElement>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Empty State */}
                {((activeTab === 'sons' && favoriteSounds.length === 0) ||
                  (activeTab === 'artistes' && favoriteArtists.length === 0)) && (
                    <Row>
                        <Col>
                            <AnimatedElement animation="fadeIn" delay={300}>
                                <div className="text-center py-5">
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        size="3x"
                                        className="text-muted mb-3"
                                    />
                                    <h4 className="text-muted mb-3">Aucun favori pour le moment</h4>
                                    <p className="text-muted mb-4">
                                        Découvrez de nouveaux {activeTab} et ajoutez-les à vos favoris
                                    </p>
                                    <Button variant="primary" href="/catalog">
                                        Découvrir maintenant
                                    </Button>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Favorites;
