import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Badge, ListGroup, ProgressBar, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faMusic,
    faShoppingBag,
    faHeart,
    faCog,
    faDownload,
    faCalendar,
    faStar,
    faEye,
    faHeadphones,
    faPlay,
    faPause,
    faEdit,
    faTrash,
    faPlus,
    faUpload,
    faCalendarAlt,
    faTicketAlt,
    faEuroSign,
    faUsers,
    faMapMarkerAlt,
    faClock,
    faSearch,
    faFilter,
    faSort,
    faChartLine,
    faShare,
    faBookmark,
    faBell,
    faPrint,
    faUserPlus,
    faCheckCircle,
    faInfoCircle,
    faExclamationTriangle,
    faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner, { LoadingOverlay } from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Données des achats utilisateur
    const [purchasedSounds, setPurchasedSounds] = useState([]);
    const [purchasedEvents, setPurchasedEvents] = useState([]);

    // Données des favoris
    const [favoriteSounds, setFavoriteSounds] = useState([]);
    const [favoriteArtists, setFavoriteArtists] = useState([]);
    const [favoriteEvents, setFavoriteEvents] = useState([]);

    // Données des créations
    const [mySounds, setMySounds] = useState([]);
    const [pendingSounds, setPendingSounds] = useState([]);

    // Notifications
    const [notifications, setNotifications] = useState([]);

    const { user, token } = useAuth();
    const toast = useToast();

    // Simuler le chargement lors du changement d'onglet
    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setIsLoading(true);
            setTimeout(() => {
                setActiveTab(tab);
                setIsLoading(false);
            }, 800);
        }
    };

    // Charger les données depuis l'API
    useEffect(() => {
        loadUserPurchases();
        loadUserFavorites();
        loadUserNotifications();
        loadUserSounds();
    }, []);

    const loadUserPurchases = async () => {
        try {
            // Récupérer les sons achetés
            const soundsResponse = await fetch('/api/user/purchased-sounds', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (soundsResponse.ok) {
                const soundsData = await soundsResponse.json();
                setPurchasedSounds(Array.isArray(soundsData) ? soundsData : soundsData.data || []);
            }

            // Récupérer les événements achetés
            const eventsResponse = await fetch('/api/user/purchased-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                setPurchasedEvents(Array.isArray(eventsData) ? eventsData : eventsData.data || []);
            }
        } catch (error) {
            // Données de fallback pour la démo
            setPurchasedSounds([
                {
                    id: 1,
                    title: "Beat Afro Moderne",
                    artist: "DJ Cameroun",
                    price: 2500,
                    purchase_date: "2024-03-15",
                    cover_image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
                    audio_file_url: "/downloads/beat-afro-moderne.mp3",
                    order_number: "RVL-1710511200-ABC123"
                },
                {
                    id: 2,
                    title: "Makossa Fusion",
                    artist: "UrbanSonic",
                    price: 3500,
                    purchase_date: "2024-03-10",
                    cover_image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
                    audio_file_url: "/downloads/makossa-fusion.mp3",
                    order_number: "RVL-1710252000-DEF456"
                }
            ]);

            setPurchasedEvents([
                {
                    id: 1,
                    title: "RéveilArt4artist Festival 2024",
                    venue: "Stade Ahmadou Ahidjo",
                    city: "Yaoundé",
                    event_date: "2024-06-15",
                    start_time: "20:00",
                    ticket_price: 15000,
                    quantity: 2,
                    purchase_date: "2024-03-12",
                    poster_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=200&fit=crop",
                    order_number: "RVL-1710338400-GHI789"
                }
            ]);
        }
    };

    const loadUserFavorites = async () => {
        try {
            // Sons favoris
            const soundsResponse = await fetch('/api/user/favorite-sounds', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (soundsResponse.ok) {
                const soundsData = await soundsResponse.json();
                setFavoriteSounds(Array.isArray(soundsData) ? soundsData : soundsData.data || []);
            }

            // Artistes suivis
            const artistsResponse = await fetch('/api/user/followed-artists', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (artistsResponse.ok) {
                const artistsData = await artistsResponse.json();
                setFavoriteArtists(Array.isArray(artistsData) ? artistsData : artistsData.data || []);
            }

            // Événements favoris
            const eventsResponse = await fetch('/api/user/favorite-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                setFavoriteEvents(Array.isArray(eventsData) ? eventsData : eventsData.data || []);
            }
        } catch (error) {
            // Données de fallback
            setFavoriteSounds([
                {
                    id: 1,
                    title: "Coupé-Décalé Beat",
                    artist: "BeatMaker237",
                    likes_count: 89,
                    cover_image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"
                },
                {
                    id: 2,
                    title: "Bikutsi Électro",
                    artist: "DJ Yaoundé",
                    likes_count: 78,
                    cover_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop"
                }
            ]);

            setFavoriteArtists([
                {
                    id: 1,
                    name: "BeatMaker237",
                    followers_count: 1250,
                    sounds_count: 45,
                    profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                },
                {
                    id: 2,
                    name: "DJ Yaoundé",
                    followers_count: 890,
                    sounds_count: 32,
                    profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                }
            ]);

            setFavoriteEvents([
                {
                    id: 1,
                    title: "Concert Afrobeat Douala",
                    event_date: "2024-05-20",
                    venue: "Palais des Sports",
                    city: "Douala",
                    poster_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=200&fit=crop"
                }
            ]);
        }
    };

    const loadUserNotifications = async () => {
        try {
            const response = await fetch('/api/user/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            // Notifications de fallback
            setNotifications([
                {
                    id: 1,
                    type: 'success',
                    title: 'Achat confirmé',
                    message: 'Votre achat "Beat Afro Moderne" a été confirmé',
                    date: '2024-03-15T10:30:00Z',
                    read: false
                },
                {
                    id: 2,
                    type: 'info',
                    title: 'Nouvel événement',
                    message: 'Un nouvel événement "Concert Makossa" a été ajouté près de chez vous',
                    date: '2024-03-14T15:45:00Z',
                    read: true
                },
                {
                    id: 3,
                    type: 'warning',
                    title: 'Événement bientôt',
                    message: 'L\'événement "RéveilArt4artist Festival" commence dans 2 jours',
                    date: '2024-03-13T09:00:00Z',
                    read: false
                }
            ]);
        }
    };

    const loadUserSounds = async () => {
        try {
            const response = await fetch('/api/user/sounds', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const sounds = Array.isArray(data) ? data : data.data || [];
                setMySounds(sounds.filter(sound => sound.status === 'approved'));
                setPendingSounds(sounds.filter(sound => sound.status === 'pending'));
            }
        } catch (error) {
            // Données de fallback
            const demoSounds = [
                {
                    id: 1,
                    title: "Afro Fusion Beat",
                    description: "Un beat afro moderne",
                    status: "pending",
                    created_at: "2024-03-15T10:30:00Z",
                    updated_at: "2024-03-15T10:30:00Z",
                    price: null,
                    category: "Afrobeat",
                    plays_count: 0,
                    likes_count: 0,
                    cover_image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
                },
                {
                    id: 2,
                    title: "Makossa Electric",
                    description: "Fusion électronique du makossa",
                    status: "pending",
                    created_at: "2024-03-14T15:20:00Z",
                    updated_at: "2024-03-14T15:20:00Z",
                    price: null,
                    category: "Traditional",
                    plays_count: 0,
                    likes_count: 0,
                    cover_image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop"
                },
                {
                    id: 3,
                    title: "Urban Cameroun",
                    description: "Hip-hop avec influences camerounaises",
                    status: "approved",
                    created_at: "2024-03-10T09:15:00Z",
                    updated_at: "2024-03-12T14:30:00Z",
                    price: 2500,
                    category: "Hip-Hop",
                    plays_count: 45,
                    likes_count: 12,
                    cover_image_url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100&h=100&fit=crop"
                }
            ];

            setMySounds(demoSounds.filter(sound => sound.status === 'approved'));
            setPendingSounds(demoSounds.filter(sound => sound.status === 'pending'));
        }
    };

    // Données utilisateur étendues
    const userStats = {
        totalSpent: purchasedSounds.reduce((sum, sound) => sum + sound.price, 0) +
                    purchasedEvents.reduce((sum, event) => sum + (event.ticket_price * event.quantity), 0),
        totalPurchases: purchasedSounds.length + purchasedEvents.length,
        favoriteGenre: "Afrobeat",
        memberSince: "Janvier 2024",
        downloads: purchasedSounds.length,
        likes: favoriteSounds.length
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const downloadSound = (sound) => {
        // Simuler le téléchargement d'un fichier audio
        const link = document.createElement('a');
        link.href = sound.audio_file_url || '#';
        link.download = `${sound.title}.mp3`;
        link.click();

        toast.success('Téléchargement', `${sound.title} est en cours de téléchargement`);
    };

    const printEventTicket = (event) => {
        const ticketWindow = window.open('', '_blank');
        const ticketHtml = generateTicketHTML(event);

        ticketWindow.document.write(ticketHtml);
        ticketWindow.document.close();
        ticketWindow.focus();
        ticketWindow.print();

        toast.success('Ticket imprimé', `Votre ticket pour ${event.title} est prêt`);
    };

    const generateTicketHTML = (event) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${event.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                    .ticket { border: 2px dashed #333; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
                    .ticket-header { text-align: center; margin-bottom: 20px; }
                    .event-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                    .ticket-info { margin-bottom: 15px; }
                    .ticket-info div { margin-bottom: 8px; }
                    .qr-placeholder { width: 80px; height: 80px; background: white; margin: 20px auto; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; }
                    .ticket-number { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 2px; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <div style="font-size: 24px;">🎵</div>
                        <div class="event-title">${event.title}</div>
                    </div>

                    <div class="ticket-info">
                        <div><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
                        <div><strong>🕒 Heure:</strong> ${event.start_time || '20:00'}</div>
                        <div><strong>📍 Lieu:</strong> ${event.venue}</div>
                        <div><strong>🏙️ Ville:</strong> ${event.city}</div>
                        <div><strong>🎫 Quantité:</strong> ${event.quantity} ticket(s)</div>
                        <div><strong>👤 Titulaire:</strong> ${user?.name}</div>
                    </div>

                    <div class="qr-placeholder">
                        QR CODE
                    </div>

                    <div class="ticket-number">
                        ${event.order_number}-${event.id}
                    </div>

                    <div style="text-align: center; margin-top: 15px; font-size: 12px;">
                        <p>Ticket valide - Présenter à l'entrée</p>
                        <p>Reveil4artist</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/mark-read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.warn('Erreur lors du marquage de la notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return faCheckCircle;
            case 'warning': return faExclamationTriangle;
            case 'error': return faTimesCircle;
            default: return faInfoCircle;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'text-success';
            case 'warning': return 'text-warning';
            case 'error': return 'text-danger';
            default: return 'text-info';
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { variant: 'warning', text: 'En attente' },
            approved: { variant: 'success', text: 'Approuvé' },
            rejected: { variant: 'danger', text: 'Rejeté' },
            published: { variant: 'success', text: 'Publié' }
        };
        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const setSoundPrice = async (soundId, price) => {
        try {
            const response = await fetch(`/api/sounds/${soundId}/price`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: parseFloat(price) })
            });

            if (response.ok) {
                // Recharger les sons de l'utilisateur
                await loadUserSounds();
                toast.success('Prix défini', `Le prix de votre son a été mis à jour`);
            } else {
                toast.error('Erreur', 'Impossible de définir le prix');
            }
        } catch (error) {
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    const handlePriceSubmit = (soundId) => {
        const priceInput = document.getElementById(`price-${soundId}`);
        const price = priceInput.value;

        if (!price || parseFloat(price) < 0) {
            toast.error('Erreur', 'Veuillez entrer un prix valide');
            return;
        }

        setSoundPrice(soundId, price);
    };

    const renderMyCreations = () => (
        <div className="fade-in">
            {/* Statistiques des créations */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faMusic} className="text-primary mb-2" size="2x" />
                            <h4 className="fw-bold text-primary">{mySounds.length + pendingSounds.length}</h4>
                            <small className="text-muted">Total créations</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-2" size="2x" />
                            <h4 className="fw-bold text-success">{mySounds.length}</h4>
                            <small className="text-muted">Sons approuvés</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faClock} className="text-warning mb-2" size="2x" />
                            <h4 className="fw-bold text-warning">{pendingSounds.length}</h4>
                            <small className="text-muted">En attente</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-info mb-2" size="2x" />
                            <h4 className="fw-bold text-info">{mySounds.reduce((acc, sound) => acc + sound.plays_count, 0)}</h4>
                            <small className="text-muted">Écoutes totales</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Actions */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Gérer vos créations</h6>
                        <Button as={Link} to="/add-sound" variant="primary">
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Nouveau son
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Sons en attente de validation */}
            {pendingSounds.length > 0 && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-warning bg-opacity-10">
                        <h5 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                            Sons en attente de validation ({pendingSounds.length})
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <ListGroup variant="flush">
                            {pendingSounds.map((sound) => (
                                <ListGroup.Item key={sound.id} className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={sound.cover_image_url}
                                                    alt={sound.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-1 small">{sound.description}</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge bg="light" text="dark">{sound.category}</Badge>
                                                        {getStatusBadge(sound.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <small className="text-muted">Soumis le</small>
                                            <div className="fw-bold">
                                                {new Date(sound.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="text-warning">
                                                <FontAwesomeIcon icon={faClock} size="lg" />
                                                <div className="small mt-1">En cours de validation</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            {/* Sons approuvés */}
            {mySounds.length > 0 && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-success bg-opacity-10">
                        <h5 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                            Sons approuvés ({mySounds.length})
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <ListGroup variant="flush">
                            {mySounds.map((sound) => (
                                <ListGroup.Item key={sound.id} className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={sound.cover_image_url}
                                                    alt={sound.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-1 small">{sound.description}</p>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Badge bg="light" text="dark">{sound.category}</Badge>
                                                        {getStatusBadge(sound.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={2} className="text-center">
                                            <div className="small">
                                                <FontAwesomeIcon icon={faPlay} className="text-primary me-1" />
                                                <div className="fw-bold">{sound.plays_count}</div>
                                                <small className="text-muted">Écoutes</small>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            {sound.price ? (
                                                <div className="text-center">
                                                    <div className="fw-bold text-success">{formatCurrency(sound.price)}</div>
                                                    <small className="text-muted">Prix défini</small>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Form.Label className="small fw-bold">Définir le prix :</Form.Label>
                                                    <InputGroup size="sm">
                                                        <Form.Control
                                                            id={`price-${sound.id}`}
                                                            type="number"
                                                            placeholder="Prix FCFA"
                                                            min="0"
                                                            step="100"
                                                        />
                                                        <Button
                                                            variant="success"
                                                            onClick={() => handlePriceSubmit(sound.id)}
                                                        >
                                                            <FontAwesomeIcon icon={faEuroSign} />
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            )}
                                        </Col>
                                        <Col md={3} className="text-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                as={Link}
                                                to={`/sound/${sound.id}`}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                as={Link}
                                                to={`/edit-sound/${sound.id}`}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            {/* Message si aucune création */}
            {mySounds.length === 0 && pendingSounds.length === 0 && (
                <Card className="border-0 shadow-sm text-center py-5">
                    <Card.Body>
                        <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                        <h5 className="text-muted">Aucune création pour le moment</h5>
                        <p className="text-muted">Commencez par ajouter votre premier son</p>
                        <Button as={Link} to="/add-sound" variant="primary">
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Ajouter un son
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    );

    const renderPurchases = () => (
        <div className="fade-in">
            {/* Statistiques des achats */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faShoppingBag} className="text-primary mb-2" size="2x" />
                            <h4 className="fw-bold text-primary">{userStats.totalPurchases}</h4>
                            <small className="text-muted">Total achats</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faMusic} className="text-success mb-2" size="2x" />
                            <h4 className="fw-bold text-success">{purchasedSounds.length}</h4>
                            <small className="text-muted">Sons achetés</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-info mb-2" size="2x" />
                            <h4 className="fw-bold text-info">{purchasedEvents.length}</h4>
                            <small className="text-muted">Événements</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="2x" />
                            <h4 className="fw-bold text-warning">{formatCurrency(userStats.totalSpent)}</h4>
                            <small className="text-muted">Total dépensé</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sons achetés */}
            {purchasedSounds.length > 0 && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white">
                        <h5 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                            Sons achetés ({purchasedSounds.length})
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <ListGroup variant="flush">
                            {purchasedSounds.map((sound) => (
                                <ListGroup.Item key={sound.id} className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={sound.cover_image_url}
                                                    alt={sound.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-1 small">par {sound.artist}</p>
                                                    <small className="text-muted">
                                                        Acheté le {new Date(sound.purchase_date).toLocaleDateString('fr-FR')}
                                                    </small>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="fw-bold text-success">{formatCurrency(sound.price)}</div>
                                            <small className="text-muted">#{sound.order_number}</small>
                                        </Col>
                                        <Col md={3} className="text-end">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => downloadSound(sound)}
                                                className="me-2"
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                Télécharger
                                            </Button>
                                            <small className="d-block text-muted mt-1">Illimité</small>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            {/* Événements achetés */}
            {purchasedEvents.length > 0 && (
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white">
                        <h5 className="fw-bold mb-0">
                            <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-success" />
                            Billets d'événements ({purchasedEvents.length})
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <ListGroup variant="flush">
                            {purchasedEvents
                                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                                .map((event) => (
                                <ListGroup.Item key={event.id} className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={event.poster_url}
                                                    alt={event.title}
                                                    className="rounded me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="fw-bold mb-1">{event.title}</h6>
                                                    <p className="text-muted mb-1 small">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                        {event.venue}, {event.city}
                                                    </p>
                                                    <small className="text-muted">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                        {new Date(event.event_date).toLocaleDateString('fr-FR')} à {event.start_time}
                                                    </small>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="fw-bold text-success">
                                                {formatCurrency(event.ticket_price * event.quantity)}
                                            </div>
                                            <small className="text-muted">{event.quantity} ticket(s)</small>
                                        </Col>
                                        <Col md={3} className="text-end">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => printEventTicket(event)}
                                            >
                                                <FontAwesomeIcon icon={faPrint} className="me-1" />
                                                Imprimer billet
                                            </Button>
                                            {new Date(event.event_date) < new Date() && (
                                                <Badge bg="secondary" className="d-block mt-1">Événement passé</Badge>
                                            )}
                                            {new Date(event.event_date) > new Date() && (
                                                <Badge bg="success" className="d-block mt-1">À venir</Badge>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}

            {purchasedSounds.length === 0 && purchasedEvents.length === 0 && (
                <Card className="border-0 shadow-sm text-center py-5">
                    <Card.Body>
                        <FontAwesomeIcon icon={faShoppingBag} size="3x" className="text-muted mb-3" />
                        <h5 className="text-muted">Aucun achat pour le moment</h5>
                        <p className="text-muted">Explorez notre catalogue pour découvrir des sons et événements</p>
                        <Button as={Link} to="/catalog" variant="primary">
                            Explorer le catalogue
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </div>
    );

    const renderFavorites = () => (
        <div className="fade-in">
            {/* Sons favoris */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faMusic} className="me-2 text-danger" />
                        Sons favoris ({favoriteSounds.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {favoriteSounds.length > 0 ? (
                        <ListGroup variant="flush">
                            {favoriteSounds.map((sound) => (
                                <ListGroup.Item key={sound.id} className="p-4">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={sound.cover_image_url}
                                            alt={sound.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{sound.title}</h6>
                                            <p className="text-muted mb-1 small">par {sound.artist}</p>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faHeart} className="me-1 text-danger" />
                                                {sound.likes_count} j'aime
                                            </small>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                as={Link}
                                                to={`/sound/${sound.id}`}
                                            >
                                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                Écouter
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faHeart} size="2x" className="text-muted mb-2" />
                            <p className="text-muted">Aucun son en favori</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Artistes suivis */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faUserPlus} className="me-2 text-primary" />
                        Artistes suivis ({favoriteArtists.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {favoriteArtists.length > 0 ? (
                        <ListGroup variant="flush">
                            {favoriteArtists.map((artist) => (
                                <ListGroup.Item key={artist.id} className="p-4">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={artist.profile_picture}
                                            alt={artist.name}
                                            className="rounded-circle me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{artist.name}</h6>
                                            <p className="text-muted mb-1 small">
                                                {artist.sounds_count} sons • {artist.followers_count} abonnés
                                            </p>
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                as={Link}
                                                to={`/artist/${artist.id}`}
                                            >
                                                Voir profil
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faUserPlus} size="2x" className="text-muted mb-2" />
                            <p className="text-muted">Aucun artiste suivi</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Événements favoris */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                        Événements favoris ({favoriteEvents.length})
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {favoriteEvents.length > 0 ? (
                        <ListGroup variant="flush">
                            {favoriteEvents.map((event) => (
                                <ListGroup.Item key={event.id} className="p-4">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={event.poster_url}
                                            alt={event.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">{event.title}</h6>
                                            <p className="text-muted mb-1 small">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                {event.venue}, {event.city}
                                            </p>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                {new Date(event.event_date).toLocaleDateString('fr-FR')}
                                            </small>
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                as={Link}
                                                to={`/event/${event.id}`}
                                            >
                                                Voir détails
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-muted mb-2" />
                            <p className="text-muted">Aucun événement en favori</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderNotifications = () => (
        <div className="fade-in">
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faBell} className="me-2 text-warning" />
                        Notifications ({notifications.filter(n => !n.read).length} non lues)
                    </h5>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    >
                        Tout marquer comme lu
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    {notifications.length > 0 ? (
                        <ListGroup variant="flush">
                            {notifications.map((notification) => (
                                <ListGroup.Item
                                    key={notification.id}
                                    className={`p-4 ${!notification.read ? 'bg-light' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="me-3">
                                            <FontAwesomeIcon
                                                icon={getNotificationIcon(notification.type)}
                                                className={`${getNotificationColor(notification.type)} fs-5`}
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1">
                                                {notification.title}
                                                {!notification.read && (
                                                    <Badge bg="primary" className="ms-2">Nouveau</Badge>
                                                )}
                                            </h6>
                                            <p className="text-muted mb-1">{notification.message}</p>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                {new Date(notification.date).toLocaleDateString('fr-FR')} à {new Date(notification.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faBell} size="3x" className="text-muted mb-3" />
                            <h5 className="text-muted">Aucune notification</h5>
                            <p className="text-muted">Vous êtes à jour !</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="fade-in">
                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
                                            color: 'white'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '24px' }} />
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1">DJ Cameroun</h4>
                                        <p className="text-muted mb-0">Producteur & Artiste</p>
                                        <small className="text-muted">
                                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                            Membre depuis {userStats.memberSince}
                                        </small>
                                    </div>
                                </div>

                                <Row className="g-3">
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-primary fs-4">{userStats.totalPurchases}</div>
                                            <small className="text-muted">Achats totaux</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-success fs-4">{favoriteSounds.length + favoriteArtists.length + favoriteEvents.length}</div>
                                            <small className="text-muted">Favoris</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-info fs-4">{userStats.downloads}</div>
                                            <small className="text-muted">Téléchargements</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-warning fs-4">{formatCurrency(userStats.totalSpent)}</div>
                                            <small className="text-muted">Total dépensé</small>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mt-4">
                                    <h6 className="fw-bold mb-3">Genre préféré</h6>
                                    <Badge bg="primary" className="px-3 py-2">
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        {userStats.favoriteGenre}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                );

            case 'purchases':
                return renderPurchases();

            case 'favorites':
                return renderFavorites();

            case 'notifications':
                return renderNotifications();

            case 'settings':
                return (
                    <div className="fade-in">
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-white border-0 p-4">
                                <h5 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faCog} className="me-2 text-secondary" />
                                    Paramètres
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Préférences</h6>
                                    <div className="form-check mb-2">
                                        <input className="form-check-input" type="checkbox" id="notifications" defaultChecked />
                                        <label className="form-check-label" htmlFor="notifications">
                                            Recevoir les notifications par email
                                        </label>
                                    </div>
                                    <div className="form-check mb-2">
                                        <input className="form-check-input" type="checkbox" id="newsletter" />
                                        <label className="form-check-label" htmlFor="newsletter">
                                            S'abonner à la newsletter
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Confidentialité</h6>
                                    <div className="form-check mb-2">
                                        <input className="form-check-input" type="checkbox" id="publicProfile" defaultChecked />
                                        <label className="form-check-label" htmlFor="publicProfile">
                                            Profil public
                                        </label>
                                    </div>
                                </div>

                                <Button variant="primary" style={{ borderRadius: '12px' }}>
                                    Sauvegarder les modifications
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                );

            case 'creations':
                return renderMyCreations();

            default:
                return null;
        }
    };

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
                                    Mon
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> Profil</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Gérez vos sons, événements et paramètres
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Navigation et Contenu */}
            <section className="py-4">
                <Container>
                    <Tab.Container activeKey={activeTab}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-white border-0 p-4">
                                <Nav variant="pills" className="justify-content-center">
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="profile"
                                            onClick={() => handleTabChange('profile')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Profil
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="purchases"
                                            onClick={() => handleTabChange('purchases')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                                            Achats
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="favorites"
                                            onClick={() => handleTabChange('favorites')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faHeart} className="me-2" />
                                            Favoris
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="notifications"
                                            onClick={() => handleTabChange('notifications')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faBell} className="me-2" />
                                            Notifications
                                            {notifications.filter(n => !n.read).length > 0 && (
                                                <Badge bg="danger" className="ms-1">
                                                    {notifications.filter(n => !n.read).length}
                                                </Badge>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="creations"
                                            onClick={() => handleTabChange('creations')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                                            Créations
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="settings"
                                            onClick={() => handleTabChange('settings')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faCog} className="me-2" />
                                            Paramètres
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>

                            <Card.Body className="p-4 position-relative">
                                <LoadingOverlay show={isLoading} text="Chargement des données..." />
                                {!isLoading && renderTabContent()}
                            </Card.Body>
                        </Card>
                    </Tab.Container>
                </Container>
            </section>
        </div>
    );
};

export default Profile;
