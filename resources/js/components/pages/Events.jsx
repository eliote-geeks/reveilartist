import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faTicketAlt,
    faUsers,
    faFilter,
    faSearch,
    faStar,
    faMusic,
    faClock,
    faHeart,
    faShare,
    faPlus,
    faMinus,
    faShoppingCart,
    faEye,
    faTh,
    faList
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import FloatingActionButton from '../common/FloatingActionButton';

const Events = () => {
    const [loading, setLoading] = useState(true);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [ticketQuantities, setTicketQuantities] = useState({});
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

    // Données mockées d'événements camerounais corrigées
    const events = [
        {
            id: 1,
            title: "RéveilArt Festival 2024",
            artist: "Multi-artistes",
            date: "2024-06-15",
            time: "18:00",
            location: "Palais des Sports Yaoundé",
            city: "Yaoundé",
            image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=250&fit=crop",
            description: "Le plus grand festival de musique urbaine du Cameroun",
            category: "Festival",
            tickets: [
                { type: "Standard", price: 15000, available: 500 },
                { type: "VIP", price: 35000, available: 100 },
                { type: "Premium", price: 55000, available: 50 }
            ],
            featured: true
        },
        {
            id: 2,
            title: "Hip-Hop Night Douala",
            artist: "BeatMaster237, UrbanFlow",
            date: "2024-05-20",
            time: "20:00",
            location: "Centre Culturel Français",
            city: "Douala",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
            description: "Une soirée dédiée au Hip-Hop camerounais",
            category: "Concert",
            tickets: [
                { type: "Entrée", price: 8000, available: 200 },
                { type: "VIP", price: 20000, available: 50 }
            ],
            featured: false
        },
        {
            id: 3,
            title: "Makossa Revival",
            artist: "Heritage Sound",
            date: "2024-07-10",
            time: "19:30",
            location: "Stade Ahmadou Ahidjo",
            city: "Yaoundé",
            image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=250&fit=crop",
            description: "Célébration de la musique traditionnelle camerounaise",
            category: "Festival",
            tickets: [
                { type: "Tribune", price: 12000, available: 1000 },
                { type: "Pelouse", price: 5000, available: 2000 }
            ],
            featured: true
        },
        {
            id: 4,
            title: "Electronic Vibes",
            artist: "DJ TechCamer",
            date: "2024-06-30",
            time: "22:00",
            location: "Club Paradise",
            city: "Douala",
            image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=250&fit=crop",
            description: "Soirée électro avec les meilleurs DJs du pays",
            category: "Soirée",
            tickets: [
                { type: "Entrée", price: 10000, available: 300 }
            ],
            featured: false
        }
    ];

    const categories = ['Tous', 'Festival', 'Concert', 'Soirée', 'Showcase'];
    const cities = ['Toutes', 'Yaoundé', 'Douala', 'Bafoussam', 'Garoua'];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            setFilteredEvents(events);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let filtered = events;

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'all' && selectedCategory !== 'Tous') {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        if (selectedCity !== 'all' && selectedCity !== 'Toutes') {
            filtered = filtered.filter(event => event.city === selectedCity);
        }

        setFilteredEvents(filtered);
    }, [searchQuery, selectedCategory, selectedCity]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getLowestPrice = (tickets) => {
        return Math.min(...tickets.map(ticket => ticket.price));
    };

    const handleTicketQuantityChange = (eventId, ticketType, change) => {
        const key = `${eventId}_${ticketType}`;
        const currentQuantity = ticketQuantities[key] || 0;
        const newQuantity = Math.max(0, currentQuantity + change);

        setTicketQuantities(prev => ({
            ...prev,
            [key]: newQuantity
        }));
    };

    const openTicketModal = (event) => {
        setSelectedEvent(event);
        setShowTicketModal(true);
    };

    const closeTicketModal = () => {
        setShowTicketModal(false);
        setSelectedEvent(null);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const EventCard = ({ event, index }) => (
        <AnimatedElement
            animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
            delay={200 + (index * 100)}
        >
            <Card className="event-card h-100 border-0 shadow-sm">
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={event.image}
                        alt={event.title}
                        className="event-image"
                        style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="event-overlay">
                        <div className="event-overlay-content">
                            <Button
                                variant="light"
                                size="sm"
                                className="me-2"
                                onClick={() => openTicketModal(event)}
                            >
                                <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                                Billets
                            </Button>
                            <Button variant="outline-light" size="sm" className="me-2">
                                <FontAwesomeIcon icon={faHeart} />
                            </Button>
                            <Button variant="outline-light" size="sm">
                                <FontAwesomeIcon icon={faShare} />
                            </Button>
                        </div>
                    </div>
                    {event.featured && (
                        <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
                            <FontAwesomeIcon icon={faStar} className="me-1" />
                            Featured
                        </Badge>
                    )}
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-2">
                        {event.category}
                    </Badge>
                </div>

                <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                        <Card.Title className="h5 fw-bold mb-1">{event.title}</Card.Title>
                        <Card.Text className="text-muted small mb-2">
                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                            {event.artist}
                        </Card.Text>
                    </div>

                    <div className="event-details mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                            <span className="small fw-medium">{formatDate(event.date)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faClock} className="text-secondary me-2" />
                            <span className="small">{event.time}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-success me-2" />
                            <span className="small">{event.location}</span>
                        </div>
                    </div>

                    <Card.Text className="text-muted small mb-3 flex-grow-1">
                        {event.description}
                    </Card.Text>

                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-muted small">À partir de</span>
                                <div className="fw-bold text-primary">
                                    {formatCurrency(getLowestPrice(event.tickets))}
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    as={Link}
                                    to={`/events/${event.id}`}
                                >
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    Détails
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openTicketModal(event)}
                                >
                                    <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                                    Billets
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    const EventListItem = ({ event, index }) => (
        <AnimatedElement animation="slideInUp" delay={100 + (index * 50)}>
            <Card className="event-list-item border-0 shadow-sm mb-3">
                <Card.Body className="p-3">
                    <Row className="align-items-center">
                        <Col md={3}>
                            <div className="position-relative">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="img-fluid rounded"
                                    style={{ height: '80px', width: '120px', objectFit: 'cover' }}
                                />
                                {event.featured && (
                                    <Badge bg="warning" className="position-absolute top-0 start-0 m-1 small">
                                        Featured
                                    </Badge>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <h5 className="fw-bold mb-1">{event.title}</h5>
                            <p className="text-muted mb-1 small">
                                <FontAwesomeIcon icon={faMusic} className="me-1" />
                                {event.artist}
                            </p>
                            <div className="d-flex flex-wrap gap-3 small text-muted">
                                <span>
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    {formatDate(event.date)}
                                </span>
                                <span>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                    {event.location}
                                </span>
                            </div>
                        </Col>
                        <Col md={3} className="text-end">
                            <div className="mb-2">
                                <span className="text-muted small">À partir de</span>
                                <div className="fw-bold text-primary">
                                    {formatCurrency(getLowestPrice(event.tickets))}
                                </div>
                            </div>
                            <div className="d-flex gap-1 justify-content-end">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    as={Link}
                                    to={`/events/${event.id}`}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openTicketModal(event)}
                                >
                                    <FontAwesomeIcon icon={faTicketAlt} />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Header de la page */}
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="py-4">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <h1 className="fw-bold mb-2">Événements</h1>
                                    <p className="text-muted mb-0">
                                        Découvrez les concerts et festivals à venir au Cameroun
                                    </p>
                                </AnimatedElement>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <Button
                                        as={Link}
                                        to="/add-event"
                                        variant="primary"
                                        className="me-2"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Créer un événement
                                    </Button>
                                    <div className="btn-group" role="group">
                                        <Button
                                            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <FontAwesomeIcon icon={faTh} />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <FontAwesomeIcon icon={faList} />
                                        </Button>
                                    </div>
                                </AnimatedElement>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {/* Filtres */}
                <AnimatedElement animation="slideInUp" delay={300}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <Row className="g-3 align-items-center">
                                <Col md={4}>
                                    <InputGroup>
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher des événements..."
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
                                        {categories.map(category => (
                                            <option
                                                key={category}
                                                value={category === 'Tous' ? 'all' : category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                    >
                                        {cities.map(city => (
                                            <option
                                                key={city}
                                                value={city === 'Toutes' ? 'all' : city}
                                            >
                                                {city}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <div className="text-muted small">
                                        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </AnimatedElement>

                {/* Liste des événements */}
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-muted mb-3" />
                        <h4 className="text-muted">Aucun événement trouvé</h4>
                        <p className="text-secondary">Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <Row className="g-4">
                                {filteredEvents.map((event, index) => (
                                    <Col key={event.id} lg={4} md={6}>
                                        <EventCard event={event} index={index} />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div>
                                {filteredEvents.map((event, index) => (
                                    <EventListItem key={event.id} event={event} index={index} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* Modal de billets */}
            <Modal show={showTicketModal} onHide={closeTicketModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Acheter des billets - {selectedEvent?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <div className="mb-4">
                                <h6 className="fw-bold mb-2">Détails de l'événement</h6>
                                <div className="d-flex gap-3 small text-muted">
                                    <span>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        {formatDate(selectedEvent.date)}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        {selectedEvent.time}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                        {selectedEvent.location}
                                    </span>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3">Types de billets disponibles</h6>
                            {selectedEvent.tickets.map((ticket, index) => (
                                <div key={index} className="border rounded p-3 mb-3">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <h6 className="fw-bold mb-1">{ticket.type}</h6>
                                            <div className="text-primary fw-bold fs-5">
                                                {formatCurrency(ticket.price)}
                                            </div>
                                            <small className="text-muted">
                                                {ticket.available} places disponibles
                                            </small>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <div className="d-flex align-items-center justify-content-end">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleTicketQuantityChange(selectedEvent.id, ticket.type, -1)}
                                                    disabled={!(ticketQuantities[`${selectedEvent.id}_${ticket.type}`] > 0)}
                                                    className="rounded-circle"
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    <FontAwesomeIcon icon={faMinus} style={{ fontSize: '10px' }} />
                                                </Button>
                                                <span className="mx-3 fw-bold" style={{ minWidth: '20px' }}>
                                                    {ticketQuantities[`${selectedEvent.id}_${ticket.type}`] || 0}
                                                </span>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleTicketQuantityChange(selectedEvent.id, ticket.type, 1)}
                                                    disabled={ticketQuantities[`${selectedEvent.id}_${ticket.type}`] >= ticket.available}
                                                    className="rounded-circle"
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: '10px' }} />
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeTicketModal}>
                        Fermer
                    </Button>
                    <Button variant="primary">
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        Ajouter au panier
                    </Button>
                </Modal.Footer>
            </Modal>

            <FloatingActionButton />

            <style jsx>{`
                .event-card {
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .event-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
                }

                .event-image {
                    transition: transform 0.3s ease;
                }

                .event-card:hover .event-image {
                    transform: scale(1.05);
                }

                .event-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .event-card:hover .event-overlay {
                    opacity: 1;
                }

                .event-overlay-content {
                    transform: translateY(20px);
                    transition: transform 0.3s ease;
                }

                .event-card:hover .event-overlay-content {
                    transform: translateY(0);
                }

                .event-list-item {
                    transition: all 0.3s ease;
                }

                .event-list-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
                }

                .event-details {
                    font-size: 0.875rem;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .event-card:hover {
                        transform: translateY(-2px);
                    }

                    .event-list-item:hover {
                        transform: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Events;
