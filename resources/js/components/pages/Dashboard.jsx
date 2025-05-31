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
                loadStats()
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

    // Fonctions d'export
    const exportSounds = () => {
        const csvContent = [
            ['Titre', 'Artiste', 'Statut', 'Prix', 'Écoutes', 'Date'].join(','),
            ...getFilteredSounds().map(sound => [
                sound.title,
                typeof sound.artist === 'object' ? sound.artist?.name || sound.user?.name || 'Artiste' : sound.artist || sound.user?.name || 'Artiste',
                sound.status,
                sound.is_free ? 'Gratuit' : sound.price || 0,
                sound.plays_count || sound.plays || 0,
                new Date(sound.created_at).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sons_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportEvents = () => {
        const csvContent = [
            ['Titre', 'Lieu', 'Date', 'Statut', 'Participants', 'Capacité'].join(','),
            ...getFilteredEvents().map(event => [
                event.title,
                event.venue || event.location || 'Non défini',
                new Date(event.event_date || event.date).toLocaleDateString('fr-FR'),
                event.status,
                event.current_attendees || 0,
                event.capacity || event.max_attendees || 0
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `evenements_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportUsers = () => {
        const csvContent = [
            ['Nom', 'Email', 'Rôle', 'Sons', 'Revenus', 'Date inscription'].join(','),
            ...getFilteredUsers().map(user => [
                user.name,
                user.email,
                user.role,
                user.sounds_count || 0,
                user.revenue || 0,
                new Date(user.join_date || user.created_at).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Composant DataTable stylisé
    const CustomDataTable = styled(DataTable)`
        .rdt_Table {
            border-radius: 8px;
        }
        .rdt_TableHead {
            background-color: #f8f9fa;
        }
        .rdt_TableHeadRow {
            border-bottom: 2px solid #dee2e6;
        }
        .rdt_TableRow:hover {
            background-color: #f8f9fa;
        }
    `;

    const renderOverview = () => (
        <div>
            {/* Cartes de statistiques principales - 4 colonnes avec vraies données */}
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
                                    <p className="text-muted mb-1 small fw-medium">Paiements</p>
                                    <h2 className="fw-bold mb-0 text-warning">{(stats.totalPayments || 0).toLocaleString()}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-warning small">
                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                            {stats.pendingPayments || 0}
                                        </span>
                                        <span className="text-muted small ms-2">en attente</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-warning bg-opacity-10">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-warning" />
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
                                    <p className="text-muted mb-1 small fw-medium">Paiement Moyen</p>
                                    <h2 className="fw-bold mb-0 text-info">{formatCurrency(stats.averagePayment || 0)}</h2>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-success small">
                                            <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                                            {stats.soundPayments || 0} sons
                                        </span>
                                        <span className="text-muted small ms-2">+ {stats.eventPayments || 0} events</span>
                                    </div>
                                </div>
                                <div className="stat-icon bg-info bg-opacity-10">
                                    <FontAwesomeIcon icon={faChartLine} className="text-info" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistiques détaillées avec vraies données */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-1">Performances Paiements</h5>
                                    <p className="text-muted mb-0 small">Données réelles de la base de données</p>
                                </div>
                                <Button variant="outline-primary" size="sm" onClick={loadStats}>
                                    <FontAwesomeIcon icon={faSync} className="me-1" />
                                    Actualiser
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-4">
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.completedPayments || 0).toLocaleString()}</div>
                                        <small className="text-muted">Validés</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faClock} className="text-warning mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.pendingPayments || 0).toLocaleString()}</div>
                                        <small className="text-muted">En attente</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-danger mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.failedPayments || 0).toLocaleString()}</div>
                                        <small className="text-muted">Échoués</small>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <FontAwesomeIcon icon={faUndo} className="text-info mb-2" size="lg" />
                                        <div className="fw-bold h5 mb-1">{(stats.refundedPayments || 0).toLocaleString()}</div>
                                        <small className="text-muted">Remboursés</small>
                                    </div>
                                </Col>
                            </Row>

                            {/* Affichage des données journalières s'il y en a */}
                            {dailyStats && dailyStats.length > 0 ? (
                                <div className="bg-light rounded p-4">
                                    <h6 className="fw-bold mb-3">Évolution des 7 derniers jours</h6>
                                    <div className="row g-2">
                                        {dailyStats.map((day, index) => (
                                            <div key={index} className="col">
                                                <div className="text-center">
                                                    <small className="text-muted d-block">{new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</small>
                                                    <div className="fw-bold">{day.count}</div>
                                                    <small className="text-success">{formatCurrency(day.amount)}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-light rounded p-4 text-center">
                                    <FontAwesomeIcon icon={faChartLine} size="3x" className="text-muted mb-3" />
                                    <h6 className="text-muted">Données de paiements</h6>
                                    <p className="text-muted small mb-0">Visualisation des transactions en temps réel</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="h-100 d-flex flex-column gap-3">
                        {/* Top Vendeurs avec vraies données */}
                        <Card className="border-0 shadow-sm flex-grow-1">
                            <Card.Header className="bg-white border-bottom">
                                <h6 className="fw-bold mb-0">Top Vendeurs</h6>
                            </Card.Header>
                            <Card.Body>
                                {topSellers && topSellers.length > 0 ? (
                                    topSellers.slice(0, 5).map((seller, index) => (
                                        <div key={seller.seller_id} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-primary me-2">{index + 1}</span>
                                                    <div>
                                                        <span className="small fw-medium">{seller.seller_name}</span>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {seller.seller_role === 'artist' ? 'Artiste' : 'Organisateur'} • {seller.sales_count} vente(s)
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="small fw-bold text-success">{formatCurrency(seller.total_earnings)}</span>
                                            </div>
                                            <ProgressBar
                                                variant="success"
                                                now={Math.min((seller.total_earnings / (topSellers[0]?.total_earnings || 1)) * 100, 100)}
                                                style={{ height: '4px' }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-3">
                                        <FontAwesomeIcon icon={faUsers} size="2x" className="text-muted mb-2" />
                                        <p className="text-muted small mb-0">Aucune vente enregistrée</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Répartition par type */}
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <h6 className="fw-bold mb-3">Répartition des Ventes</h6>
                                <Row>
                                    <Col>
                                        <FontAwesomeIcon icon={faMusic} className="text-primary mb-2" size="lg" />
                                        <div className="fw-bold text-primary">{stats.soundPayments || 0}</div>
                                        <small className="text-muted">Sons</small>
                                    </Col>
                                    <Col>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-success mb-2" size="lg" />
                                        <div className="fw-bold text-success">{stats.eventPayments || 0}</div>
                                        <small className="text-muted">Événements</small>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* Données générales de la plateforme */}
            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Utilisateurs</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Total</span>
                                <span className="fw-bold">{(stats.totalUsers || 0).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Actifs</span>
                                <span className="fw-bold text-success">{(stats.activeUsers || 0).toLocaleString()}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Sons</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Total</span>
                                <span className="fw-bold">{(stats.totalSounds || 0).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Publiés</span>
                                <span className="fw-bold text-success">{(stats.publishedSounds || 0).toLocaleString()}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Événements</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Total</span>
                                <span className="fw-bold">{(stats.totalEvents || 0).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Publiés</span>
                                <span className="fw-bold text-success">{(stats.publishedEvents || 0).toLocaleString()}</span>
                            </div>
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
                <h5 className="fw-bold mb-1">Analytics des Paiements</h5>
                <p className="text-muted mb-0 small">Analysez les performances financières en temps réel</p>
            </div>

            {/* Métriques principales basées sur les vraies données */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faChartLine} className="text-primary mb-2" size="2x" />
                            <h3 className="fw-bold text-primary">
                                {stats.totalRevenue > 0 && stats.totalCommission > 0 ?
                                    `${Math.round((stats.totalCommission / stats.totalRevenue) * 100)}%` :
                                    '0%'
                                }
                            </h3>
                            <small className="text-muted">Taux de commission moyen</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-success mb-2" size="2x" />
                            <h3 className="fw-bold text-success">{(stats.activeUsers || 0).toLocaleString()}</h3>
                            <small className="text-muted">Utilisateurs actifs</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCreditCard} className="text-info mb-2" size="2x" />
                            <h3 className="fw-bold text-info">{(stats.totalPayments || 0).toLocaleString()}</h3>
                            <small className="text-muted">Transactions totales</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faEuroSign} className="text-warning mb-2" size="2x" />
                            <h3 className="fw-bold text-warning">{formatCurrency(stats.averagePayment || 0)}</h3>
                            <small className="text-muted">Valeur moyenne transaction</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                {/* Répartition des statuts de paiement */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Statuts des Paiements</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                                        <span className="small fw-medium">Validés</span>
                                    </div>
                                    <span className="small fw-bold text-success">
                                        {stats.completedPayments || 0} ({stats.totalPayments > 0 ? Math.round((stats.completedPayments / stats.totalPayments) * 100) : 0}%)
                                    </span>
                                </div>
                                <ProgressBar
                                    variant="success"
                                    now={stats.totalPayments > 0 ? (stats.completedPayments / stats.totalPayments) * 100 : 0}
                                    style={{ height: '6px' }}
                                />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faClock} className="text-warning me-2" />
                                        <span className="small fw-medium">En attente</span>
                                    </div>
                                    <span className="small fw-bold text-warning">
                                        {stats.pendingPayments || 0} ({stats.totalPayments > 0 ? Math.round((stats.pendingPayments / stats.totalPayments) * 100) : 0}%)
                                    </span>
                                </div>
                                <ProgressBar
                                    variant="warning"
                                    now={stats.totalPayments > 0 ? (stats.pendingPayments / stats.totalPayments) * 100 : 0}
                                    style={{ height: '6px' }}
                                />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-danger me-2" />
                                        <span className="small fw-medium">Échoués</span>
                                    </div>
                                    <span className="small fw-bold text-danger">
                                        {stats.failedPayments || 0} ({stats.totalPayments > 0 ? Math.round((stats.failedPayments / stats.totalPayments) * 100) : 0}%)
                                    </span>
                                </div>
                                <ProgressBar
                                    variant="danger"
                                    now={stats.totalPayments > 0 ? (stats.failedPayments / stats.totalPayments) * 100 : 0}
                                    style={{ height: '6px' }}
                                />
                            </div>
                            <div className="mb-0">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faUndo} className="text-info me-2" />
                                        <span className="small fw-medium">Remboursés</span>
                                    </div>
                                    <span className="small fw-bold text-info">
                                        {stats.refundedPayments || 0} ({stats.totalPayments > 0 ? Math.round((stats.refundedPayments / stats.totalPayments) * 100) : 0}%)
                                    </span>
                                </div>
                                <ProgressBar
                                    variant="info"
                                    now={stats.totalPayments > 0 ? (stats.refundedPayments / stats.totalPayments) * 100 : 0}
                                    style={{ height: '6px' }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Paramètres de commission */}
                <Col lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white">
                            <h6 className="fw-bold mb-0">Paramètres des Commissions</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">Commission totale perçue</span>
                                </div>
                                <div className="fw-bold h5 text-success">{formatCurrency(stats.totalCommission || 0)}</div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">Taux moyen effectif</span>
                                </div>
                                <div className="fw-bold h6 text-primary">
                                    {stats.totalRevenue > 0 ?
                                        `${Math.round((stats.totalCommission / stats.totalRevenue) * 100)}%` :
                                        '0%'
                                    }
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">Revenus versés aux vendeurs</span>
                                </div>
                                <div className="fw-bold h6 text-info">
                                    {formatCurrency((stats.totalRevenue || 0) - (stats.totalCommission || 0))}
                                </div>
                            </div>
                            <hr />
                            <div className="small text-muted">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Paiements sons:</span>
                                    <span className="fw-medium">{stats.soundPayments || 0}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Paiements événements:</span>
                                    <span className="fw-medium">{stats.eventPayments || 0}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // Simplification du système de commission
    const updateCommissionSettings = async (newRates) => {
        try {
            const response = await fetch('/api/dashboard/commission', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rates: newRates })
            });

            if (response.ok) {
                const data = await response.json();
                setCommissionSettings({
                    sound_commission: data.rates?.sound_commission || newRates.sound_commission || 15,
                    event_commission: data.rates?.event_commission || newRates.event_commission || 10
                });
                toast.success('Succès', 'Paramètres mis à jour');
            } else {
                toast.error('Erreur', 'Impossible de mettre à jour');
            }
        } catch (error) {
            toast.error('Erreur', 'Erreur de connexion');
        }
    };

    // Fonction pour mettre à jour un seul taux de commission
    const updateSingleCommissionRate = async (rateType, value) => {
        const newRates = { [rateType]: parseFloat(value) };
        await updateCommissionSettings(newRates);
    };

    // Fonctions de calcul pour les simulateurs
    const calculateSoundCommission = (price) => {
        const amount = parseFloat(price) || 0;
        const rate = commissionSettings.sound_commission || 0;
        const commission = (amount * rate) / 100;
        const sellerAmount = amount - commission;

        const commissionElement = document.getElementById('sound-commission-result');
        const sellerElement = document.getElementById('sound-seller-result');

        if (commissionElement) commissionElement.textContent = formatCurrency(commission);
        if (sellerElement) sellerElement.textContent = formatCurrency(sellerAmount);
    };

    const calculateEventCommission = (price) => {
        const amount = parseFloat(price) || 0;
        const rate = commissionSettings.event_commission || 0;
        const commission = (amount * rate) / 100;
        const sellerAmount = amount - commission;

        const commissionElement = document.getElementById('event-commission-result');
        const sellerElement = document.getElementById('event-seller-result');

        if (commissionElement) commissionElement.textContent = formatCurrency(commission);
        if (sellerElement) sellerElement.textContent = formatCurrency(sellerAmount);
    };

    // Fonction d'export des statistiques
    const exportStats = () => {
        const csvContent = [
            ['Type', 'Nombre', 'Montant Total'],
            ['Paiements Validés', stats.completedPayments || 0, formatCurrency(stats.totalRevenue || 0)],
            ['Paiements En Attente', stats.pendingPayments || 0, '-'],
            ['Commissions Totales', '-', formatCurrency(stats.totalCommission || 0)],
            ['Utilisateurs Totaux', stats.totalUsers || 0, '-'],
            ['Sons Publiés', stats.publishedSounds || 0, '-'],
            ['Événements Publiés', stats.publishedEvents || 0, '-']
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dashboard_stats_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Fonction d'export des paiements
    const exportPayments = () => {
        const url = '/api/payments/export/csv';
        window.open(url, '_blank');
    };

    const renderSettings = () => (
        <div>
            <div className="mb-4">
                <h5 className="fw-bold mb-1">Paramètres de Commission</h5>
                <p className="text-muted mb-0 small">Configurez les taux de commission pour les sons et événements</p>
            </div>

            <Row className="g-4">
                {/* Configuration des taux de commission */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Taux de Commission Actuels</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="border rounded-3 p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <FontAwesomeIcon icon={faMusic} className="text-primary me-3" size="lg" />
                                            <div>
                                                <h6 className="fw-bold mb-0">Commission Sons</h6>
                                                <small className="text-muted">Taux appliqué sur les ventes de sons</small>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Form.Label className="small fw-medium">Taux de commission (%)</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={commissionSettings.sound_commission}
                                                    onChange={(e) => {
                                                        const newValue = parseFloat(e.target.value) || 0;
                                                        setCommissionSettings({
                                                            ...commissionSettings,
                                                            sound_commission: newValue
                                                        });
                                                    }}
                                                    onBlur={(e) => {
                                                        const newValue = parseFloat(e.target.value) || 0;
                                                        if (newValue !== commissionSettings.sound_commission) {
                                                            updateSingleCommissionRate('sound_commission', newValue);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => updateSingleCommissionRate('sound_commission', commissionSettings.sound_commission)}
                                                >
                                                    <FontAwesomeIcon icon={faSync} />
                                                </Button>
                                            </div>
                                            <Form.Text className="text-muted">
                                                Appuyez sur Entrée ou cliquez sur le bouton pour appliquer
                                            </Form.Text>
                                        </div>
                                        <div className="bg-light rounded p-3">
                                            <small className="text-muted">Exemple : Sur 1000 XAF</small>
                                            <div className="d-flex justify-content-between mt-2">
                                                <span className="small">Commission :</span>
                                                <span className="small fw-bold text-danger">
                                                    {formatCurrency((1000 * commissionSettings.sound_commission) / 100)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="small">Artiste reçoit :</span>
                                                <span className="small fw-bold text-success">
                                                    {formatCurrency(1000 - (1000 * commissionSettings.sound_commission) / 100)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border rounded-3 p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-success me-3" size="lg" />
                                            <div>
                                                <h6 className="fw-bold mb-0">Commission Événements</h6>
                                                <small className="text-muted">Taux appliqué sur les ventes de billets</small>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Form.Label className="small fw-medium">Taux de commission (%)</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={commissionSettings.event_commission}
                                                    onChange={(e) => {
                                                        const newValue = parseFloat(e.target.value) || 0;
                                                        setCommissionSettings({
                                                            ...commissionSettings,
                                                            event_commission: newValue
                                                        });
                                                    }}
                                                    onBlur={(e) => {
                                                        const newValue = parseFloat(e.target.value) || 0;
                                                        if (newValue !== commissionSettings.event_commission) {
                                                            updateSingleCommissionRate('event_commission', newValue);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const newValue = parseFloat(e.target.value) || 0;
                                                            updateSingleCommissionRate('event_commission', newValue);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => updateSingleCommissionRate('event_commission', commissionSettings.event_commission)}
                                                >
                                                    <FontAwesomeIcon icon={faSync} />
                                                </Button>
                                            </div>
                                            <Form.Text className="text-muted">
                                                Appuyez sur Entrée ou cliquez sur le bouton pour appliquer
                                            </Form.Text>
                                        </div>
                                        <div className="bg-light rounded p-3">
                                            <small className="text-muted">Exemple : Sur 5000 XAF</small>
                                            <div className="d-flex justify-content-between mt-2">
                                                <span className="small">Commission :</span>
                                                <span className="small fw-bold text-danger">
                                                    {formatCurrency((5000 * commissionSettings.event_commission) / 100)}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="small">Organisateur reçoit :</span>
                                                <span className="small fw-bold text-success">
                                                    {formatCurrency(5000 - (5000 * commissionSettings.event_commission) / 100)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Boutons d'action globaux */}
                            <div className="mt-4 d-flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={() => updateCommissionSettings({
                                        sound_commission: commissionSettings.sound_commission,
                                        event_commission: commissionSettings.event_commission
                                    })}
                                >
                                    <FontAwesomeIcon icon={faSync} className="me-2" />
                                    Mettre à jour tout
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setCommissionSettings({
                                            sound_commission: 15,
                                            event_commission: 10
                                        });
                                        updateCommissionSettings({
                                            sound_commission: 15,
                                            event_commission: 10
                                        });
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUndo} className="me-2" />
                                    Réinitialiser
                                </Button>
                                <Button
                                    variant="outline-info"
                                    onClick={loadCommissionSettings}
                                >
                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                    Recharger
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Simulateurs de commission */}
                    <Card className="border-0 shadow-sm mt-4">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Simulateur de Commission en Temps Réel</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="bg-light rounded-3 p-4">
                                        <h6 className="fw-bold mb-3">
                                            <FontAwesomeIcon icon={faMusic} className="text-primary me-2" />
                                            Simulation Son
                                        </h6>
                                        <div className="mb-3">
                                            <Form.Label className="small">Prix de vente (XAF)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Ex: 1000"
                                                onChange={(e) => {
                                                    const amount = parseFloat(e.target.value) || 0;
                                                    const commission = (amount * commissionSettings.sound_commission) / 100;
                                                    const seller = amount - commission;

                                                    const commissionEl = document.getElementById('sound-commission-result');
                                                    const sellerEl = document.getElementById('sound-seller-result');

                                                    if (commissionEl) commissionEl.textContent = formatCurrency(commission);
                                                    if (sellerEl) sellerEl.textContent = formatCurrency(seller);
                                                }}
                                            />
                                        </div>
                                        <div className="border-top pt-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="small text-muted">Commission ({commissionSettings.sound_commission}%)</span>
                                                <span className="small fw-bold text-danger" id="sound-commission-result">0 XAF</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="small text-muted">Montant vendeur</span>
                                                <span className="small fw-bold text-success" id="sound-seller-result">0 XAF</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bg-light rounded-3 p-4">
                                        <h6 className="fw-bold mb-3">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-success me-2" />
                                            Simulation Événement
                                        </h6>
                                        <div className="mb-3">
                                            <Form.Label className="small">Prix du billet (XAF)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Ex: 5000"
                                                onChange={(e) => {
                                                    const amount = parseFloat(e.target.value) || 0;
                                                    const commission = (amount * commissionSettings.event_commission) / 100;
                                                    const seller = amount - commission;

                                                    const commissionEl = document.getElementById('event-commission-result');
                                                    const sellerEl = document.getElementById('event-seller-result');

                                                    if (commissionEl) commissionEl.textContent = formatCurrency(commission);
                                                    if (sellerEl) sellerEl.textContent = formatCurrency(seller);
                                                }}
                                            />
                                        </div>
                                        <div className="border-top pt-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="small text-muted">Commission ({commissionSettings.event_commission}%)</span>
                                                <span className="small fw-bold text-danger" id="event-commission-result">0 XAF</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="small text-muted">Montant organisateur</span>
                                                <span className="small fw-bold text-success" id="event-seller-result">0 XAF</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Statistiques de commission */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="fw-bold mb-0">Résumé des Commissions</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center mb-4">
                                <FontAwesomeIcon icon={faPercentage} size="3x" className="text-primary mb-3" />
                                <h3 className="fw-bold text-primary">{formatCurrency(stats.totalCommission || 0)}</h3>
                                <small className="text-muted">Total des commissions perçues</small>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Taux moyen effectif</small>
                                    <span className="fw-bold">
                                        {stats.totalRevenue > 0 ?
                                            `${Math.round((stats.totalCommission / stats.totalRevenue) * 100)}%` :
                                            '0%'
                                        }
                                    </span>
                                </div>
                                <ProgressBar
                                    variant="primary"
                                    now={stats.totalRevenue > 0 ? (stats.totalCommission / stats.totalRevenue) * 100 : 0}
                                    style={{ height: '6px' }}
                                />
                            </div>

                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="text-muted">Commissions sons</small>
                                    <small className="fw-medium text-primary">{commissionSettings.sound_commission}%</small>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">Commissions événements</small>
                                    <small className="fw-medium text-success">{commissionSettings.event_commission}%</small>
                                </div>
                            </div>

                            <hr />

                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={loadCommissionSettings}
                                >
                                    <FontAwesomeIcon icon={faSync} className="me-2" />
                                    Actualiser
                                </Button>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={exportStats}
                                >
                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                    Exporter
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Statut de la connexion API */}
                    <Card className="border-0 shadow-sm mt-3">
                        <Card.Body className="text-center">
                            <div className="mb-2">
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-success bg-opacity-10 rounded-pill">
                                    <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                    <small className="text-success fw-medium">API Connectée</small>
                                </div>
                            </div>
                            <small className="text-muted">
                                Dernière synchronisation:<br />
                                {new Date().toLocaleString('fr-FR')}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    // Nouvelles fonctions pour approbation/rejet des sons
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

    const handleRejectSound = async (soundId, reason) => {
        try {
            setActionLoading(true);
            const response = await fetch(`/api/admin/sounds/${soundId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (data.success || response.ok) {
                toast.success('Succès', 'Son rejeté avec succès');
                loadSounds(); // Recharger la liste
                setShowSoundRejectModal(false);
                setRejectReason('');
            } else {
                toast.error('Erreur', data.message || 'Impossible de rejeter le son');
            }
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="d-flex">
                {/* Sidebar */}
                <div className="sidebar shadow-lg" style={{
                    width: '280px',
                    minHeight: '100vh',
                    height: 'auto', // Changé de minHeight à height auto
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
                    borderRight: '1px solid #e5e7eb',
                    overflowY: 'auto', // Ajouté pour permettre le scroll si nécessaire
                    maxHeight: '100vh' // Limiter la hauteur maximale
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
                                        onMouseEnter={(e) => {
                                            if (activeTab !== item.id) {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                                e.target.style.transform = 'translateX(4px)';
                                                // Garder la couleur des icônes
                                                const icon = e.target.querySelector('.fa-icon');
                                                if (icon) {
                                                    icon.style.color = '#ffffff';
                                                }
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== item.id) {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.target.style.transform = 'translateX(0)';
                                                // Remettre la couleur normale
                                                const icon = e.target.querySelector('.fa-icon');
                                                if (icon) {
                                                    icon.style.color = '#ffffff';
                                                }
                                            }
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

                        {/* Section Statistiques rapides */}
                        <div className="mb-4">
                            <small className="text-white text-opacity-60 text-uppercase fw-bold px-3 d-block mb-3"
                                   style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                STATISTIQUES RAPIDES
                            </small>
                            <div className="px-2">
                                <div className="p-3 rounded-3 mb-2" style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-white text-opacity-80" style={{ fontSize: '12px' }}>
                                            Revenus aujourd'hui
                                        </small>
                                        <div className="p-1 bg-success bg-opacity-20 rounded">
                                            <FontAwesomeIcon icon={faEuroSign} className="text-success" style={{ fontSize: '12px' }} />
                                        </div>
                                    </div>
                                    <div className="fw-bold text-white h6 mb-0" style={{ fontSize: '16px' }}>
                                        {formatCurrency(stats.totalRevenue * 0.1 || 0)}
                                    </div>
                                </div>

                                <div className="p-3 rounded-3 mb-2" style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-white text-opacity-80" style={{ fontSize: '12px' }}>
                                            Paiements en attente
                                        </small>
                                        <div className="p-1 bg-warning bg-opacity-20 rounded">
                                            <FontAwesomeIcon icon={faClock} className="text-warning" style={{ fontSize: '12px' }} />
                                        </div>
                                    </div>
                                    <div className="fw-bold text-white h6 mb-0" style={{ fontSize: '16px' }}>
                                        {(stats.pendingPayments || 0).toLocaleString()}
                                    </div>
                                </div>

                                <div className="p-3 rounded-3" style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-white text-opacity-80" style={{ fontSize: '12px' }}>
                                            Utilisateurs actifs
                                        </small>
                                        <div className="p-1 bg-info bg-opacity-20 rounded">
                                            <FontAwesomeIcon icon={faUsers} className="text-info" style={{ fontSize: '12px' }} />
                                        </div>
                                    </div>
                                    <div className="fw-bold text-white h6 mb-0" style={{ fontSize: '16px' }}>
                                        {(stats.activeUsers || stats.totalUsers || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="mb-4">
                            <small className="text-white text-opacity-60 text-uppercase fw-bold px-3 d-block mb-3"
                                   style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                ACTIONS RAPIDES
                            </small>
                            <div className="px-2 d-grid gap-2">
                                <button
                                    className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                                    onClick={exportStats}
                                    style={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faDownload} className="me-2" style={{ fontSize: '12px' }} />
                                    <span style={{ fontSize: '12px' }}>Exporter Stats</span>
                                </button>
                                <button
                                    className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                                    onClick={loadStats}
                                    style={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faSync} className="me-2" style={{ fontSize: '12px' }} />
                                    <span style={{ fontSize: '12px' }}>Actualiser</span>
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* Footer de la sidebar */}
                    <div className="sidebar-footer mt-auto p-3" style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="d-flex align-items-center p-2 rounded-3" style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div className="avatar bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                                 style={{ width: '42px', height: '42px', fontSize: '16px', fontWeight: 'bold' }}>
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-grow-1">
                                <div className="fw-semibold text-white" style={{ fontSize: '13px' }}>
                                    {user?.name || 'Administrateur'}
                                </div>
                                <small className="text-white text-opacity-70" style={{ fontSize: '11px' }}>
                                    {user?.email || 'admin@reveilartist.com'}
                                </small>
                            </div>
                            <button className="btn btn-outline-light btn-sm p-2" style={{
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                width: '36px',
                                height: '36px'
                            }}>
                                <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: '12px' }} />
                            </button>
                        </div>
                    </div>
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
                            <div className="d-flex gap-2 align-items-center">
                                {/* Indicateur de statut */}
                                <div className="d-flex align-items-center me-3">
                                    <div className="me-2 p-1 bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                    <small className="text-muted">En ligne</small>
                                </div>

                                <button className="btn btn-outline-primary btn-sm position-relative" style={{
                                    borderColor: '#e2e8f0',
                                    color: '#64748b',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.color = '#3b82f6';
                                    e.target.style.background = 'rgba(59, 130, 246, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.color = '#64748b';
                                    e.target.style.background = 'transparent';
                                }}>
                                    <FontAwesomeIcon icon={faBell} className="me-1" />
                                    Notifications
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                          style={{ fontSize: '10px', padding: '2px 6px' }}>
                                        3
                                    </span>
                                </button>

                                <div className="dropdown">
                                    <button className="btn btn-primary btn-sm dropdown-toggle"
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                border: 'none',
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                            }}>
                                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                                        Nouveau
                                    </button>
                                </div>
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
                                {activeTab === 'analytics' && renderAnalytics()}
                                {activeTab === 'categories' && <CategoryManagement />}
                                {activeTab === 'settings' && renderSettings()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de rejet de son */}
            <Modal show={showSoundRejectModal} onHide={() => setShowSoundRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rejeter le son</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Raison du rejet *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Expliquez pourquoi ce son est rejeté..."
                                required
                            />
                            <Form.Text className="text-muted">
                                Cette raison sera envoyée à l'artiste par email.
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSoundRejectModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => handleRejectSound(selectedSound?.id, rejectReason)}
                        disabled={!rejectReason.trim() || rejectReason.length < 10 || actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                Traitement...
                            </>
                        ) : (
                            'Rejeter le son'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Lecteur audio flottant amélioré */}
            {showAudioPlayer && currentlyPlaying && (
                <div className="audio-player-floating position-fixed bottom-0 start-50 translate-middle-x mb-3"
                     style={{
                         zIndex: 1050,
                         width: '400px',
                         maxWidth: '90vw',
                         animation: 'slideUp 0.3s ease-out'
                     }}>
                    <Card className="shadow-lg border-0" style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Card.Body className="p-4">
                            {/* Header du lecteur */}
                            <div className="d-flex align-items-center mb-3">
                                <div className="me-3 p-2 rounded-3 text-center" style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    minWidth: '48px',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FontAwesomeIcon icon={faMusic} size="lg" />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
                                        {currentlyPlaying.title}
                                    </div>
                                    <small className="text-muted">
                                        <FontAwesomeIcon icon={faUser} className="me-1" />
                                        {typeof currentlyPlaying.artist === 'object' ?
                                            currentlyPlaying.artist?.name || currentlyPlaying.user?.name || 'Artiste' :
                                            currentlyPlaying.artist || currentlyPlaying.user?.name || 'Artiste'
                                        }
                                    </small>
                                    {currentlyPlaying.genre && (
                                        <div className="small text-info">
                                            <FontAwesomeIcon icon={faTags} className="me-1" />
                                            {currentlyPlaying.genre}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => {
                                        if (audioRef) {
                                            audioRef.pause();
                                        }
                                        setCurrentlyPlaying(null);
                                        setIsPlaying(false);
                                        setShowAudioPlayer(false);
                                        setCurrentTime(0);
                                    }}
                                    className="rounded-circle p-2"
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </div>

                            {/* Barre de progression interactive */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between small text-muted mb-2">
                                    <span className="fw-medium">{formatTime(currentTime)}</span>
                                    <span className="fw-medium">{formatTime(duration)}</span>
                                </div>
                                <div
                                    className="progress"
                                    style={{
                                        height: '6px',
                                        cursor: 'pointer',
                                        borderRadius: '3px',
                                        backgroundColor: '#e9ecef'
                                    }}
                                    onClick={(e) => {
                                        if (audioRef && duration > 0) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const pos = (e.clientX - rect.left) / rect.width;
                                            const newTime = pos * duration;
                                            audioRef.currentTime = newTime;
                                            setCurrentTime(newTime);
                                        }
                                    }}
                                >
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            transition: 'width 0.1s ease'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Contrôles de lecture */}
                            <div className="d-flex align-items-center justify-content-between">
                                {/* Bouton Play/Pause principal */}
                                <Button
                                    variant={isPlaying ? "danger" : "success"}
                                    size="sm"
                                    onClick={() => {
                                        if (audioRef) {
                                            if (isPlaying) {
                                                audioRef.pause();
                                                setIsPlaying(false);
                                            } else {
                                                audioRef.play();
                                                setIsPlaying(true);
                                            }
                                        }
                                    }}
                                    className="d-flex align-items-center rounded-pill px-3"
                                    style={{ minWidth: '80px' }}
                                >
                                    <FontAwesomeIcon
                                        icon={isPlaying ? faPause : faPlay}
                                        className="me-2"
                                    />
                                    {isPlaying ? "Pause" : "Play"}
                                </Button>

                                {/* Contrôles de volume */}
                                <div className="d-flex align-items-center gap-2 flex-grow-1 ms-3">
                                    <FontAwesomeIcon
                                        icon={volume === 0 ? faVolumeMute : volume < 0.5 ? faVolumeDown : faVolumeUp}
                                        className="small text-muted"
                                        style={{ minWidth: '16px' }}
                                    />
                                    <Form.Range
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => {
                                            const newVolume = parseFloat(e.target.value);
                                            setVolume(newVolume);
                                            if (audioRef) {
                                                audioRef.volume = newVolume;
                                            }
                                        }}
                                        className="flex-grow-1"
                                        style={{
                                            height: '4px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <small className="text-muted" style={{ minWidth: '35px', textAlign: 'right' }}>
                                        {Math.round(volume * 100)}%
                                    </small>
                                </div>
                            </div>

                            {/* Informations supplémentaires */}
                            {(currentlyPlaying.bpm || currentlyPlaying.key) && (
                                <div className="mt-3 pt-3 border-top">
                                    <div className="d-flex gap-3 small text-muted">
                                        {currentlyPlaying.bpm && (
                                            <span>
                                                <FontAwesomeIcon icon={faMusic} className="me-1" />
                                                {currentlyPlaying.bpm} BPM
                                            </span>
                                        )}
                                        {currentlyPlaying.key && (
                                            <span>
                                                <FontAwesomeIcon icon={faTags} className="me-1" />
                                                Clé: {currentlyPlaying.key}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
