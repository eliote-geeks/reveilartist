import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faPlay,
    faDownload,
    faEdit,
    faMusic,
    faCalendarAlt,
    faMapMarkerAlt,
    faClock,
    faEye,
    faShoppingCart,
    faTicketAlt,
    faPlus,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const MyCreations = () => {
    const [activeTab, setActiveTab] = useState('sons');
    const [loading, setLoading] = useState(true);
    const [mySounds, setMySounds] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [error, setError] = useState('');

    const { token, user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        if (token) {
            loadMyCreations();
        }
    }, [token]);

    const loadMyCreations = async () => {
        try {
            setLoading(true);
            setError('');

            // Charger mes sons créés
            const soundsResponse = await fetch('/api/sounds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Charger mes événements créés
            const eventsResponse = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (soundsResponse.ok) {
                const soundsData = await soundsResponse.json();
                console.log('Sons data:', soundsData); // Debug

                // Gérer différents formats de réponse API
                let soundsArray = [];
                if (Array.isArray(soundsData)) {
                    soundsArray = soundsData;
                } else if (soundsData.data && Array.isArray(soundsData.data)) {
                    soundsArray = soundsData.data;
                } else if (soundsData.sounds && Array.isArray(soundsData.sounds)) {
                    soundsArray = soundsData.sounds;
                }

                // Filtrer pour ne garder que les sons créés par l'utilisateur connecté
                const userSounds = soundsArray.filter(sound =>
                    sound.user_id === user?.id ||
                    sound.artist_id === user?.id ||
                    sound.created_by === user?.id
                );
                setMySounds(userSounds);
            } else {
                console.error('Erreur lors du chargement des sons');
                setMySounds([]);
            }

            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                console.log('Événements data:', eventsData); // Debug

                // Gérer différents formats de réponse API
                let eventsArray = [];
                if (Array.isArray(eventsData)) {
                    eventsArray = eventsData;
                } else if (eventsData.data && Array.isArray(eventsData.data)) {
                    eventsArray = eventsData.data;
                } else if (eventsData.events && Array.isArray(eventsData.events)) {
                    eventsArray = eventsData.events;
                }

                // Filtrer pour ne garder que les événements créés par l'utilisateur connecté
                const userEvents = eventsArray.filter(event =>
                    event.user_id === user?.id ||
                    event.organizer_id === user?.id ||
                    event.created_by === user?.id
                );
                setMyEvents(userEvents);
            } else {
                console.error('Erreur lors du chargement des événements');
                setMyEvents([]);
            }

        } catch (error) {
            console.error('Erreur lors du chargement des créations:', error);
            setError('Impossible de charger vos créations');
            setMySounds([]);
            setMyEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSound = async (soundId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce son ?')) return;

        try {
            const response = await fetch(`/api/sounds/${soundId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setMySounds(prev => prev.filter(sound => sound.id !== soundId));
                toast.success('Supprimé', 'Son supprimé avec succès');
            } else {
                toast.error('Erreur', 'Impossible de supprimer le son');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setMyEvents(prev => prev.filter(event => event.id !== eventId));
                toast.success('Supprimé', 'Événement supprimé avec succès');
            } else {
                toast.error('Erreur', 'Impossible de supprimer l\'événement');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'published': { variant: 'success', text: 'Publié' },
            'draft': { variant: 'warning', text: 'Brouillon' },
            'pending': { variant: 'info', text: 'En attente' },
            'rejected': { variant: 'danger', text: 'Rejeté' },
            'active': { variant: 'success', text: 'Actif' },
            'inactive': { variant: 'secondary', text: 'Inactif' }
        };
        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    if (!token) {
        return (
            <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center avoid-header-overlap">
                <div className="text-center">
                    <FontAwesomeIcon icon={faUser} size="3x" className="text-muted mb-3" />
                    <h3 className="text-muted mb-3">Connexion requise</h3>
                    <p className="text-secondary mb-4">Vous devez être connecté pour voir vos créations</p>
                    <Button as={Link} to="/login" variant="primary">
                        Se connecter
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 avoid-header-overlap">
            {/* Hero Section */}
            <section className="hero-gradient text-white py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <div className="slide-in">
                                <div className="mb-3">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="float-animation text-white"
                                        style={{ fontSize: '2.5rem', opacity: 0.9 }}
                                    />
                                </div>
                                <h1 className="mb-3 fw-bold text-white">
                                    Mes
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> Créations</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Gérez tous vos sons et événements créés
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <Container className="py-4">
                {error && (
                    <Alert variant="danger" className="mb-4">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        {error}
                        <Button variant="link" className="p-0 ms-2" onClick={loadMyCreations}>
                            Réessayer
                        </Button>
                    </Alert>
                )}

                {/* Navigation Tabs */}
                <Row className="mb-4">
                    <Col>
                        <AnimatedElement animation="slideInUp" delay={200}>
                            <Nav variant="pills" className="justify-content-center">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'sons'}
                                        onClick={() => setActiveTab('sons')}
                                        className="rounded-pill px-4"
                                    >
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Mes Sons ({mySounds.length})
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'events'}
                                        onClick={() => setActiveTab('events')}
                                        className="rounded-pill px-4"
                                    >
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                        Mes Événements ({myEvents.length})
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </AnimatedElement>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <h5 className="text-muted">Chargement de vos créations...</h5>
                    </div>
                ) : (
                    <>
                        {/* Mes Sons */}
                        {activeTab === 'sons' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4>Mes Sons</h4>
                                    <Button as={Link} to="/add-sound" variant="primary">
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Nouveau son
                                    </Button>
                                </div>

                                {mySounds.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon
                                            icon={faMusic}
                                            size="3x"
                                            className="text-muted mb-3"
                                        />
                                        <h4 className="text-muted mb-3">Aucun son créé</h4>
                                        <p className="text-muted mb-4">
                                            Commencez par ajouter votre premier son
                                        </p>
                                        <Button as={Link} to="/add-sound" variant="primary">
                                            Créer mon premier son
                                        </Button>
                                    </div>
                                ) : (
                                    <Row className="g-4">
                                        {mySounds.map((sound, index) => (
                                            <Col key={sound.id} lg={6} md={6}>
                                                <AnimatedElement animation="slideInUp" delay={300 + (index * 100)}>
                                                    <Card className="h-100 shadow-sm border-0">
                                                        <Row className="g-0">
                                                            <Col md={4}>
                                                                <Card.Img
                                                                    src={sound.cover_image || sound.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop`}
                                                                    alt={sound.title}
                                                                    style={{ height: '140px', objectFit: 'cover' }}
                                                                />
                                                            </Col>
                                                            <Col md={8}>
                                                                <Card.Body className="d-flex flex-column h-100">
                                                                    <div className="flex-grow-1">
                                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                                            <div>
                                                                                <Card.Title className="h6 mb-1">{sound.title}</Card.Title>
                                                                                <Card.Text className="small text-muted mb-1">
                                                                                    par {sound.artist || sound.user?.name || 'Artiste'}
                                                                                </Card.Text>
                                                                            </div>
                                                                            {getStatusBadge(sound.status || 'published')}
                                                                        </div>
                                                                        <p className="small text-muted mb-2">
                                                                            Créé le {formatDate(sound.created_at)}
                                                                        </p>
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <span className="small text-muted">
                                                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                                {sound.duration || '0:00'}
                                                                            </span>
                                                                            {sound.is_free || sound.price === 0 ? (
                                                                                <span className="fw-bold text-success">Gratuit</span>
                                                                            ) : (
                                                                                <span className="fw-bold text-primary">
                                                                                    {formatCurrency(sound.price || 0)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="d-flex justify-content-between align-items-center small text-muted">
                                                                            <span>{sound.plays_count || sound.plays || 0} écoutes</span>
                                                                            <span>{sound.downloads_count || sound.downloads || 0} téléchargements</span>
                                                                        </div>
                                                                        {sound.category && (
                                                                            <Badge bg="secondary" className="mt-2">
                                                                                {sound.category.name || sound.category}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="d-flex gap-2 mt-2">
                                                                        <Button
                                                                            as={Link}
                                                                            to={`/sound/${sound.id}`}
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} />
                                                                        </Button>
                                                                        <Button
                                                                            as={Link}
                                                                            to={`/edit-sound/${sound.id}`}
                                                                            variant="outline-success"
                                                                            size="sm"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEdit} />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteSound(sound.id)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </Button>
                                                                    </div>
                                                                </Card.Body>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </AnimatedElement>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </>
                        )}

                        {/* Mes Événements */}
                        {activeTab === 'events' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4>Mes Événements</h4>
                                    <Button as={Link} to="/add-event" variant="primary">
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Nouvel événement
                                    </Button>
                                </div>

                                {myEvents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon
                                            icon={faCalendarAlt}
                                            size="3x"
                                            className="text-muted mb-3"
                                        />
                                        <h4 className="text-muted mb-3">Aucun événement créé</h4>
                                        <p className="text-muted mb-4">
                                            Commencez par organiser votre premier événement
                                        </p>
                                        <Button as={Link} to="/add-event" variant="primary">
                                            Créer mon premier événement
                                        </Button>
                                    </div>
                                ) : (
                                    <Row className="g-4">
                                        {myEvents.map((event, index) => (
                                            <Col key={event.id} lg={4} md={6}>
                                                <AnimatedElement animation="slideInUp" delay={300 + (index * 100)}>
                                                    <Card className="h-100 shadow-sm border-0">
                                                        <div className="position-relative">
                                                            <Card.Img
                                                                variant="top"
                                                                src={event.poster_image_url || event.featured_image || event.image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=250&fit=crop`}
                                                                style={{ height: '180px', objectFit: 'cover' }}
                                                            />
                                                            {(event.is_free || event.ticket_price === 0) && (
                                                                <Badge bg="success" className="position-absolute top-0 start-0 m-3">
                                                                    Gratuit
                                                                </Badge>
                                                            )}
                                                            <div className="position-absolute top-0 end-0 m-3">
                                                                {getStatusBadge(event.status || 'active')}
                                                            </div>
                                                        </div>
                                                        <Card.Body className="d-flex flex-column">
                                                            <div className="flex-grow-1">
                                                                <Card.Title className="h6 mb-2">{event.title}</Card.Title>
                                                                <div className="d-flex align-items-center text-muted small mb-2">
                                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                                    {formatDate(event.event_date || event.date)}
                                                                </div>
                                                                <div className="d-flex align-items-center text-muted small mb-2">
                                                                    <FontAwesomeIcon icon={faClock} className="me-2" />
                                                                    {event.start_time || event.time}
                                                                </div>
                                                                <div className="d-flex align-items-center text-muted small mb-3">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                                    {event.venue || event.location}, {event.city}
                                                                </div>
                                                                <div className="text-center mb-3">
                                                                    {event.is_free || event.ticket_price === 0 ? (
                                                                        <span className="fw-bold text-success">Entrée gratuite</span>
                                                                    ) : (
                                                                        <span className="fw-bold text-primary">
                                                                            À partir de {formatCurrency(event.ticket_price || event.price || 0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="d-flex justify-content-between small text-muted">
                                                                    <span>{event.tickets_sold || event.attendees_count || 0} participants</span>
                                                                    <span>{event.max_attendees || event.capacity || 'Illimité'} places</span>
                                                                </div>
                                                                {event.category && (
                                                                    <Badge bg="info" className="mt-2">
                                                                        {event.category.name || event.category}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                <Button
                                                                    as={Link}
                                                                    to={`/event/${event.id}`}
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                                <Button
                                                                    as={Link}
                                                                    to={`/edit-event/${event.id}`}
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </AnimatedElement>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </>
                        )}
                    </>
                )}
            </Container>
        </div>
    );
};

export default MyCreations;
