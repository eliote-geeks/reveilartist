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
    faCheckCircle,
    faTimesCircle,
    faExclamationTriangle,
    faPause,
    faStop,
    faStepForward,
    faStepBackward,
    faVolumeUp,
    faVolumeDown,
    faVolumeMute
} from '@fortawesome/free-solid-svg-icons';
import CategoryManagement from './CategoryManagement';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';

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

    // États pour l'approbation/rejet des sons
    const [showSoundApproveModal, setShowSoundApproveModal] = useState(false);
    const [showSoundRejectModal, setShowSoundRejectModal] = useState(false);
    const [selectedSound, setSelectedSound] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [soundFilter, setSoundFilter] = useState('all');

    // États pour le lecteur audio
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioRef, setAudioRef] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // États pour la recherche dans les DataTables
    const [soundsSearchTerm, setSoundsSearchTerm] = useState('');
    const [eventsSearchTerm, setEventsSearchTerm] = useState('');
    const [usersSearchTerm, setUsersSearchTerm] = useState('');

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
            const response = await fetch('/api/admin/sounds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // L'API admin/sounds retourne directement un tableau
                const soundsArray = Array.isArray(data) ? data : data.data || [];
                setSounds(soundsArray);
            } else {
                console.error('Erreur API admin/sounds:', response.status);
                // Fallback vers l'API publique si l'API admin échoue
                const publicResponse = await fetch('/api/sounds?per_page=50', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const publicData = await publicResponse.json();
                if (publicData.success) {
                    setSounds(publicData.sounds);
                } else {
                    setSounds([]);
                }
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

            // S'assurer que topArtist est une chaîne
            const topArtistName = typeof topArtist === 'object' ? topArtist?.name || 'Aucun' : topArtist || 'Aucun';

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
                topArtist: topArtistName
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
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Succès', 'Utilisateur supprimé');
                loadUsers();
            } else {
                toast.error('Erreur', 'Impossible de supprimer l\'utilisateur');
            }
        } catch (error) {
            console.error('Erreur suppression utilisateur:', error);
            toast.error('Erreur', 'Erreur de connexion');
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
            description: sounds.length > 0 ? `"${sounds[0].title}" par ${typeof sounds[0].artist === 'object' ? sounds[0].artist?.name || sounds[0].user?.name || 'Artiste' : sounds[0].artist || 'Artiste'}` : 'Aucun son récent',
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

    // Fonctions de filtrage pour les DataTables
    const getFilteredSounds = () => {
        return sounds
            .filter(sound => soundFilter === 'all' || sound.status === soundFilter)
            .filter(sound => {
                if (!soundsSearchTerm) return true;
                const searchLower = soundsSearchTerm.toLowerCase();
                const artistName = typeof sound.artist === 'object' ?
                    sound.artist?.name || sound.user?.name || '' :
                    sound.artist || sound.user?.name || '';

                return sound.title?.toLowerCase().includes(searchLower) ||
                       artistName.toLowerCase().includes(searchLower) ||
                       (sound.category || '').toLowerCase().includes(searchLower);
            });
    };

    const getFilteredEvents = () => {
        return events
            .filter(event => eventFilter === 'all' || event.status === eventFilter)
            .filter(event => {
                if (!eventsSearchTerm) return true;
                const searchLower = eventsSearchTerm.toLowerCase();

                return event.title?.toLowerCase().includes(searchLower) ||
                       (event.venue || '').toLowerCase().includes(searchLower) ||
                       (event.city || '').toLowerCase().includes(searchLower) ||
                       (event.location || '').toLowerCase().includes(searchLower);
            });
    };

    const getFilteredUsers = () => {
        return users.filter(user => {
            if (!usersSearchTerm) return true;
            const searchLower = usersSearchTerm.toLowerCase();

            return user.name?.toLowerCase().includes(searchLower) ||
                   user.email?.toLowerCase().includes(searchLower) ||
                   user.role?.toLowerCase().includes(searchLower);
        });
    };

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
                                        <div className="text-muted small">{typeof sound.artist === 'object' ? sound.artist?.name || sound.user?.name || 'Artiste' : sound.artist || sound.user?.name || 'Artiste'}</div>
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
                                        <Button
                                            variant={currentlyPlaying?.id === sound.id && isPlaying ? "warning" : "outline-primary"}
                                            size="sm"
                                            onClick={() => playSound(sound)}
                                            className="mb-2"
                                            title={currentlyPlaying?.id === sound.id && isPlaying ? "Pause" : "Lire"}
                                        >
                                            <FontAwesomeIcon
                                                icon={currentlyPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                            />
                                        </Button>
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
                            <Form.Select
                                size="sm"
                                style={{ width: 'auto' }}
                                value={soundFilter}
                                onChange={(e) => setSoundFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="published">Publié</option>
                                <option value="rejected">Rejeté</option>
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
                        <CustomDataTable
                            columns={soundsColumns}
                            data={getFilteredSounds()}
                            {...dataTableConfig}
                            subHeader
                            subHeaderComponent={
                                <div className="d-flex justify-content-between align-items-center w-100 p-3">
                                    <div>
                                        <strong>{getFilteredSounds().length}</strong> son(s) affiché(s)
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher par titre, artiste..."
                                            size="sm"
                                            style={{ width: '250px' }}
                                            value={soundsSearchTerm}
                                            onChange={(e) => setSoundsSearchTerm(e.target.value)}
                                        />
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={exportSounds}
                                            title="Exporter en CSV"
                                        >
                                            <FontAwesomeIcon icon={faDownload} />
                                        </Button>
                                    </div>
                                </div>
                            }
                        />
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
                        <CustomDataTable
                            columns={eventsColumns}
                            data={getFilteredEvents()}
                            {...dataTableConfig}
                            subHeader
                            subHeaderComponent={
                                <div className="d-flex justify-content-between align-items-center w-100 p-3">
                                    <div>
                                        <strong>{getFilteredEvents().length}</strong> événement(s) affiché(s)
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher par titre, lieu..."
                                            size="sm"
                                            style={{ width: '250px' }}
                                            value={eventsSearchTerm}
                                            onChange={(e) => setEventsSearchTerm(e.target.value)}
                                        />
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faSearch} />
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={exportEvents}
                                            title="Exporter en CSV"
                                        >
                                            <FontAwesomeIcon icon={faDownload} />
                                        </Button>
                                    </div>
                                </div>
                            }
                        />
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
                    <CustomDataTable
                        columns={usersColumns}
                        data={getFilteredUsers()}
                        {...dataTableConfig}
                        subHeader
                        subHeaderComponent={
                            <div className="d-flex justify-content-between align-items-center w-100 p-3">
                                <div>
                                    <strong>{getFilteredUsers().length}</strong> utilisateur(s) affiché(s)
                                </div>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher par nom, email..."
                                        size="sm"
                                        style={{ width: '250px' }}
                                        value={usersSearchTerm}
                                        onChange={(e) => setUsersSearchTerm(e.target.value)}
                                    />
                                    <Button variant="outline-secondary" size="sm">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={exportUsers}
                                        title="Exporter en CSV"
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </Button>
                                </div>
                            </div>
                        }
                    />
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

    // Fonctions pour l'approbation/rejet des sons
    const handleApproveSoundAdmin = async (soundId) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/sounds/${soundId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Son approuvé', 'Le son a été approuvé avec succès');
                loadSounds(); // Recharger les sons
                setShowSoundApproveModal(false);
                setSelectedSound(null);
            } else {
                const errorData = await response.json();
                toast.error('Erreur', errorData.message || 'Impossible d\'approuver le son');
            }
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            toast.error('Erreur', 'Erreur de connexion lors de l\'approbation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSoundAdmin = async () => {
        if (!rejectReason.trim()) {
            toast.error('Erreur', 'La raison du rejet est obligatoire');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/sounds/${selectedSound.id}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectReason.trim() })
            });

            if (response.ok) {
                toast.success('Son rejeté', 'Le son a été rejeté');
                loadSounds(); // Recharger les sons
                setShowSoundRejectModal(false);
                setRejectReason('');
                setSelectedSound(null);
            } else {
                const errorData = await response.json();
                toast.error('Erreur', errorData.message || 'Impossible de rejeter le son');
            }
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            toast.error('Erreur', 'Erreur de connexion lors du rejet');
        } finally {
            setActionLoading(false);
        }
    };

    const openSoundApproveModal = (sound) => {
        setSelectedSound(sound);
        setShowSoundApproveModal(true);
    };

    const openSoundRejectModal = (sound) => {
        setSelectedSound(sound);
        setShowSoundRejectModal(true);
    };

    const closeSoundModals = () => {
        setShowSoundApproveModal(false);
        setShowSoundRejectModal(false);
        setSelectedSound(null);
        setRejectReason('');
    };

    // Fonctions pour le lecteur audio
    const playSound = (sound) => {
        if (currentlyPlaying?.id === sound.id) {
            // Si c'est déjà le son en cours, toggle play/pause
            if (isPlaying) {
                pauseSound();
            } else {
                resumeSound();
            }
        } else {
            // Nouveau son à jouer
            if (audioRef) {
                audioRef.pause();
            }

            const audio = new Audio();
            // Utiliser l'URL du fichier audio du son
            audio.src = sound.file_url || sound.audio_file_url || `/storage/sounds/${sound.file_name}`;

            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });

            audio.addEventListener('timeupdate', () => {
                setCurrentTime(audio.currentTime);
            });

            audio.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentTime(0);
                // Optionnel: passer au son suivant
                playNextSound();
            });

            audio.addEventListener('error', (e) => {
                console.error('Erreur de lecture audio:', e);
                toast.error('Erreur', 'Impossible de lire ce fichier audio');
            });

            setAudioRef(audio);
            setCurrentlyPlaying(sound);
            setIsPlaying(true);

            audio.play().catch(error => {
                console.error('Erreur lors de la lecture:', error);
                toast.error('Erreur', 'Impossible de lire ce son');
                setIsPlaying(false);
            });
        }
    };

    const pauseSound = () => {
        if (audioRef) {
            audioRef.pause();
            setIsPlaying(false);
        }
    };

    const resumeSound = () => {
        if (audioRef) {
            audioRef.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error('Erreur lors de la reprise:', error);
                setIsPlaying(false);
            });
        }
    };

    const stopSound = () => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    const playNextSound = () => {
        if (!currentlyPlaying || !sounds.length) return;

        const currentIndex = sounds.findIndex(s => s.id === currentlyPlaying.id);
        const nextIndex = (currentIndex + 1) % sounds.length;
        playSound(sounds[nextIndex]);
    };

    const playPrevSound = () => {
        if (!currentlyPlaying || !sounds.length) return;

        const currentIndex = sounds.findIndex(s => s.id === currentlyPlaying.id);
        const prevIndex = (currentIndex - 1 + sounds.length) % sounds.length;
        playSound(sounds[prevIndex]);
    };

    const seekTo = (time) => {
        if (audioRef) {
            audioRef.currentTime = time;
            setCurrentTime(time);
        }
    };

    const changeVolume = (newVolume) => {
        if (audioRef) {
            audioRef.volume = newVolume;
            setVolume(newVolume);
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Nettoyer l'audio au démontage du composant
    useEffect(() => {
        return () => {
            if (audioRef) {
                audioRef.pause();
                audioRef.src = '';
            }
        };
    }, [audioRef]);

    // Styles personnalisés pour DataTable
    const CustomDataTable = styled(DataTable)`
        .rdt_TableHead {
            .rdt_TableHeadRow {
                background-color: #f8f9fa;
                border-bottom: 2px solid #dee2e6;

                .rdt_TableCol {
                    font-weight: 600;
                    color: #495057;
                    padding: 16px 8px;
                }
            }
        }

        .rdt_TableBody {
            .rdt_TableRow {
                border-bottom: 1px solid #f1f3f4;
                transition: background-color 0.2s ease;

                &:hover {
                    background-color: #f8f9fa;
                }

                .rdt_TableCell {
                    padding: 12px 8px;
                }
            }
        }

        .rdt_Pagination {
            border-top: 1px solid #dee2e6;
            background-color: #f8f9fa;
        }
    `;

    // Configuration générale pour les DataTables
    const dataTableConfig = {
        pagination: true,
        paginationPerPage: 10,
        paginationRowsPerPageOptions: [5, 10, 15, 20, 25],
        responsive: true,
        highlightOnHover: true,
        striped: false,
        noDataComponent: "Aucune donnée à afficher",
        paginationComponentOptions: {
            rowsPerPageText: 'Lignes par page:',
            rangeSeparatorText: 'de',
            selectAllRowsItem: true,
            selectAllRowsItemText: 'Tous',
        }
    };

    // Colonnes pour la table des sons
    const soundsColumns = [
        {
            name: 'Son',
            cell: row => (
                <div className="d-flex align-items-center">
                    <img
                        src={row.cover_image || row.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=40&h=40&fit=crop`}
                        alt={row.title}
                        className="rounded me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                        <div className="fw-bold small">{row.title}</div>
                        <small className="text-muted">
                            {typeof row.artist === 'object' ?
                                row.artist?.name || row.user?.name || 'Artiste' :
                                row.artist || row.user?.name || 'Artiste'
                            }
                        </small>
                    </div>
                </div>
            ),
            sortable: true,
            sortFunction: (a, b) => a.title.localeCompare(b.title),
            minWidth: '250px'
        },
        {
            name: 'Catégorie',
            selector: row => row.category || 'Non classé',
            sortable: true,
            cell: row => <Badge bg="light" text="dark">{row.category || 'Non classé'}</Badge>,
            width: '120px'
        },
        {
            name: 'Statut',
            selector: row => row.status || 'pending',
            sortable: true,
            cell: row => getStatusBadge(row.status || 'pending'),
            width: '100px'
        },
        {
            name: 'Écoutes',
            selector: row => row.plays_count || row.plays || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">{(row.plays_count || row.plays || 0).toLocaleString()}</div>
                </div>
            ),
            width: '100px'
        },
        {
            name: 'DL',
            selector: row => row.downloads_count || row.downloads || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">{(row.downloads_count || row.downloads || 0).toLocaleString()}</div>
                </div>
            ),
            width: '80px'
        },
        {
            name: 'Prix',
            selector: row => row.price || 0,
            sortable: true,
            cell: row => (
                <div className="fw-bold text-success">
                    {row.is_free ? 'Gratuit' : formatCurrency(row.price || 0)}
                </div>
            ),
            width: '100px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        variant={currentlyPlaying?.id === row.id && isPlaying ? "warning" : "primary"}
                        size="sm"
                        onClick={() => playSound(row)}
                        title={currentlyPlaying?.id === row.id && isPlaying ? "Pause" : "Lire"}
                    >
                        <FontAwesomeIcon
                            icon={currentlyPlaying?.id === row.id && isPlaying ? faPause : faPlay}
                        />
                    </Button>

                    <Button
                        as={Link}
                        to={`/sound/${row.id}`}
                        variant="outline-primary"
                        size="sm"
                        title="Voir"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>

                    {row.status === 'pending' && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => openSoundApproveModal(row)}
                                title="Approuver"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => openSoundRejectModal(row)}
                                title="Rejeter"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSound(row.id)}
                        title="Supprimer"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '200px'
        }
    ];

    // Colonnes pour la table des événements
    const eventsColumns = [
        {
            name: 'Événement',
            cell: row => (
                <div className="d-flex align-items-center">
                    <img
                        src={row.poster_image_url || `https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=40&h=40&fit=crop`}
                        alt={row.title}
                        className="rounded me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                        <div className="fw-bold small">{row.title}</div>
                        <small className="text-muted">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                            {row.venue || row.location}, {row.city}
                        </small>
                    </div>
                </div>
            ),
            sortable: true,
            sortFunction: (a, b) => a.title.localeCompare(b.title),
            minWidth: '250px'
        },
        {
            name: 'Date',
            selector: row => row.event_date,
            sortable: true,
            cell: row => (
                <div>
                    <div className="fw-bold small">{new Date(row.event_date).toLocaleDateString('fr-FR')}</div>
                    <small className="text-muted">{row.start_time}</small>
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Statut',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status),
            width: '100px'
        },
        {
            name: 'Participants',
            selector: row => row.current_attendees || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">{row.current_attendees || 0}/{row.max_attendees || 'Illimité'}</div>
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Prix',
            selector: row => row.ticket_price || 0,
            sortable: true,
            cell: row => (
                <div className="fw-bold text-success">
                    {row.is_free ? 'Gratuit' :
                     row.ticket_price ? formatCurrency(row.ticket_price) : 'À définir'}
                </div>
            ),
            width: '100px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        as={Link}
                        to={`/event/${row.id}`}
                        variant="outline-info"
                        size="sm"
                        title="Voir"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>

                    {row.status === 'pending' && user?.role === 'admin' && (
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => openApproveModal(row)}
                            title="Approuver"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </Button>
                    )}

                    {canManageEvent(row, user) && (
                        <>
                            <Button
                                as={Link}
                                to={`/edit-event/${row.id}`}
                                variant="outline-secondary"
                                size="sm"
                                title="Modifier"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openDeleteModal(row)}
                                title="Supprimer"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px'
        }
    ];

    // Colonnes pour la table des utilisateurs
    const usersColumns = [
        {
            name: 'Utilisateur',
            cell: row => (
                <div className="d-flex align-items-center">
                    <img
                        src={row.avatar}
                        alt={row.name}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                        <div className="fw-bold small">{row.name}</div>
                        <small className="text-muted">{row.email}</small>
                    </div>
                </div>
            ),
            sortable: true,
            sortFunction: (a, b) => a.name.localeCompare(b.name),
            minWidth: '250px'
        },
        {
            name: 'Rôle',
            selector: row => row.role,
            sortable: true,
            cell: row => <Badge bg="light" text="dark">{row.role}</Badge>,
            width: '100px'
        },
        {
            name: 'Statut',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status),
            width: '100px'
        },
        {
            name: 'Inscription',
            selector: row => row.join_date,
            sortable: true,
            cell: row => new Date(row.join_date).toLocaleDateString('fr-FR'),
            width: '120px'
        },
        {
            name: 'Sons',
            selector: row => row.sounds_count || 0,
            sortable: true,
            cell: row => <div className="text-center fw-bold">{row.sounds_count || 0}</div>,
            width: '80px'
        },
        {
            name: 'Revenus',
            selector: row => row.revenue || 0,
            sortable: true,
            cell: row => <div className="fw-bold text-success">{formatCurrency(row.revenue || 0)}</div>,
            width: '120px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button variant="outline-primary" size="sm" title="Voir">
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button variant="outline-secondary" size="sm" title="Modifier">
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(row.id)}
                        title="Supprimer"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '120px'
        }
    ];

    // Fonctions d'export CSV
    const exportToCSV = (data, filename) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + data.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportSounds = () => {
        const soundsData = getFilteredSounds().map(sound => ({
            Titre: sound.title,
            Artiste: typeof sound.artist === 'object' ?
                sound.artist?.name || sound.user?.name || 'Artiste' :
                sound.artist || sound.user?.name || 'Artiste',
            Catégorie: sound.category || 'Non classé',
            Statut: sound.status || 'pending',
            Écoutes: sound.plays_count || sound.plays || 0,
            Téléchargements: sound.downloads_count || sound.downloads || 0,
            Prix: sound.is_free ? 'Gratuit' : (sound.price || 0) + ' XAF'
        }));
        exportToCSV(soundsData, 'sons_dashboard.csv');
    };

    const exportEvents = () => {
        const eventsData = getFilteredEvents().map(event => ({
            Titre: event.title,
            Date: new Date(event.event_date).toLocaleDateString('fr-FR'),
            Lieu: `${event.venue || event.location}, ${event.city}`,
            Statut: event.status,
            Participants: `${event.current_attendees || 0}/${event.max_attendees || 'Illimité'}`,
            Prix: event.is_free ? 'Gratuit' :
                  event.ticket_price ? event.ticket_price + ' XAF' : 'À définir'
        }));
        exportToCSV(eventsData, 'evenements_dashboard.csv');
    };

    const exportUsers = () => {
        const usersData = getFilteredUsers().map(user => ({
            Nom: user.name,
            Email: user.email,
            Rôle: user.role,
            Statut: user.status,
            Inscription: new Date(user.join_date).toLocaleDateString('fr-FR'),
            Sons: user.sounds_count || 0,
            Revenus: (user.revenue || 0) + ' XAF'
        }));
        exportToCSV(usersData, 'utilisateurs_dashboard.csv');
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

                .audio-player {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    border-top: 1px solid #dee2e6;
                    z-index: 1000;
                    transition: transform 0.3s ease;
                }

                .audio-player.hidden {
                    transform: translateY(100%);
                }

                .progress-bar-custom {
                    height: 4px;
                    background: #e9ecef;
                    border-radius: 2px;
                    overflow: hidden;
                    cursor: pointer;
                }

                .progress-fill {
                    height: 100%;
                    background: #007bff;
                    transition: width 0.1s ease;
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

                    .audio-player {
                        padding: 8px 12px;
                    }
                }
            `}</style>

            {/* Lecteur audio fixe */}
            {currentlyPlaying && (
                <div className={`audio-player p-3 ${!currentlyPlaying ? 'hidden' : ''}`}>
                    <Container fluid>
                        <Row className="align-items-center">
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={currentlyPlaying.cover_image || currentlyPlaying.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop`}
                                        alt={currentlyPlaying.title}
                                        className="rounded me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="fw-bold small">{currentlyPlaying.title}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {typeof currentlyPlaying.artist === 'object' ?
                                                currentlyPlaying.artist?.name || currentlyPlaying.user?.name || 'Artiste' :
                                                currentlyPlaying.artist || currentlyPlaying.user?.name || 'Artiste'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="text-center">
                                    {/* Contrôles de lecture */}
                                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                                        <Button variant="outline-secondary" size="sm" onClick={playPrevSound}>
                                            <FontAwesomeIcon icon={faStepBackward} />
                                        </Button>

                                        <Button
                                            variant={isPlaying ? "warning" : "primary"}
                                            onClick={() => isPlaying ? pauseSound() : resumeSound()}
                                        >
                                            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                        </Button>

                                        <Button variant="outline-secondary" size="sm" onClick={stopSound}>
                                            <FontAwesomeIcon icon={faStop} />
                                        </Button>

                                        <Button variant="outline-secondary" size="sm" onClick={playNextSound}>
                                            <FontAwesomeIcon icon={faStepForward} />
                                        </Button>
                                    </div>

                                    {/* Barre de progression */}
                                    <div className="d-flex align-items-center gap-2">
                                        <small className="text-muted">{formatTime(currentTime)}</small>
                                        <div
                                            className="progress-bar-custom flex-grow-1"
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const percent = (e.clientX - rect.left) / rect.width;
                                                seekTo(percent * duration);
                                            }}
                                        >
                                            <div
                                                className="progress-fill"
                                                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <small className="text-muted">{formatTime(duration)}</small>
                                    </div>
                                </div>
                            </Col>

                            <Col md={3}>
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                    {/* Contrôle de volume */}
                                    <FontAwesomeIcon
                                        icon={volume === 0 ? faVolumeMute : volume < 0.5 ? faVolumeDown : faVolumeUp}
                                        className="text-muted"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => changeVolume(parseFloat(e.target.value))}
                                        className="form-range"
                                        style={{ width: '80px' }}
                                    />

                                    {/* Bouton fermer */}
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            stopSound();
                                            setCurrentlyPlaying(null);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTimesCircle} />
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            )}

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

            {/* Modales pour l'approbation/rejet des sons */}
            <Modal show={showSoundApproveModal} onHide={closeSoundModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-success">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                        Approuver le son
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSound && (
                        <div>
                            <div className="text-center mb-3">
                                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                                <h5>Approuver ce son ?</h5>
                                <p className="text-muted">Le son sera publié et visible par tous les utilisateurs. L'artiste recevra une notification.</p>
                            </div>
                            <Card className="bg-light">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={selectedSound.cover_image || selectedSound.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop`}
                                            alt={selectedSound.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{selectedSound.title}</h6>
                                            <small className="text-muted">
                                                par {typeof selectedSound.artist === 'object' ? selectedSound.artist?.name || selectedSound.user?.name || 'Artiste' : selectedSound.artist || selectedSound.user?.name || 'Artiste'}
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
                    <Button variant="secondary" onClick={closeSoundModals} disabled={actionLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => handleApproveSoundAdmin(selectedSound?.id)}
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
                                Approuver le son
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de rejet des sons */}
            <Modal show={showSoundRejectModal} onHide={closeSoundModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        Rejeter le son
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <strong>Attention !</strong> L'artiste sera automatiquement notifié par email avec la raison du rejet.
                    </Alert>

                    {selectedSound && (
                        <div className="mb-3">
                            <Card className="bg-light">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={selectedSound.cover_image || selectedSound.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop`}
                                            alt={selectedSound.title}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="fw-bold mb-1">{selectedSound.title}</h6>
                                            <small className="text-muted">
                                                par {typeof selectedSound.artist === 'object' ? selectedSound.artist?.name || selectedSound.user?.name || 'Artiste' : selectedSound.artist || selectedSound.user?.name || 'Artiste'}
                                            </small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                            Raison du rejet <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Expliquez clairement pourquoi ce son est rejeté (qualité audio, droits d'auteur, contenu inapproprié, etc.)..."
                            required
                        />
                        <Form.Text className="text-muted">
                            Cette raison sera envoyée à l'artiste. Soyez constructif et précis.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={closeSoundModals}
                        disabled={actionLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleRejectSoundAdmin}
                        disabled={!rejectReason.trim() || actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                Rejet en cours...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                                Confirmer le rejet
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Dashboard;
