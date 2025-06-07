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
    faShare,
    faPlus,
    faMinus,
    faShoppingCart,
    faEye,
    faTh,
    faList,
    faEuroSign
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import FloatingActionButton from '../common/FloatingActionButton';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const Events = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [ticketQuantities, setTicketQuantities] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [categories, setCategories] = useState(['Tous']);
    const [cities, setCities] = useState(['Toutes']);

    // Villes populaires du Cameroun
    const cameroonCities = [
        'Toutes',
        'Yaoundé',
        'Douala',
        'Bamenda',
        'Bafoussam',
        'Garoua',
        'Maroua',
        'Ngaoundéré',
        'Bertoua',
        'Kribi',
        'Limbe',
        'Buea',
        'Kumba',
        'Edéa',
        'Foumban',
        'Dschang',
        'Ebolowa',
        'Sangmélima',
        'Mbalmayo',
        'Nkongsamba',
        'Loum',
        'Mbouda',
        'Tiko',
        'Yokadouma',
        'Batouri'
    ];

    const { addToCart } = useCart();
    const toast = useToast();
    const { token } = useAuth();

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, searchQuery, selectedCategory, selectedCity]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/events');
            const data = await response.json();

            console.log('Données événements reçues:', data);

            if (data && Array.isArray(data)) {
                const adaptedEvents = data
                    .filter(event => new Date(event.event_date) >= new Date().setHours(0, 0, 0, 0))
                    .map(event => ({
                        ...event,
                        poster_image_url: event.poster_image ? `/storage/${event.poster_image}` : null,
                        artists_array: event.artists ? (
                            typeof event.artists === 'string' ? JSON.parse(event.artists) : event.artists
                        ) : [],
                        remaining_spots: (event.max_attendees || 0) - (event.current_attendees || 0)
                    }));
                setEvents(adaptedEvents);
            } else if (data && data.events) {
                const adaptedEvents = data.events
                    .filter(event => new Date(event.event_date) >= new Date().setHours(0, 0, 0, 0))
                    .map(event => ({
                        ...event,
                        poster_image_url: event.poster_image ? `/storage/${event.poster_image}` : null,
                        artists_array: event.artists ? (
                            typeof event.artists === 'string' ? JSON.parse(event.artists) : event.artists
                        ) : [],
                        remaining_spots: (event.max_attendees || 0) - (event.current_attendees || 0)
                    }));
                setEvents(adaptedEvents);
            } else {
                console.error('Format de données inattendu:', data);
                setEvents([]);
            }

            // Extraire les catégories et villes uniques
            const allEvents = data && Array.isArray(data) ? data : (data && data.events ? data.events : []);
            const uniqueCategories = ['Tous', ...new Set(allEvents.map(event => event.category).filter(Boolean))];
            const existingCities = new Set(allEvents.map(event => event.city).filter(Boolean));
            const allCities = [...new Set([...cameroonCities, ...existingCities])];

            setCategories(uniqueCategories);
            setCities(allCities);

        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.artists_array && event.artists_array.some(artist =>
                    artist.toLowerCase().includes(searchQuery.toLowerCase())
                )) ||
                event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.city?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'all' && selectedCategory !== 'Tous') {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        if (selectedCity !== 'all' && selectedCity !== 'Toutes') {
            filtered = filtered.filter(event => event.city === selectedCity);
        }

        // Filtrer pour n'afficher que les événements publiés et à venir
        filtered = filtered.filter(event =>
            event.status === 'published' &&
            new Date(event.event_date) >= new Date().setHours(0, 0, 0, 0)
        );

        setFilteredEvents(filtered);
    };

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

    const getLowestPrice = (event) => {
        if (event.is_free) return 0;
        if (event.ticket_price) return event.ticket_price;
        if (event.price_min) return event.price_min;
        if (event.tickets && event.tickets.length > 0) {
            return Math.min(...event.tickets.map(ticket => ticket.price));
        }
        return 0;
    };

    const openTicketModal = (event) => {
        setSelectedEvent(event);
        setShowTicketModal(true);
    };

    const closeTicketModal = () => {
        setShowTicketModal(false);
        setSelectedEvent(null);
        setTicketQuantities({});
    };

    const handleAddToCart = () => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour acheter des billets');
            return;
        }

        if (!selectedEvent) return;

        // Pour les événements payants, ajouter un billet standard
        if (!selectedEvent.is_free && selectedEvent.ticket_price) {
            const cartItem = {
                id: selectedEvent.id,
                type: 'event',
                title: selectedEvent.title,
                artist: selectedEvent.artists_array?.[0] || 'Event',
                event_date: selectedEvent.event_date,
                venue: selectedEvent.venue,
                city: selectedEvent.city,
                ticket_type: 'Standard',
                ticket_price: selectedEvent.ticket_price,
                price: selectedEvent.ticket_price,
                quantity: 1,
                poster: selectedEvent.poster_image_url,
                max_attendees: selectedEvent.max_attendees
            };

            addToCart(cartItem);

            toast.success(
                'Billet ajouté au panier',
                `Billet pour "${selectedEvent.title}" ajouté au panier`
            );
        }

        closeTicketModal();
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
                    <div className="event-date-badge bg-primary text-white p-4 text-center" style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="fw-bold" style={{ fontSize: '2.5rem' }}>
                            {new Date(event.event_date).getDate()}
                        </div>
                        <div style={{ fontSize: '1.2rem' }}>
                            {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'long' })}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="position-absolute top-0 start-0 m-3">
                        <Badge bg="primary" className="mb-2">
                            {event.category || 'Événement'}
                        </Badge>
                        {event.is_featured && (
                            <Badge bg="warning" text="dark">
                                <FontAwesomeIcon icon={faStar} className="me-1" />
                                Featured
                            </Badge>
                        )}
                    </div>

                    {event.is_free && (
                        <div className="position-absolute top-0 end-0 m-3">
                            <Badge bg="success">
                                Gratuit
                            </Badge>
                        </div>
                    )}

                    {/* Overlay au hover */}
                    <div className="event-overlay">
                        <div className="event-overlay-content text-center">
                            <Button
                                as={Link}
                                to={`/events/${event.id}`}
                                variant="light"
                                className="mb-2 me-2"
                            >
                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                Voir détails
                            </Button>
                            {!event.is_free && (
                                <Button
                                    variant="primary"
                                    onClick={() => openTicketModal(event)}
                                >
                                    <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                                    Billets
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0">
                            <Link
                                to={`/events/${event.id}`}
                                className="text-decoration-none text-dark"
                            >
                                {event.title}
                            </Link>
                        </h5>
                    </div>

                    <p className="text-muted small mb-2">
                        {event.artists_array && event.artists_array.length > 0 &&
                            `par ${event.artists_array.slice(0, 2).join(', ')}${event.artists_array.length > 2 ? '...' : ''}`
                        }
                    </p>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                            <small>{formatDate(event.event_date)}</small>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                            <FontAwesomeIcon icon={faClock} className="text-primary me-2" />
                            <small>{event.start_time || 'Heure à confirmer'}</small>
                        </div>
                        <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                            <small>{event.venue}, {event.city}</small>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {event.is_free ? (
                                <span className="fw-bold text-success">Gratuit</span>
                            ) : (
                                <span className="fw-bold text-primary">
                                    À partir de {formatCurrency(getLowestPrice(event))}
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-1">
                            <Button
                                as={Link}
                                to={`/events/${event.id}`}
                                variant="outline-primary"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </Button>
                            {!event.is_free && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => openTicketModal(event)}
                                >
                                    <FontAwesomeIcon icon={faTicketAlt} />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    const EventListItem = ({ event, index }) => (
        <AnimatedElement animation="slideInUp" delay={100 + (index * 50)}>
            <Card className="event-list-item border-0 shadow-sm mb-3">
                <Row className="g-0">
                    <Col md={3}>
                        <img
                            src={event.poster_image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&h=200&fit=crop`}
                            className="img-fluid rounded-start"
                            style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                            alt={event.title}
                        />
                    </Col>
                    <Col md={9}>
                        <Card.Body>
                            <Row className="h-100">
                                <Col md={8}>
                                    <div className="d-flex align-items-center mb-2">
                                        <Badge bg="primary" className="me-2">{event.category || 'Événement'}</Badge>
                                        {event.is_featured && (
                                            <Badge bg="warning" text="dark">
                                                <FontAwesomeIcon icon={faStar} className="me-1" />
                                                Featured
                                            </Badge>
                                        )}
                                        {event.is_free && (
                                            <Badge bg="success" className="ms-2">Gratuit</Badge>
                                        )}
                                    </div>

                                    <h5 className="fw-bold mb-2">
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="text-decoration-none text-dark"
                                        >
                                            {event.title}
                                        </Link>
                                    </h5>

                                    {event.artists_array && event.artists_array.length > 0 && (
                                        <p className="text-muted mb-2">
                                            par {event.artists_array.slice(0, 2).join(', ')}
                                            {event.artists_array.length > 2 ? '...' : ''}
                                        </p>
                                    )}

                                    <p className="text-muted small mb-2">{event.description}</p>

                                    <div className="event-details">
                                        <div className="d-flex align-items-center mb-1">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                                            <span>{formatDate(event.event_date)} à {event.start_time || 'Heure à confirmer'}</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                                            <span>{event.venue}, {event.city}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4} className="d-flex flex-column justify-content-between">
                                    <div className="text-end">
                                        {event.is_free ? (
                                            <div className="fw-bold text-success fs-5">Gratuit</div>
                                        ) : (
                                            <div className="fw-bold text-primary fs-5">
                                                À partir de {formatCurrency(getLowestPrice(event))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button
                                            as={Link}
                                            to={`/events/${event.id}`}
                                            variant="outline-primary"
                                            size="sm"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                            Détails
                                        </Button>
                                        {!event.is_free && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => openTicketModal(event)}
                                            >
                                                <FontAwesomeIcon icon={faTicketAlt} className="me-1" />
                                                Billets
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </AnimatedElement>
    );

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Hero Section */}
            <div className="hero-gradient text-white">
                <Container>
                    <div className="py-5">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <AnimatedElement animation="slideInLeft" delay={100}>
                                    <h1 className="display-4 fw-bold mb-3">
                                        Événements
                                    </h1>
                                    <p className="lead mb-4">
                                        Découvrez les meilleurs événements musicaux du Cameroun.
                                        Concerts, festivals, showcases et plus encore !
                                    </p>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            <span>{filteredEvents.length} événements disponibles</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                            <span>Partout au Cameroun</span>
                                        </div>
                                    </div>
                                </AnimatedElement>
                            </Col>
                            <Col lg={4}>
                                <AnimatedElement animation="slideInRight" delay={200}>
                                    <div className="text-end">
                                        <Button
                                            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="me-2"
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
                                        {formatDate(selectedEvent.event_date)}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        {selectedEvent.start_time || 'Heure à confirmer'}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                        {selectedEvent.venue}
                                    </span>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3">Billet disponible</h6>
                            {!selectedEvent.is_free && selectedEvent.ticket_price ? (
                                <div className="border rounded p-3 mb-3">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <h6 className="fw-bold mb-1">Billet Standard</h6>
                                            <div className="text-primary fw-bold fs-5">
                                                {formatCurrency(selectedEvent.ticket_price)}
                                            </div>
                                            <small className="text-muted d-block">
                                                {selectedEvent.remaining_spots > 0 ?
                                                    `${selectedEvent.remaining_spots} places disponibles` :
                                                    'Places limitées'
                                                }
                                            </small>
                                            <small className="text-info d-block mt-1">
                                                Accès général à l'événement
                                            </small>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <Button
                                                variant="primary"
                                                onClick={handleAddToCart}
                                                disabled={selectedEvent.remaining_spots <= 0}
                                            >
                                                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                                Ajouter au panier
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <p className="text-muted">
                                        {selectedEvent.is_free ?
                                            "Cet événement est gratuit" :
                                            "Billets non disponibles pour le moment"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeTicketModal}>
                        Fermer
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
                        transform: translateX(2px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Events;
