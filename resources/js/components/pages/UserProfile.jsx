import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs, Spinner, Alert, ProgressBar, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faMusic, faCalendarAlt, faHeart, faShoppingCart, faCoins,
    faPlay, faDownload, faEye, faUsers, faUserPlus, faTrophy,
    faChartLine, faHistory, faClock, faMapMarkerAlt, faTag, faPause,
    faStepForward, faStepBackward, faVolumeUp, faVolumeMute
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Lecteur audio
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isPreview, setIsPreview] = useState(false);
    const audioRef = useRef(null);

    // Modal pour les détails de paiement
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        loadCompleteProfile();
    }, []);

    // Gestion du lecteur audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            audioRef.current.addEventListener('ended', handleAudioEnded);

            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                    audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    audioRef.current.removeEventListener('ended', handleAudioEnded);
                }
            };
        }
    }, [audioRef.current]);

    const loadCompleteProfile = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/user/complete-profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setProfileData(data);
            } else {
                setError(data.message || 'Erreur lors du chargement du profil');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    // Fonctions du lecteur audio
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);

            // Arrêter après 20s pour les previews
            if (isPreview && audioRef.current.currentTime >= 20) {
                handlePause();
                audioRef.current.currentTime = 0;
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentPlaying(null);
        setCurrentTime(0);
    };

        const handlePlay = async (sound) => {
        try {
            // Vérifier si c'est un son gratuit ou si l'utilisateur l'a acheté
            const canPlayFull = sound.is_free || sound.is_purchased || sound.price === 0;
            setIsPreview(!canPlayFull);

            if (currentPlaying?.id === sound.id) {
                // Même son, toggle play/pause
                if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            } else {
                // Nouveau son
                setCurrentPlaying(sound);
                if (audioRef.current) {
                    // Essayer différentes sources audio
                    const audioUrl = sound.file_url || sound.audio_url || sound.audio_file || sound.file_path || sound.preview_url || sound.url;
                    if (!audioUrl) {
                        console.error('Aucune URL audio disponible pour:', sound);
                        alert('Fichier audio non disponible');
                        return;
                    }
                    audioRef.current.src = audioUrl;
                    audioRef.current.currentTime = 0;
                    await audioRef.current.play();
                    setIsPlaying(true);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
            alert('Erreur lors de la lecture du fichier audio');
        }
    };

    const handleDownload = async (sound) => {
        try {
            // Vérifier si l'utilisateur peut télécharger
            if (!sound.is_purchased && !sound.is_free && sound.price > 0) {
                alert('Vous devez acheter ce son pour le télécharger');
                return;
            }

            const downloadUrl = sound.download_url || sound.file_url || sound.audio_url || sound.audio_file || sound.file_path;
            if (!downloadUrl) {
                alert('Fichier de téléchargement non disponible');
                return;
            }

            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${sound.title} - ${sound.artist}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optionnel : Enregistrer le téléchargement via API
            try {
                await fetch('/api/sounds/track-download', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sound_id: sound.id })
                });
            } catch (err) {
                console.log('Erreur lors de l\'enregistrement du téléchargement:', err);
            }
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement');
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (e) => {
        if (audioRef.current && !isPreview) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            audioRef.current.currentTime = newTime;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'published': { variant: 'success', text: 'Publié' },
            'pending': { variant: 'warning', text: 'En attente' },
            'draft': { variant: 'secondary', text: 'Brouillon' },
            'rejected': { variant: 'danger', text: 'Rejeté' },
            'completed': { variant: 'success', text: 'Complété' },
            'failed': { variant: 'danger', text: 'Échoué' },
            'refunded': { variant: 'warning', text: 'Remboursé' }
        };

        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const showPaymentDetails = async (sound) => {
        try {
            // Si c'est déjà un objet de paiement complet
            if (sound.transaction_id || sound.payment_id) {
                setSelectedPayment(sound);
                setShowPaymentModal(true);
                return;
            }

            // Sinon, récupérer les détails de paiement depuis l'API
            const response = await fetch(`/api/user/sound/${sound.id}/payment-details`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const paymentData = await response.json();
                setSelectedPayment(paymentData.payment);
                setShowPaymentModal(true);
            } else {
                // Créer un objet de paiement factice pour affichage
                const mockPayment = {
                    transaction_id: sound.purchase_id || `TXN-${sound.id}-${Date.now()}`,
                    payment_method: 'card',
                    status: 'completed',
                    amount: sound.price_paid || sound.price || 0,
                    paid_at: sound.purchase_date || sound.created_at,
                    type: 'sound',
                    sound: sound
                };
                setSelectedPayment(mockPayment);
                setShowPaymentModal(true);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            // Fallback avec données disponibles
            const fallbackPayment = {
                transaction_id: `TXN-${sound.id}`,
                payment_method: 'Inconnu',
                status: 'completed',
                amount: sound.price_paid || sound.price || 0,
                paid_at: sound.purchase_date || sound.created_at,
                type: 'sound',
                sound: sound
            };
            setSelectedPayment(fallbackPayment);
            setShowPaymentModal(true);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du profil...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Aucune donnée de profil disponible</Alert>
            </Container>
        );
    }

    const { user: userData, general_stats, detailed_stats, purchased_sounds, purchased_events, favorite_sounds, my_creations, my_events, recent_activity } = profileData;

    return (
        <Container fluid className="py-4">
            {/* Audio player caché */}
            <audio ref={audioRef} style={{ display: 'none' }} />

            {/* En-tête du profil */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col md={2} className="text-center">
                                    <img
                                        src={userData.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=120`}
                                        alt={userData.name}
                                        className="rounded-circle"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    />
                                </Col>
                                <Col md={6}>
                                    <h2 className="mb-2">{userData.name}</h2>
                                    <p className="text-muted mb-2">
                                        <FontAwesomeIcon icon={faUser} className="me-2" />
                                        {userData.role === 'artist' ? 'Artiste' :
                                         userData.role === 'producer' ? 'Producteur' :
                                         userData.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                    </p>
                                    {userData.location && (
                                        <p className="text-muted mb-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            {userData.location}
                                        </p>
                                    )}
                                    {userData.bio && (
                                        <p className="mb-3">{userData.bio}</p>
                                    )}
                                    <small className="text-muted">
                                        Membre depuis {formatDate(userData.created_at)}
                                    </small>
                                </Col>
                                <Col md={4}>
                                    <Row className="text-center">
                                        <Col>
                                            <h4 className="text-primary mb-0">{general_stats.total_listens || 0}</h4>
                                            <small className="text-muted">Écoutes</small>
                                        </Col>
                                        <Col>
                                            <h4 className="text-success mb-0">{general_stats.total_downloads || 0}</h4>
                                            <small className="text-muted">Téléchargements</small>
                                        </Col>
                                        <Col>
                                            <h4 className="text-info mb-0">{Math.floor((general_stats.total_listen_time || 0) / 60)}</h4>
                                            <small className="text-muted">Minutes d'écoute</small>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Lecteur audio intégré */}
            {currentPlaying && (
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Card.Body className="text-white">
                                <Row className="align-items-center">
                                    <Col md={2}>
                                        <img
                                            src={currentPlaying.cover_image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop"}
                                            alt={currentPlaying.title}
                                            className="rounded"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="mb-1 text-white">{currentPlaying.title}</h6>
                                        <p className="mb-2 small opacity-75">{currentPlaying.artist}</p>
                                        {isPreview && (
                                            <Badge bg="warning" className="mb-2">
                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                Aperçu 20s
                                            </Badge>
                                        )}
                                        <div className="d-flex align-items-center">
                                            <span className="small me-2">{formatDuration(currentTime)}</span>
                                            <div
                                                className="progress flex-grow-1 me-2"
                                                style={{ height: '6px', cursor: !isPreview ? 'pointer' : 'default' }}
                                                onClick={handleSeek}
                                            >
                                                <div
                                                    className="progress-bar bg-light"
                                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="small">{formatDuration(isPreview ? 20 : duration)}</span>
                                        </div>
                                    </Col>
                                    <Col md={4} className="text-center">
                                        <Button
                                            variant="light"
                                            size="lg"
                                            className="rounded-circle me-2"
                                            onClick={() => handlePlay(currentPlaying)}
                                            style={{ width: '50px', height: '50px' }}
                                        >
                                            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            className="rounded-circle"
                                            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                                        >
                                            <FontAwesomeIcon icon={volume === 0 ? faVolumeMute : faVolumeUp} />
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Statistiques rapides */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-primary mb-3" />
                            <h4 className="text-primary">{formatCurrency(general_stats.total_spent || 0)}</h4>
                            <p className="text-muted mb-0">Total dépensé</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faHeart} size="2x" className="text-danger mb-3" />
                            <h4 className="text-danger">{detailed_stats?.favorites?.sounds_count || 0}</h4>
                            <p className="text-muted mb-0">Sons favoris</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-warning mb-3" />
                            <h4 className="text-warning">{detailed_stats?.purchases?.events?.count || 0}</h4>
                            <p className="text-muted mb-0">Événements achetés</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPlay} size="2x" className="text-success mb-3" />
                            <h4 className="text-success">{detailed_stats?.activity?.sessions_count || 0}</h4>
                            <p className="text-muted mb-0">Sessions d'écoute</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Onglets de contenu */}
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="overview" title={<><FontAwesomeIcon icon={faChartLine} className="me-2" />Vue d'ensemble</>}>
                    <Row>
                        {/* Activité récente */}
                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faHistory} className="me-2" />
                                        Activité récente
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {recent_activity.recent_purchases.length > 0 ? (
                                        recent_activity.recent_purchases.map((purchase, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h6 className="mb-1">{purchase.product_name}</h6>
                                                    <small className="text-muted">
                                                        {purchase.type === 'sound' ? 'Son' : 'Événement'} • {formatDate(purchase.date)}
                                                    </small>
                                                </div>
                                                <Badge bg="success">{formatCurrency(purchase.amount)}</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted text-center">Aucun achat récent</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Catégories préférées */}
                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faTag} className="me-2" />
                                        Catégories préférées
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {recent_activity.favorite_categories && recent_activity.favorite_categories.length > 0 ? (
                                        recent_activity.favorite_categories.map((category, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h6 className="mb-1">{category.name}</h6>
                                                    <small className="text-muted">{category.listen_count} écoutes</small>
                                                </div>
                                                <div>
                                                    <Badge bg="primary">{category.percentage}%</Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-3">
                                            <FontAwesomeIcon icon={faTag} size="2x" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">Commencez à écouter pour voir vos préférences</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Statistiques détaillées */}
                    <Row>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                                        Activité d'écoute
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Cette semaine</span>
                                            <strong>{detailed_stats?.activity?.weekly_listens || 0} écoutes</strong>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((detailed_stats?.activity?.weekly_listens || 0) / 50 * 100, 100)}
                                            variant="primary"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Ce mois</span>
                                            <strong>{detailed_stats?.activity?.monthly_listens || 0} écoutes</strong>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((detailed_stats?.activity?.monthly_listens || 0) / 200 * 100, 100)}
                                            variant="success"
                                        />
                                    </div>
                                    <hr />
                                    <Row className="text-center">
                                        <Col>
                                            <h6 className="text-primary">{Math.floor((detailed_stats?.activity?.avg_session_duration || 0) / 60)}</h6>
                                            <small className="text-muted">Min/session</small>
                                        </Col>
                                        <Col>
                                            <h6 className="text-success">{detailed_stats?.activity?.favorite_genre || 'Aucun'}</h6>
                                            <small className="text-muted">Genre préféré</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                        Mes achats
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Sons achetés</span>
                                            <strong>{detailed_stats?.purchases?.sounds?.count || 0}</strong>
                                        </div>
                                        <small className="text-muted">
                                            {detailed_stats?.purchases?.sounds?.free_count || 0} gratuits • {detailed_stats?.purchases?.sounds?.paid_count || 0} payants
                                        </small>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Événements</span>
                                            <strong>{detailed_stats?.purchases?.events?.count || 0}</strong>
                                        </div>
                                        <small className="text-muted">
                                            {detailed_stats?.purchases?.events?.upcoming_count || 0} à venir • {detailed_stats?.purchases?.events?.past_count || 0} passés
                                        </small>
                                    </div>
                                    <hr />
                                    <Row className="text-center">
                                        <Col>
                                            <h6 className="text-primary">{formatCurrency((detailed_stats?.purchases?.sounds?.total_spent || 0) + (detailed_stats?.purchases?.events?.total_spent || 0))}</h6>
                                            <small className="text-muted">Total dépensé</small>
                                        </Col>
                                        <Col>
                                            <h6 className="text-success">{detailed_stats?.purchases?.sounds?.downloads_count || 0}</h6>
                                            <small className="text-muted">Téléchargements</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="purchased" title={<><FontAwesomeIcon icon={faShoppingCart} className="me-2" />Mes achats</>}>
                    <Tabs defaultActiveKey="sounds" className="mb-3">
                        <Tab eventKey="sounds" title={<><FontAwesomeIcon icon={faMusic} className="me-2" />Sons ({purchased_sounds.length})</>}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Sons achetés</h5>
                                    <Badge bg="primary">{formatCurrency(detailed_stats.purchases.sounds.total_spent)}</Badge>
                                </Card.Header>
                                <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {purchased_sounds.length > 0 ? (
                                        purchased_sounds.map((sound) => (
                                            <div key={sound.id} className="d-flex align-items-center mb-3 p-3 border rounded position-relative">
                                                <img
                                                    src={sound.cover_image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop`}
                                                    alt={sound.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                {currentPlaying?.id === sound.id && (
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-10 rounded"></div>
                                                )}
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-1 small">par {sound.artist}</p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <small className="text-muted d-block">
                                                                {formatDate(sound.purchase_date)}
                                                            </small>
                                                            <small className="text-muted">
                                                                {formatCurrency(sound.price_paid)} • {formatDuration(sound.duration)}
                                                            </small>
                                                        </div>
                                                                                                                <div>
                                                            <Button
                                                                size="sm"
                                                                variant={currentPlaying?.id === sound.id && isPlaying ? "primary" : "outline-primary"}
                                                                className="me-1"
                                                                onClick={() => handlePlay({...sound, is_purchased: true})}
                                                                title="Écouter"
                                                            >
                                                                <FontAwesomeIcon icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-success"
                                                                className="me-1"
                                                                onClick={() => handleDownload(sound)}
                                                                title="Télécharger"
                                                            >
                                                                <FontAwesomeIcon icon={faDownload} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-info"
                                                                onClick={() => showPaymentDetails(sound)}
                                                                title="Détails d'achat"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                                            <p className="text-muted">Aucun son acheté</p>
                                            <Button as={Link} to="/catalog" variant="primary">
                                                Découvrir des sons
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="events" title={<><FontAwesomeIcon icon={faCalendarAlt} className="me-2" />Événements ({purchased_events.length})</>}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Événements achetés</h5>
                                    <Badge bg="warning">{formatCurrency(detailed_stats.purchases.events.total_spent)}</Badge>
                                </Card.Header>
                                <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {purchased_events.length > 0 ? (
                                        purchased_events.map((event) => (
                                            <div key={event.id} className="d-flex align-items-center mb-3 p-3 border rounded">
                                                <img
                                                    src={event.cover_image || `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=60&h=60&fit=crop`}
                                                    alt={event.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="mb-1">{event.title}</h6>
                                                        <Badge bg={event.is_upcoming ? 'success' : 'secondary'}>
                                                            {event.is_upcoming ? 'À venir' : 'Passé'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted mb-1 small">par {event.organizer}</p>
                                                    <p className="text-muted mb-2 small">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                        {formatDate(event.event_date)}
                                                        {event.location && (
                                                            <>
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="ms-3 me-1" />
                                                                {event.location}
                                                            </>
                                                        )}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <small className="text-muted d-block">
                                                                Acheté le {formatDate(event.purchase_date)}
                                                            </small>
                                                            <small className="text-success fw-bold">
                                                                {formatCurrency(event.price_paid)}
                                                            </small>
                                                        </div>
                                                        <div>
                                                            <Button
                                                                as={Link}
                                                                to={`/event/${event.id}`}
                                                                size="sm"
                                                                variant="outline-primary"
                                                                className="me-1"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                Voir
                                                            </Button>
                                                                                                                        <Button
                                                                size="sm"
                                                                variant="outline-info"
                                                                onClick={() => showPaymentDetails(event)}
                                                                title="Voir le ticket"
                                                            >
                                                                Ticket
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-muted mb-3" />
                                            <p className="text-muted">Aucun événement acheté</p>
                                            <Button as={Link} to="/events" variant="warning">
                                                Découvrir des événements
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Tab>

                <Tab eventKey="favorites" title={<><FontAwesomeIcon icon={faHeart} className="me-2" />Favoris</>}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Sons favoris</h5>
                            <div>
                                <Badge bg="success" className="me-2">
                                    {favorite_sounds.filter(s => s.is_free).length} gratuits
                                </Badge>
                                <Badge bg="primary">
                                    {favorite_sounds.filter(s => !s.is_free).length} payants
                                </Badge>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {favorite_sounds.length > 0 ? (
                                    favorite_sounds.map((sound) => (
                                        <Col md={6} lg={4} key={sound.id} className="mb-4">
                                            <Card className={`h-100 border-0 shadow-sm ${currentPlaying?.id === sound.id ? 'border-primary border-2' : ''}`}>
                                                <div className="position-relative">
                                                    <Card.Img
                                                        variant="top"
                                                        src={sound.cover_image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop`}
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                    {currentPlaying?.id === sound.id && isPlaying && (
                                                        <div className="position-absolute top-50 start-50 translate-middle">
                                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                                <FontAwesomeIcon icon={faPlay} className="text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!sound.is_free && !sound.is_purchased && (
                                                        <div className="position-absolute top-0 end-0 m-2">
                                                            <Badge bg="warning">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                20s
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <Card.Body className="d-flex flex-column">
                                                    <div className="flex-grow-1">
                                                        <Card.Title className="h6">{sound.title}</Card.Title>
                                                        <Card.Text className="text-muted small">
                                                            par {sound.artist}
                                                        </Card.Text>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <small className="text-muted">
                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                {formatDuration(sound.duration)}
                                                            </small>
                                                            <Badge bg={sound.is_free ? 'success' : 'primary'}>
                                                                {sound.is_free ? 'Gratuit' : formatCurrency(sound.price)}
                                                            </Badge>
                                                        </div>
                                                        {sound.category && (
                                                            <div className="mb-2">
                                                                <Badge bg="secondary" className="small">
                                                                    <FontAwesomeIcon icon={faTag} className="me-1" />
                                                                    {sound.category}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={currentPlaying?.id === sound.id && isPlaying ? "primary" : "outline-primary"}
                                                            className="flex-grow-1"
                                                            onClick={() => handlePlay(sound)}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                                                className="me-1"
                                                            />
                                                            {sound.is_free || sound.is_purchased ? 'Écouter' : 'Aperçu'}
                                                        </Button>
                                                        {sound.is_purchased && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline-success"
                                                                onClick={() => handleDownload(sound)}
                                                                title="Télécharger"
                                                            >
                                                                <FontAwesomeIcon icon={faDownload} />
                                                            </Button>
                                                        )}
                                                        {!sound.is_free && !sound.is_purchased && (
                                                            <Button
                                                                as={Link}
                                                                to={`/sound/${sound.id}`}
                                                                size="sm"
                                                                variant="outline-warning"
                                                            >
                                                                <FontAwesomeIcon icon={faShoppingCart} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faHeart} size="3x" className="text-muted mb-3" />
                                            <p className="text-muted">Aucun son en favori</p>
                                            <p className="small text-muted mb-3">
                                                Ajoutez des sons à vos favoris pour les retrouver facilement
                                            </p>
                                            <Button as={Link} to="/catalog" variant="outline-primary">
                                                <FontAwesomeIcon icon={faMusic} className="me-2" />
                                                Parcourir le catalogue
                                            </Button>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="stats" title={<><FontAwesomeIcon icon={faChartLine} className="me-2" />Statistiques</>}>
                    <Row>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faClock} className="me-2" />
                                        Temps d'écoute
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Aujourd'hui</span>
                                            <strong>{Math.floor((detailed_stats?.activity?.daily_listen_time || 0) / 60)} min</strong>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((detailed_stats?.activity?.daily_listen_time || 0) / 120 * 100, 100)}
                                            variant="info"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Cette semaine</span>
                                            <strong>{Math.floor((detailed_stats?.activity?.weekly_listen_time || 0) / 60)} min</strong>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((detailed_stats?.activity?.weekly_listen_time || 0) / 840 * 100, 100)}
                                            variant="primary"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Ce mois</span>
                                            <strong>{Math.floor((detailed_stats?.activity?.monthly_listen_time || 0) / 60)} min</strong>
                                        </div>
                                        <ProgressBar
                                            now={Math.min((detailed_stats?.activity?.monthly_listen_time || 0) / 3600 * 100, 100)}
                                            variant="success"
                                        />
                                    </div>
                                    <hr />
                                    <div className="text-center">
                                        <h6 className="text-primary">{Math.floor((detailed_stats?.activity?.total_listen_time || 0) / 3600)}</h6>
                                        <small className="text-muted">Heures totales d'écoute</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faHistory} className="me-2" />
                                        Historique d'utilisation
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Connexions ce mois</span>
                                            <strong>{detailed_stats?.activity?.monthly_sessions || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Sons découverts</span>
                                            <strong>{detailed_stats?.activity?.discovered_sounds || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Artistes suivis</span>
                                            <strong>{detailed_stats?.activity?.followed_artists || 0}</strong>
                                        </div>
                                    </div>
                                    <hr />
                                    <Row className="text-center">
                                        <Col>
                                            <h6 className="text-warning">{detailed_stats?.activity?.streak_days || 0}</h6>
                                            <small className="text-muted">Jours consécutifs</small>
                                        </Col>
                                        <Col>
                                            <h6 className="text-info">{formatDate(detailed_stats?.activity?.last_active || userData.created_at)}</h6>
                                            <small className="text-muted">Dernière activité</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0">
                                    <h5 className="mb-0">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                        Réalisations
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3} className="text-center mb-3">
                                            <div className="achievement-badge p-3 rounded">
                                                <FontAwesomeIcon icon={faMusic} size="2x" className="text-primary mb-2" />
                                                <h6 className="mb-1">Mélomane</h6>
                                                <small className="text-muted">100+ écoutes</small>
                                                <div className="mt-2">
                                                    {(detailed_stats?.activity?.total_listens || 0) >= 100 ?
                                                        <Badge bg="success">Débloqué</Badge> :
                                                        <Badge bg="secondary">Verrouillé</Badge>
                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center mb-3">
                                            <div className="achievement-badge p-3 rounded">
                                                <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-warning mb-2" />
                                                <h6 className="mb-1">Collectionneur</h6>
                                                <small className="text-muted">10+ achats</small>
                                                <div className="mt-2">
                                                    {((detailed_stats?.purchases?.sounds?.count || 0) + (detailed_stats?.purchases?.events?.count || 0)) >= 10 ?
                                                        <Badge bg="success">Débloqué</Badge> :
                                                        <Badge bg="secondary">Verrouillé</Badge>
                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center mb-3">
                                            <div className="achievement-badge p-3 rounded">
                                                <FontAwesomeIcon icon={faHeart} size="2x" className="text-danger mb-2" />
                                                <h6 className="mb-1">Passionné</h6>
                                                <small className="text-muted">50+ favoris</small>
                                                <div className="mt-2">
                                                    {(detailed_stats?.favorites?.sounds_count || 0) >= 50 ?
                                                        <Badge bg="success">Débloqué</Badge> :
                                                        <Badge bg="secondary">Verrouillé</Badge>
                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center mb-3">
                                            <div className="achievement-badge p-3 rounded">
                                                <FontAwesomeIcon icon={faClock} size="2x" className="text-success mb-2" />
                                                <h6 className="mb-1">Assidu</h6>
                                                <small className="text-muted">7 jours consécutifs</small>
                                                <div className="mt-2">
                                                    {(detailed_stats?.activity?.streak_days || 0) >= 7 ?
                                                        <Badge bg="success">Débloqué</Badge> :
                                                        <Badge bg="secondary">Verrouillé</Badge>
                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>

            {/* Modal pour les détails de paiement */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        Détails du paiement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="mb-3">Informations de transaction</h6>
                                            <div className="mb-2">
                                                <strong>ID Transaction:</strong>
                                                <br />
                                                <code className="small">{selectedPayment.transaction_id || 'N/A'}</code>
                                            </div>
                                            <div className="mb-2">
                                                <strong>Méthode:</strong> {selectedPayment.payment_method || 'Carte bancaire'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Statut:</strong> {getStatusBadge(selectedPayment.status || 'completed')}
                                            </div>
                                            <div>
                                                <strong>Date:</strong> {formatDate(selectedPayment.paid_at || selectedPayment.purchase_date || selectedPayment.created_at)}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="mb-3">Détails financiers</h6>
                                            <div className="mb-2">
                                                <strong>Montant total:</strong>
                                                <br />
                                                <span className="h5 text-primary">{formatCurrency(selectedPayment.amount || selectedPayment.price_paid || selectedPayment.price || 0)}</span>
                                            </div>
                                            {selectedPayment.commission_amount && (
                                                <div className="mb-2">
                                                    <strong>Commission:</strong> {formatCurrency(selectedPayment.commission_amount)}
                                                    <small className="text-muted"> ({selectedPayment.commission_rate}%)</small>
                                                </div>
                                            )}
                                            {selectedPayment.seller_amount && (
                                                <div>
                                                    <strong>Montant vendeur:</strong> {formatCurrency(selectedPayment.seller_amount)}
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {(selectedPayment.type === 'event' || selectedPayment.event_date) && (selectedPayment.event || selectedPayment) && (
                                <Card className="border-0 bg-primary bg-opacity-10">
                                    <Card.Body>
                                        <h6 className="text-primary mb-3">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Informations de l'événement
                                        </h6>
                                        <Row>
                                            <Col md={3}>
                                                <img
                                                    src={(selectedPayment.event?.cover_image || selectedPayment.cover_image) || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=100&h=100&fit=crop"}
                                                    alt={(selectedPayment.event?.title || selectedPayment.title)}
                                                    className="rounded w-100"
                                                />
                                            </Col>
                                            <Col md={9}>
                                                <h6>{selectedPayment.event?.title || selectedPayment.title}</h6>
                                                <p className="text-muted mb-1">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                    {formatDate(selectedPayment.event?.event_date || selectedPayment.event_date)}
                                                </p>
                                                {(selectedPayment.event?.location || selectedPayment.location) && (
                                                    <p className="text-muted mb-1">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                        {selectedPayment.event?.location || selectedPayment.location}
                                                    </p>
                                                )}
                                                <Badge bg={(selectedPayment.event?.is_upcoming ?? selectedPayment.is_upcoming) ? 'success' : 'secondary'}>
                                                    {(selectedPayment.event?.is_upcoming ?? selectedPayment.is_upcoming) ? 'À venir' : 'Passé'}
                                                </Badge>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {(selectedPayment.type === 'sound' || selectedPayment.duration || selectedPayment.artist) && (selectedPayment.sound || selectedPayment) && (
                                <Card className="border-0 bg-success bg-opacity-10">
                                    <Card.Body>
                                        <h6 className="text-success mb-3">
                                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                                            Informations du son
                                        </h6>
                                        <Row>
                                            <Col md={3}>
                                                <img
                                                    src={(selectedPayment.sound?.cover_image || selectedPayment.cover_image) || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"}
                                                    alt={(selectedPayment.sound?.title || selectedPayment.title)}
                                                    className="rounded w-100"
                                                />
                                            </Col>
                                            <Col md={9}>
                                                <h6>{selectedPayment.sound?.title || selectedPayment.title}</h6>
                                                <p className="text-muted mb-1">
                                                    par {selectedPayment.sound?.artist || selectedPayment.artist}
                                                </p>
                                                <p className="text-muted mb-1">
                                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                                    {formatDuration(selectedPayment.sound?.duration || selectedPayment.duration)}
                                                </p>
                                                {(selectedPayment.sound?.category || selectedPayment.category) && (
                                                    <Badge bg="secondary">
                                                        {selectedPayment.sound?.category || selectedPayment.category}
                                                    </Badge>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Fermer
                    </Button>
                    {(selectedPayment?.type === 'sound' || selectedPayment?.duration || selectedPayment?.artist) && (
                        <Button variant="primary" onClick={() => handlePlay(selectedPayment.sound || selectedPayment)}>
                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                            Écouter
                        </Button>
                    )}
                    {(selectedPayment?.type === 'sound' || selectedPayment?.duration || selectedPayment?.artist) && (
                        <Button variant="success" className="ms-2" onClick={() => handleDownload(selectedPayment.sound || selectedPayment)}>
                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                            Télécharger
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserProfile;
