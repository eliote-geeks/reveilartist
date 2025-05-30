import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Tab, Tabs, Table, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faTicketAlt,
    faUsers,
    faStar,
    faMusic,
    faClock,
    faArrowLeft,
    faShoppingCart,
    faShare,
    faHeart,
    faInfoCircle,
    faCheckCircle,
    faCrown,
    faCouch,
    faEye,
    faDownload,
    faChartLine,
    faEdit,
    faTrash,
    faCopy,
    faQrcode,
    faEnvelope,
    faPhone
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import FloatingActionButton from '../common/FloatingActionButton';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTickets, setSelectedTickets] = useState({
        tribune: 0,
        pelouse: 0,
        vip: 0
    });

    // Données d'événement camerounais enrichies
    const events = [
        {
            id: 1,
            title: "RéveilArt4artist Festival 2024",
            description: "Le plus grand festival de musique urbaine du Cameroun",
            fullDescription: "RéveilArt4artist Festival 2024 est l'événement musical le plus attendu de l'année ! Cette célébration exceptionnelle de 3 jours réunit les plus grands talents de la musique camerounaise et africaine. Au programme : concerts live, battles de rap, ateliers musicaux, et découvertes de nouveaux artistes.",
            date: "2024-06-15",
            endDate: "2024-06-17",
            time: "18:00",
            location: "Stade Ahmadou Ahidjo",
            address: "Avenue du 20 Mai, Quartier Tsinga, Yaoundé",
            city: "Yaoundé",
            category: "Festival",
            status: "active",
            organizer: "RéveilArt4artist Productions",
            capacity: 15000,
            ticketsSold: 8450,
            revenue: 485250000,
            image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop",
            tickets: [
                {
                    type: "Tribune VIP",
                    price: 75000,
                    description: "Accès tribune couverte, catering inclus, meet & greet artistes",
                    available: 500,
                    sold: 245,
                    color: "warning",
                    features: ["Tribune couverte", "Catering premium", "Meet & greet", "Parking VIP", "Goodies exclusifs"]
                },
                {
                    type: "Tribune Standard",
                    price: 35000,
                    description: "Accès tribune couverte, vue panoramique",
                    available: 2000,
                    sold: 1650,
                    color: "primary",
                    features: ["Tribune couverte", "Vue panoramique", "Boissons incluses", "Parking"]
                },
                {
                    type: "Pelouse",
                    price: 15000,
                    description: "Accès pelouse, ambiance festive",
                    available: 12500,
                    sold: 6555,
                    color: "success",
                    features: ["Pelouse", "Ambiance festive", "Points de vente sur site"]
                }
            ],
            artists: [
                { name: "DJ Cameroun", genre: "Afrobeat", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
                { name: "BeatMaster237", genre: "Hip-Hop", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop" },
                { name: "Makossa Revival", genre: "Traditional", image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop" }
            ],
            schedule: [
                { time: "18:00", activity: "Ouverture des portes" },
                { time: "19:00", activity: "DJ Set d'ouverture" },
                { time: "20:00", activity: "BeatMaster237 Live" },
                { time: "21:30", activity: "Makossa Revival" },
                { time: "23:00", activity: "DJ Cameroun - Main Event" },
                { time: "01:00", activity: "After Party" }
            ],
            attendeesStats: {
                ageGroups: { "18-25": 45, "26-35": 35, "36-45": 15, "45+": 5 },
                gender: { "Hommes": 55, "Femmes": 45 },
                cities: { "Yaoundé": 60, "Douala": 25, "Autres": 15 }
            },
            socialMedia: {
                facebook: "https://facebook.com/reveilart4artist",
                instagram: "https://instagram.com/reveilart4artist",
                twitter: "https://twitter.com/reveilart4artist"
            }
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            const foundEvent = events.find(e => e.id === parseInt(id));
            setEvent(foundEvent);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateTicketProgress = (sold, available) => {
        return (sold / (sold + available)) * 100;
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!event) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center" style={{ paddingTop: '70px' }}>
                <div className="text-center">
                    <h3>Événement non trouvé</h3>
                    <Button as={Link} to="/events" variant="primary">
                        Retour aux événements
                    </Button>
                </div>
            </div>
        );
    }

    const renderOverview = () => (
        <Row className="g-4">
            <Col lg={8}>
                {/* Informations principales */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="img-fluid rounded"
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                            </Col>
                            <Col md={8}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <Badge bg="success" className="mb-2">{event.status === 'active' ? 'Actif' : 'Inactif'}</Badge>
                                        <h4 className="fw-bold">{event.title}</h4>
                                        <p className="text-muted">{event.description}</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faCopy} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div className="d-flex align-items-center text-muted">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="d-flex align-items-center text-muted">
                                            <FontAwesomeIcon icon={faClock} className="me-2 text-info" />
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="d-flex align-items-center text-muted">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-success" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="d-flex align-items-center text-muted">
                                            <FontAwesomeIcon icon={faUsers} className="me-2 text-warning" />
                                            <span>{event.capacity.toLocaleString()} places</span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Description complète */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Description complète</h6>
                    </Card.Header>
                    <Card.Body>
                        <p className="text-muted lh-lg">{event.fullDescription}</p>
                    </Card.Body>
                </Card>

                {/* Programme */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Programme de la soirée</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="timeline">
                            {event.schedule.map((item, index) => (
                                <div key={index} className="timeline-item d-flex align-items-center mb-3">
                                    <div className="timeline-time bg-primary bg-opacity-10 text-primary rounded px-3 py-1 fw-medium me-3">
                                        {item.time}
                                    </div>
                                    <div className="timeline-content">
                                        <span className="fw-medium">{item.activity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={4}>
                {/* Statistiques de vente */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-primary text-white">
                        <h6 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faChartLine} className="me-2" />
                            Statistiques de vente
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center mb-3">
                            <h3 className="fw-bold text-primary">{event.ticketsSold.toLocaleString()}</h3>
                            <p className="text-muted mb-0">billets vendus sur {event.capacity.toLocaleString()}</p>
                            <div className="progress mt-2" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="row g-3 text-center">
                            <div className="col-6">
                                <div className="bg-light rounded p-2">
                                    <div className="fw-bold text-success">{formatCurrency(event.revenue)}</div>
                                    <small className="text-muted">Revenus</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bg-light rounded p-2">
                                    <div className="fw-bold text-info">{Math.round((event.ticketsSold / event.capacity) * 100)}%</div>
                                    <small className="text-muted">Taux de remplissage</small>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Artistes */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                            Artistes programmés
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        {event.artists.map((artist, index) => (
                            <div key={index} className="d-flex align-items-center mb-3">
                                <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="rounded-circle me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <div>
                                    <div className="fw-medium">{artist.name}</div>
                                    <small className="text-muted">{artist.genre}</small>
                                </div>
                            </div>
                        ))}
                    </Card.Body>
                </Card>

                {/* Contact organisateur */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Organisateur</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center">
                            <h6 className="fw-bold">{event.organizer}</h6>
                            <p className="text-muted small mb-3">Producteur officiel</p>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary" size="sm">
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                    Contacter
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <FontAwesomeIcon icon={faShare} className="me-2" />
                                    Partager l'événement
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );

    const renderTickets = () => (
        <Row className="g-4">
            <Col lg={8}>
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Gestion des billets</h6>
                    </Card.Header>
                    <Card.Body>
                        {event.tickets.map((ticket, index) => (
                            <Card key={index} className="border mb-3">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <h6 className="fw-bold mb-2">{ticket.type}</h6>
                                            <p className="text-muted small mb-2">{ticket.description}</p>
                                            <div className="d-flex flex-wrap gap-1">
                                                {ticket.features.map((feature, fIndex) => (
                                                    <Badge key={fIndex} bg="light" text="dark" className="small">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Col>
                                        <Col md={2} className="text-center">
                                            <div className="fw-bold h5 mb-0 text-primary">
                                                {formatCurrency(ticket.price)}
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="mb-2">
                                                <div className="d-flex justify-content-between small">
                                                    <span>Vendus: {ticket.sold}</span>
                                                    <span>Disponibles: {ticket.available}</span>
                                                </div>
                                                <div className="progress mt-1" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar bg-${ticket.color}`}
                                                        style={{ width: `${calculateTicketProgress(ticket.sold, ticket.available)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-1">
                                                <Button variant="outline-primary" size="sm" className="flex-grow-1">
                                                    Modifier
                                                </Button>
                                                <Button variant="outline-secondary" size="sm">
                                                    <FontAwesomeIcon icon={faQrcode} />
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={4}>
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Résumé des ventes</h6>
                    </Card.Header>
                    <Card.Body>
                        {event.tickets.map((ticket, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div className="fw-medium">{ticket.type}</div>
                                    <small className="text-muted">{ticket.sold} vendus</small>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold text-primary">
                                        {formatCurrency(ticket.sold * ticket.price)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-bold">Total des revenus</div>
                            <div className="fw-bold h5 text-success mb-0">
                                {formatCurrency(event.revenue)}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );

    const renderAnalytics = () => (
        <Row className="g-4">
            <Col lg={8}>
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Démographie des participants</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-4">
                            <Col md={6}>
                                <h6 className="fw-medium mb-3">Répartition par âge</h6>
                                {Object.entries(event.attendeesStats.ageGroups).map(([age, percentage]) => (
                                    <div key={age} className="mb-2">
                                        <div className="d-flex justify-content-between small">
                                            <span>{age} ans</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar bg-primary"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-medium mb-3">Répartition par ville</h6>
                                {Object.entries(event.attendeesStats.cities).map(([city, percentage]) => (
                                    <div key={city} className="mb-2">
                                        <div className="d-flex justify-content-between small">
                                            <span>{city}</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Évolution des ventes</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="bg-light rounded p-4 text-center">
                            <FontAwesomeIcon icon={faChartLine} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Graphique des ventes</h6>
                            <p className="text-muted small mb-0">Intégration Chart.js à venir</p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={4}>
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom">
                        <h6 className="fw-bold mb-0">Actions rapides</h6>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-grid gap-2">
                            <Button variant="primary" size="sm">
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Exporter les données
                            </Button>
                            <Button variant="outline-primary" size="sm">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                Envoyer un rappel
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                                <FontAwesomeIcon icon={faQrcode} className="me-2" />
                                QR Codes billets
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'tickets':
                return renderTickets();
            case 'analytics':
                return renderAnalytics();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '70px' }}>
            {/* Header de la page */}
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="py-3">
                        <Row className="align-items-center">
                            <Col>
                                <div className="d-flex align-items-center">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-3"
                                        onClick={() => navigate(-1)}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                        Retour
                                    </Button>
                                    <div>
                                        <h4 className="fw-bold mb-1">{event.title}</h4>
                                        <p className="text-muted mb-0 small">
                                            Gestion de l'événement • {formatDate(event.date)}
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="auto">
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm">
                                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                                        Modifier
                                    </Button>
                                    <Button variant="outline-danger" size="sm">
                                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                                        Supprimer
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Navigation tabs */}
                <div className="mb-4">
                    <nav className="nav nav-pills">
                        <button
                            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                            Vue d'ensemble
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tickets')}
                        >
                            <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                            Billets
                        </button>
                        <button
                            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <FontAwesomeIcon icon={faChartLine} className="me-2" />
                            Analytics
                        </button>
                    </nav>
                </div>

                {/* Contenu */}
                <AnimatedElement animation="fadeIn" delay={100}>
                    {renderContent()}
                </AnimatedElement>
            </Container>

            <FloatingActionButton />

            <style jsx>{`
                .nav-pills .nav-link {
                    color: var(--bs-secondary);
                    background: transparent;
                    border: 1px solid transparent;
                    padding: 0.75rem 1rem;
                    margin-right: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .nav-pills .nav-link:hover {
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--bs-primary);
                }

                .nav-pills .nav-link.active {
                    background: var(--bs-primary);
                    color: white;
                    border-color: var(--bs-primary);
                }

                .timeline-item {
                    position: relative;
                }

                .timeline-time {
                    min-width: 80px;
                    font-size: 0.875rem;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .nav-pills .nav-link {
                        padding: 0.5rem 0.75rem;
                        font-size: 0.875rem;
                        margin-right: 0.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventDetails;
