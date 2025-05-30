import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMusic, faHeart, faSearch, faFilter, faUsers, faPlay } from '@fortawesome/free-solid-svg-icons';

const Artists = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('all');

    const artists = [
        {
            id: 1,
            name: "UrbanSonic",
            bio: "Producteur camerounais spécialisé dans les beats urbains",
            genre: "Hip-Hop",
            followers: 1240,
            totalSounds: 87,
            verified: true,
            location: "Douala, Cameroun",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 1,
                    title: "Metro Vibes",
                    plays: 12400,
                    cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=50&h=50&fit=crop&crop=center"
                },
                {
                    id: 2,
                    title: "City Flow",
                    plays: 8900,
                    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop&crop=center"
                }
            ]
        },
        {
            id: 2,
            name: "CamerSounds",
            bio: "Artiste multi-genres, créateur d'ambiances authentiques",
            genre: "Afrobeat",
            followers: 2180,
            totalSounds: 134,
            verified: true,
            location: "Yaoundé, Cameroun",
            avatar: "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 3,
                    title: "Afro Dreams",
                    plays: 15600,
                    cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=50&h=50&fit=crop&crop=center"
                },
                {
                    id: 4,
                    title: "Cameroon Soul",
                    plays: 11200,
                    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=50&h=50&fit=crop&crop=center"
                }
            ]
        },
        {
            id: 3,
            name: "NightLife237",
            bio: "DJ producteur spécialisé en électro et house music",
            genre: "Électro",
            followers: 890,
            totalSounds: 56,
            verified: false,
            location: "Douala, Cameroun",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 5,
                    title: "Night Energy",
                    plays: 7800,
                    cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=50&h=50&fit=crop&crop=center"
                }
            ]
        },
        {
            id: 4,
            name: "FlowMaster",
            bio: "Rappeur et producteur, pioneer du drill camerounais",
            genre: "Drill",
            followers: 1650,
            totalSounds: 73,
            verified: true,
            location: "Bafoussam, Cameroun",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 6,
                    title: "Drill Session",
                    plays: 9400,
                    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop&crop=center"
                }
            ]
        },
        {
            id: 5,
            name: "SoulRhythm",
            bio: "Artiste R&B avec une touche moderne africaine",
            genre: "R&B",
            followers: 3240,
            totalSounds: 98,
            verified: true,
            location: "Limbé, Cameroun",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b9b5eb87?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 7,
                    title: "Smooth Vibes",
                    plays: 18700,
                    cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=50&h=50&fit=crop&crop=center"
                }
            ]
        },
        {
            id: 6,
            name: "AmbientMaster",
            bio: "Créateur d'atmosphères sonores et d'ambiances urbaines",
            genre: "Ambiance",
            followers: 760,
            totalSounds: 145,
            verified: false,
            location: "Garoua, Cameroun",
            avatar: "https://images.unsplash.com/photo-1519763089779-1d6e0df80b11?w=120&h=120&fit=crop&crop=face",
            coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=200&fit=crop&crop=center",
            topTracks: [
                {
                    id: 8,
                    title: "City Atmosphere",
                    plays: 5600,
                    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=50&h=50&fit=crop&crop=center"
                }
            ]
        }
    ];

    const genres = ['all', 'Hip-Hop', 'Afrobeat', 'Électro', 'Drill', 'R&B', 'Ambiance'];

    const filteredArtists = artists.filter(artist => {
        const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             artist.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             artist.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = filterGenre === 'all' || artist.genre === filterGenre;
        return matchesSearch && matchesGenre;
    });

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
                        <Col lg={8} md={10}>
                            <Row className="g-3">
                                <Col md={8}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light border-0">
                                            <FontAwesomeIcon icon={faSearch} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher un artiste..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-0 bg-light"
                                            style={{ fontSize: '14px' }}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Form.Select
                                        value={filterGenre}
                                        onChange={(e) => setFilterGenre(e.target.value)}
                                        className="border-0 bg-light"
                                        style={{ fontSize: '14px' }}
                                    >
                                        {genres.map(genre => (
                                            <option key={genre} value={genre}>
                                                {genre === 'all' ? 'Tous les genres' : genre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Artists Grid */}
            <section className="py-4">
                <Container>
                    <div className="mb-4">
                        <h2 className="fw-bold text-dark mb-2">Artistes disponibles</h2>
                        <p className="text-muted small mb-0">{filteredArtists.length} artistes trouvés</p>
                    </div>

                    <Row className="g-3">
                        {filteredArtists.map(artist => (
                            <Col key={artist.id} lg={4} md={6} className="mb-3">
                                <Card
                                    className="artist-card border-0 h-100"
                                    style={{ borderRadius: '16px' }}
                                >
                                    {/* Cover Image */}
                                    <div className="position-relative">
                                        <div
                                            className="artist-cover"
                                            style={{
                                                height: '140px',
                                                backgroundImage: `url(${artist.coverImage})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: '16px 16px 0 0'
                                            }}
                                        >
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100"
                                                style={{
                                                    background: 'linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
                                                    borderRadius: '16px 16px 0 0'
                                                }}
                                            ></div>
                                        </div>

                                        {/* Avatar */}
                                        <div className="position-absolute bottom-0 start-50 translate-middle-x">
                                            <div className="position-relative">
                                                <img
                                                    src={artist.avatar}
                                                    alt={artist.name}
                                                    className="rounded-circle border border-white border-3"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                                {artist.verified && (
                                                    <div
                                                        className="position-absolute bottom-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: '24px', height: '24px' }}
                                                    >
                                                        <FontAwesomeIcon icon={faMusic} className="text-white" style={{ fontSize: '10px' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Genre Badge */}
                                        <Badge
                                            bg="primary"
                                            className="position-absolute top-0 end-0 m-3"
                                            style={{ borderRadius: '8px', fontSize: '11px' }}
                                        >
                                            {artist.genre}
                                        </Badge>
                                    </div>

                                    <Card.Body className="p-3 pt-5 text-center">
                                        <h5 className="fw-bold mb-1" style={{ fontSize: '16px' }}>{artist.name}</h5>
                                        <p className="text-muted small mb-2">{artist.location}</p>
                                        <p className="text-muted small mb-3" style={{ fontSize: '13px' }}>
                                            {artist.bio}
                                        </p>

                                        {/* Stats */}
                                        <Row className="g-2 mb-3">
                                            <Col xs={6}>
                                                <div className="text-center">
                                                    <div className="fw-bold text-primary" style={{ fontSize: '14px' }}>
                                                        {artist.followers.toLocaleString()}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>Followers</small>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div className="text-center">
                                                    <div className="fw-bold text-success" style={{ fontSize: '14px' }}>
                                                        {artist.totalSounds}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>Sons</small>
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* Top Tracks Preview */}
                                        {artist.topTracks.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-start mb-2">
                                                    <small className="fw-medium text-dark" style={{ fontSize: '12px' }}>
                                                        Top sons :
                                                    </small>
                                                </div>
                                                {artist.topTracks.slice(0, 2).map(track => (
                                                    <div key={track.id} className="d-flex align-items-center mb-2">
                                                        <img
                                                            src={track.cover}
                                                            alt={track.title}
                                                            className="rounded me-2"
                                                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                        />
                                                        <div className="flex-grow-1 text-start">
                                                            <div className="fw-medium small" style={{ fontSize: '12px' }}>
                                                                {track.title}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '10px' }}>
                                                                {track.plays.toLocaleString()} écoutes
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="rounded-circle p-0"
                                                            style={{ width: '26px', height: '26px' }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} style={{ fontSize: '10px' }} />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="d-flex gap-2">
                                            <Button
                                                as={Link}
                                                to={`/artists/${artist.id}`}
                                                variant="primary"
                                                size="sm"
                                                className="flex-fill fw-medium"
                                                style={{ borderRadius: '12px', fontSize: '13px' }}
                                            >
                                                Voir Profil
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="px-2"
                                                style={{ borderRadius: '12px' }}
                                            >
                                                <FontAwesomeIcon icon={faHeart} style={{ fontSize: '12px' }} />
                                            </Button>
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
                                <div className="fs-2 fw-bold mb-1">{artists.length}</div>
                                <p className="small mb-0 opacity-90">Artistes Talentueux</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '0.5s' }}>
                                <div className="fs-2 fw-bold mb-1">
                                    {artists.filter(a => a.verified).length}
                                </div>
                                <p className="small mb-0 opacity-90">Artistes Vérifiés</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-3">
                            <div className="pulse-animation" style={{ animationDelay: '1s' }}>
                                <div className="fs-2 fw-bold mb-1">
                                    {artists.reduce((sum, artist) => sum + artist.totalSounds, 0)}
                                </div>
                                <p className="small mb-0 opacity-90">Sons Créés</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Artists;
