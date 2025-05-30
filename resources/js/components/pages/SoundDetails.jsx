import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Breadcrumb, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faPause, faHeart, faShare, faDownload, faShoppingCart,
    faClock, faCalendar, faFileAudio, faUser, faEuroSign, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from '../common/AudioPlayer';
import { useAuth } from '../../context/AuthContext';

const SoundDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [soundData, setSoundData] = useState(null);
    const [suggestedSounds, setSuggestedSounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (id) {
            loadSoundDetails();
            loadSuggestedSounds();
        }
    }, [id]);

    useEffect(() => {
        if (token && soundData) {
            checkLikeStatus();
        }
    }, [token, soundData]);

    const loadSoundDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sounds/${id}`);
            const data = await response.json();

            if (data.success) {
                setSoundData(data.sound);
            } else {
                throw new Error(data.message || 'Son non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors du chargement du son:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestedSounds = async () => {
        try {
            const response = await fetch('/api/sounds/popular?limit=5');
            const data = await response.json();

            if (data.success) {
                setSuggestedSounds(data.sounds.filter(sound => sound.id !== parseInt(id)));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des sons suggérés:', error);
        }
    };

    const checkLikeStatus = async () => {
        if (!token || !soundData) return;

        try {
            const response = await fetch('/api/sounds/likes/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sound_ids: [soundData.id] })
            });

            const data = await response.json();

            if (data.success) {
                setIsLiked(data.likes.includes(soundData.id));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du like:', error);
        }
    };

    const handleLike = async () => {
        if (!token) {
            alert('Veuillez vous connecter pour liker des sons');
            return;
        }

        try {
            const response = await fetch(`/api/sounds/${soundData.id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setIsLiked(data.is_liked);
                // Mettre à jour le compteur de likes
                setSoundData(prev => ({
                    ...prev,
                    likes: data.likes_count
                }));
            } else {
                alert(data.message || 'Erreur lors du like');
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            alert('Erreur lors du like. Veuillez réessayer.');
        }
    };

    const handleAddToCart = () => {
        if (soundData.is_free || soundData.price === 0) {
            alert('Ce son est gratuit ! Vous pouvez le télécharger directement.');
            return;
        }

        // TODO: Implémenter l'ajout au panier
        alert(`"${soundData.title}" ajouté au panier !`);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: soundData.title,
                text: `Découvrez "${soundData.title}" par ${soundData.artist}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5 className="text-muted">Chargement du son...</h5>
            </Container>
        );
    }

    if (error || !soundData) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <h5>Erreur</h5>
                    <p>{error || 'Son non trouvé'}</p>
                    <Button variant="primary" onClick={() => navigate('/catalog')}>
                        Retour au catalogue
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item as={Link} to="/">Accueil</Breadcrumb.Item>
                <Breadcrumb.Item as={Link} to="/catalog">Catalogue</Breadcrumb.Item>
                <Breadcrumb.Item active>{soundData.title}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Bouton retour */}
            <Button
                variant="outline-secondary"
                className="mb-4"
                onClick={() => navigate('/catalog')}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Retour au catalogue
            </Button>

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
                                </div>
                            </Col>
                            <Col md={7}>
                                <Card.Body className="p-4">
                                    <div className="d-flex gap-2 mb-2">
                                        <Badge bg="dark">{soundData.category}</Badge>
                                        {soundData.is_featured && (
                                            <Badge bg="warning" text="dark">⭐ Populaire</Badge>
                                        )}
                                        {(soundData.is_free || soundData.price === 0) && (
                                            <Badge bg="success">Gratuit</Badge>
                                        )}
                                    </div>

                                    <h2 className="fw-bold mb-2">{soundData.title}</h2>
                                    <p className="text-muted mb-3">
                                        par <Link
                                            to={`/artist/${soundData.artistId}`}
                                            className="text-decoration-none"
                                        >
                                            {soundData.artist}
                                        </Link>
                                    </p>

                                    {/* Tags */}
                                    {soundData.tags && soundData.tags.length > 0 && (
                                        <div className="mb-3">
                                            {soundData.tags.map(tag => (
                                                <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="d-flex gap-4 mb-3 small text-muted">
                                        <span>
                                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                                            {soundData.likes} likes
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                                            {soundData.plays} écoutes
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                                            {soundData.downloads || 0} téléchargements
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-2 mb-3">
                                        <Button
                                            variant={isLiked ? "danger" : "outline-danger"}
                                            onClick={handleLike}
                                            disabled={!token}
                                        >
                                            <FontAwesomeIcon icon={faHeart} className="me-2" />
                                            {isLiked ? 'Aimé' : 'J\'aime'}
                                        </Button>
                                        <Button variant="outline-secondary" onClick={handleShare}>
                                            <FontAwesomeIcon icon={faShare} className="me-2" />
                                            Partager
                                        </Button>
                                    </div>

                                    {/* Prix et achat */}
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faEuroSign} className="text-warning me-1" />
                                            <span className="fw-bold fs-3 text-warning">
                                                {soundData.is_free || soundData.price === 0
                                                    ? 'Gratuit'
                                                    : `${soundData.price.toLocaleString()} FCFA`
                                                }
                                            </span>
                                        </div>
                                        {soundData.is_free || soundData.price === 0 ? (
                                            <Button variant="success" size="lg">
                                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                Télécharger Gratuitement
                                            </Button>
                                        ) : (
                                            <Button variant="dark" size="lg" onClick={handleAddToCart}>
                                                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                                Ajouter au Panier
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Col>
                        </Row>
                    </Card>

                    {/* Player */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Écouter</h5>
                            <AudioPlayer
                                sound={soundData}
                                isCompact={false}
                                showDetails={false}
                                onLike={handleLike}
                                previewDuration={20}
                                showPreviewBadge={true}
                            />
                        </Card.Body>
                    </Card>

                    {/* Description */}
                    {soundData.description && (
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Description</h5>
                                <p className="text-muted">{soundData.description}</p>
                            </Card.Body>
                        </Card>
                    )}

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
                                    <span>{soundData.file_size}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span><FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />Date d'ajout</span>
                                    <span>{new Date(soundData.upload_date).toLocaleDateString('fr-FR')}</span>
                                </ListGroup.Item>
                                {soundData.genre && (
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <span>Genre</span>
                                        <span>{soundData.genre}</span>
                                    </ListGroup.Item>
                                )}
                                {soundData.bpm && (
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <span>BPM</span>
                                        <span>{soundData.bpm}</span>
                                    </ListGroup.Item>
                                )}
                                {soundData.key && (
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <span>Tonalité</span>
                                        <span>{soundData.key}</span>
                                    </ListGroup.Item>
                                )}
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Usage commercial</span>
                                    <span className={soundData.commercial_use ? "text-success" : "text-warning"}>
                                        {soundData.commercial_use ? 'Autorisé' : 'Limité'}
                                    </span>
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
                                Artiste
                            </h6>
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(soundData.artist)}&size=50`}
                                    alt={soundData.artist}
                                    className="rounded-circle me-3"
                                    width="50"
                                    height="50"
                                />
                                <div>
                                    <div className="fw-bold">{soundData.artist}</div>
                                    <small className="text-muted">Producteur musical</small>
                                </div>
                            </div>
                            <Button
                                as={Link}
                                to={`/artist/${soundData.artistId}`}
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                            >
                                Voir le profil
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
                                        <div className="text-warning small">
                                            {suggestedSound.is_free || suggestedSound.price === 0
                                                ? 'Gratuit'
                                                : `${suggestedSound.price.toLocaleString()} FCFA`
                                            }
                                        </div>
                                    </div>
                                    <Button
                                        as={Link}
                                        to={`/sound/${suggestedSound.id}`}
                                        variant="outline-dark"
                                        size="sm"
                                    >
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
