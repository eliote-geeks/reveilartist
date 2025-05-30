import React, { useState } from 'react';
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
    faBookmark
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner, { LoadingOverlay } from '../common/LoadingSpinner';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Données utilisateur étendues
    const userStats = {
        totalSpent: 54200,
        totalPurchases: 12,
        favoriteGenre: "Afrobeat",
        memberSince: "Janvier 2024",
        downloads: 24,
        likes: 67,
        totalSounds: 8,
        totalEvents: 3,
        totalPlays: 2547,
        totalRevenue: 89500
    };

    // Mes Sons - données mockées
    const mySounds = [
        {
            id: 1,
            title: "Afro Fusion Beat",
            artist: "DJ Cameroun",
            uploadDate: "2024-03-15",
            plays: 542,
            downloads: 32,
            revenue: 24000,
            status: "published",
            category: "Afrobeat",
            duration: "3:45",
            price: 2500,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
            likes: 78,
            description: "Un beat afro moderne avec des sonorités traditionnelles"
        },
        {
            id: 2,
            title: "Makossa Electric",
            artist: "DJ Cameroun",
            uploadDate: "2024-03-10",
            plays: 387,
            downloads: 28,
            revenue: 21000,
            status: "published",
            category: "Traditional",
            duration: "4:12",
            price: 3000,
            cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
            likes: 65,
            description: "Fusion électronique du makossa traditionnel camerounais"
        },
        {
            id: 3,
            title: "Urban Vibes Cameroun",
            artist: "DJ Cameroun",
            uploadDate: "2024-03-05",
            plays: 689,
            downloads: 45,
            revenue: 33750,
            status: "pending",
            category: "Hip-Hop",
            duration: "3:28",
            price: 2000,
            cover: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100&h=100&fit=crop",
            likes: 92,
            description: "Hip-hop urbain avec des influences camerounaises"
        },
        {
            id: 4,
            title: "Bikutsi Modern",
            artist: "DJ Cameroun",
            uploadDate: "2024-02-28",
            plays: 234,
            downloads: 18,
            revenue: 13500,
            status: "draft",
            category: "Traditional",
            duration: "3:56",
            price: 2500,
            cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop",
            likes: 43,
            description: "Bikutsi modernisé avec des éléments électroniques"
        }
    ];

    // Mes Événements - données mockées
    const myEvents = [
        {
            id: 1,
            title: "RéveilArt4artist Festival 2024",
            venue: "Stade Ahmadou Ahidjo",
            city: "Yaoundé",
            date: "2024-06-15",
            time: "20:00",
            ticketsSold: 1250,
            totalTickets: 2000,
            revenue: 15000000,
            status: "active",
            category: "Festival",
            description: "Le plus grand festival de musique urbaine du Cameroun",
            image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=200&fit=crop",
            ticketTypes: [
                { name: "Standard", price: 5000, sold: 800 },
                { name: "VIP", price: 15000, sold: 350 },
                { name: "Premium", price: 25000, sold: 100 }
            ]
        },
        {
            id: 2,
            title: "Nuit Afrobeat Douala",
            venue: "Palais des Sports",
            city: "Douala",
            date: "2024-05-20",
            time: "21:00",
            ticketsSold: 680,
            totalTickets: 800,
            revenue: 6800000,
            status: "active",
            category: "Concert",
            description: "Soirée dédiée aux rythmes afrobeat contemporains",
            image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=200&fit=crop",
            ticketTypes: [
                { name: "Standard", price: 8000, sold: 480 },
                { name: "VIP", price: 20000, sold: 200 }
            ]
        },
        {
            id: 3,
            title: "Makossa Revival",
            venue: "Centre Culturel",
            city: "Bafoussam",
            date: "2024-07-10",
            time: "19:30",
            ticketsSold: 156,
            totalTickets: 300,
            revenue: 1560000,
            status: "pending",
            category: "Concert",
            description: "Retour aux sources avec les maîtres du makossa",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
            ticketTypes: [
                { name: "Standard", price: 10000, sold: 156 }
            ]
        }
    ];

    // Achats - données existantes
    const purchaseHistory = [
        {
            id: 1,
            title: "Beat Afro Moderne",
            artist: "DJ Cameroun",
            price: 2500,
            date: "2024-03-15",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
            status: "Téléchargé"
        },
        {
            id: 2,
            title: "Makossa Fusion",
            artist: "UrbanSonic",
            price: 3500,
            date: "2024-03-10",
            cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop",
            status: "Disponible"
        },
        {
            id: 3,
            title: "Ndombolo Modern",
            artist: "SoundCraft",
            price: 2000,
            date: "2024-03-05",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
            status: "Téléchargé"
        }
    ];

    // Favoris - données existantes
    const likedSounds = [
        {
            id: 1,
            title: "Coupé-Décalé Beat",
            artist: "BeatMaker237",
            likes: 89,
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"
        },
        {
            id: 2,
            title: "Bikutsi Électro",
            artist: "DJ Yaoundé",
            likes: 78,
            cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop"
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { variant: 'success', text: 'Actif' },
            pending: { variant: 'warning', text: 'En attente' },
            published: { variant: 'success', text: 'Publié' },
            draft: { variant: 'secondary', text: 'Brouillon' },
            suspended: { variant: 'danger', text: 'Suspendu' }
        };
        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const renderMySounds = () => (
        <div className="fade-in">
            {/* Header avec statistiques */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faMusic} className="text-primary mb-2" size="2x" />
                            <h4 className="fw-bold text-primary">{mySounds.length}</h4>
                            <small className="text-muted">Sons créés</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-success mb-2" size="2x" />
                            <h4 className="fw-bold text-success">{userStats.totalPlays.toLocaleString()}</h4>
                            <small className="text-muted">Écoutes totales</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faDownload} className="text-info mb-2" size="2x" />
                            <h4 className="fw-bold text-info">{mySounds.reduce((acc, sound) => acc + sound.downloads, 0)}</h4>
                            <small className="text-muted">Téléchargements</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="2x" />
                            <h4 className="fw-bold text-warning">{formatCurrency(userStats.totalRevenue)}</h4>
                            <small className="text-muted">Revenus totaux</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Actions et filtres */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher dans mes sons..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4} className="text-end">
                            <Button as={Link} to="/add-sound" variant="primary" className="me-2">
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Nouveau son
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Liste des sons */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="fw-bold mb-0">Mes Sons ({mySounds.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {mySounds.map((sound) => (
                        <div key={sound.id} className="border-bottom p-4">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={sound.cover}
                                            alt={sound.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{sound.title}</h6>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Badge bg="light" text="dark">{sound.category}</Badge>
                                                {getStatusBadge(sound.status)}
                                            </div>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faClock} className="me-1" />
                                                {sound.duration} • {new Date(sound.uploadDate).toLocaleDateString('fr-FR')}
                                            </small>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={3}>
                                    <Row className="text-center">
                                        <Col xs={4}>
                                            <div className="small">
                                                <FontAwesomeIcon icon={faPlay} className="text-primary me-1" />
                                                <div className="fw-bold">{sound.plays}</div>
                                                <small className="text-muted">Écoutes</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="small">
                                                <FontAwesomeIcon icon={faDownload} className="text-success me-1" />
                                                <div className="fw-bold">{sound.downloads}</div>
                                                <small className="text-muted">DL</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="small">
                                                <FontAwesomeIcon icon={faHeart} className="text-danger me-1" />
                                                <div className="fw-bold">{sound.likes}</div>
                                                <small className="text-muted">J'aime</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="fw-bold text-success mb-1">{formatCurrency(sound.revenue)}</div>
                                    <small className="text-muted">Revenus</small>
                                </Col>
                                <Col md={1} className="text-end">
                                    <div className="d-flex flex-column gap-1">
                                        <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faChartLine} />
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </div>
    );

    const renderMyEvents = () => (
        <div className="fade-in">
            {/* Header avec statistiques */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary mb-2" size="2x" />
                            <h4 className="fw-bold text-primary">{myEvents.length}</h4>
                            <small className="text-muted">Événements créés</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-success mb-2" size="2x" />
                            <h4 className="fw-bold text-success">{myEvents.reduce((acc, event) => acc + event.ticketsSold, 0)}</h4>
                            <small className="text-muted">Billets vendus</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-info mb-2" size="2x" />
                            <h4 className="fw-bold text-info">{myEvents.reduce((acc, event) => acc + event.totalTickets, 0)}</h4>
                            <small className="text-muted">Capacité totale</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="2x" />
                            <h4 className="fw-bold text-warning">{formatCurrency(myEvents.reduce((acc, event) => acc + event.revenue, 0))}</h4>
                            <small className="text-muted">Revenus totaux</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Actions */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher dans mes événements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4} className="text-end">
                            <Button as={Link} to="/add-event" variant="primary">
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Nouvel événement
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Liste des événements */}
            <div className="row g-4">
                {myEvents.map((event) => (
                    <div key={event.id} className="col-lg-6">
                        <Card className="border-0 shadow-sm h-100">
                            <div className="position-relative">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="card-img-top"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="position-absolute top-0 end-0 m-3">
                                    {getStatusBadge(event.status)}
                                </div>
                            </div>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="fw-bold mb-1">{event.title}</h5>
                                    <Badge bg="light" text="dark">{event.category}</Badge>
                                </div>

                                <div className="mb-3">
                                    <div className="text-muted small mb-1">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                        {event.venue}, {event.city}
                                    </div>
                                    <div className="text-muted small">
                                        <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                        {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-medium">Billets vendus</span>
                                        <span className="small fw-bold">{event.ticketsSold}/{event.totalTickets}</span>
                                    </div>
                                    <ProgressBar
                                        variant="success"
                                        now={(event.ticketsSold / event.totalTickets) * 100}
                                        style={{ height: '6px' }}
                                    />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <div className="fw-bold text-success">{formatCurrency(event.revenue)}</div>
                                        <small className="text-muted">Revenus</small>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-primary">{Math.round((event.ticketsSold / event.totalTickets) * 100)}%</div>
                                        <small className="text-muted">Remplissage</small>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm" className="flex-grow-1">
                                        <FontAwesomeIcon icon={faEdit} className="me-1" />
                                        Modifier
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" className="flex-grow-1">
                                        <FontAwesomeIcon icon={faChartLine} className="me-1" />
                                        Analytics
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
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
                                            <div className="fw-bold text-primary fs-4">{userStats.totalSounds}</div>
                                            <small className="text-muted">Sons créés</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-success fs-4">{userStats.totalEvents}</div>
                                            <small className="text-muted">Événements</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-info fs-4">{userStats.totalPlays.toLocaleString()}</div>
                                            <small className="text-muted">Écoutes totales</small>
                                        </div>
                                    </Col>
                                    <Col md={3} sm={6}>
                                        <div className="text-center p-3 bg-light rounded-3 profile-stat-card">
                                            <div className="fw-bold text-warning fs-4">{formatCurrency(userStats.totalRevenue)}</div>
                                            <small className="text-muted">Revenus totaux</small>
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

            case 'sounds':
                return renderMySounds();

            case 'events':
                return renderMyEvents();

            case 'purchases':
                return (
                    <div className="fade-in">
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-white border-0 p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faShoppingBag} className="me-2 text-primary" />
                                        Mes Achats
                                    </h5>
                                    <Badge bg="light" text="dark">{purchaseHistory.length} sons</Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {purchaseHistory.map((purchase, index) => (
                                        <ListGroup.Item key={purchase.id} className="p-4 border-0">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={purchase.cover}
                                                    alt={purchase.title}
                                                    className="rounded-3 me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-1">{purchase.title}</h6>
                                                    <p className="text-muted mb-1 small">par {purchase.artist}</p>
                                                    <small className="text-muted">
                                                        <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                                        {new Date(purchase.date).toLocaleDateString('fr-FR')}
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary mb-2">
                                                        {purchase.price.toLocaleString()} FCFA
                                                    </div>
                                                    {purchase.status === 'Téléchargé' ? (
                                                        <Badge bg="success" className="small">
                                                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                            Téléchargé
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                            Télécharger
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </div>
                );

            case 'favorites':
                return (
                    <div className="fade-in">
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Header className="bg-white border-0 p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faHeart} className="me-2 text-danger" />
                                        Mes Favoris
                                    </h5>
                                    <Badge bg="light" text="dark">{likedSounds.length} sons</Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {likedSounds.map((sound) => (
                                        <ListGroup.Item key={sound.id} className="p-4 border-0">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={sound.cover}
                                                    alt={sound.title}
                                                    className="rounded-3 me-3"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-1">{sound.title}</h6>
                                                    <p className="text-muted mb-1 small">par {sound.artist}</p>
                                                    <small className="text-muted">
                                                        <FontAwesomeIcon icon={faHeart} className="me-1 text-danger" />
                                                        {sound.likes} j'aime
                                                    </small>
                                                </div>
                                                <div className="d-flex gap-2 action-buttons">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="btn-compact"
                                                        title="Écouter"
                                                    >
                                                        <FontAwesomeIcon icon={faHeadphones} style={{ fontSize: '12px' }} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="btn-compact"
                                                        title="Voir plus"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </div>
                );

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
                                            eventKey="sounds"
                                            onClick={() => handleTabChange('sounds')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                                            Mes Sons
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="events"
                                            onClick={() => handleTabChange('events')}
                                            className="px-3 py-2 mx-1"
                                            style={{ borderRadius: '12px' }}
                                        >
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                            Mes Événements
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
