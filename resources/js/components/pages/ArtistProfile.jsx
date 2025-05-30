import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Nav } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faMusic, faHeart, faPlay, faDownload, faShare,
    faMapMarkerAlt, faCalendar, faCheckCircle, faUsers,
    faHeadphones, faPlus
} from '@fortawesome/free-solid-svg-icons';

const ArtistProfile = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('sounds');
    const [isFollowing, setIsFollowing] = useState(false);

    // Mock data pour l'artiste (basé sur l'ID)
    const artist = {
        id: 1,
        name: "UrbanSonic",
        bio: "Producteur camerounais passionné par la création de beats urbains authentiques. Spécialisé dans le hip-hop et les sonorités afro-urbaines, je puise mon inspiration dans les rues de Douala pour créer des ambiances uniques qui capturent l'essence de la vie urbaine camerounaise.",
        genre: "Hip-Hop & Afro",
        followers: 1240,
        following: 45,
        totalSounds: 87,
        totalPlays: 156780,
        verified: true,
        joinDate: "2022-03-15",
        location: "Douala, Cameroun",
        website: "https://urbansonic.cm",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&h=400&fit=crop&crop=center",
        socialLinks: {
            instagram: "@urbansonic237",
            facebook: "UrbanSonicOfficial",
            youtube: "UrbanSonicBeats"
        }
    };

    const sounds = [
        {
            id: 1,
            title: "Metro Vibes",
            duration: "3:24",
            price: 2500,
            likes: 234,
            plays: 12400,
            uploadDate: "2024-01-15",
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=300&fit=crop&crop=center",
            featured: true
        },
        {
            id: 2,
            title: "City Flow",
            duration: "2:45",
            price: 2000,
            likes: 189,
            plays: 8900,
            uploadDate: "2024-01-10",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
            featured: false
        },
        {
            id: 3,
            title: "Urban Dreams",
            duration: "4:12",
            price: 3000,
            likes: 312,
            plays: 15600,
            uploadDate: "2024-01-05",
            cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop&crop=center",
            featured: true
        },
        {
            id: 4,
            title: "Street Symphony",
            duration: "3:58",
            price: 2800,
            likes: 145,
            plays: 6700,
            uploadDate: "2023-12-28",
            cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=center",
            featured: false
        }
    ];

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Cover & Profile Header */}
            <section className="position-relative">
                <div
                    className="artist-cover"
                    style={{
                        height: '300px',
                        backgroundImage: `url(${artist.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background: 'linear-gradient(45deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))'
                        }}
                    ></div>
                </div>

                <Container className="position-relative" style={{ marginTop: '-80px', zIndex: 10 }}>
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col sm={3} className="text-center text-sm-start mb-3 mb-sm-0">
                                            <div className="position-relative d-inline-block">
                                                <img
                                                    src={artist.avatar}
                                                    alt={artist.name}
                                                    className="rounded-circle border border-white border-4"
                                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                />
                                                {artist.verified && (
                                                    <div
                                                        className="position-absolute bottom-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center border border-white border-2"
                                                        style={{ width: '32px', height: '32px' }}
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-white" style={{ fontSize: '16px' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <h2 className="fw-bold mb-1" style={{ fontSize: '24px' }}>{artist.name}</h2>
                                            <p className="text-muted mb-2">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                {artist.location}
                                            </p>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                <Badge bg="primary" style={{ borderRadius: '8px', fontSize: '11px' }}>
                                                    {artist.genre}
                                                </Badge>
                                                {artist.verified && (
                                                    <Badge bg="success" style={{ borderRadius: '8px', fontSize: '11px' }}>
                                                        Vérifié
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted small mb-0">
                                                Membre depuis {new Date(artist.joinDate).toLocaleDateString('fr-FR', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </Col>
                                        <Col sm={3} className="text-center">
                                            <Button
                                                variant={isFollowing ? "outline-primary" : "primary"}
                                                onClick={handleFollow}
                                                className="w-100 mb-2 fw-medium"
                                                style={{ borderRadius: '12px', fontSize: '14px' }}
                                            >
                                                <FontAwesomeIcon icon={isFollowing ? faUsers : faPlus} className="me-1" />
                                                {isFollowing ? 'Suivi' : 'Suivre'}
                                            </Button>
                                            <Button
                                                variant="outline-dark"
                                                size="sm"
                                                className="w-100"
                                                style={{ borderRadius: '12px', fontSize: '13px' }}
                                            >
                                                <FontAwesomeIcon icon={faShare} className="me-1" />
                                                Partager
                                            </Button>
                                        </Col>
                                    </Row>

                                    {/* Stats */}
                                    <Row className="mt-4 text-center">
                                        <Col xs={3}>
                                            <div className="fw-bold text-primary" style={{ fontSize: '18px' }}>
                                                {artist.totalSounds}
                                            </div>
                                            <small className="text-muted">Sons</small>
                                        </Col>
                                        <Col xs={3}>
                                            <div className="fw-bold text-success" style={{ fontSize: '18px' }}>
                                                {artist.followers.toLocaleString()}
                                            </div>
                                            <small className="text-muted">Followers</small>
                                        </Col>
                                        <Col xs={3}>
                                            <div className="fw-bold text-warning" style={{ fontSize: '18px' }}>
                                                {artist.totalPlays.toLocaleString()}
                                            </div>
                                            <small className="text-muted">Écoutes</small>
                                        </Col>
                                        <Col xs={3}>
                                            <div className="fw-bold text-info" style={{ fontSize: '18px' }}>
                                                {artist.following}
                                            </div>
                                            <small className="text-muted">Suivis</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Content Tabs */}
            <section className="py-4">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto">
                            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                                <Nav variant="pills" className="justify-content-center mb-4">
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="sounds"
                                            className="fw-medium"
                                            style={{ borderRadius: '12px', fontSize: '14px' }}
                                        >
                                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                                            Sons ({sounds.length})
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="about"
                                            className="fw-medium"
                                            style={{ borderRadius: '12px', fontSize: '14px' }}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="me-1" />
                                            À propos
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    {/* Sons Tab */}
                                    <Tab.Pane eventKey="sounds">
                                        <Row className="g-3">
                                            {sounds.map(sound => (
                                                <Col key={sound.id} md={6} className="mb-3">
                                                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                                        <div className="position-relative">
                                                            <Card.Img
                                                                variant="top"
                                                                src={sound.cover}
                                                                style={{ height: '180px', objectFit: 'cover' }}
                                                            />

                                                            {sound.featured && (
                                                                <Badge
                                                                    bg="warning"
                                                                    className="position-absolute top-0 start-0 m-3"
                                                                    style={{ borderRadius: '8px', fontSize: '11px' }}
                                                                >
                                                                    Featured
                                                                </Badge>
                                                            )}

                                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                                <Button
                                                                    variant="light"
                                                                    className="rounded-circle shadow"
                                                                    style={{ width: '50px', height: '50px' }}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faPlay}
                                                                        className="text-primary"
                                                                        style={{ fontSize: '18px' }}
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Card.Body className="p-3">
                                                            <h6 className="fw-bold mb-1" style={{ fontSize: '15px' }}>
                                                                <Link
                                                                    to={`/sound/${sound.id}`}
                                                                    className="text-decoration-none text-dark"
                                                                >
                                                                    {sound.title}
                                                                </Link>
                                                            </h6>

                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <small className="text-muted">{sound.duration}</small>
                                                                <div className="d-flex align-items-center">
                                                                    <FontAwesomeIcon icon={faHeart} className="text-danger me-1" style={{ fontSize: '12px' }} />
                                                                    <small>{sound.likes}</small>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex align-items-center mb-2">
                                                                <FontAwesomeIcon icon={faHeadphones} className="text-muted me-1" style={{ fontSize: '12px' }} />
                                                                <small className="text-muted">{sound.plays.toLocaleString()} écoutes</small>
                                                            </div>

                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="fw-bold text-primary" style={{ fontSize: '14px' }}>
                                                                    {sound.price.toLocaleString()} FCFA
                                                                </span>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    style={{ borderRadius: '12px', fontSize: '13px' }}
                                                                >
                                                                    Ajouter
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Tab.Pane>

                                    {/* About Tab */}
                                    <Tab.Pane eventKey="about">
                                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                            <Card.Body className="p-4">
                                                <h5 className="fw-bold mb-3">Biographie</h5>
                                                <p className="text-muted mb-4" style={{ lineHeight: 1.6 }}>
                                                    {artist.bio}
                                                </p>

                                                <Row className="g-4">
                                                    <Col md={6}>
                                                        <h6 className="fw-bold mb-3">Informations</h6>
                                                        <div className="mb-3">
                                                            <strong className="small">Genre principal :</strong>
                                                            <div className="text-muted">{artist.genre}</div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <strong className="small">Localisation :</strong>
                                                            <div className="text-muted">{artist.location}</div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <strong className="small">Membre depuis :</strong>
                                                            <div className="text-muted">
                                                                {new Date(artist.joinDate).toLocaleDateString('fr-FR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                        {artist.website && (
                                                            <div className="mb-3">
                                                                <strong className="small">Site web :</strong>
                                                                <div>
                                                                    <a
                                                                        href={artist.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-decoration-none"
                                                                        style={{ color: 'var(--primary-purple)' }}
                                                                    >
                                                                        {artist.website}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Col>
                                                    <Col md={6}>
                                                        <h6 className="fw-bold mb-3">Réseaux sociaux</h6>
                                                        <div className="d-flex flex-column gap-2">
                                                            {artist.socialLinks.instagram && (
                                                                <div className="d-flex align-items-center">
                                                                    <div
                                                                        className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '32px', height: '32px', backgroundColor: '#E4405F', color: 'white' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '14px' }} />
                                                                    </div>
                                                                    <span className="small">{artist.socialLinks.instagram}</span>
                                                                </div>
                                                            )}
                                                            {artist.socialLinks.facebook && (
                                                                <div className="d-flex align-items-center">
                                                                    <div
                                                                        className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '32px', height: '32px', backgroundColor: '#1877F2', color: 'white' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '14px' }} />
                                                                    </div>
                                                                    <span className="small">{artist.socialLinks.facebook}</span>
                                                                </div>
                                                            )}
                                                            {artist.socialLinks.youtube && (
                                                                <div className="d-flex align-items-center">
                                                                    <div
                                                                        className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                                                        style={{ width: '32px', height: '32px', backgroundColor: '#FF0000', color: 'white' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlay} style={{ fontSize: '14px' }} />
                                                                    </div>
                                                                    <span className="small">{artist.socialLinks.youtube}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default ArtistProfile;
