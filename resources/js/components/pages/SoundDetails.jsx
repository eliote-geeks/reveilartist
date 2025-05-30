import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Badge, Breadcrumb, ListGroup } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faPause, faHeart, faShare, faDownload, faShoppingCart,
    faClock, faCalendar, faFileAudio, faUser, faEuroSign
} from '@fortawesome/free-solid-svg-icons';

const SoundDetails = () => {
    const { id } = useParams();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Mock data pour le son
    const soundData = {
        id: 1,
        title: "Métro Parisien - Rush Hour",
        artist: "UrbanSonic",
        duration: "3:24",
        price: 2500,
        category: "Transport",
        description: "Capturez l'énergie et le dynamisme du métro parisien aux heures de pointe. Un mélange authentique de bruits mécaniques, de conversations urbaines et de musique de rue qui donne vie à vos projets audiovisuels.",
        tags: ["métro", "transport", "paris", "urbain", "rush", "crowds"],
        likes: 245,
        plays: 1823,
        uploadDate: "2024-03-15",
        license: "Usage Commercial Autorisé",
        format: "WAV 48kHz/24bit",
        fileSize: "24.5 MB",
        cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&crop=center",
        audioUrl: "#",
        waveform: "/api/waveform/1",
        artistInfo: {
            name: "UrbanSonic",
            bio: "Producteur camerounais spécialisé dans les beats urbains authentiques",
            followers: 1240,
            totalSounds: 87
        },
        relatedSounds: [
            {
                id: 2,
                title: "Gare du Nord",
                artist: "StationSounds",
                duration: "2:45",
                price: 2000,
                cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=100&fit=crop&crop=center"
            },
            {
                id: 3,
                title: "Bus Parisien",
                artist: "UrbanSonic",
                duration: "4:12",
                price: 2200,
                cover: "https://images.unsplash.com/photo-1570068519303-94e7bab0a9aa?w=150&h=100&fit=crop&crop=center"
            },
            {
                id: 4,
                title: "Passage Souterrain",
                artist: "CityEcho",
                duration: "5:01",
                price: 2800,
                cover: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=150&h=100&fit=crop&crop=center"
            }
        ]
    };

    // Sons suggérés
    const suggestedSounds = [
        {
            id: 2,
            title: "Gare du Nord - Matin",
            artist: "UrbanSonic",
            price: 2000,
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=100&fit=crop&crop=center"
        },
        {
            id: 3,
            title: "Bus Parisien",
            artist: "CityRecords",
            price: 1500,
            cover: "https://images.unsplash.com/photo-1570068519303-94e7bab0a9aa?w=150&h=100&fit=crop&crop=center"
        },
        {
            id: 4,
            title: "Passage Piéton",
            artist: "UrbanSonic",
            price: 1000,
            cover: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=150&h=100&fit=crop&crop=center"
        }
    ];

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item as={Link} to="/">Accueil</Breadcrumb.Item>
                <Breadcrumb.Item as={Link} to="/catalog">Catalogue</Breadcrumb.Item>
                <Breadcrumb.Item active>{soundData.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Row>
                {/* Main Content */}
                <Col lg={8}>
                    {/* Sound Header */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Row className="g-0">
                            <Col md={5}>
                                <div className="position-relative">
                                    <Card.Img
                                        src={soundData.cover}
                                        className="rounded-start h-100 object-fit-cover"
                                        style={{ minHeight: '300px' }}
                                    />
                                    <div className="position-absolute top-50 start-50 translate-middle">
                                        <Button
                                            variant="warning"
                                            className="rounded-circle p-4 shadow-lg"
                                            onClick={() => setIsPlaying(!isPlaying)}
                                        >
                                            <FontAwesomeIcon
                                                icon={isPlaying ? faPause : faPlay}
                                                size="2x"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                            <Col md={7}>
                                <Card.Body className="p-4">
                                    <Badge bg="dark" className="mb-2">{soundData.category}</Badge>
                                    <h2 className="fw-bold mb-2">{soundData.title}</h2>
                                    <p className="text-muted mb-3">
                                        par <Link to={`/artist/${soundData.artist}`} className="text-decoration-none">
                                            {soundData.artist}
                                        </Link>
                                    </p>

                                    <div className="mb-3">
                                        {soundData.tags.map(tag => (
                                            <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="d-flex gap-3 mb-4">
                                        <div className="text-center">
                                            <div className="fw-bold">{soundData.duration}</div>
                                            <small className="text-muted">Durée</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="fw-bold">{soundData.likes}</div>
                                            <small className="text-muted">J'aime</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="fw-bold">{soundData.plays}</div>
                                            <small className="text-muted">Écoutes</small>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mb-3">
                                        <Button
                                            variant={isLiked ? "danger" : "outline-danger"}
                                            onClick={() => setIsLiked(!isLiked)}
                                        >
                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                            {isLiked ? "Aimé" : "J'aime"}
                                        </Button>
                                        <Button variant="outline-dark">
                                            <FontAwesomeIcon icon={faShare} className="me-1" />
                                            Partager
                                        </Button>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faEuroSign} className="text-warning me-1" />
                                            <span className="fw-bold fs-3 text-warning">{soundData.price.toLocaleString()} FCFA</span>
                                        </div>
                                        <Button variant="dark" size="lg">
                                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                            Ajouter au Panier
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>

                    {/* Description */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Description</h5>
                            <p className="text-muted">{soundData.description}</p>
                        </Card.Body>
                    </Card>

                    {/* Technical Info */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Informations Techniques</h5>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span><FontAwesomeIcon icon={faClock} className="me-2 text-muted" />Durée</span>
                                    <span>{soundData.duration}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span><FontAwesomeIcon icon={faFileAudio} className="me-2 text-muted" />Format</span>
                                    <span>{soundData.format}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span><FontAwesomeIcon icon={faDownload} className="me-2 text-muted" />Taille</span>
                                    <span>{soundData.fileSize}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span><FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />Date d'ajout</span>
                                    <span>{new Date(soundData.uploadDate).toLocaleDateString('fr-FR')}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Licence</span>
                                    <span className="text-success">{soundData.license}</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={4}>
                    {/* Artist Info */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faUser} className="me-2" />
                                À propos de l'artiste
                            </h6>
                            <div className="text-center mb-3">
                                <div className="bg-dark rounded-circle p-3 d-inline-block mb-2">
                                    <FontAwesomeIcon icon={faUser} className="text-white" size="2x" />
                                </div>
                                <h6 className="fw-bold">{soundData.artistInfo.name}</h6>
                                <p className="text-muted small">{soundData.artistInfo.bio}</p>
                            </div>
                            <div className="d-flex justify-content-around text-center mb-3">
                                <div>
                                    <div className="fw-bold">{soundData.artistInfo.followers}</div>
                                    <small className="text-muted">Followers</small>
                                </div>
                                <div>
                                    <div className="fw-bold">{soundData.artistInfo.totalSounds}</div>
                                    <small className="text-muted">Sons</small>
                                </div>
                            </div>
                            <Button variant="outline-dark" className="w-100">
                                Voir le Profil
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Suggested Sounds */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Sons Similaires</h6>
                            {suggestedSounds.map(suggestedSound => (
                                <div key={suggestedSound.id} className="d-flex align-items-center mb-3">
                                    <img
                                        src={suggestedSound.cover}
                                        alt={suggestedSound.title}
                                        className="rounded me-3"
                                        width="60"
                                        height="40"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold small">{suggestedSound.title}</div>
                                        <div className="text-muted small">par {suggestedSound.artist}</div>
                                        <div className="text-warning small">{suggestedSound.price.toLocaleString()} FCFA</div>
                                    </div>
                                    <Button variant="outline-dark" size="sm">
                                        <FontAwesomeIcon icon={faPlay} />
                                    </Button>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SoundDetails;
