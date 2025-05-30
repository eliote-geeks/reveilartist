import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Modal, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt,
    faMusic,
    faCalendarAlt,
    faUsers,
    faChartLine,
    faDownload,
    faEuroSign,
    faTicketAlt,
    faHeart,
    faPlay,
    faShoppingCart,
    faEye,
    faEdit,
    faTrash,
    faPlus,
    faCog,
    faSignOutAlt,
    faSearch,
    faArrowUp,
    faArrowDown,
    faBell,
    faGlobe,
    faCrown,
    faStar,
    faHome,
    faMapMarkerAlt,
    faUpload,
    faClock,
    faTags,
    faSpinner,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import CategoryManagement from './CategoryManagement';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('7d');
    const [loading, setLoading] = useState(false);

    // États pour les modals et confirmations
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [eventFilter, setEventFilter] = useState('all');

    // États pour les données API
    const [sounds, setSounds] = useState([]);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        // Statistiques principales
        totalSounds: 0,
        totalEvents: 0,
        totalUsers: 0,
        totalRevenue: 0,

        // Statistiques détaillées
        totalPlays: 0,
        totalDownloads: 0,
        totalLikes: 0,
        activeEvents: 0,
        totalTicketsSold: 0,
        totalEventRevenue: 0,

        // Utilisateurs
        artistsCount: 0,
        producersCount: 0,

        // Croissance et tendances
        newUsers: { count: 0, change: 0 },
        monthlyGrowth: 0,
        pendingOrders: 0,
        topArtist: "Aucun"
    });

    const { token, user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadSounds(),
                loadEvents(),
                loadUsers(),
                loadStats()
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            toast.error('Erreur', 'Impossible de charger les données du dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadSounds = async () => {
        try {
            const response = await fetch('/api/sounds?per_page=50', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                setSounds(data.sounds);
            } else {
                setSounds([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des sons:', error);
            setSounds([]);
        }
    };

    const loadEvents = async () => {
        try {
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.events) {
                setEvents(data.events);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
            setEvents([]);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
            } else {
                // Fallback vers des données mockées si l'API échoue
                const mockUsers = [
                    {
                        id: 1,
                        name: "Jean Kamga",
                        email: "jean.kamga@email.com",
                        role: "artist",
                        join_date: "2024-01-15",
                        status: "active",
                        sounds_count: 8,
                        revenue: 125000,
                        total_plays: 2847,
                        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                    },
                    {
                        id: 2,
                        name: "Marie Nkomo",
                        email: "marie.nkomo@email.com",
                        role: "producer",
                        join_date: "2024-02-20",
                        status: "active",
                        sounds_count: 12,
                        revenue: 289000,
                        total_plays: 5438,
                        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=50&h=50&fit=crop&crop=face"
                    },
                    {
                        id: 3,
                        name: "Paul Mbida",
                        email: "paul.mbida@email.com",
                        role: "artist",
                        join_date: "2024-03-10",
                        status: "active",
                        sounds_count: 6,
                        revenue: 98000,
                        total_plays: 1923,
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                    }
                ];
                setUsers(mockUsers);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            // Utiliser des données mockées en cas d'erreur
            const mockUsers = [
                {
                    id: 1,
                    name: "Jean Kamga",
                    email: "jean.kamga@email.com",
                    role: "artist",
                    join_date: "2024-01-15",
                    status: "active",
                    sounds_count: 8,
                    revenue: 125000,
                    total_plays: 2847,
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                },
                {
                    id: 2,
                    name: "Marie Nkomo",
                    email: "marie.nkomo@email.com",
                    role: "producer",
                    join_date: "2024-02-20",
                    status: "active",
                    sounds_count: 12,
                    revenue: 289000,
                    total_plays: 5438,
                    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e2?w=50&h=50&fit=crop&crop=face"
                }
            ];
            setUsers(mockUsers);
        }
    };

    const loadStats = async () => {
        try {
            // Calculer les stats basées sur les données réelles
            const totalSounds = sounds?.length || 0;
            const totalEvents = events?.length || 0;
            const totalUsers = users?.length || 0;

            // Statistiques des sons
            const totalPlays = (sounds || []).reduce((acc, sound) => acc + (sound.plays_count || sound.plays || 0), 0);
            const totalDownloads = (sounds || []).reduce((acc, sound) => acc + (sound.downloads_count || sound.downloads || 0), 0);
            const totalLikes = (sounds || []).reduce((acc, sound) => acc + (sound.likes_count || sound.likes || 0), 0);

            // Statistiques des événements
            const activeEvents = (events || []).filter(event => event.status === 'active' || event.status === 'published').length;
            const totalTicketsSold = (events || []).reduce((acc, event) => acc + (event.current_attendees || 0), 0);
            const totalEventRevenue = (events || []).reduce((acc, event) => acc + (event.revenue || 0), 0);

            // Statistiques des utilisateurs
            const totalUserRevenue = (users || []).reduce((acc, user) => acc + (user.revenue || 0), 0);
            const artistsCount = (users || []).filter(user => user.role === 'artist').length;
            const producersCount = (users || []).filter(user => user.role === 'producer').length;

            // Trouver l'artiste avec le plus d'écoutes
            const topArtist = sounds && sounds.length > 0
                ? (sounds.reduce((prev, current) =>
                    ((current.plays_count || current.plays || 0) > (prev.plays_count || prev.plays || 0)) ? current : prev
                  ).artist || "Aucun")
                : "Aucun";

            // Calculer la croissance mensuelle (simulation)
            const monthlyGrowth = totalSounds > 0 ? Math.round(((totalPlays / totalSounds) / 100) * 100) / 100 : 0;

            setStats(prevStats => ({
                ...prevStats,
                // Statistiques principales
                totalSounds,
                totalEvents,
                totalUsers: totalUsers || 2456, // Fallback si pas d'utilisateurs chargés
                totalRevenue: totalEventRevenue + totalUserRevenue || 2845600,

                // Statistiques détaillées
                totalPlays,
                totalDownloads,
                totalLikes,
                activeEvents,
                totalTicketsSold,
                totalEventRevenue,

                // Utilisateurs
                artistsCount,
                producersCount,

                // Croissance et tendances
                monthlyGrowth: monthlyGrowth || 18.5,
                topArtist
            }));

        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            // Ne pas écraser les stats par défaut en cas d'erreur
        }
    };

    // Mettre à jour les stats quand les données changent
    useEffect(() => {
        if (sounds.length > 0 || events.length > 0) {
            loadStats();
        }
    }, [sounds, events, users]);

    const handleDeleteSound = async (soundId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce son ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/sounds/${soundId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Son supprimé avec succès');
                loadSounds(); // Recharger la liste
            } else {
                toast.error('Erreur', data.message || 'Impossible de supprimer le son');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Événement supprimé avec succès');
                loadEvents(); // Recharger la liste
            } else {
                toast.error('Erreur', data.message || 'Impossible de supprimer l\'événement');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Utilisateur supprimé avec succès');
                loadUsers(); // Recharger la liste
            } else {
                toast.error('Erreur', data.message || 'Impossible de supprimer l\'utilisateur');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        }
    };

    // Nouvelles fonctions pour la gestion des événements
    const canManageEvent = (event, user) => {
        if (!user) return false;
        return user.role === 'admin' || user.id === event.user_id;
    };

    const openDeleteModal = (event) => {
        setSelectedEvent(event);
        setShowDeleteModal(true);
    };

    const openApproveModal = (event) => {
        setSelectedEvent(event);
        setShowApproveModal(true);
    };

    const closeModals = () => {
        setShowDeleteModal(false);
        setShowApproveModal(false);
        setSelectedEvent(null);
        setActionLoading(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;

        try {
            setActionLoading(true);
            const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Événement supprimé avec succès');
                loadEvents(); // Recharger la liste
                closeModals();
            } else {
                toast.error('Erreur', data.message || 'Impossible de supprimer l\'événement');
                setActionLoading(false);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
            setActionLoading(false);
        }
    };

    const handleApproveEvent = async () => {
        if (!selectedEvent) return;

        try {
            setActionLoading(true);
            const response = await fetch(`/api/events/${selectedEvent.id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Événement approuvé avec succès');
                loadEvents(); // Recharger la liste
                closeModals();
            } else {
                toast.error('Erreur', data.message || 'Impossible d\'approuver l\'événement');
                setActionLoading(false);
            }
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
            setActionLoading(false);
        }
    };

    const handleUpdateEvent = async (eventData) => {
        if (!selectedEvent) return;

        try {
            setActionLoading(true);
            const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Événement mis à jour avec succès');
                loadEvents(); // Recharger la liste
                closeModals();
            } else {
                toast.error('Erreur', data.message || 'Impossible de mettre à jour l\'événement');
                setActionLoading(false);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
            setActionLoading(false);
        }
    };

    const recentActivities = [
        {
            id: 1,
            type: 'sound',
            title: 'Nouveau son ajouté',
            description: sounds.length > 0 ? `"${sounds[0].title}" par ${sounds[0].artist}` : 'Aucun son récent',
            time: 'Il y a 2 heures',
            icon: faMusic,
            color: 'primary'
        },
        {
            id: 2,
            type: 'event',
            title: 'Événement créé',
            description: events.length > 0 ? events[0].title : 'Aucun événement récent',
            time: 'Il y a 5 heures',
            icon: faCalendarAlt,
            color: 'success'
        },
        {
            id: 3,
            type: 'user',
            title: 'Nouvel utilisateur',
            description: 'Jean Kamga a rejoint la plateforme',
            time: 'Il y a 1 jour',
            icon: faUsers,
            color: 'info'
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

    // Données pour la gestion des sons
    const allSounds = [
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
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
        },
        {
            id: 2,
            title: "Makossa Electric",
            artist: "BeatMaster237",
            uploadDate: "2024-03-10",
            plays: 387,
            downloads: 28,
            revenue: 21000,
            status: "published",
            category: "Traditional",
            duration: "4:12",
            cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop"
        },
        {
            id: 3,
            title: "Urban Vibes",
            artist: "SoundCraft",
            uploadDate: "2024-03-05",
            plays: 689,
            downloads: 45,
            revenue: 33750,
            status: "pending",
            category: "Hip-Hop",
            duration: "3:28",
            cover: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100&h=100&fit=crop"
        },
        {
            id: 4,
            title: "Bikutsi Modern",
            artist: "DJ Yaoundé",
            uploadDate: "2024-02-28",
            plays: 234,
            downloads: 18,
            revenue: 13500,
            status: "draft",
            category: "Traditional",
            duration: "3:56",
            cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop"
        }
    ];

    // Données pour la gestion des événements
    const allEvents = [
        {
            id: 1,
            title: "RéveilArt4artist Festival 2024",
            venue: "Stade Ahmadou Ahidjo",
            city: "Yaoundé",
            date: "2024-06-15",
            ticketsSold: 1250,
            totalTickets: 2000,
            revenue: 15000000,
            status: "active",
            category: "Festival",
            organizer: "Events CM"
        },
        {
            id: 2,
            title: "Nuit Afrobeat Douala",
            venue: "Palais des Sports",
            city: "Douala",
            date: "2024-05-20",
            ticketsSold: 680,
            totalTickets: 800,
            revenue: 6800000,
            status: "active",
            category: "Concert",
            organizer: "Music Pro"
        },
        {
            id: 3,
            title: "Makossa Revival",
            venue: "Centre Culturel",
            city: "Bafoussam",
            date: "2024-07-10",
            ticketsSold: 156,
            totalTickets: 300,
            revenue: 1560000,
            status: "pending",
            category: "Concert",
            organizer: "Cultural Events"
        }
    ];

    // Navigation items
    const navigationItems = [
        {
            id: 'overview',
            label: 'Vue d\'ensemble',
            icon: faTachometerAlt,
            color: 'primary',
            description: 'Statistiques générales'
        },
        {
            id: 'sounds',
            label: 'Sons',
            icon: faMusic,
            color: 'info',
            count: stats.totalSounds,
            description: 'Gestion des sons'
        },
        {
            id: 'events',
            label: 'Événements',
            icon: faCalendarAlt,
            color: 'success',
            count: stats.activeEvents,
            description: 'Gestion des événements'
        },
        {
            id: 'users',
            label: 'Utilisateurs',
            icon: faUsers,
            color: 'warning',
            count: stats.totalUsers,
            description: 'Gestion des utilisateurs'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: faChartLine,
            color: 'danger',
            description: 'Rapports détaillés'
        },
        {
            id: 'categories',
            label: 'Catégories',
            icon: faTags,
            color: 'secondary',
            description: 'Gestion des catégories'
        },
        {
            id: 'settings',
            label: 'Paramètres',
            icon: faCog,
            color: 'secondary',
            description: 'Configuration'
        }
    ];

    const renderOverview = () => (
        <div>
            {/* Cartes de statistiques principales - 4 colonnes */}
            <Row className="g-4 mb-4">
                <Col xl={3} lg={6} md={6}>
                    <Card className="stat-card border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1 small fw-medium">Sons Total</p>
                                    <h2 className="fw-bold mb-0 text-primary">{(stats.totalSounds || 0).toLocaleString()}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                                            +{stats.monthlyGrowth || 0}%
                                        </span>
                                        <span className="text-muted small ms-2">ce mois</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-primary bg-opacity-10">
                                    <FontAwesomeIcon icon={faMusic} className="text-primary" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6}>
                    <Card className="stat-card border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1 small fw-medium">Utilisateurs</p>
                                    <h2 className="fw-bold mb-0 text-success">{(stats.totalUsers || 0).toLocaleString()}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                                            +{(stats.newUsers?.count || 0)}
                                        </span>
                                        <span className="text-muted small ms-2">nouveaux</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-success bg-opacity-10">
                                    <FontAwesomeIcon icon={faUsers} className="text-success" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6}>
                    <Card className="stat-card border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1 small fw-medium">Revenus</p>
                                    <h2 className="fw-bold mb-0 text-warning">{formatCurrency(stats.totalRevenue || 0)}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                                            Tendance
                                        </span>
                                        <span className="text-muted small ms-2">positive</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-warning bg-opacity-10">
                                    <FontAwesomeIcon icon={faEuroSign} className="text-warning" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6}>
                    <Card className="stat-card border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1 small fw-medium">Événements</p>
                                    <h2 className="fw-bold mb-0 text-info">{stats.activeEvents || 0}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-info small">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                            Actifs
                                        </span>
                                        <span className="text-muted small ms-2">en cours</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-info bg-opacity-10">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-info" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistiques détaillées */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-1">Performances</h5>
                                    <p className="text-muted mb-0 small">Aperçu des 30 derniers jours</p>
                                </div>
                                <Form.Select style={{ width: 'auto' }} size="sm">
                                    <option value="7d">7 jours</option>
                                    <option value="30d">30 jours</option>
                                    <option value="90d">3 mois</option>
                                </Form.Select>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-4">
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faPlay} className="text-primary mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.totalPlays || 0).toLocaleString()}</div>
                                        <small className="text-muted">Écoutes</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faDownload} className="text-success mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.totalDownloads || 0).toLocaleString()}</div>
                                        <small className="text-muted">Téléchargements</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faHeart} className="text-danger mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.totalLikes || 0).toLocaleString()}</div>
                                        <small className="text-muted">Favoris</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faShoppingCart} className="text-warning mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{stats.pendingOrders || 0}</div>
                                        <small className="text-muted">Commandes</small>
                                    </div>
                                </Col>
                            </Row>

                            <div className="bg-light rounded p-4 text-center">
                                <FontAwesomeIcon icon={faChartLine} size="3x" className="text-muted mb-3" />
                                <h6 className="text-muted">Graphique des analytics</h6>
                                <p className="text-muted small mb-0">Intégration Chart.js à venir</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="h-100 d-flex flex-column gap-3">
                        {/* Top Catégories */}
                        <Card className="border-0 shadow-sm flex-grow-1">
                            <Card.Header className="bg-white border-bottom">
                                <h6 className="fw-bold mb-0">Top Catégories</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small fw-medium">Afrobeat</span>
                                        <span className="small fw-bold text-primary">34%</span>
                                    </div>
                                    <ProgressBar variant="primary" now={34} style={{ height: '6px' }} />
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small fw-medium">Hip-Hop</span>
                                        <span className="small fw-bold text-success">28%</span>
                                    </div>
                                    <ProgressBar variant="success" now={28} style={{ height: '6px' }} />
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small fw-medium">Traditional</span>
                                        <span className="small fw-bold text-warning">22%</span>
                                    </div>
                                    <ProgressBar variant="warning" now={22} style={{ height: '6px' }} />
                                </div>
                                <div className="mb-0">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small fw-medium">R&B</span>
                                        <span className="small fw-bold text-info">16%</span>
                                    </div>
                                    <ProgressBar variant="info" now={16} style={{ height: '6px' }} />
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Artiste du mois */}
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <FontAwesomeIcon icon={faCrown} className="text-warning mb-2" size="2x" />
                                <h6 className="fw-bold">Artiste du mois</h6>
                                <p className="mb-0 fw-medium">{stats.topArtist}</p>
                                <small className="text-muted">2,341 écoutes ce mois</small>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* Activité récente et sons récents */}
            <Row className="g-4">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">Activité récente</h6>
                                <Button variant="outline-primary" size="sm">
                                    Voir tout
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {recentActivities.map(activity => (
                                <div key={activity.id} className="d-flex align-items-start mb-3">
                                    <div className={`activity-icon bg-${activity.color} bg-opacity-10 me-3`}>
                                        <FontAwesomeIcon icon={activity.icon} className={`text-${activity.color}`} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-medium small">{activity.title}</div>
                                        <div className="text-muted small mb-1">{activity.description}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">Sons récents</h6>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setActiveTab('sounds')}
                                >
                                    Voir tout
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {(sounds || []).slice(0, 3).map(sound => (
                                <div key={sound.id} className="d-flex align-items-center mb-3">
                                    <img
                                        src={sound.cover}
                                        alt={sound.title}
                                        className="rounded me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-medium small">{sound.title}</div>
                                        <div className="text-muted small">{sound.artist}</div>
                                        <div className="d-flex align-items-center gap-3 mt-1">
                                            <small className="text-primary">
                                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                                {sound.plays || sound.plays_count || 0}
                                            </small>
                                            <small className="text-success">
                                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                {sound.downloads || sound.downloads_count || 0}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        {getStatusBadge(sound.status)}
                                        <div className="fw-bold small text-primary mt-1">
                                            {formatCurrency(sound.revenue || sound.price || 0)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderSoundsManagement = () => (
        <div>
            {/* Header avec actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Gestion des Sons</h5>
                    <p className="text-muted mb-0 small">Gérez tous les sons de la plateforme</p>
                </div>
                <Button as={Link} to="/add-sound" variant="primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Ajouter un son
                </Button>
            </div>

            {/* Stats rapides */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faMusic} className="text-primary mb-2" size="lg" />
                            <h4 className="fw-bold text-primary">{sounds?.length || 0}</h4>
                            <small className="text-muted">Sons totaux</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-success mb-2" size="lg" />
                            <h4 className="fw-bold text-success">{((sounds || []).reduce((acc, sound) => acc + (sound.plays_count || sound.plays || 0), 0) || 0).toLocaleString()}</h4>
                            <small className="text-muted">Écoutes totales</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faDownload} className="text-info mb-2" size="lg" />
                            <h4 className="fw-bold text-info">{(sounds || []).reduce((acc, sound) => acc + (sound.downloads_count || sound.downloads || 0), 0) || 0}</h4>
                            <small className="text-muted">Téléchargements</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="lg" />
                            <h4 className="fw-bold text-warning">{formatCurrency((sounds || []).reduce((acc, sound) => acc + (sound.is_free ? 0 : (sound.price || 0)), 0) || 0)}</h4>
                            <small className="text-muted">Valeur totale</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Liste des sons */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Tous les sons</h6>
                        <div className="d-flex gap-2">
                            <Form.Select size="sm" style={{ width: 'auto' }}>
                                <option>Tous les statuts</option>
                                <option value="published">Publié</option>
                                <option value="pending">En attente</option>
                                <option value="draft">Brouillon</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {(sounds?.length || 0) === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun son trouvé</h6>
                            <p className="text-muted small">Ajoutez votre premier son</p>
                            <Button as={Link} to="/add-sound" variant="primary">
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Ajouter un son
                            </Button>
                        </div>
                    ) : (
                        (sounds || []).map((sound) => (
                        <div key={sound.id} className="border-bottom p-3">
                            <Row className="align-items-center">
                                <Col md={5}>
                                    <div className="d-flex align-items-center">
                                        <img
                                                src={sound.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop`}
                                            alt={sound.title}
                                            className="rounded me-3"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{sound.title}</h6>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Badge bg="light" text="dark">{sound.category}</Badge>
                                                    {getStatusBadge('published')}
                                                    {sound.is_featured && (
                                                        <Badge bg="warning" text="dark">
                                                            <FontAwesomeIcon icon={faStar} className="me-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {sound.is_free && (
                                                        <Badge bg="success">Gratuit</Badge>
                                                    )}
                                            </div>
                                                <small className="text-muted">
                                                    par {sound.artist} • {sound.duration || '0:00'}
                                                    {sound.genre && ` • ${sound.genre}`}
                                                </small>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                        <FontAwesomeIcon icon={faPlay} className="text-primary me-1" />
                                            <div className="fw-bold">{sound.plays || 0}</div>
                                        <small className="text-muted">Écoutes</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                        <FontAwesomeIcon icon={faDownload} className="text-success me-1" />
                                            <div className="fw-bold">{sound.downloads || 0}</div>
                                        <small className="text-muted">DL</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                        <div className="fw-bold text-success">
                                            {sound.is_free ? 'Gratuit' : formatCurrency(sound.price || 0)}
                                        </div>
                                        <small className="text-muted">Prix</small>
                                </Col>
                                <Col md={1} className="text-end">
                                    <div className="d-flex gap-1">
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
                                                variant="outline-secondary"
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
                                </Col>
                            </Row>
                        </div>
                        ))
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderEventsManagement = () => (
        <div>
            {/* Header avec actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Gestion des Événements</h5>
                    <p className="text-muted mb-0 small">Gérez tous les événements de la plateforme</p>
                </div>
                <Button as={Link} to="/add-event" variant="primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer un événement
                </Button>
            </div>

            {/* Stats rapides */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary mb-2" size="lg" />
                            <h4 className="fw-bold text-primary">{events?.length || 0}</h4>
                            <small className="text-muted">Événements totaux</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-success mb-2" size="lg" />
                            <h4 className="fw-bold text-success">{((events || []).reduce((acc, event) => acc + (event.current_attendees || 0), 0) || 0).toLocaleString()}</h4>
                            <small className="text-muted">Billets vendus</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-info mb-2" size="lg" />
                            <h4 className="fw-bold text-info">{((events || []).reduce((acc, event) => acc + (event.capacity || event.max_attendees || 0), 0) || 0).toLocaleString()}</h4>
                            <small className="text-muted">Capacité totale</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="lg" />
                            <h4 className="fw-bold text-warning">{formatCurrency((events || []).reduce((acc, event) => acc + (event.revenue || 0), 0) || 0)}</h4>
                            <small className="text-muted">Revenus estimés</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Liste des événements */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Tous les événements</h6>
                        <Form.Select
                            size="sm"
                            style={{ width: 'auto' }}
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente d'approbation</option>
                            <option value="published">Publié</option>
                            <option value="draft">Brouillon</option>
                        </Form.Select>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {(events?.length || 0) === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun événement trouvé</h6>
                            <p className="text-muted small">Créez votre premier événement</p>
                            <Button as={Link} to="/add-event" variant="primary">
                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                Créer un événement
                            </Button>
                        </div>
                    ) : (
                        (events || [])
                            .filter(event => eventFilter === 'all' || event.status === eventFilter)
                            .map((event) => (
                        <div key={event.id} className="border-bottom p-3">
                            <Row className="align-items-center">
                                <Col md={4}>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={event.poster_image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=50&h=50&fit=crop`}
                                                alt={event.title}
                                                className="rounded me-3"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                    <div>
                                        <h6 className="fw-bold mb-1">{event.title}</h6>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <Badge bg="light" text="dark">{event.category}</Badge>
                                            {getStatusBadge(event.status)}
                                                    {event.is_featured && (
                                                        <Badge bg="warning" text="dark">
                                                            <FontAwesomeIcon icon={faStar} className="me-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                        </div>
                                        <small className="text-muted">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                    {event.venue || event.location}, {event.city}
                                                </small>
                                                {user && (
                                                    <div className="mt-1">
                                                        <small className="text-info">
                                                            par {event.user_name || 'Utilisateur'}
                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                            <div className="fw-bold">{new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
                                            <small className="text-muted">{event.start_time}</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                            <div className="fw-bold">{event.current_attendees || 0}/{event.max_attendees || 'Illimité'}</div>
                                            <small className="text-muted">Participants</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                        <div className="fw-bold text-success">
                                            {event.is_free ? 'Gratuit' :
                                             event.ticket_price ?
                                             formatCurrency(event.ticket_price) :
                                             'À définir'}
                                        </div>
                                        <small className="text-muted">Prix</small>
                                </Col>
                                <Col md={2} className="text-end">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <Button
                                                as={Link}
                                                to={`/event/${event.id}`}
                                                variant="outline-info"
                                                size="sm"
                                                title="Voir les détails"
                                            >
                                            <FontAwesomeIcon icon={faEye} />
                                        </Button>

                                            {event.status === 'pending' && user?.role === 'admin' && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => openApproveModal(event)}
                                                    title="Approuver l'événement"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                </Button>
                                            )}

                                            {canManageEvent(event, user) && (
                                                <>
                                                    <Button
                                                        as={Link}
                                                        to={`/edit-event/${event.id}`}
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        title="Modifier l'événement"
                                                    >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(event)}
                                                        title="Supprimer l'événement"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </>
                                            )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        ))
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderUsersManagement = () => (
        <div>
            {/* Header avec actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Gestion des Utilisateurs</h5>
                    <p className="text-muted mb-0 small">Gérez tous les utilisateurs de la plateforme</p>
                </div>
                <Button variant="primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Inviter un utilisateur
                </Button>
            </div>

            {/* Stats rapides */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-primary mb-2" size="lg" />
                            <h4 className="fw-bold text-primary">{users.length}</h4>
                            <small className="text-muted">Utilisateurs totaux</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faMusic} className="text-success mb-2" size="lg" />
                            <h4 className="fw-bold text-success">{users.filter(u => u.role === 'Artist').length}</h4>
                            <small className="text-muted">Artistes</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCog} className="text-info mb-2" size="lg" />
                            <h4 className="fw-bold text-info">{users.filter(u => u.role === 'Producer').length}</h4>
                            <small className="text-muted">Producteurs</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="lg" />
                            <h4 className="fw-bold text-warning">{formatCurrency(users.reduce((acc, user) => acc + user.revenue, 0))}</h4>
                            <small className="text-muted">Revenus générés</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Liste des utilisateurs */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Tous les utilisateurs</h6>
                        <div className="d-flex gap-2">
                            <Form.Select size="sm" style={{ width: 'auto' }}>
                                <option>Tous les rôles</option>
                                <option value="Artist">Artiste</option>
                                <option value="Producer">Producteur</option>
                                <option value="User">Utilisateur</option>
                            </Form.Select>
                            <Form.Select size="sm" style={{ width: 'auto' }}>
                                <option>Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="suspended">Suspendu</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {users.map((user) => (
                        <div key={user.id} className="border-bottom p-3">
                            <Row className="align-items-center">
                                <Col md={4}>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="rounded-circle me-3"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{user.name}</h6>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <Badge bg="light" text="dark">{user.role}</Badge>
                                                {getStatusBadge(user.status)}
                                            </div>
                                            <small className="text-muted">{user.email}</small>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                        <div className="fw-bold">{new Date(user.join_date).toLocaleDateString('fr-FR')}</div>
                                        <small className="text-muted">Inscription</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="small">
                                        <div className="fw-bold">{user.sounds_count}</div>
                                        <small className="text-muted">Sons</small>
                                    </div>
                                </Col>
                                <Col md={2} className="text-center">
                                    <div className="fw-bold text-success">{formatCurrency(user.revenue)}</div>
                                    <small className="text-muted">Revenus</small>
                                </Col>
                                <Col md={2} className="text-end">
                                    <div className="d-flex gap-1">
                                        <Button variant="outline-primary" size="sm">
                                            <FontAwesomeIcon icon={faEye} />
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
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

    const renderAnalytics = () => (
        <div>
            <div className="mb-4">
                <h5 className="fw-bold mb-1">Analytics</h5>
                <p className="text-muted mb-0 small">Analysez les performances de votre plateforme</p>
            </div>

            {/* Métriques principales */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faChartLine} className="text-primary mb-2" size="2x" />
                            <h3 className="fw-bold text-primary">+18.5%</h3>
                            <small className="text-muted">Croissance mensuelle</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-success mb-2" size="2x" />
                            <h3 className="fw-bold text-success">5,689</h3>
                            <small className="text-muted">Utilisateurs actifs</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPlay} className="text-info mb-2" size="2x" />
                            <h3 className="fw-bold text-info">89,456</h3>
                            <small className="text-muted">Écoutes ce mois</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="2x" />
                            <h3 className="fw-bold text-warning">{formatCurrency(2845600)}</h3>
                            <small className="text-muted">Revenus ce mois</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Évolution des ventes</h6>
                        </Card.Header>
                        <Card.Body className="text-center py-5">
                            <FontAwesomeIcon icon={faChartLine} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Graphique des analytics</h6>
                            <p className="text-muted small mb-0">Intégration Chart.js à venir</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Top Genres</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-medium">Afrobeat</span>
                                    <span className="small fw-bold text-primary">34%</span>
                                </div>
                                <ProgressBar variant="primary" now={34} style={{ height: '6px' }} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-medium">Hip-Hop</span>
                                    <span className="small fw-bold text-success">28%</span>
                                </div>
                                <ProgressBar variant="success" now={28} style={{ height: '6px' }} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-medium">Traditional</span>
                                    <span className="small fw-bold text-warning">22%</span>
                                </div>
                                <ProgressBar variant="warning" now={22} style={{ height: '6px' }} />
                            </div>
                            <div className="mb-0">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small fw-medium">R&B</span>
                                    <span className="small fw-bold text-info">16%</span>
                                </div>
                                <ProgressBar variant="info" now={16} style={{ height: '6px' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderSettings = () => (
        <div>
            <div className="mb-4">
                <h5 className="fw-bold mb-1">Paramètres</h5>
                <p className="text-muted mb-0 small">Configurez votre plateforme</p>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Paramètres généraux</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Nom de la plateforme</Form.Label>
                                            <Form.Control type="text" defaultValue="Reveilart4artist" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Email de contact</Form.Label>
                                            <Form.Control type="email" defaultValue="contact@reveilart4artist.com" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Devise</Form.Label>
                                            <Form.Select defaultValue="XAF">
                                                <option value="XAF">Franc CFA (XAF)</option>
                                                <option value="EUR">Euro (EUR)</option>
                                                <option value="USD">Dollar US (USD)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Fuseau horaire</Form.Label>
                                            <Form.Select defaultValue="Africa/Douala">
                                                <option value="Africa/Douala">Afrique/Douala</option>
                                                <option value="Africa/Yaoundé">Afrique/Yaoundé</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Paramètres de commission</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Commission sur les sons (%)</Form.Label>
                                            <Form.Control type="number" defaultValue="15" min="0" max="100" />
                                            <Form.Text className="text-muted">Commission prélevée sur chaque vente de son</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Commission sur les événements (%)</Form.Label>
                                            <Form.Control type="number" defaultValue="10" min="0" max="100" />
                                            <Form.Text className="text-muted">Commission prélevée sur chaque billet vendu</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Actions rapides</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button variant="outline-primary">
                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                    Exporter les données
                                </Button>
                                <Button variant="outline-success">
                                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                                    Importer des données
                                </Button>
                                <Button variant="outline-info">
                                    <FontAwesomeIcon icon={faBell} className="me-2" />
                                    Notifications
                                </Button>
                                <Button variant="outline-warning">
                                    <FontAwesomeIcon icon={faCog} className="me-2" />
                                    Maintenance
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Informations système</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="small">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Version:</span>
                                    <span className="fw-medium">1.0.0</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Dernière mise à jour:</span>
                                    <span className="fw-medium">15/03/2024</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Espace disque:</span>
                                    <span className="fw-medium">78% utilisé</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Statut:</span>
                                    <Badge bg="success">En ligne</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="mt-4 text-center">
                <Button variant="primary" size="lg">
                    <FontAwesomeIcon icon={faCog} className="me-2" />
                    Sauvegarder les modifications
                </Button>
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                    <h5 className="text-muted">Chargement des données...</h5>
                    <p className="text-muted small">Veuillez patienter</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'sounds':
                return renderSoundsManagement();
            case 'events':
                return renderEventsManagement();
            case 'users':
                return renderUsersManagement();
            case 'analytics':
                return renderAnalytics();
            case 'settings':
                return renderSettings();
            case 'categories':
                return <CategoryManagement />;
            default:
                return renderOverview();
        }
    };

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            <div className="d-flex">
                {/* Sidebar moderne */}
                <div className="dashboard-sidebar bg-white border-end shadow-sm">
                    <div className="p-4">
                        {/* Logo */}
                        <Link to="/" className="text-decoration-none">
                            <div className="d-flex align-items-center mb-4">
                                <div className="sidebar-logo bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center">
                                    <img
                                        src="/images/reveil4artist-logo.svg"
                                        alt="Reveil4artist"
                                        style={{ width: '24px', height: '24px' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <FontAwesomeIcon
                                        icon={faGlobe}
                                        className="text-primary"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold text-dark">Reveil4artist</h5>
                                    <small className="text-muted">Dashboard Admin</small>
                                </div>
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="mb-4">
                            {navigationItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`nav-item w-100 d-flex align-items-center p-3 mb-2 border-0 rounded ${
                                        activeTab === item.id ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <div className={`nav-icon bg-${item.color} bg-opacity-10 me-3`}>
                                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}`} />
                                    </div>
                                    <div className="flex-grow-1 text-start">
                                        <div className="nav-label">{item.label}</div>
                                        <small className="nav-description">{item.description}</small>
                                    </div>
                                    {item.count && (
                                        <Badge bg={item.color} className="ms-auto">
                                            {item.count > 999 ? '999+' : item.count}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Actions rapides */}
                        <div className="quick-actions">
                            <h6 className="fw-bold text-muted mb-3">Actions rapides</h6>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/add-sound" variant="outline-primary" size="sm">
                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                    Ajouter un son
                                </Button>
                                <Button as={Link} to="/add-event" variant="outline-success" size="sm">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                    Créer un événement
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Profil admin */}
                    <div className="mt-auto p-4 border-top">
                        <div className="d-flex align-items-center mb-3">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                                alt="Admin"
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px' }}
                            />
                            <div className="flex-grow-1">
                                <div className="fw-medium small">Admin</div>
                                <small className="text-muted">admin@reveilart4artist.com</small>
                            </div>
                            <Button variant="outline-secondary" size="sm" className="p-1">
                                <FontAwesomeIcon icon={faCog} />
                            </Button>
                        </div>
                        <Button as={Link} to="/" variant="outline-primary" size="sm" className="w-100">
                            <FontAwesomeIcon icon={faHome} className="me-2" />
                            Retour au site
                        </Button>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="dashboard-content flex-grow-1">
                    <div className="dashboard-header bg-white border-bottom shadow-sm sticky-top">
                        <div className="d-flex align-items-center justify-content-between p-4">
                            <div>
                                <h4 className="fw-bold mb-1">
                                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                                </h4>
                                <p className="text-muted mb-0 small">
                                    {navigationItems.find(item => item.id === activeTab)?.description || 'Bienvenue sur votre dashboard'}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <Button variant="outline-secondary" size="sm">
                                    <FontAwesomeIcon icon={faBell} />
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-sidebar {
                    width: 320px;
                    min-height: calc(100vh - 80px);
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-logo {
                    width: 40px;
                    height: 40px;
                }

                .nav-item {
                    background: transparent;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .nav-item:hover {
                    background: rgba(139, 92, 246, 0.05);
                    transform: translateX(5px);
                }

                .nav-item.active {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }

                .nav-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .nav-label {
                    font-weight: 500;
                    font-size: 0.875rem;
                    color: var(--bs-dark);
                }

                .nav-description {
                    color: var(--bs-secondary);
                    font-size: 0.75rem;
                }

                .stat-card {
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                }

                .stat-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .activity-icon {
                    width: 35px;
                    height: 35px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .dashboard-header {
                    z-index: 100;
                }

                @media (max-width: 1200px) {
                    .dashboard-sidebar {
                        width: 280px;
                    }
                }

                @media (max-width: 992px) {
                    .dashboard-sidebar {
                        width: 250px;
                    }

                    .nav-label {
                        font-size: 0.8rem;
                    }

                    .nav-description {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .dashboard-sidebar {
                        position: fixed;
                        left: -320px;
                        top: 80px;
                        z-index: 1000;
                        transition: left 0.3s ease;
                    }

                    .dashboard-sidebar.show {
                        left: 0;
                    }
                }
            `}</style>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={closeModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Confirmer la suppression
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <div className="text-center mb-3">
                                <FontAwesomeIcon icon={faTrash} size="3x" className="text-danger mb-3" />
                                <h5>Êtes-vous sûr de vouloir supprimer cet événement ?</h5>
                                <p className="text-muted">Cette action est irréversible.</p>
                            </div>
                            <Card className="bg-light">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={selectedEvent.poster_image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=60&h=60&fit=crop`}
                                            alt={selectedEvent.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{selectedEvent.title}</h6>
                                            <small className="text-muted">
                                                {new Date(selectedEvent.event_date).toLocaleDateString('fr-FR')} • {selectedEvent.venue}
                                            </small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals} disabled={actionLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faTrash} className="me-2" />
                                Supprimer définitivement
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal d'approbation */}
            <Modal show={showApproveModal} onHide={closeModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-success">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Approuver l'événement
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <div className="text-center mb-3">
                                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                                <h5>Approuver cet événement ?</h5>
                                <p className="text-muted">L'événement sera publié et visible par tous les utilisateurs.</p>
                            </div>
                            <Card className="bg-light">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={selectedEvent.poster_image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=60&h=60&fit=crop`}
                                            alt={selectedEvent.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{selectedEvent.title}</h6>
                                            <small className="text-muted">
                                                {new Date(selectedEvent.event_date).toLocaleDateString('fr-FR')} • {selectedEvent.venue}
                                            </small>
                                            <div className="mt-1">
                                                <Badge bg="warning">En attente d'approbation</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals} disabled={actionLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleApproveEvent}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                Approbation...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                Approuver l'événement
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Dashboard;
