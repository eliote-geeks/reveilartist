import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Tab, Tabs, ProgressBar, ListGroup, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrophy,
    faMusic,
    faClock,
    faUsers,
    faCoins,
    faPlay,
    faStop,
    faPause,
    faArrowLeft,
    faShare,
    faHeart,
    faCheck,
    faLightbulb,
    faMicrophone,
    faHeadphones,
    faVolumeUp,
    faCrown,
    faFire,
    faCalendarAlt,
    faMapMarkerAlt,
    faEye,
    faThumbsUp,
    faComment,
    faDownload,
    faStar,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const CompetitionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeLeft, setTimeLeft] = useState('');
    const [isLive, setIsLive] = useState(false);

    const toast = useToast();
    const { token, user } = useAuth();

    // Données de démonstration étendues
    const mockCompetition = {
        id: 1,
        title: "Battle de Rap Camerounais",
        description: "Compétition de rap freestyle en direct. Montrez votre talent et remportez la cagnotte ! Cette compétition met en avant le talent local camerounais et encourage la créativité dans le rap français et en langues locales.",
        artist: "MC Thunder",
        artist_id: 15,
        artist_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face",
        artist_bio: "MC Thunder est un rappeur camerounais reconnu avec plus de 10 ans d'expérience dans la scène hip-hop locale.",
        category: "Rap",
        entry_fee: 5000,
        prize_pool: 150000,
        max_participants: 20,
        current_participants: 15,
        status: "registration", // registration, active, completed
        start_time: "2024-01-20T20:00:00",
        end_time: "2024-01-20T22:00:00",
        duration: 120, // minutes
        rules: [
            "Performance de 3 minutes maximum par participant",
            "Thème libre ou imposé selon les rounds",
            "Pas de contenu offensant ou discriminatoire",
            "Jugement par le public en direct via votes",
            "Respect total des autres participants",
            "Utilisation d'instrumentales libres de droits uniquement"
        ],
        prizes: [
            { position: 1, amount: 75000, percentage: 50 },
            { position: 2, amount: 45000, percentage: 30 },
            { position: 3, amount: 30000, percentage: 20 }
        ],
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300&h=200&fit=crop"
        ],
        created_at: "2024-01-15T10:00:00",
        participants: [
            {
                id: 1,
                name: "Rap Master CM",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
                joined_at: "2024-01-16T14:30:00",
                status: "registered"
            },
            {
                id: 2,
                name: "Flow Princess",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=50&h=50&fit=crop&crop=face",
                joined_at: "2024-01-16T15:45:00",
                status: "registered"
            },
            {
                id: 3,
                name: "Freestyle King",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
                joined_at: "2024-01-17T09:15:00",
                status: "registered"
            }
        ],
        judge_criteria: [
            { name: "Flow et rythme", weight: 30 },
            { name: "Originalité des paroles", weight: 25 },
            { name: "Présence scénique", weight: 20 },
            { name: "Technique vocale", weight: 15 },
            { name: "Connexion avec le public", weight: 10 }
        ],
        featured: true,
        live_stream_url: null,
        chat_enabled: true,
        voting_enabled: true
    };

    useEffect(() => {
        loadCompetition();
    }, [id]);

    useEffect(() => {
        // Timer pour le compte à rebours
        const timer = setInterval(() => {
            if (competition) {
                updateTimeLeft();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [competition]);

    const loadCompetition = async () => {
        try {
            setLoading(true);
            // Simuler un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCompetition(mockCompetition);
        } catch (error) {
            console.error('Erreur lors du chargement de la compétition:', error);
            toast.error('Erreur', 'Compétition non trouvée');
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const updateTimeLeft = () => {
        if (!competition) return;

        const now = new Date();
        const start = new Date(competition.start_time);
        const end = new Date(competition.end_time);

        if (now >= start && now <= end) {
            setIsLive(true);
            const diff = end - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else if (now < start) {
            setIsLive(false);
            const diff = start - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}j ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        } else {
            setTimeLeft('Terminé');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'registration':
                return <Badge bg="primary" className="fs-6"><FontAwesomeIcon icon={faClock} className="me-1" />Inscriptions ouvertes</Badge>;
            case 'active':
                return <Badge bg="success" className="fs-6"><FontAwesomeIcon icon={faPlay} className="me-1" />En cours</Badge>;
            case 'completed':
                return <Badge bg="secondary" className="fs-6"><FontAwesomeIcon icon={faTrophy} className="me-1" />Terminé</Badge>;
            default:
                return <Badge bg="light">Inconnu</Badge>;
        }
    };

    const handleJoinCompetition = () => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour participer');
            return;
        }
        setShowJoinModal(true);
    };

    const confirmJoinCompetition = () => {
        toast.success('Inscription confirmée', `Vous êtes inscrit à "${competition.title}"`);
        setShowJoinModal(false);
        // Ici on ferait l'appel API pour s'inscrire
    };

    const handleUploadEntry = () => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour soumettre');
            return;
        }
        setShowUploadModal(true);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!competition) {
        return (
            <Container className="py-5 text-center">
                <h3>Compétition non trouvée</h3>
                <Button as={Link} to="/competitions" variant="primary">
                    Retour aux compétitions
                </Button>
            </Container>
        );
    }

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Hero Section */}
            <div className="competition-hero" style={{ backgroundImage: `url(${competition.image})` }}>
                <div className="competition-hero-overlay">
                    <Container>
                        <div className="py-5">
                            <Row className="align-items-center">
                                <Col lg={8}>
                                    <AnimatedElement animation="slideInLeft" delay={100}>
                                        <Button
                                            as={Link}
                                            to="/competitions"
                                            variant="outline-light"
                                            className="mb-3"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                            Retour aux compétitions
                                        </Button>

                                        <div className="mb-3">
                                            {getStatusBadge(competition.status)}
                                            {competition.featured && (
                                                <Badge bg="warning" text="dark" className="ms-2 fs-6">
                                                    <FontAwesomeIcon icon={faStar} className="me-1" />
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>

                                        <h1 className="display-4 fw-bold mb-3 text-white">
                                            {competition.title}
                                        </h1>

                                        <div className="d-flex align-items-center mb-3">
                                            <img
                                                src={competition.artist_avatar}
                                                alt={competition.artist}
                                                className="rounded-circle me-3"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <h5 className="text-white mb-0">{competition.artist}</h5>
                                                <small className="text-light">Organisateur de la compétition</small>
                                            </div>
                                        </div>

                                        <p className="lead text-light mb-4">
                                            {competition.description}
                                        </p>
                                    </AnimatedElement>
                                </Col>
                                <Col lg={4}>
                                    <AnimatedElement animation="slideInRight" delay={200}>
                                        <Card className="competition-info-card border-0 shadow-lg">
                                            <Card.Body className="text-center p-4">
                                                <div className="mb-3">
                                                    <FontAwesomeIcon icon={faTrophy} size="3x" className="text-warning mb-2" />
                                                    <h3 className="fw-bold text-primary mb-0">
                                                        {formatCurrency(competition.prize_pool)}
                                                    </h3>
                                                    <small className="text-muted">Cagnotte totale</small>
                                                </div>

                                                <div className="row g-2 mb-3 small">
                                                    <div className="col-6">
                                                        <div className="bg-light rounded p-2">
                                                            <FontAwesomeIcon icon={faCoins} className="text-primary" />
                                                            <div>{formatCurrency(competition.entry_fee)}</div>
                                                            <small className="text-muted">Inscription</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="bg-light rounded p-2">
                                                            <FontAwesomeIcon icon={faUsers} className="text-primary" />
                                                            <div>{competition.current_participants}/{competition.max_participants}</div>
                                                            <small className="text-muted">Participants</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isLive ? (
                                                    <div className="mb-3">
                                                        <div className="bg-primary text-white rounded p-3">
                                                            <FontAwesomeIcon icon={faClock} className="mb-2" />
                                                            <div className="h4 mb-0">{timeLeft}</div>
                                                            <small>avant le début</small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-3">
                                                        <div className="bg-success text-white rounded p-3">
                                                            <FontAwesomeIcon icon={faPlay} className="mb-2" />
                                                            <div className="h4 mb-0">EN DIRECT</div>
                                                            <small>Temps restant: {timeLeft}</small>
                                                        </div>
                                                    </div>
                                                )}

                                                {competition.status === 'registration' && (
                                                    <Button
                                                        variant="primary"
                                                        size="lg"
                                                        className="w-100 fw-bold"
                                                        onClick={handleJoinCompetition}
                                                        disabled={competition.current_participants >= competition.max_participants}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                                                        {competition.current_participants >= competition.max_participants ? 'Complet' : 'Participer'}
                                                    </Button>
                                                )}

                                                {competition.status === 'active' && (
                                                    <div className="d-grid gap-2">
                                                        <Button
                                                            variant="success"
                                                            size="lg"
                                                            as={Link}
                                                            to={`/competitions/${competition.id}/live`}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} className="me-2" />
                                                            Regarder en direct
                                                        </Button>
                                                        <Button
                                                            variant="outline-primary"
                                                            onClick={handleUploadEntry}
                                                        >
                                                            <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                                                            Soumettre ma performance
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </div>
            </div>

            {/* Contenu principal */}
            <Container className="py-4">
                <AnimatedElement animation="slideInUp" delay={400}>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        {/* Onglet Vue d'ensemble */}
                        <Tab eventKey="overview" title={
                            <span>
                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                Vue d'ensemble
                            </span>
                        }>
                            <Row className="g-4">
                                <Col lg={8}>
                                    <Card className="border-0 shadow-sm mb-4">
                                        <Card.Header className="bg-white border-0 py-3">
                                            <h5 className="mb-0 fw-bold">
                                                <FontAwesomeIcon icon={faLightbulb} className="me-2 text-primary" />
                                                Règles de la compétition
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <ListGroup variant="flush">
                                                {competition.rules.map((rule, index) => (
                                                    <ListGroup.Item key={index} className="border-0 px-0">
                                                        <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                                                        {rule}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>

                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white border-0 py-3">
                                            <h5 className="mb-0 fw-bold">
                                                <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                                Répartition des prix
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {competition.prizes.map((prize, index) => (
                                                <div key={index} className="d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded">
                                                    <div className="d-flex align-items-center">
                                                        <div className={`prize-medal me-3 ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {index + 1}ère place</h6>
                                                            <small className="text-muted">{prize.percentage}% de la cagnotte</small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <h5 className="mb-0 text-primary fw-bold">{formatCurrency(prize.amount)}</h5>
                                                    </div>
                                                </div>
                                            ))}
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col lg={4}>
                                    <Card className="border-0 shadow-sm mb-4">
                                        <Card.Header className="bg-white border-0 py-3">
                                            <h5 className="mb-0 fw-bold">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                                Informations
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <small className="text-muted">Début</small>
                                                <div className="fw-bold">{formatDateTime(competition.start_time)}</div>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted">Durée</small>
                                                <div className="fw-bold">{competition.duration} minutes</div>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted">Catégorie</small>
                                                <div className="fw-bold">{competition.category}</div>
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted">Places disponibles</small>
                                                <div className="fw-bold">
                                                    {competition.max_participants - competition.current_participants}
                                                    <small className="text-muted"> / {competition.max_participants}</small>
                                                </div>
                                                <ProgressBar
                                                    now={(competition.current_participants / competition.max_participants) * 100}
                                                    variant="primary"
                                                    className="mt-1"
                                                    style={{ height: '6px' }}
                                                />
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white border-0 py-3">
                                            <h5 className="mb-0 fw-bold">
                                                <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                                                À propos de l'organisateur
                                            </h5>
                                        </Card.Header>
                                        <Card.Body className="text-center">
                                            <img
                                                src={competition.artist_avatar}
                                                alt={competition.artist}
                                                className="rounded-circle mb-3"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                            <h6 className="fw-bold">{competition.artist}</h6>
                                            <p className="text-muted small">{competition.artist_bio}</p>
                                            <Button variant="outline-primary" size="sm">
                                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                                Voir le profil
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>

                        {/* Onglet Participants */}
                        <Tab eventKey="participants" title={
                            <span>
                                <FontAwesomeIcon icon={faUsers} className="me-2" />
                                Participants ({competition.current_participants})
                            </span>
                        }>
                            <Row className="g-4">
                                {competition.participants.length > 0 ? (
                                    competition.participants.map((participant, index) => (
                                        <Col key={participant.id} md={6} lg={4}>
                                            <Card className="border-0 shadow-sm participant-card">
                                                <Card.Body className="text-center">
                                                    <img
                                                        src={participant.avatar}
                                                        alt={participant.name}
                                                        className="rounded-circle mb-3"
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                    />
                                                    <h6 className="fw-bold mb-1">{participant.name}</h6>
                                                    <small className="text-muted">
                                                        Inscrit le {new Date(participant.joined_at).toLocaleDateString('fr-FR')}
                                                    </small>
                                                    <div className="mt-2">
                                                        <Badge bg="success">Confirmé</Badge>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                                            <h5 className="text-muted">Aucun participant pour le moment</h5>
                                            <p className="text-secondary">Soyez le premier à vous inscrire !</p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Tab>

                        {/* Onglet Critères de jugement */}
                        <Tab eventKey="criteria" title={
                            <span>
                                <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                Critères de jugement
                            </span>
                        }>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <div className="text-center mb-4">
                                        <h5 className="fw-bold">Comment les performances sont-elles évaluées ?</h5>
                                        <p className="text-muted">
                                            Chaque performance est évaluée selon les critères suivants avec pondération
                                        </p>
                                    </div>

                                    <Row className="g-3">
                                        {competition.judge_criteria.map((criteria, index) => (
                                            <Col key={index} md={6}>
                                                <Card className="border-primary border-2">
                                                    <Card.Body className="text-center">
                                                        <h6 className="fw-bold text-primary mb-2">{criteria.name}</h6>
                                                        <div className="display-6 fw-bold text-primary mb-2">{criteria.weight}%</div>
                                                        <ProgressBar
                                                            now={criteria.weight}
                                                            variant="primary"
                                                            style={{ height: '8px' }}
                                                        />
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>

                                    <div className="alert alert-info mt-4">
                                        <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                                        <strong>Note :</strong> Le vote du public compte également dans l'évaluation finale.
                                        Plus vous impressionnez l'audience, plus vos chances de gagner augmentent !
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </AnimatedElement>
            </Container>

            {/* Modal de participation */}
            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                        Rejoindre la compétition
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <h5 className="fw-bold">{competition.title}</h5>
                        <p className="text-muted">Confirmez votre participation à cette compétition</p>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Card className="border-primary h-100">
                                <Card.Body className="text-center">
                                    <FontAwesomeIcon icon={faCoins} size="2x" className="text-primary mb-2" />
                                    <h6 className="fw-bold">Frais d'inscription</h6>
                                    <h4 className="text-primary">{formatCurrency(competition.entry_fee)}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-warning h-100">
                                <Card.Body className="text-center">
                                    <FontAwesomeIcon icon={faTrophy} size="2x" className="text-warning mb-2" />
                                    <h6 className="fw-bold">Vous pourriez gagner</h6>
                                    <h4 className="text-warning">{formatCurrency(competition.prizes[0].amount)}</h4>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="alert alert-info">
                        <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                        <strong>Rappel :</strong> En participant, vous acceptez les règles de la compétition
                        et autorisez la diffusion de votre performance.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowJoinModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={confirmJoinCompetition}>
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Confirmer l'inscription
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal upload performance */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faMicrophone} className="me-2 text-primary" />
                        Soumettre votre performance
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Titre de votre performance</Form.Label>
                            <Form.Control type="text" placeholder="Ex: Mon freestyle de folie" />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Fichier audio</Form.Label>
                            <Form.Control type="file" accept="audio/*" />
                            <Form.Text className="text-muted">
                                Formats acceptés: MP3, WAV, M4A (max 50MB)
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Description (optionnel)</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Parlez-nous de votre performance..." />
                        </Form.Group>

                        <div className="alert alert-warning">
                            <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                            <strong>Important :</strong> Assurez-vous que votre performance respecte
                            la durée maximum de 3 minutes et les règles de la compétition.
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary">
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Soumettre
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .competition-hero {
                    height: 60vh;
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                    position: relative;
                }

                .competition-hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
                    display: flex;
                    align-items: center;
                }

                .competition-info-card {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 15px;
                }

                .participant-card {
                    transition: all 0.3s ease;
                }

                .participant-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }

                .prize-medal {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                }

                .prize-medal.gold {
                    background: linear-gradient(45deg, #ffd700, #ffed4e);
                }

                .prize-medal.silver {
                    background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
                }

                .prize-medal.bronze {
                    background: linear-gradient(45deg, #cd7f32, #b8860b);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .competition-hero {
                        height: 50vh;
                        background-attachment: scroll;
                    }
                }
            `}</style>
        </div>
    );
};

export default CompetitionDetails;
