import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Tab, Tabs, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
    faFire,
    faStar,
    faPlus,
    faSearch,
    faFilter,
    faCalendarAlt,
    faMapMarkerAlt,
    faEuroSign,
    faMicrophone,
    faHeadphones,
    faVolumeUp,
    faRocket,
    faCrown,
    faLightbulb,
    faEye,
    faCheck
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const Competitions = () => {
    const [loading, setLoading] = useState(true);
    const [competitions, setCompetitions] = useState([]);
    const [filteredCompetitions, setFilteredCompetitions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('active');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const toast = useToast();
    const { token, user } = useAuth();

    // Données de démonstration
    const mockCompetitions = [
        {
            id: 1,
            title: "Battle de Rap Camerounais",
            description: "Compétition de rap freestyle en direct. Montrez votre talent et remportez la cagnotte !",
            artist: "MC Thunder",
            artist_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face",
            category: "Rap",
            entry_fee: 5000,
            prize_pool: 150000,
            max_participants: 20,
            current_participants: 15,
            status: "registration", // registration, active, completed
            start_time: "2024-01-20T20:00:00",
            duration: 120, // minutes
            rules: [
                "Performance de 3 minutes maximum",
                "Thème libre ou imposé",
                "Pas de contenu offensant",
                "Jugement par le public en direct"
            ],
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
            created_at: "2024-01-15T10:00:00",
            participants: []
        },
        {
            id: 2,
            title: "Concours de Chant Afrobeat",
            description: "Compétition de chant sur des rythmes afrobeat. Venez vibrer et gagner !",
            artist: "Bella Voice",
            artist_avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=100&h=100&fit=crop&crop=face",
            category: "Afrobeat",
            entry_fee: 3000,
            prize_pool: 89000,
            max_participants: 15,
            current_participants: 12,
            status: "active",
            start_time: "2024-01-19T19:30:00",
            duration: 90,
            rules: [
                "Chant a cappella ou avec instrumental",
                "2 minutes par participant",
                "Style afrobeat obligatoire",
                "Vote en temps réel"
            ],
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
            created_at: "2024-01-10T14:00:00",
            participants: []
        },
        {
            id: 3,
            title: "Makossa Master Class",
            description: "Compétition de makossa traditionnel. Préservons notre patrimoine musical !",
            artist: "Papa Makossa",
            artist_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "Makossa",
            entry_fee: 2000,
            prize_pool: 45000,
            max_participants: 10,
            current_participants: 8,
            status: "registration",
            start_time: "2024-01-25T18:00:00",
            duration: 60,
            rules: [
                "Makossa traditionnel uniquement",
                "Instruments traditionnels recommandés",
                "Performance de 4 minutes max",
                "Respect des traditions"
            ],
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
            created_at: "2024-01-12T16:00:00",
            participants: []
        }
    ];

    useEffect(() => {
        loadCompetitions();
    }, []);

    useEffect(() => {
        filterCompetitions();
    }, [competitions, searchQuery, selectedCategory, selectedStatus, activeTab]);

    const loadCompetitions = async () => {
        try {
            setLoading(true);
            // Simuler un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCompetitions(mockCompetitions);
        } catch (error) {
            console.error('Erreur lors du chargement des compétitions:', error);
            if (toast) {
                toast.error('Erreur', 'Erreur de connexion au serveur');
            }
        } finally {
            setLoading(false);
        }
    };

    const filterCompetitions = () => {
        let filtered = competitions;

        // Filtrer par onglet actif
        switch (activeTab) {
            case 'active':
                filtered = filtered.filter(comp => comp.status === 'active');
                break;
            case 'upcoming':
                filtered = filtered.filter(comp => comp.status === 'registration');
                break;
            case 'completed':
                filtered = filtered.filter(comp => comp.status === 'completed');
                break;
            default:
                break;
        }

        // Filtrer par recherche
        if (searchQuery) {
            filtered = filtered.filter(comp =>
                comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrer par catégorie
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(comp => comp.category === selectedCategory);
        }

        setFilteredCompetitions(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTimeLeft = (startTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start - now;

        if (diff <= 0) return "En cours";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}j ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'registration':
                return <Badge bg="primary"><FontAwesomeIcon icon={faClock} className="me-1" />Inscription</Badge>;
            case 'active':
                return <Badge bg="success"><FontAwesomeIcon icon={faPlay} className="me-1" />En cours</Badge>;
            case 'completed':
                return <Badge bg="secondary"><FontAwesomeIcon icon={faTrophy} className="me-1" />Terminé</Badge>;
            default:
                return <Badge bg="light">Inconnu</Badge>;
        }
    };

    const getParticipationRate = (current, max) => {
        return Math.round((current / max) * 100);
    };

    const handleJoinCompetition = (competition) => {
        if (!token) {
            if (toast) {
                toast.warning('Connexion requise', 'Vous devez être connecté pour participer');
            }
            return;
        }
        setSelectedCompetition(competition);
        setShowJoinModal(true);
    };

    const confirmJoinCompetition = () => {
        if (selectedCompetition) {
            if (toast) {
                toast.success('Inscription confirmée', `Vous êtes inscrit à "${selectedCompetition.title}"`);
            }
            setShowJoinModal(false);
            setSelectedCompetition(null);
            // Ici on ferait l'appel API pour s'inscrire
        }
    };

    // Écran de chargement simple
    if (loading) {
        return (
            <div className="min-vh-100 bg-light avoid-header-overlap d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <h5 className="text-muted">Chargement des compétitions...</h5>
                </div>
            </div>
        );
    }

    const CompetitionCard = ({ competition, index }) => (
        <AnimatedElement
            animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
            delay={200 + (index * 100)}
        >
            <Card className="competition-card h-100 border-0 shadow-sm overflow-hidden">
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={competition.image}
                        className="competition-image"
                        style={{ height: '200px', objectFit: 'cover' }}
                    />

                    {/* Status badge */}
                    <div className="position-absolute top-0 start-0 m-3">
                        {getStatusBadge(competition.status)}
                    </div>

                    {/* Prize pool */}
                    <div className="position-absolute top-0 end-0 m-3">
                        <Badge bg="warning" text="dark" className="prize-badge">
                            <FontAwesomeIcon icon={faTrophy} className="me-1" />
                            {formatCurrency(competition.prize_pool)}
                        </Badge>
                    </div>

                    {/* Competition info overlay */}
                    <div className="position-absolute bottom-0 start-0 end-0 p-3 text-white">
                        <div className="d-flex align-items-center mb-2">
                            <img
                                src={competition.artist_avatar}
                                alt={competition.artist}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <small className="fw-bold">{competition.artist}</small>
                        </div>
                    </div>
                </div>

                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0 flex-grow-1">
                            <Link
                                to={`/competitions/${competition.id}`}
                                className="text-decoration-none text-dark"
                            >
                                {competition.title}
                            </Link>
                        </h5>
                        <Badge bg="light" text="dark" className="ms-2">
                            {competition.category}
                        </Badge>
                    </div>

                    <p className="text-muted small mb-3 line-clamp-2">
                        {competition.description}
                    </p>

                    {/* Competition details */}
                    <div className="competition-details mb-3">
                        <Row className="g-2 small">
                            <Col xs={6}>
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faCoins} className="text-primary me-2" />
                                    <span>{formatCurrency(competition.entry_fee)}</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faClock} className="text-primary me-2" />
                                    <span>{competition.duration}min</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faUsers} className="text-primary me-2" />
                                    <span>{competition.current_participants}/{competition.max_participants}</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                {competition.status === 'registration' && (
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                                        <span>{formatTimeLeft(competition.start_time)}</span>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>

                    {/* Participation progress */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Participants</small>
                            <small className="text-muted">{getParticipationRate(competition.current_participants, competition.max_participants)}%</small>
                        </div>
                        <ProgressBar
                            now={getParticipationRate(competition.current_participants, competition.max_participants)}
                            variant={getParticipationRate(competition.current_participants, competition.max_participants) > 80 ? 'warning' : 'primary'}
                            style={{ height: '6px' }}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2">
                        <Button
                            as={Link}
                            to={`/competitions/${competition.id}`}
                            variant="outline-primary"
                            size="sm"
                            className="flex-grow-1"
                        >
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            Détails
                        </Button>
                        {competition.status === 'registration' && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleJoinCompetition(competition)}
                                disabled={competition.current_participants >= competition.max_participants}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Participer
                            </Button>
                        )}
                        {competition.status === 'active' && (
                            <Button
                                variant="success"
                                size="sm"
                                as={Link}
                                to={`/competitions/${competition.id}/live`}
                            >
                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                Regarder
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Hero Section */}
            <div className="hero-gradient-competitions text-white">
                <Container>
                    <div className="py-5">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <div className="d-flex align-items-center mb-3">
                                        <FontAwesomeIcon icon={faTrophy} size="2x" className="me-3 text-warning" />
                                        <h1 className="display-4 fw-bold mb-0">
                                            Compétitions Musicales
                                        </h1>
                                    </div>
                                    <p className="lead mb-4">
                                        Participez aux compétitions en temps réel, montrez votre talent
                                        et remportez des prix incroyables ! 🎵
                                    </p>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faFire} className="me-2 text-warning" />
                                            <span>{filteredCompetitions.length} compétitions disponibles</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faCoins} className="me-2 text-warning" />
                                            <span>Cagnottes jusqu'à 150k XAF</span>
                                        </div>
                                    </div>
                                </AnimatedElement>
                            </Col>
                            <Col lg={4}>
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <div className="text-end">
                                        {user && (user.role === 'artist' || user.role === 'producer') && (
                                            <Button
                                                as={Link}
                                                to="/create-competition"
                                                variant="warning"
                                                size="lg"
                                                className="text-dark fw-bold"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                Créer une compétition
                                            </Button>
                                        )}
                                    </div>
                                </AnimatedElement>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Filtres et onglets */}
                <AnimatedElement animation="slideInUp" delay={300}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            {/* Onglets */}
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-3 nav-tabs-custom"
                            >
                                <Tab
                                    eventKey="active"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faPlay} className="me-2" />
                                            En cours
                                        </span>
                                    }
                                />
                                <Tab
                                    eventKey="upcoming"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                            À venir
                                        </span>
                                    }
                                />
                                <Tab
                                    eventKey="completed"
                                    title={
                                        <span>
                                            <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                            Terminées
                                        </span>
                                    }
                                />
                            </Tabs>

                            {/* Filtres */}
                            <Row className="g-3 align-items-center">
                                <Col md={6}>
                                    <InputGroup>
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher des compétitions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">Toutes catégories</option>
                                        <option value="Rap">Rap</option>
                                        <option value="Afrobeat">Afrobeat</option>
                                        <option value="Makossa">Makossa</option>
                                        <option value="Gospel">Gospel</option>
                                        <option value="Jazz">Jazz</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <div className="text-muted small">
                                        {filteredCompetitions.length} compétition{filteredCompetitions.length > 1 ? 's' : ''}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </AnimatedElement>

                {/* Liste des compétitions */}
                {filteredCompetitions.length === 0 ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faTrophy} size="3x" className="text-muted mb-3" />
                        <h4 className="text-muted">Aucune compétition trouvée</h4>
                        <p className="text-secondary">
                            {activeTab === 'active' && "Aucune compétition en cours actuellement"}
                            {activeTab === 'upcoming' && "Aucune compétition à venir"}
                            {activeTab === 'completed' && "Aucune compétition terminée"}
                        </p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredCompetitions.map((competition, index) => (
                            <Col key={competition.id} lg={4} md={6}>
                                <CompetitionCard competition={competition} index={index} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            {/* Modal de participation */}
            <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                        Participer à la compétition
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCompetition && (
                        <div>
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">{selectedCompetition.title}</h5>
                                <p className="text-muted">{selectedCompetition.description}</p>
                            </div>

                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <Card className="border-primary">
                                        <Card.Body className="text-center">
                                            <FontAwesomeIcon icon={faCoins} size="2x" className="text-primary mb-2" />
                                            <h6 className="fw-bold">Frais d'inscription</h6>
                                            <h4 className="text-primary">{formatCurrency(selectedCompetition.entry_fee)}</h4>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border-warning">
                                        <Card.Body className="text-center">
                                            <FontAwesomeIcon icon={faTrophy} size="2x" className="text-warning mb-2" />
                                            <h6 className="fw-bold">Cagnotte totale</h6>
                                            <h4 className="text-warning">{formatCurrency(selectedCompetition.prize_pool)}</h4>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Règles de la compétition :</h6>
                                <ul className="list-unstyled">
                                    {selectedCompetition.rules.map((rule, index) => (
                                        <li key={index} className="mb-2">
                                            <FontAwesomeIcon icon={faCheck} className="text-success me-2" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="alert alert-info">
                                <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                                <strong>Important :</strong> Les frais d'inscription seront prélevés de votre solde.
                                En participant, vous acceptez les règles de la compétition.
                            </div>
                        </div>
                    )}
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

            <style jsx>{`
                .hero-gradient-competitions {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    position: relative;
                    overflow: hidden;
                }

                .hero-gradient-competitions::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E");
                }

                .competition-card {
                    transition: all 0.3s ease;
                    background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
                }

                .competition-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
                }

                .competition-image {
                    transition: transform 0.3s ease;
                }

                .competition-card:hover .competition-image {
                    transform: scale(1.05);
                }

                .prize-badge {
                    background: linear-gradient(45deg, #ffd700, #ffed4e) !important;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
                }

                .nav-tabs-custom .nav-link {
                    border: none;
                    color: #6c757d;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .nav-tabs-custom .nav-link:hover {
                    color: #495057;
                    background: rgba(102, 126, 234, 0.1);
                }

                .nav-tabs-custom .nav-link.active {
                    color: #667eea;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                    border-bottom: 3px solid #667eea;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .competition-details {
                    background: rgba(102, 126, 234, 0.05);
                    border-radius: 8px;
                    padding: 12px;
                }

                /* Animations pour les éléments flottants */
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .competition-card .prize-badge {
                    animation: float 3s ease-in-out infinite;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .competition-card:hover {
                        transform: translateY(-4px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Competitions;
