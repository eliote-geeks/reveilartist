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
    faVolumeMute,
    faPercentage,
    faCreditCard,
    faSync,
    faUndo,
    faUser,
    faCheck,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import CategoryManagement from './CategoryManagement';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DataTable from 'react-data-table-component';
import styled from 'styled-components';
import '../../../css/dashboard.css'; // Import du CSS dashboard

// Styles additionnels pour les cartes de statistiques
const styles = `
    .stat-card {
        transition: all 0.3s ease !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
    }
    .stat-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
    }
    .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }
`;

// Injecter les styles
if (!document.getElementById('dashboard-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dashboard-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

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
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);

    // États pour la recherche dans les DataTables
    const [soundsSearchTerm, setSoundsSearchTerm] = useState('');
    const [eventsSearchTerm, setEventsSearchTerm] = useState('');
    const [usersSearchTerm, setUsersSearchTerm] = useState('');

    // États pour les données API
    const [sounds, setSounds] = useState([]);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersRevenue, setUsersRevenue] = useState([]);
    const [revenueStats, setRevenueStats] = useState({});
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

    // États pour stocker les données supplémentaires
    const [dailyStats, setDailyStats] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [commissionSettings, setCommissionSettings] = useState({
        sound_commission: 15,
        event_commission: 10
    });

    const { token, user } = useAuth();
    const toast = useToast();

    useEffect(() => {
        loadDashboardData();
        loadCommissionSettings(); // Charger les paramètres de commission au démarrage
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadSounds(),
                loadEvents(),
                loadUsers(),
                loadStats(),
                loadUsersRevenue()
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            toast.error('Erreur', 'Impossible de charger les données du dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour charger les paramètres de commission (simplifiée)
    const loadCommissionSettings = async () => {
        try {
            const response = await fetch('/api/dashboard/commission', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.rates) {
                    setCommissionSettings({
                        sound_commission: data.rates.sound_commission || 15,
                        event_commission: data.rates.event_commission || 10
                    });
                }
            }
        } catch (error) {
            console.error('Erreur chargement commission:', error);
        }
    };

    const loadSounds = async () => {
        try {
            const response = await fetch('/api/dashboard/sounds', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSounds(Array.isArray(data) ? data : []);
            } else {
                // Fallback
                setSounds([]);
            }
        } catch (error) {
            console.error('Erreur chargement sons:', error);
            setSounds([]);
        }
    };

    const loadEvents = async () => {
        try {
            const response = await fetch('/api/dashboard/events', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(Array.isArray(data) ? data : []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Erreur chargement événements:', error);
            setEvents([]);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/dashboard/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            setUsers([]);
        }
    };

    const loadUsersRevenue = async () => {
        try {
            const response = await fetch('/api/dashboard/users-revenue', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsersRevenue(Array.isArray(data.users_revenue) ? data.users_revenue : []);
                setRevenueStats(data.summary || {});
            } else {
                setUsersRevenue([]);
                setRevenueStats({});
            }
        } catch (error) {
            console.error('Erreur chargement revenus utilisateurs:', error);
            setUsersRevenue([]);
            setRevenueStats({});
        }
    };

    const loadStats = async () => {
        try {
            // Récupérer les vraies statistiques depuis l'API
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                console.warn(`API stats error: ${response.status}`);
                // Utiliser des stats par défaut si l'API échoue
                setStats(prevStats => ({
                    ...prevStats,
                    totalUsers: users.length || 0,
                    totalSounds: sounds.length || 0,
                    totalEvents: events.length || 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                    totalPayments: 0
                }));
                return;
            }

            const data = await response.json();
            console.log('Stats API response:', data);

            // Mettre à jour les stats avec les vraies données
            if (data.payment_stats && data.general_stats) {
                const paymentStats = data.payment_stats;
                const generalStats = data.general_stats;

                setStats(prevStats => ({
                    ...prevStats,
                    // Statistiques principales des paiements
                    totalRevenue: paymentStats.total_amount || 0,
                    totalPayments: paymentStats.total_payments || 0,
                    totalCommission: paymentStats.total_commission || 0,
                    averagePayment: paymentStats.average_amount || 0,

                    // Statistiques par statut
                    completedPayments: paymentStats.completed_payments || 0,
                    pendingPayments: paymentStats.pending_payments || 0,
                    failedPayments: paymentStats.failed_payments || 0,
                    refundedPayments: paymentStats.refunded_payments || 0,

                    // Statistiques par type
                    soundPayments: paymentStats.sound_payments || 0,
                    eventPayments: paymentStats.event_payments || 0,

                    // Statistiques générales de la plateforme
                    totalUsers: generalStats.total_users || 0,
                    totalSounds: generalStats.total_sounds || 0,
                    totalEvents: generalStats.total_events || 0,
                    activeUsers: generalStats.active_users || 0,
                    publishedSounds: generalStats.published_sounds || 0,
                    publishedEvents: generalStats.published_events || 0,
                    activeEvents: generalStats.published_events || 0,

                    // Calculer la croissance basée sur les données réelles
                    monthlyGrowth: paymentStats.total_payments > 0 ?
                        Math.round(((paymentStats.completed_payments / paymentStats.total_payments) * 100) * 100) / 100 : 0,

                    // Top vendeur basé sur les vraies données
                    topArtist: data.top_sellers && data.top_sellers.length > 0 ?
                        data.top_sellers[0].seller_name : 'Aucun'
                }));

                // Stocker les données supplémentaires pour d'autres usages
                if (data.daily_stats) {
                    setDailyStats(data.daily_stats);
                }
                if (data.top_sellers) {
                    setTopSellers(data.top_sellers);
                }
                if (data.payment_methods) {
                    setPaymentMethods(data.payment_methods);
                }
            }

        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            // Utiliser des données de fallback en cas d'erreur
            setStats(prevStats => ({
                ...prevStats,
                totalUsers: users.length || 0,
                totalSounds: sounds.length || 0,
                totalEvents: events.length || 0,
                totalRevenue: 0,
                totalCommission: 0,
                totalPayments: 0,
                completedPayments: 0,
                pendingPayments: 0,
                failedPayments: 0,
                refundedPayments: 0,
                soundPayments: 0,
                eventPayments: 0,
                activeUsers: users.length || 0,
                publishedSounds: sounds.filter(s => s.status === 'published').length || 0,
                publishedEvents: events.filter(e => e.status === 'published').length || 0,
                activeEvents: events.filter(e => e.status === 'published').length || 0,
                monthlyGrowth: 0,
                topArtist: 'Aucun'
            }));
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

    const handleApproveEvent = async (eventId) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/events/${eventId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success || response.ok) {
                toast.success('Succès', 'Événement approuvé avec succès');
                loadEvents(); // Recharger la liste
            } else {
                toast.error('Erreur', data.message || 'Impossible d\'approuver l\'événement');
            }
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
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
            id: 'revenue',
            label: 'Revenus',
            icon: faEuroSign,
            color: 'success',
            count: revenueStats.active_sellers || 0,
            description: 'Revenus par utilisateur'
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

    // Configuration des DataTables
    const dataTableConfig = {
        pagination: true,
        paginationPerPage: 10,
        paginationRowsPerPageOptions: [10, 20, 30, 50],
        responsive: true,
        highlightOnHover: true,
        striped: true,
        dense: true
    };

    // Fonction pour formater le temps (définie plus tôt)
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Fonction pour jouer/arrêter un son améliorée
    const togglePlaySound = (sound) => {
        console.log('Playing sound:', sound); // Debug

        if (currentlyPlaying && currentlyPlaying.id === sound.id) {
            // Arrêter le son en cours
            if (audioRef) {
                audioRef.pause();
                setIsPlaying(false);
                setCurrentlyPlaying(null);
                setShowAudioPlayer(false);
            }
        } else {
            // Jouer un nouveau son
            if (audioRef) {
                audioRef.pause();
            }

            // Construire l'URL du fichier audio avec fallback
            let audioUrl = null;

            if (sound.file_url) {
                audioUrl = sound.file_url;
            } else if (sound.file_path) {
                // Vérifier si le chemin commence déjà par /storage
                if (sound.file_path.startsWith('/storage')) {
                    audioUrl = sound.file_path;
                } else if (sound.file_path.startsWith('storage/')) {
                    audioUrl = '/' + sound.file_path;
                } else {
                    audioUrl = `/storage/${sound.file_path}`;
                }
            } else {
                // Fichier de démonstration
                audioUrl = '/storage/sounds/demo.mp3';
            }

            console.log('Audio URL:', audioUrl); // Debug

            const audio = new Audio(audioUrl);
            audio.volume = volume;
            setAudioRef(audio);
            setCurrentlyPlaying(sound);
            setShowAudioPlayer(true);

            // Gestion des événements audio
            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
                console.log('Audio duration loaded:', audio.duration); // Debug
            });

            audio.addEventListener('timeupdate', () => {
                setCurrentTime(audio.currentTime);
            });

            audio.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentlyPlaying(null);
                setShowAudioPlayer(false);
                setCurrentTime(0);
            });

            audio.addEventListener('error', (e) => {
                console.error('Erreur audio:', e);
                console.error('URL problématique:', audioUrl);
                toast.error('Erreur', `Impossible de charger le fichier audio: ${sound.title}`);
                setCurrentlyPlaying(null);
                setShowAudioPlayer(false);
                setIsPlaying(false);
            });

            audio.addEventListener('loadstart', () => {
                console.log('Début chargement audio:', audioUrl);
            });

            audio.addEventListener('canplay', () => {
                console.log('Audio prêt à jouer');
            });

            // Tenter de lire le son
            audio.play().then(() => {
                setIsPlaying(true);
                console.log('Audio lecture démarrée avec succès'); // Debug
            }).catch(error => {
                console.error('Erreur lecture audio:', error);
                toast.error('Erreur', `Impossible de lire le son: ${sound.title}. Vérifiez que le fichier existe.`);
                setCurrentlyPlaying(null);
                setShowAudioPlayer(false);
                setIsPlaying(false);
            });
        }
    };

    // Colonnes pour la table des sons avec lecteur audio amélioré
    const soundsColumns = [
        {
            name: 'Son',
            selector: row => row.title,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    {/* Icône de musique uniquement */}
                    <div className="me-3 p-3 rounded-3 text-center" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FontAwesomeIcon icon={faMusic} size="lg" />
                    </div>

                    <div className="flex-grow-1">
                        <div className="fw-medium text-dark">{row.title}</div>
                        <small className="text-muted d-block">
                            <FontAwesomeIcon icon={faUser} className="me-1" />
                            {row.artist_name || row.artist || (row.user ? row.user.name : 'Artiste inconnu')}
                        </small>
                        <div className="small text-info">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {row.formatted_duration || formatTime(row.duration) || '0:00'}
                        </div>
                        {row.genre && (
                            <div className="small text-secondary">
                                <FontAwesomeIcon icon={faTags} className="me-1" />
                                {row.genre}
                            </div>
                        )}
                        {row.bpm && (
                            <div className="small text-primary">
                                <FontAwesomeIcon icon={faMusic} className="me-1" />
                                {row.bpm} BPM
                            </div>
                        )}
                    </div>
                </div>
            ),
            width: '350px'
        },
        {
            name: 'Statut',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status),
            width: '120px'
        },
        {
            name: 'Prix',
            selector: row => row.price,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    {row.is_free ? (
                        <Badge bg="success" className="px-2 py-1">
                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                            Gratuit
                        </Badge>
                    ) : (
                        <span className="fw-bold text-primary">
                            <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                            {row.formatted_price || formatCurrency(row.price || 0)}
                        </span>
                    )}
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Statistiques',
            selector: row => row.plays_count || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold small">
                        <FontAwesomeIcon icon={faPlay} className="me-1 text-success" />
                        {(row.plays_count || 0).toLocaleString()}
                    </div>
                    <div className="small text-muted">
                        <FontAwesomeIcon icon={faDownload} className="me-1 text-info" />
                        {(row.downloads_count || 0).toLocaleString()}
                    </div>
                    <div className="small text-danger">
                        <FontAwesomeIcon icon={faHeart} className="me-1" />
                        {(row.likes_count || 0).toLocaleString()}
                    </div>
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Date',
            selector: row => row.created_at,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="small fw-medium">
                        {new Date(row.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <small className="text-muted">
                        {new Date(row.created_at).toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </small>
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    {/* Bouton Play/Stop - maintenant dans les actions */}
                    <Button
                        variant={currentlyPlaying && currentlyPlaying.id === row.id ? "danger" : "success"}
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlaySound(row);
                        }}
                        title={currentlyPlaying && currentlyPlaying.id === row.id ? "Arrêter" : "Écouter"}
                        className="d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                    >
                        <FontAwesomeIcon
                            icon={currentlyPlaying && currentlyPlaying.id === row.id ? faStop : faPlay}
                        />
                    </Button>

                    <Button
                        as={Link}
                        to={`/sound-details/${row.id}`}
                        variant="outline-primary"
                        size="sm"
                        title="Voir"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                        as={Link}
                        to={`/edit-sound/${row.id}`}
                        variant="outline-secondary"
                        size="sm"
                        title="Éditer"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    {row.status === 'pending' && user?.role === 'admin' && (
                        <>
                            <Button
                                variant="outline-success"
                                size="sm"
                                title="Approuver"
                                onClick={() => handleApproveSound(row.id)}
                                disabled={actionLoading}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </Button>
                            <Button
                                variant="outline-warning"
                                size="sm"
                                title="Rejeter"
                                onClick={() => {
                                    setSelectedSound(row);
                                    setShowSoundRejectModal(true);
                                }}
                                disabled={actionLoading}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline-danger"
                        size="sm"
                        title="Supprimer"
                        onClick={() => handleDeleteSound(row.id)}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '250px'
        }
    ];

    // Colonnes pour la table des événements avec icônes appropriées
    const eventsColumns = [
        {
            name: 'Événement',
            selector: row => row.title,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <div className="me-3 p-3 rounded-3 text-center" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
                    </div>
                    <div>
                        <div className="fw-medium text-dark">{row.title}</div>
                        <small className="text-muted">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                            {row.venue || row.location || 'Lieu non défini'}
                        </small>
                        <div className="small text-info">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {new Date(row.event_date || row.date).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
            ),
            width: '320px'
        },
        {
            name: 'Date',
            selector: row => row.event_date || row.date,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">
                        {new Date(row.event_date || row.date).toLocaleDateString('fr-FR')}
                    </div>
                    <small className="text-muted">
                        {new Date(row.event_date || row.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                    </small>
                </div>
            ),
            width: '140px'
        },
        {
            name: 'Statut',
            selector: row => row.status,
            sortable: true,
            cell: row => getStatusBadge(row.status),
            width: '120px'
        },
        {
            name: 'Participants',
            selector: row => row.current_attendees || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">
                        <FontAwesomeIcon icon={faUsers} className="me-1 text-primary" />
                        {row.current_attendees || 0}/{row.capacity || row.max_attendees || 0}
                    </div>
                    <small className="text-muted">participants</small>
                </div>
            ),
            width: '140px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        as={Link}
                        to={`/event-details/${row.id}`}
                        variant="outline-primary"
                        size="sm"
                        title="Voir"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                        as={Link}
                        to={`/edit-event/${row.id}`}
                        variant="outline-secondary"
                        size="sm"
                        title="Éditer"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    {row.status === 'pending' && user?.role === 'admin' && (
                        <Button
                            variant="outline-success"
                            size="sm"
                            title="Approuver"
                            onClick={() => handleApproveEvent(row.id)}
                            disabled={actionLoading}
                        >
                            <FontAwesomeIcon icon={faCheck} />
                        </Button>
                    )}
                    <Button
                        variant="outline-danger"
                        size="sm"
                        title="Supprimer"
                        onClick={() => handleDeleteEvent(row.id)}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '180px'
        }
    ];

    // Colonnes pour la table des utilisateurs avec route corrigée
    const usersColumns = [
        {
            name: 'Utilisateur',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <div className="me-3 p-3 rounded-circle text-center" style={{
                        background: `linear-gradient(135deg, ${
                            row.role === 'artist' ? '#3b82f6, #1d4ed8' :
                            row.role === 'producer' ? '#10b981, #059669' :
                            row.role === 'admin' ? '#dc2626, #b91c1c' :
                            '#6b7280, #4b5563'
                        })`,
                        color: 'white',
                        minWidth: '50px',
                        minHeight: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        {row.role === 'artist' ? (
                            <FontAwesomeIcon icon={faStar} />
                        ) : row.role === 'producer' ? (
                            <FontAwesomeIcon icon={faCog} />
                        ) : row.role === 'admin' ? (
                            <FontAwesomeIcon icon={faCrown} />
                        ) : (
                            <FontAwesomeIcon icon={faUser} />
                        )}
                    </div>
                    <div>
                        <div className="fw-medium">{row.name}</div>
                        <small className="text-muted">{row.email}</small>
                        <div className="small text-info">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            Membre depuis {new Date(row.join_date || row.created_at).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
            ),
            width: '300px'
        },
        {
            name: 'Rôle',
            selector: row => row.role,
            sortable: true,
            cell: row => (
                <Badge bg={row.role === 'artist' ? 'primary' : row.role === 'producer' ? 'success' : row.role === 'admin' ? 'danger' : 'secondary'}>
                    <FontAwesomeIcon
                        icon={row.role === 'artist' ? faStar : row.role === 'producer' ? faCog : row.role === 'admin' ? faCrown : faUser}
                        className="me-1"
                    />
                    {row.role === 'artist' ? 'Artiste' : row.role === 'producer' ? 'Producteur' : row.role === 'admin' ? 'Admin' : 'Utilisateur'}
                </Badge>
            ),
            width: '140px'
        },
        {
            name: 'Activité',
            selector: row => row.sounds_count || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold">
                        <FontAwesomeIcon icon={faMusic} className="me-1 text-primary" />
                        {row.sounds_count || 0}
                    </div>
                    <small className="text-muted">sons</small>
                    {row.total_plays && (
                        <div className="small text-info">
                            <FontAwesomeIcon icon={faPlay} className="me-1" />
                            {row.total_plays.toLocaleString()} écoutes
                        </div>
                    )}
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Revenus',
            selector: row => row.revenue || 0,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <span className="fw-bold text-success">
                        <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                        {formatCurrency(row.revenue || 0)}
                    </span>
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Statut',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge bg={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'danger' : 'secondary'}>
                    <FontAwesomeIcon
                        icon={row.status === 'active' ? faCheckCircle : row.status === 'suspended' ? faTimesCircle : faClock}
                        className="me-1"
                    />
                    {row.status === 'active' ? 'Actif' : row.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                </Badge>
            ),
            width: '120px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        as={Link}
                        to={`/artist/${row.id}`}
                        variant="outline-primary"
                        size="sm"
                        title="Voir le profil"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                        as={Link}
                        to={`/profile-edit/${row.id}`}
                        variant="outline-secondary"
                        size="sm"
                        title="Éditer"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    {user?.role === 'admin' && row.id !== user.id && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            title="Supprimer"
                            onClick={() => handleDeleteUser(row.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px'
        }
    ];

    // Colonnes pour la table des revenus utilisateurs
    const revenueColumns = [
        {
            name: 'Vendeur',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <div className="me-3 p-3 rounded-circle text-center position-relative" style={{
                        background: `linear-gradient(135deg, ${
                            row.seller_category === 'platinum' ? '#e5e7eb, #9ca3af' :
                            row.seller_category === 'gold' ? '#fbbf24, #f59e0b' :
                            row.seller_category === 'silver' ? '#6b7280, #4b5563' :
                            row.seller_category === 'bronze' ? '#92400e, #78350f' :
                            row.seller_category === 'rookie' ? '#059669, #047857' :
                            '#6b7280, #4b5563'
                        })`,
                        color: 'white',
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FontAwesomeIcon icon={
                            row.seller_category === 'platinum' ? faCrown :
                            row.seller_category === 'gold' ? faStar :
                            row.seller_category === 'silver' ? faStar :
                            row.seller_category === 'bronze' ? faStar :
                            faUser
                        } className="text-white" />

                        {/* Badge catégorie */}
                        {row.seller_category !== 'none' && (
                            <div className="position-absolute" style={{
                                bottom: '-5px',
                                right: '-5px',
                                background: row.seller_category === 'platinum' ? '#8b5cf6' :
                                           row.seller_category === 'gold' ? '#f59e0b' :
                                           row.seller_category === 'silver' ? '#6b7280' :
                                           row.seller_category === 'bronze' ? '#92400e' : '#059669',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8px',
                                fontWeight: 'bold',
                                color: 'white',
                                border: '2px solid white'
                            }}>
                                {row.seller_category === 'platinum' ? 'P' :
                                 row.seller_category === 'gold' ? 'G' :
                                 row.seller_category === 'silver' ? 'S' :
                                 row.seller_category === 'bronze' ? 'B' : 'R'}
                            </div>
                        )}
                    </div>

                    <div className="flex-grow-1">
                        <div className="fw-bold text-dark mb-1">{row.name}</div>
                        <small className="text-muted d-block">{row.email}</small>
                        <div className="small d-flex align-items-center gap-2 mt-1">
                            <Badge bg={row.role === 'artist' ? 'primary' : row.role === 'producer' ? 'success' : 'secondary'}>
                                <FontAwesomeIcon
                                    icon={row.role === 'artist' ? faStar : row.role === 'producer' ? faCog : faUser}
                                    className="me-1"
                                />
                                {row.role === 'artist' ? 'Artiste' : row.role === 'producer' ? 'Producteur' : 'Utilisateur'}
                            </Badge>
                            {row.seller_category !== 'none' && (
                                <Badge bg={
                                    row.seller_category === 'platinum' ? 'secondary' :
                                    row.seller_category === 'gold' ? 'warning' :
                                    row.seller_category === 'silver' ? 'light' :
                                    row.seller_category === 'bronze' ? 'dark' : 'success'
                                } className="text-uppercase">
                                    {row.seller_category}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            ),
            width: '280px'
        },
        {
            name: 'Revenus Totaux',
            selector: row => row.total_earnings,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold h6 mb-1 text-success">
                        <FontAwesomeIcon icon={faEuroSign} className="me-1" />
                        {row.formatted_total_earnings}
                    </div>
                    <small className="text-muted">
                        Ventes: {row.formatted_total_sales}
                    </small>
                    <div className="small text-info">
                        Commission: {row.formatted_total_commission_paid}
                    </div>
                </div>
            ),
            width: '150px'
        },
        {
            name: 'Répartition',
            selector: row => row.sound_earnings + row.event_earnings,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="mb-2">
                        <div className="small text-primary">
                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                            Sons: {row.formatted_sound_earnings}
                        </div>
                        <div className="small text-success">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            Events: {row.formatted_event_earnings}
                        </div>
                    </div>
                    {row.total_earnings > 0 && (
                        <div className="progress" style={{ height: '4px' }}>
                            <div
                                className="progress-bar bg-primary"
                                style={{
                                    width: `${(row.sound_earnings / row.total_earnings) * 100}%`
                                }}
                                title={`Sons: ${Math.round((row.sound_earnings / row.total_earnings) * 100)}%`}
                            />
                            <div
                                className="progress-bar bg-success"
                                style={{
                                    width: `${(row.event_earnings / row.total_earnings) * 100}%`
                                }}
                                title={`Événements: ${Math.round((row.event_earnings / row.total_earnings) * 100)}%`}
                            />
                        </div>
                    )}
                </div>
            ),
            width: '160px'
        },
        {
            name: 'Ventes',
            selector: row => row.total_sales_count,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="fw-bold text-primary mb-1">
                        <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                        {row.total_sales_count}
                    </div>
                    <div className="small text-muted mb-1">
                        <FontAwesomeIcon icon={faMusic} className="me-1 text-primary" />
                        {row.sound_sales_count} sons
                    </div>
                    <div className="small text-muted">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-success" />
                        {row.event_sales_count} events
                    </div>
                    {row.pending_sales_count > 0 && (
                        <div className="small text-warning mt-1">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {row.pending_sales_count} en attente
                        </div>
                    )}
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Performance',
            selector: row => row.average_sale_amount,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="small text-muted mb-1">Vente moyenne</div>
                    <div className="fw-medium text-info mb-2">
                        {row.formatted_average_sale_amount}
                    </div>
                    {row.commission_rate > 0 && (
                        <div className="small text-secondary">
                            <FontAwesomeIcon icon={faPercentage} className="me-1" />
                            {row.commission_rate}% commission
                        </div>
                    )}
                    {row.pending_earnings > 0 && (
                        <div className="small text-warning">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {row.formatted_pending_earnings} en attente
                        </div>
                    )}
                </div>
            ),
            width: '140px'
        },
        {
            name: 'Activité',
            selector: row => row.days_since_last_sale,
            sortable: true,
            cell: row => (
                <div className="text-center">
                    <div className="small text-muted mb-1">Dernière vente</div>
                    <div className="fw-medium mb-1">
                        {row.formatted_last_sale_date}
                    </div>
                    {row.days_since_last_sale !== null && (
                        <div className={`small ${
                            row.days_since_last_sale <= 7 ? 'text-success' :
                            row.days_since_last_sale <= 30 ? 'text-warning' : 'text-danger'
                        }`}>
                            {row.days_since_last_sale === 0 ? 'Aujourd\'hui' :
                             row.days_since_last_sale === 1 ? 'Hier' :
                             `Il y a ${row.days_since_last_sale} jours`}
                        </div>
                    )}
                    <div className="small text-muted">
                        Membre depuis {row.formatted_join_date}
                    </div>
                </div>
            ),
            width: '140px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <Button
                        as={Link}
                        to={`/artist/${row.id}`}
                        variant="outline-primary"
                        size="sm"
                        title="Voir le profil"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                        variant="outline-success"
                        size="sm"
                        title="Détails des revenus"
                    >
                        <FontAwesomeIcon icon={faChartLine} />
                    </Button>
                    {row.pending_earnings > 0 && (
                        <Button
                            variant="outline-warning"
                            size="sm"
                            title="Paiements en attente"
                        >
                            <FontAwesomeIcon icon={faClock} />
                        </Button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '120px'
        }
    ];

    // Composant DataTable personnalisé
    const CustomDataTable = styled(DataTable)`
        .rdt_TableHeadRow {
            background-color: #f8f9fa !important;
        }
        .rdt_TableHead {
            color: #495057 !important;
            font-weight: 600 !important;
        }
        .rdt_TableRow {
            transition: all 0.2s ease;
        }
        .rdt_TableRow:hover {
            background-color: rgba(59, 130, 246, 0.04) !important;
        }
    `;

    // Fonctions d'export
    const exportSounds = () => {
        const csvContent = [
            ['ID', 'Titre', 'Artiste', 'Date de téléchargement', 'Écoutes', 'Téléchargements', 'Revenu', 'Statut', 'Catégorie', 'Durée', 'Cover'],
            ...sounds.map(sound => [
                sound.id,
                sound.title,
                sound.artist_name || sound.artist || (sound.user ? sound.user.name : 'Artiste inconnu'),
                new Date(sound.created_at).toLocaleDateString('fr-FR'),
                sound.plays_count || 0,
                sound.downloads_count || 0,
                formatCurrency(sound.revenue || 0),
                getStatusBadge(sound.status),
                sound.category || 'Inconnue',
                sound.formatted_duration || formatTime(sound.duration) || '0:00',
                sound.cover || 'Inconnue'
            ])
        ];

        const csvString = csvContent.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sons.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportEvents = () => {
        const csvContent = [
            ['ID', 'Titre', 'Lieu', 'Date', 'Tickets vendus', 'Total de tickets', 'Revenu', 'Statut', 'Catégorie', 'Organisateur'],
            ...events.map(event => [
                event.id,
                event.title,
                event.venue || event.location || 'Lieu non défini',
                new Date(event.event_date || event.date).toLocaleDateString('fr-FR'),
                event.ticketsSold || 0,
                event.totalTickets || 0,
                formatCurrency(event.revenue || 0),
                getStatusBadge(event.status),
                event.category || 'Inconnue',
                event.organizer || 'Inconnu'
            ])
        ];

        const csvString = csvContent.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'événements.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportUsers = () => {
        const csvContent = [
            ['ID', 'Nom', 'Email', 'Rôle', 'Date de création', 'Date de dernière connexion'],
            ...users.map(user => [
                user.id,
                user.name,
                user.email,
                user.role,
                new Date(user.created_at).toLocaleDateString('fr-FR'),
                new Date(user.last_login).toLocaleDateString('fr-FR')
            ])
        ];

        const csvString = csvContent.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'utilisateurs.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const exportRevenue = () => {
        const csvContent = [
            ['ID', 'Nom', 'Email', 'Rôle', 'Revenu', 'Statut'],
            ...usersRevenue.map(revenue => [
                revenue.id,
                revenue.name,
                revenue.email,
                revenue.role,
                formatCurrency(revenue.total_earnings || 0),
                getStatusBadge(revenue.status)
            ])
        ];

        const csvString = csvContent.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'revenus.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // Fonction pour approuver un son
    const handleApproveSound = async (soundId) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/admin/sounds/${soundId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success || response.ok) {
                toast.success('Succès', 'Son approuvé avec succès');
                loadSounds(); // Recharger la liste
            } else {
                toast.error('Erreur', data.message || 'Impossible d\'approuver le son');
            }
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setActionLoading(false);
        }
    };

    // Fonction de filtrage pour les revenus
    const getFilteredRevenue = () => {
        return usersRevenue.filter(user => {
            // Filtrer seulement les utilisateurs qui ont des revenus ou sont des vendeurs actifs
            return user.total_earnings > 0 || user.total_sales_count > 0;
        });
    };

    const renderOverview = () => (
        <div>
            {/* Cartes de statistiques principales */}
            <Row className="g-4 mb-4">
                <Col xl={3} lg={6} md={6}>
                    <Card className="stat-card border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted mb-1 small fw-medium">Revenus Totaux</p>
                                    <h2 className="fw-bold mb-0 text-primary">{formatCurrency(stats.totalRevenue || 0)}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                                            {stats.completedPayments || 0} paiements
                                        </span>
                                        <span className="text-muted small ms-2">validés</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-primary bg-opacity-10">
                                    <FontAwesomeIcon icon={faEuroSign} className="text-primary" />
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
                                    <p className="text-muted mb-1 small fw-medium">Commissions</p>
                                    <h2 className="fw-bold mb-0 text-success">{formatCurrency(stats.totalCommission || 0)}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-info small">
                                            <FontAwesomeIcon icon={faPercentage} className="me-1" />
                                            {stats.totalRevenue > 0 ?
                                                Math.round((stats.totalCommission / stats.totalRevenue) * 100) : 0}%
                                        </span>
                                        <span className="text-muted small ms-2">du total</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-success bg-opacity-10">
                                    <FontAwesomeIcon icon={faPercentage} className="text-success" />
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
                                    <h2 className="fw-bold mb-0 text-info">{(stats.totalUsers || 0).toLocaleString()}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faUsers} className="me-1" />
                                            {stats.activeUsers || 0}
                                        </span>
                                        <span className="text-muted small ms-2">actifs</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-info bg-opacity-10">
                                    <FontAwesomeIcon icon={faUsers} className="text-info" />
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
                                    <p className="text-muted mb-1 small fw-medium">Contenu</p>
                                    <h2 className="fw-bold mb-0 text-warning">{((stats.totalSounds || 0) + (stats.totalEvents || 0)).toLocaleString()}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-primary small">
                                            <FontAwesomeIcon icon={faMusic} className="me-1" />
                                            {stats.totalSounds || 0} sons
                                        </span>
                                        <span className="text-success small ms-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                            {stats.totalEvents || 0} events
                                        </span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-warning bg-opacity-10">
                                    <FontAwesomeIcon icon={faChartLine} className="text-warning" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistiques détaillées */}
            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Aperçu des Performances</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col sm={6}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faMusic} className="text-primary mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{stats.totalSounds || 0}</div>
                                        <small className="text-muted">Sons totaux</small>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-success mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{stats.totalEvents || 0}</div>
                                        <small className="text-muted">Événements</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Activité Récente</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center py-3">
                                <FontAwesomeIcon icon={faChartLine} size="2x" className="text-muted mb-2" />
                                <p className="text-muted small mb-0">Plateforme active</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderSoundsManagement = () => (
        <div>
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

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Tous les sons</h6>
                </Card.Header>
                <Card.Body>
                    {(sounds?.length || 0) === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun son trouvé</h6>
                        </div>
                    ) : (
                        <CustomDataTable
                            columns={soundsColumns}
                            data={getFilteredSounds()}
                            {...dataTableConfig}
                        />
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderEventsManagement = () => (
        <div>
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

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Tous les événements</h6>
                </Card.Header>
                <Card.Body>
                    {(events?.length || 0) === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun événement trouvé</h6>
                        </div>
                    ) : (
                        <CustomDataTable
                            columns={eventsColumns}
                            data={getFilteredEvents()}
                            {...dataTableConfig}
                        />
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderUsersManagement = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Gestion des Utilisateurs</h5>
                    <p className="text-muted mb-0 small">Gérez tous les utilisateurs de la plateforme</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Tous les utilisateurs</h6>
                </Card.Header>
                <Card.Body>
                    {(users?.length || 0) === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun utilisateur trouvé</h6>
                        </div>
                    ) : (
                        <CustomDataTable
                            columns={usersColumns}
                            data={getFilteredUsers()}
                            {...dataTableConfig}
                        />
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderAnalytics = () => (
        <div>
            <div className="mb-4">
                <h5 className="fw-bold mb-1">Analytics des Paiements</h5>
                <p className="text-muted mb-0 small">Analysez les performances financières en temps réel</p>
            </div>

            <Row className="g-4">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Statistiques des Paiements</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center">
                                <FontAwesomeIcon icon={faChartLine} size="3x" className="text-primary mb-3" />
                                <h4 className="fw-bold text-primary">{formatCurrency(stats.totalRevenue || 0)}</h4>
                                <p className="text-muted">Revenus totaux</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Commissions</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center">
                                <FontAwesomeIcon icon={faPercentage} size="3x" className="text-success mb-3" />
                                <h4 className="fw-bold text-success">{formatCurrency(stats.totalCommission || 0)}</h4>
                                <p className="text-muted">Commissions perçues</p>
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
                <p className="text-muted mb-0 small">Configurez les paramètres de la plateforme</p>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <h6 className="fw-bold mb-0">Configuration générale</h6>
                </Card.Header>
                <Card.Body>
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faCog} size="3x" className="text-muted mb-3" />
                        <h6 className="text-muted">Paramètres</h6>
                        <p className="text-muted small">Configuration de la plateforme</p>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );

    const renderRevenueManagement = () => (
        <div>
            {/* Header avec actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Revenus par Utilisateur</h5>
                    <p className="text-muted mb-0 small">Analysez les revenus générés par chaque vendeur de la plateforme</p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={loadUsersRevenue}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faSync} className="me-2" />
                        Actualiser
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Export des revenus
                            const csvContent = [
                                ['Nom', 'Email', 'Rôle', 'Catégorie', 'Revenus Totaux', 'Revenus Sons', 'Revenus Événements', 'Commission Payée', 'Nombre de Ventes', 'Vente Moyenne', 'Dernière Vente'],
                                ...getFilteredRevenue().map(user => [
                                    user.name,
                                    user.email,
                                    user.role,
                                    user.seller_category,
                                    user.total_earnings,
                                    user.sound_earnings,
                                    user.event_earnings,
                                    user.total_commission_paid,
                                    user.total_sales_count,
                                    user.average_sale_amount,
                                    user.formatted_last_sale_date
                                ])
                            ].map(row => row.join(',')).join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `revenus_utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
                            link.click();
                        }}
                    >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter CSV
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides des revenus */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-primary mb-2" size="lg" />
                            <h4 className="fw-bold text-primary">{revenueStats.active_sellers || 0}</h4>
                            <small className="text-muted">Vendeurs actifs</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-success mb-2" size="lg" />
                            <h4 className="fw-bold text-success">{revenueStats.formatted_total_earnings_all || '0 XAF'}</h4>
                            <small className="text-muted">Revenus totaux distribués</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faPercentage} className="text-warning mb-2" size="lg" />
                            <h4 className="fw-bold text-warning">{revenueStats.formatted_total_commission_paid_all || '0 XAF'}</h4>
                            <small className="text-muted">Commission totale perçue</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faChartLine} className="text-info mb-2" size="lg" />
                            <h4 className="fw-bold text-info">{revenueStats.formatted_average_earnings_per_seller || '0 XAF'}</h4>
                            <small className="text-muted">Revenus moyens par vendeur</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Répartition par catégorie de vendeurs */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Top Vendeurs</h6>
                        </Card.Header>
                        <Card.Body>
                            {revenueStats.top_earner ? (
                                <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                    <div className="me-3 p-3 rounded-circle text-center" style={{
                                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                        color: 'white',
                                        minWidth: '60px',
                                        minHeight: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FontAwesomeIcon icon={faCrown} size="lg" />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1">🏆 Meilleur Vendeur</h6>
                                        <div className="fw-medium text-primary">{revenueStats.top_earner.name}</div>
                                        <div className="text-success fw-bold">{revenueStats.top_earner.formatted_total_earnings}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <FontAwesomeIcon icon={faUsers} size="2x" className="text-muted mb-2" />
                                    <p className="text-muted">Aucun vendeur actif pour le moment</p>
                                </div>
                            )}

                            {/* Statistiques par catégorie */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted d-flex align-items-center">
                                            <FontAwesomeIcon icon={faCrown} className="text-secondary me-2" />
                                            Platinum
                                        </span>
                                        <span className="fw-bold">{revenueStats.seller_categories?.platinum || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted d-flex align-items-center">
                                            <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
                                            Gold
                                        </span>
                                        <span className="fw-bold">{revenueStats.seller_categories?.gold || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted d-flex align-items-center">
                                            <FontAwesomeIcon icon={faStar} className="text-light me-2" />
                                            Silver
                                        </span>
                                        <span className="fw-bold">{revenueStats.seller_categories?.silver || 0}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted d-flex align-items-center">
                                            <FontAwesomeIcon icon={faStar} className="text-dark me-2" />
                                            Bronze
                                        </span>
                                        <span className="fw-bold">{revenueStats.seller_categories?.bronze || 0}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted d-flex align-items-center">
                                            <FontAwesomeIcon icon={faUser} className="text-success me-2" />
                                            Rookie
                                        </span>
                                        <span className="fw-bold">{revenueStats.seller_categories?.rookie || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Légende des Catégories</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-2 p-2 rounded-circle" style={{ background: '#8b5cf6', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faCrown} className="text-white" style={{ fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold small">Platinum</div>
                                        <small className="text-muted">500 000 XAF+</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-2 p-2 rounded-circle" style={{ background: '#f59e0b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faStar} className="text-white" style={{ fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold small">Gold</div>
                                        <small className="text-muted">250 000 XAF+</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-2 p-2 rounded-circle" style={{ background: '#6b7280', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faStar} className="text-white" style={{ fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold small">Silver</div>
                                        <small className="text-muted">100 000 XAF+</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-2 p-2 rounded-circle" style={{ background: '#92400e', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faStar} className="text-white" style={{ fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold small">Bronze</div>
                                        <small className="text-muted">25 000 XAF+</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="me-2 p-2 rounded-circle" style={{ background: '#059669', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faUser} className="text-white" style={{ fontSize: '12px' }} />
                                    </div>
                                    <div>
                                        <div className="fw-bold small">Rookie</div>
                                        <small className="text-muted">Premières ventes</small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Table des revenus */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Revenus détaillés par vendeur</h6>
                        <div className="d-flex gap-2">
                            <Form.Select size="sm" style={{ width: 'auto' }}>
                                <option>Toutes les catégories</option>
                                <option value="platinum">Platinum</option>
                                <option value="gold">Gold</option>
                                <option value="silver">Silver</option>
                                <option value="bronze">Bronze</option>
                                <option value="rookie">Rookie</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {getFilteredRevenue().length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faEuroSign} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">Aucun revenu trouvé</h6>
                            <p className="text-muted small">Les revenus apparaîtront ici une fois les premières ventes effectuées</p>
                        </div>
                    ) : (
                        <CustomDataTable
                            columns={revenueColumns}
                            data={getFilteredRevenue()}
                            {...dataTableConfig}
                            subHeader
                            subHeaderComponent={
                                <div className="d-flex justify-content-between align-items-center w-100 p-3">
                                    <div>
                                        <strong>{getFilteredRevenue().length}</strong> vendeur(s) actif(s) •
                                        <span className="text-success ms-1">
                                            {revenueStats.formatted_total_earnings_all || '0 XAF'} distribués
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher un vendeur..."
                                            size="sm"
                                            style={{ width: '250px' }}
                                        />
                                        <Button variant="outline-secondary" size="sm">
                                            <FontAwesomeIcon icon={faSearch} />
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

    return (
        <div className="dashboard-container" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="d-flex">
                {/* Sidebar */}
                <div className="sidebar shadow-lg" style={{
                    width: '280px',
                    minHeight: '100vh',
                    height: 'auto',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
                    borderRight: '1px solid #e5e7eb',
                    overflowY: 'auto',
                    maxHeight: '100vh'
                }}>
                    {/* Header de la sidebar */}
                    <div className="sidebar-header p-4 border-bottom border-white border-opacity-20">
                        <div className="d-flex align-items-center">
                            <div className="me-3 p-2 bg-white bg-opacity-20 rounded-3">
                                <FontAwesomeIcon icon={faTachometerAlt} className="text-white" size="2x" />
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0 text-white">Dashboard Admin</h5>
                                <small className="text-white text-opacity-75">Réveil Artist</small>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="sidebar-nav p-3" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        <div className="mb-4">
                            <small className="text-white text-opacity-60 text-uppercase fw-bold px-3 d-block mb-3"
                                   style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                NAVIGATION PRINCIPALE
                            </small>
                            <div className="nav flex-column">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        className={`nav-link btn border-0 text-start p-3 rounded-3 mb-2 d-flex align-items-center position-relative ${
                                            activeTab === item.id
                                                ? 'bg-white text-primary shadow-sm'
                                                : 'text-white text-opacity-90'
                                        }`}
                                        onClick={() => setActiveTab(item.id)}
                                        style={{
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            textDecoration: 'none',
                                            transform: activeTab === item.id ? 'translateX(8px)' : 'translateX(0)',
                                            backdropFilter: activeTab === item.id ? 'none' : 'blur(10px)',
                                            background: activeTab === item.id
                                                ? '#ffffff'
                                                : 'rgba(255, 255, 255, 0.1)',
                                            border: activeTab === item.id
                                                ? '1px solid rgba(59, 130, 246, 0.2)'
                                                : '1px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: activeTab === item.id
                                                ? '0 4px 15px rgba(0, 0, 0, 0.1)'
                                                : 'none'
                                        }}
                                    >
                                        {/* Indicateur actif */}
                                        {activeTab === item.id && (
                                            <div
                                                className="position-absolute start-0 top-50 translate-middle-y bg-primary rounded-end"
                                                style={{ width: '4px', height: '60%', left: '-1px' }}
                                            />
                                        )}

                                        <div className={`me-3 p-2 rounded-2 ${
                                            activeTab === item.id
                                                ? `bg-${item.color} bg-opacity-10`
                                                : 'bg-white bg-opacity-20'
                                        }`} style={{ minWidth: '40px', textAlign: 'center' }}>
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`fa-icon ${activeTab === item.id ? `text-${item.color}` : 'text-white'}`}
                                                style={{ fontSize: '16px' }}
                                            />
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className={`fw-semibold mb-1 ${
                                                activeTab === item.id ? 'text-dark' : 'text-white'
                                            }`} style={{ fontSize: '14px' }}>
                                                {item.label}
                                            </div>
                                            <small className={`d-block ${
                                                activeTab === item.id ? 'text-muted' : 'text-white text-opacity-70'
                                            }`} style={{ fontSize: '12px', lineHeight: '1.2' }}>
                                                {item.description}
                                            </small>
                                        </div>

                                        {item.count !== undefined && (
                                            <div className={`px-2 py-1 rounded-pill small fw-bold ${
                                                activeTab === item.id
                                                    ? `bg-${item.color} text-white`
                                                    : 'bg-white bg-opacity-20 text-white'
                                            }`} style={{ fontSize: '11px', minWidth: '24px', textAlign: 'center' }}>
                                                {item.count}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Contenu principal */}
                <div className="main-content flex-grow-1" style={{ marginLeft: '280px', minHeight: '100vh' }}>
                    {/* Header du contenu */}
                    <div className="content-header shadow-sm p-4 mb-4" style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-3 p-2 rounded-3" style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        color: 'white'
                                    }}>
                                        <FontAwesomeIcon
                                            icon={navigationItems.find(item => item.id === activeTab)?.icon || faTachometerAlt}
                                            style={{ fontSize: '18px' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-0 text-dark">
                                            {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                                        </h4>
                                        <div className="small text-muted d-flex align-items-center mt-1">
                                            <FontAwesomeIcon icon={faHome} className="me-1" style={{ fontSize: '12px' }} />
                                            Dashboard
                                            <span className="mx-1">→</span>
                                            {navigationItems.find(item => item.id === activeTab)?.label}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                    {navigationItems.find(item => item.id === activeTab)?.description || 'Bienvenue sur votre dashboard administrateur'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenu des sections */}
                    <div className="content-body p-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                                <h5 className="text-muted">Chargement des données...</h5>
                            </div>
                        ) : (
                            <>
                                {/* Render components based on activeTab */}
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'sounds' && renderSoundsManagement()}
                                {activeTab === 'events' && renderEventsManagement()}
                                {activeTab === 'users' && renderUsersManagement()}
                                {activeTab === 'revenue' && renderRevenueManagement()}
                                {activeTab === 'analytics' && renderAnalytics()}
                                {activeTab === 'categories' && <CategoryManagement />}
                                {activeTab === 'settings' && renderSettings()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
