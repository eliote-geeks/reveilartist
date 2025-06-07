import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Breadcrumb, ListGroup, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay, faPause, faHeart, faShare, faDownload, faShoppingCart,
    faClock, faCalendar, faFileAudio, faUser, faEuroSign, faArrowLeft,
    faMusic, faCompactDisc, faWaveSquare, faTachometerAlt, faKey,
    faCheckCircle, faTimesCircle, faEye, faThumbsUp, faVolumeUp,
    faHeadphones, faTag, faStar, faGlobe, faShield, faCopyright
} from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from '../common/AudioPlayer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import axios from '../../utils/axios';

const SoundDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const { addToCart, isInCart, cartItems } = useCart();
    const toast = useToast();

    const [soundData, setSoundData] = useState(null);
    const [suggestedSounds, setSuggestedSounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

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

            const response = await axios.get(`/sounds/${id}`);
            const data = response.data;

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
            const response = await axios.get('/sounds?limit=4');
            const data = response.data;

            if (data.success && data.sounds) {
                setSuggestedSounds(data.sounds.filter(sound => sound.id !== parseInt(id)));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des suggestions:', error);
        }
    };

    const checkLikeStatus = async () => {
        try {
            const response = await axios.post('/sounds/likes/status', {
                    sound_ids: [parseInt(id)]
            });

            const data = response.data;
            if (data.success) {
                setIsLiked(data.likes.includes(parseInt(id)));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du like:', error);
        }
    };

    const handleLike = async () => {
        if (!token) {
            toast.warning(
                'Connexion requise',
                'Vous devez être connecté pour aimer un son'
            );
            return;
        }

        try {
            const response = await axios.post(`/sounds/${id}/like`);
            const data = response.data;

            if (data.success) {
                setIsLiked(data.is_liked);
                setSoundData(prev => ({
                    ...prev,
                    likes: data.likes_count
                }));

                toast.like(
                    data.is_liked ? 'Son ajouté aux favoris' : 'Son retiré des favoris',
                    data.message
                );
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            toast.error('Erreur', 'Impossible de modifier le statut du like');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = `${soundData.title} par ${soundData.artist}`;
        const text = `Découvrez ce son sur Reveil4artist`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
                toast.success('Partage', 'Son partagé avec succès');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erreur de partage:', error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Lien copié', 'Le lien a été copié dans le presse-papiers');
            } catch (error) {
                console.error('Erreur de copie:', error);
                toast.error('Erreur', 'Impossible de copier le lien');
            }
        }
    };

    const handleAddToCart = () => {
        if (!user || !token) {
            toast.warning(
                'Connexion requise',
                'Vous devez être connecté pour ajouter des articles au panier'
            );
            return;
        }

        // Vérifier si le son est déjà acheté
        if (checkIfPurchased(soundData.id)) {
            toast.info(
                'Son déjà acheté',
                'Vous avez déjà acheté ce son. Vous pouvez le télécharger directement depuis votre profil.'
            );
            return;
        }

        // Si le son est gratuit, proposer le téléchargement direct
        if (soundData.is_free || soundData.price === 0) {
            toast.info(
                'Son gratuit',
                'Ce son est gratuit, vous pouvez le télécharger directement.'
            );
            return;
        }

        // Vérifier si le son est déjà dans le panier
        const isAlreadyInCart = cartItems.some(item => item.id === soundData.id && item.type === 'sound');

        if (isAlreadyInCart) {
            toast.warning(
                'Déjà dans le panier',
                `"${soundData.title}" est déjà dans votre panier`
            );
            return;
        }

        const cartItem = {
            id: soundData.id,
            type: 'sound',
            title: soundData.title,
            artist: soundData.artist,
            artistId: soundData.artistId,
            price: soundData.price,
            is_free: soundData.is_free,
            cover: soundData.cover,
            duration: soundData.duration,
            category: soundData.category,
            quantity: 1
        };

        addToCart(cartItem);
        toast.success(
            'Ajouté au panier',
            `"${soundData.title}" a été ajouté à votre panier`,
            {
                icon: '🛒',
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            }
        );

        // Animation d'ajout au panier
        const cartButton = document.querySelector(`#cart-button-${soundData.id}`);
        if (cartButton) {
            cartButton.classList.add('cart-animation');
            setTimeout(() => {
                cartButton.classList.remove('cart-animation');
            }, 1000);
        }
    };

    const handleDownload = async () => {
        if (!token) {
            toast.warning(
                'Connexion requise',
                'Vous devez être connecté pour télécharger un son'
            );
            return;
        }

        if (!soundData.is_free && soundData.price > 0) {
            toast.warning(
                'Son payant',
                'Ce son doit être acheté avant d\'être téléchargé'
            );
            return;
        }

        try {
            setDownloading(true);
            setDownloadProgress(0);

            // Simulation du progress (remplacer par le vrai téléchargement)
            const interval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await axios.get(`/sounds/${id}/download`, {
                responseType: 'blob'
            });

            clearInterval(interval);
            setDownloadProgress(100);

                // Créer un lien de téléchargement
            const blob = new Blob([response.data], { type: 'audio/mpeg' });
                const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${soundData.title}.mp3`;
            document.body.appendChild(a);
            a.click();
                window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Téléchargement', 'Son téléchargé avec succès');
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            toast.error('Erreur', 'Impossible de télécharger le son');
        } finally {
            setDownloading(false);
            setDownloadProgress(0);
        }
    };

    // Fonction pour formater la durée
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    };

    // Fonction pour formater la taille de fichier
    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';

        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

            <Row className="g-4">
                {/* Contenu principal */}
                <Col lg={8}>
                    {/* Informations principales */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Row className="g-0">
                            <Col md={4}>
                                <div className="position-relative">
                                    <img
                                        src={soundData.cover}
                                        alt={soundData.title}
                                        className="w-100 h-100"
                                        style={{
                                            objectFit: 'cover',
                                            minHeight: '250px',
                                            borderRadius: '8px 0 0 8px'
                                        }}
                                    />
                                    <div className="position-absolute top-0 start-0 m-3">
                                        <Badge bg="primary" className="px-3 py-2">
                                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                                            {soundData.category}
                                        </Badge>
                                    </div>
                                    {soundData.is_featured && (
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <Badge bg="warning" text="dark" className="px-3 py-2">
                                                <FontAwesomeIcon icon={faStar} className="me-1" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={8}>
                                <Card.Body className="p-4">
                                    <div className="sound-info">
                                        <h1 className="sound-title mb-2">{soundData.title}</h1>
                                        <div className="sound-meta mb-3">
                                            <Badge bg="light" text="dark" className="me-2">
                                                {soundData.category}
                                            </Badge>
                                            {soundData.genre && (
                                                <Badge bg="outline-secondary" className="me-2">
                                                    {soundData.genre}
                                                </Badge>
                                            )}
                                            <span className="text-muted small">
                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                {formatDuration(soundData.duration_seconds) || soundData.duration || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="sound-stats d-flex gap-3 mb-3">
                                            <span className="text-muted small">
                                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                {soundData.plays || 0} écoutes
                                            </span>
                                            <span className="text-muted small">
                                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                {soundData.downloads || 0} téléchargements
                                            </span>
                                            <span className="text-muted small">
                                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                                {soundData.likes || 0} likes
                                            </span>
                                        </div>
                                    </div>

                                        {/* Tags */}
                                        {soundData.tags && soundData.tags.length > 0 && (
                                    <div className="mb-3">
                                        {soundData.tags.map(tag => (
                                            <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                                        <FontAwesomeIcon icon={faTag} className="me-1" />
                                                        {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                        )}

                                        {/* Actions */}
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                        <Button
                                            variant={isLiked ? "danger" : "outline-danger"}
                                                onClick={handleLike}
                                                disabled={!token}
                                                className="flex-fill"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faHeart}
                                                    className={`me-2 ${isLiked ? 'text-white' : ''}`}
                                                    style={{ color: isLiked ? '#fff' : '#dc3545' }}
                                                />
                                                {isLiked ? 'Aimé' : 'J\'aime'}
                                        </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handleShare}
                                                className="flex-fill"
                                            >
                                                <FontAwesomeIcon icon={faShare} className="me-2" />
                                            Partager
                                        </Button>
                                    </div>

                                        {/* Prix et achat */}
                                        <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                                        <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faEuroSign} className="text-warning me-2 fs-4" />
                                                <span className="fw-bold fs-3 text-warning">
                                                    {soundData.is_free || soundData.price === 0
                                                        ? 'Gratuit'
                                                        : `${soundData.price?.toLocaleString()} FCFA`
                                                    }
                                                </span>
                                            </div>

                                            {downloading && (
                                                <div className="me-3" style={{ minWidth: '200px' }}>
                                                    <div className="d-flex justify-content-between small text-muted mb-1">
                                                        <span>Téléchargement...</span>
                                                        <span>{downloadProgress}%</span>
                                                    </div>
                                                    <ProgressBar now={downloadProgress} size="sm" />
                                                </div>
                                            )}

                                            {soundData.is_free || soundData.price === 0 ? (
                                                <Button
                                                    variant="success"
                                                    size="lg"
                                                    onClick={handleDownload}
                                                    disabled={downloading || !token}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                    {downloading ? 'Téléchargement...' : 'Télécharger Gratuitement'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    onClick={handleAddToCart}
                                                    disabled={!token || isInCart(soundData.id, 'sound')}
                                                >
                                                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                                    {isInCart(soundData.id, 'sound') ? 'Dans le panier' : 'Ajouter au Panier'}
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
                            <h5 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faVolumeUp} className="me-2 text-primary" />
                                Écouter
                            </h5>
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
                                <h5 className="fw-bold mb-3">
                                    <FontAwesomeIcon icon={faFileAudio} className="me-2 text-primary" />
                                    Description
                                </h5>
                                <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                                    {soundData.description}
                                </p>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Informations Techniques Complètes */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faCompactDisc} className="me-2 text-primary" />
                                Informations Techniques
                            </h5>
                            <Row className="g-3">
                                <Col md={6}>
                            <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                            <span className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                                                Durée
                                            </span>
                                            <span className="fw-medium">
                                                {formatDuration(soundData.duration_seconds) || soundData.duration || 'N/A'}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                            <span className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faFileAudio} className="me-2 text-muted" />
                                                Format
                                            </span>
                                            <span className="fw-medium">{soundData.format || 'MP3 320kbps'}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                            <span className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faDownload} className="me-2 text-muted" />
                                                Taille
                                            </span>
                                            <span className="fw-medium">
                                                {soundData.file_size || formatFileSize(soundData.size) || 'N/A'}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                            <span className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                                Date d'ajout
                                            </span>
                                            <span className="fw-medium">
                                                {new Date(soundData.upload_date || soundData.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <ListGroup variant="flush">
                                        {soundData.bpm && (
                                            <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                                <span className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2 text-muted" />
                                                    BPM
                                                </span>
                                                <span className="fw-medium">{soundData.bpm}</span>
                                </ListGroup.Item>
                                        )}
                                        {soundData.key && (
                                            <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                                <span className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faKey} className="me-2 text-muted" />
                                                    Tonalité
                                                </span>
                                                <span className="fw-medium">{soundData.key}</span>
                                </ListGroup.Item>
                                        )}
                                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0">
                                            <span className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faShield} className="me-2 text-muted" />
                                                Licence
                                            </span>
                                            <span className="fw-medium">
                                                {soundData.license_type || 'Standard'}
                                            </span>
                                </ListGroup.Item>
                            </ListGroup>
                                </Col>
                            </Row>

                            {/* Informations légales */}
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="fw-bold mb-2">
                                    <FontAwesomeIcon icon={faCopyright} className="me-2" />
                                    Droits d'utilisation
                                </h6>
                                <Row className="g-2">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon
                                                icon={soundData.commercial_use ? faCheckCircle : faTimesCircle}
                                                className={`me-2 ${soundData.commercial_use ? 'text-success' : 'text-danger'}`}
                                            />
                                            <span className="small">Usage commercial</span>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                                            <span className="small">Usage personnel</span>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                                            <span className="small">Modification autorisée</span>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faTimesCircle} className="me-2 text-danger" />
                                            <span className="small">Revente interdite</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={4}>
                    {/* Suggested Sounds */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faMusic} className="me-2" />
                                Sons Similaires
                            </h6>
                            {suggestedSounds.length > 0 ? (
                                suggestedSounds.map(suggestedSound => (
                                    <div key={suggestedSound.id} className="d-flex align-items-center mb-3 p-2 border rounded hover-shadow">
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
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="text-warning small fw-medium">
                                                    {suggestedSound.is_free || suggestedSound.price === 0
                                                        ? 'Gratuit'
                                                        : `${suggestedSound.price?.toLocaleString()} FCFA`
                                                    }
                                                </div>
                                                <div className="small text-muted">
                                                    <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                    {suggestedSound.downloads || 0}
                                                </div>
                                            </div>
                                    </div>
                                        <Button
                                            as={Link}
                                            to={`/sounds/${suggestedSound.id}`}
                                            variant="outline-primary"
                                            size="sm"
                                            className="ms-2"
                                        >
                                        <FontAwesomeIcon icon={faPlay} />
                                    </Button>
                                </div>
                                ))
                            ) : (
                                <p className="text-muted small">Aucun son similaire trouvé</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SoundDetails;
