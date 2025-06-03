import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, InputGroup, ProgressBar, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrophy,
    faPlay,
    faPause,
    faStop,
    faClock,
    faUsers,
    faCoins,
    faArrowLeft,
    faHeart,
    faThumbsUp,
    faThumbsDown,
    faComment,
    faPaperPlane,
    faMicrophone,
    faVolumeUp,
    faVolumeMute,
    faCrown,
    faFire,
    faEye,
    faShare,
    faStar,
    faMusic,
    faHeadphones,
    faLightbulb,
    faRecordVinyl,
    faStopCircle,
    faCheckCircle,
    faTimesCircle,
    faUserFriends,
    faGift,
    faCalendarAlt,
    faRocket,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const LiveCompetition = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isDemoMode = searchParams.get('demo') === 'true';
    
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentPerformer, setCurrentPerformer] = useState(null);
    const [performanceQueue, setPerformanceQueue] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [reactions, setReactions] = useState({});
    const [viewers, setViewers] = useState(0);
    const [phase, setPhase] = useState('waiting'); // waiting, performing, voting, results
    const [timeLeft, setTimeLeft] = useState('');
    const [isUserParticipant, setIsUserParticipant] = useState(false);
    const [userVotes, setUserVotes] = useState({});
    const [liveStats, setLiveStats] = useState({ likes: 0, comments: 0, shares: 0 });
    const [competitionStarted, setCompetitionStarted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // États pour le live audio
    const [isLiveAudioEnabled, setIsLiveAudioEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [audioConnections, setAudioConnections] = useState(new Map());
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [roomId, setRoomId] = useState(`competition_${id}`);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const chatContainerRef = useRef(null);
    const websocketRef = useRef(null);
    
    // Refs pour WebRTC
    const localAudioRef = useRef(null);
    const remoteAudiosRef = useRef(new Map());
    const peerConnections = useRef(new Map());
    const webrtcSocket = useRef(null);

    const toast = useToast();
    const { user, token } = useAuth();

    // Données de démonstration
    const demoParticipants = [
        {
            id: 1,
            user: { 
                id: 1, 
                name: 'MC Freestyle', 
                avatar_url: 'https://ui-avatars.com/api/?name=MC+Freestyle&background=3b82f6&color=fff' 
            },
            performance_title: 'Rap Battle Finale',
            status: 'performing'
        },
        {
            id: 2,
            user: { 
                id: 2, 
                name: 'Queen Vocal', 
                avatar_url: 'https://ui-avatars.com/api/?name=Queen+Vocal&background=e74c3c&color=fff' 
            },
            performance_title: 'Afrobeat Vibes',
            status: 'waiting'
        },
        {
            id: 3,
            user: { 
                id: 3, 
                name: 'Beat Master', 
                avatar_url: 'https://ui-avatars.com/api/?name=Beat+Master&background=2ecc71&color=fff' 
            },
            performance_title: 'Urban Flow',
            status: 'completed'
        },
        {
            id: 4,
            user: { 
                id: 4, 
                name: 'Melody Star', 
                avatar_url: 'https://ui-avatars.com/api/?name=Melody+Star&background=f39c12&color=fff' 
            },
            performance_title: 'Soul Expression',
            status: 'waiting'
        },
        {
            id: 5,
            user: { 
                id: 5, 
                name: 'Flow King', 
                avatar_url: 'https://ui-avatars.com/api/?name=Flow+King&background=9b59b6&color=fff' 
            },
            performance_title: 'Hip-Hop Legacy',
            status: 'waiting'
        }
    ];

    const demoChatMessages = [
        {
            id: 1,
            user: { name: 'MusicFan237' },
            message: 'Cette compétition est incroyable ! 🔥',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            user: { name: 'BeatLover' },
            message: 'MC Freestyle est sur le feu ! 💪',
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            user: { name: 'VocalExpert' },
            message: 'Le niveau est vraiment élevé cette année',
            created_at: new Date().toISOString()
        },
        {
            id: 4,
            user: { name: 'CamerounPride' },
            message: 'Représentation du Cameroun ! 🇨🇲',
            created_at: new Date().toISOString()
        }
    ];

    useEffect(() => {
        if (isDemoMode) {
            loadDemoData();
        } else {
            loadCompetition();
        }
        initializeWebSocket();

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [id, isDemoMode]);

    useEffect(() => {
        if (competition) {
            startLiveTimer();
            if (!isDemoMode) {
                loadParticipants();
                loadChatMessages();
            }
        }
    }, [competition, isDemoMode]);

    useEffect(() => {
        // Auto-scroll chat to bottom
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const loadDemoData = async () => {
        try {
            setLoading(true);
            
            // Simuler le chargement de données de démonstration
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Créer une compétition fictive
            const demoCompetition = {
                id: parseInt(id),
                title: 'Battle of Champions - DEMO',
                description: 'Une compétition de démonstration pour tester l\'interface live',
                category: 'Rap',
                entry_fee: 5000,
                max_participants: 20,
                current_participants: 5,
                start_date: new Date().toISOString().split('T')[0],
                start_time: '20:00',
                duration: 120,
                status: 'active',
                user: {
                    id: 99,
                    name: 'Admin Demo'
                }
            };

            setCompetition(demoCompetition);
            setParticipants(demoParticipants);
            setCurrentPerformer(null); // Aucun performer au début
            setChatMessages(demoChatMessages);
            setIsUserParticipant(true);
            setPhase('waiting'); // En attente du lancement
            setViewers(Math.floor(Math.random() * 500) + 150);
            
            // En mode démo, considérer l'utilisateur comme admin
            setIsAdmin(true);
            setCompetitionStarted(false);

            // Initialiser les réactions de démonstration
            const demoReactions = {};
            demoParticipants.forEach(participant => {
                demoReactions[participant.id] = {
                    hearts: Math.floor(Math.random() * 50) + 10,
                    likes: Math.floor(Math.random() * 75) + 20,
                    fire: Math.floor(Math.random() * 30) + 5
                };
            });
            setReactions(demoReactions);

        } catch (error) {
            console.error('Erreur lors du chargement des données de démo:', error);
            toast?.error('Erreur', 'Impossible de charger la démonstration');
        } finally {
            setLoading(false);
        }
    };

    const loadCompetition = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/competitions/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Compétition non trouvée');
            }

            setCompetition(result.competition);
            setIsUserParticipant(result.user_participation ? true : false);
            setViewers(Math.floor(Math.random() * 500) + 50); // Simuler les viewers initiaux

            // Vérifier si l'utilisateur est l'organisateur (admin) de la compétition
            const isCompetitionOwner = user && result.competition.user_id === user.id;
            setIsAdmin(isCompetitionOwner);
            setCompetitionStarted(false); // Par défaut, la compétition n'a pas commencé

        } catch (error) {
            console.error('Erreur:', error);
            toast?.error('Erreur', error.message);
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const loadParticipants = async () => {
        try {
            const response = await fetch(`/api/competitions/${id}/participants`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();

            if (response.ok) {
                setParticipants(result.participants || []);
                setPerformanceQueue(result.participants || []);
                
                // Trouver le participant actuel en performance
                const current = result.participants?.find(p => p.status === 'performing');
                setCurrentPerformer(current || null);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des participants:', error);
        }
    };

    const loadChatMessages = async () => {
        try {
            const response = await fetch(`/api/competitions/${id}/chat`);
            const result = await response.json();

            if (response.ok) {
                setChatMessages(result.messages || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du chat:', error);
        }
    };

    const initializeWebSocket = () => {
        // Simuler WebSocket avec des updates périodiques
        const interval = setInterval(() => {
            updateLiveData();
        }, 3000);

        return () => clearInterval(interval);
    };

    const updateLiveData = () => {
        // Simuler l'augmentation des viewers
        setViewers(prev => prev + Math.floor(Math.random() * 5));
        
        // Simuler nouveaux messages de chat
        if (Math.random() > 0.7) {
            addRandomMessage();
        }

        // Simuler des réactions
        if (currentPerformer && Math.random() > 0.6) {
            addRandomReaction();
        }

        // En mode démo, simuler des changements de phase et de participants seulement si la compétition a commencé
        if (isDemoMode && competitionStarted && Math.random() > 0.85) {
            simulatePhaseChange();
        }
    };

    const simulatePhaseChange = () => {
        // Simuler parfois le changement de participant en performance
        if (phase === 'performing' && Math.random() > 0.7) {
            const waitingParticipants = participants.filter(p => p.status === 'waiting');
            if (waitingParticipants.length > 0) {
                const nextPerformer = waitingParticipants[0];
                
                // Mettre à jour les statuts
                setParticipants(prev => prev.map(p => {
                    if (p.id === currentPerformer?.id) return { ...p, status: 'completed' };
                    if (p.id === nextPerformer.id) return { ...p, status: 'performing' };
                    return p;
                }));
                
                setCurrentPerformer(nextPerformer);
                
                // Ajouter un message système
                const systemMessage = {
                    id: Date.now(),
                    user: { name: 'Système' },
                    message: `🎤 ${nextPerformer.user.name} commence sa performance !`,
                    created_at: new Date().toISOString(),
                    isSystem: true
                };
                setChatMessages(prev => [...prev.slice(-50), systemMessage]);
            }
        }
    };

    const addRandomMessage = () => {
        const randomUsers = [
            "MusicFan237", "RapLover", "BeatMaster", "FlowExpert", "CamerounPride", 
            "VocalStar", "HipHopHead", "AfrobeatVibes", "MelodyMaker", "RhymeTime",
            "SoundWave", "BassLover", "DrumLine", "VoiceOfGold", "UrbanLegend"
        ];
        
        const randomMessages = [
            "Excellent ! 🔥", "Le niveau monte ! 💪", "Bravo les artistes ! 👏",
            "Qui va gagner ? 🤔", "Performance incroyable ! ⭐", "Cameroun représente ! 🇨🇲",
            "Le flow est parfait ! 🎵", "J'adore cette compétition ! ❤️",
            "C'est du pur talent ! 💯", "On est en feu ce soir ! 🔥",
            "Cette voix me donne des frissons ! ✨", "Battle légendaire ! ⚡",
            "Du jamais vu ! 🚀", "Respect total ! 🙏", "Que du lourd ! 💎",
            "Mon cœur bat fort ! 💓", "Atmosphère de folie ! 🎪",
            "Niveau international ! 🌍", "Pure magie ! ✨", "Chapeau l'artiste ! 🎩"
        ];

        const reactions = ["❤️", "🔥", "👏", "💯", "⭐", "🚀", "✨", "💪", "🎵", "🎤"];

        // Parfois juste des emojis
        let message;
        if (Math.random() > 0.8) {
            message = reactions[Math.floor(Math.random() * reactions.length)].repeat(Math.floor(Math.random() * 3) + 1);
        } else {
            message = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        }

        const newMsg = {
            id: Date.now() + Math.random(),
            user: { name: randomUsers[Math.floor(Math.random() * randomUsers.length)] },
            message: message,
            created_at: new Date().toISOString()
        };

        setChatMessages(prev => [...prev.slice(-50), newMsg]);
    };

    const addRandomReaction = () => {
        if (!currentPerformer) return;

        setReactions(prev => ({
            ...prev,
            [currentPerformer.id]: {
                likes: (prev[currentPerformer.id]?.likes || 0) + Math.floor(Math.random() * 3) + 1,
                hearts: (prev[currentPerformer.id]?.hearts || 0) + Math.floor(Math.random() * 2),
                fire: (prev[currentPerformer.id]?.fire || 0) + Math.floor(Math.random() * 2)
            }
        }));
    };

    const startLiveTimer = () => {
        const timer = setInterval(() => {
            // Ne démarrer le timer que si la compétition a été lancée manuellement
            if (!competitionStarted) {
                return;
            }

            const now = new Date();
            
            // En mode démo, utiliser 30 secondes pour les tests
            const durationMs = isDemoMode ? 30 * 1000 : 2 * 60 * 60 * 1000; // 30s en démo, 2h sinon
            const endTime = new Date(now.getTime() + durationMs);
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft('Terminé');
                setPhase('results');
                // Désigner le vainqueur automatiquement
                designateWinner();
                clearInterval(timer);
                return;
            }

            // Changer de phase selon le temps restant
            const totalTime = durationMs;
            const elapsed = totalTime - diff;
            const progressPercentage = (elapsed / totalTime) * 100;

            if (progressPercentage < 20) {
                setPhase('performing'); // Rester en performing après le lancement
            } else if (progressPercentage < 80) {
                setPhase('performing');
            } else if (progressPercentage < 100) {
                setPhase('voting');
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (isDemoMode) {
                // Afficher seulement les secondes en mode démo
                setTimeLeft(`${seconds}s`);
            } else {
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    };

    const designateWinner = () => {
        if (!participants.length) return;

        // Calculer le score final pour chaque participant
        const participantsWithScores = participants.map(participant => {
            const participantReactions = reactions[participant.id] || {};
            const hearts = participantReactions.hearts || 0;
            const likes = participantReactions.likes || 0;
            const fire = participantReactions.fire || 0;
            
            // Score pondéré : hearts = 3 points, likes = 2 points, fire = 1 point
            const totalScore = (hearts * 3) + (likes * 2) + (fire * 1);
            
            return {
                ...participant,
                finalScore: totalScore,
                reactions: participantReactions
            };
        }).sort((a, b) => b.finalScore - a.finalScore);

        setParticipants(participantsWithScores);

        // Afficher le message de victoire
        if (participantsWithScores.length > 0) {
            const winner = participantsWithScores[0];
            const winnerMessage = {
                id: Date.now(),
                user: { name: 'Système 🏆' },
                message: `🎉 FÉLICITATIONS ! ${winner.user.name} remporte la compétition avec ${winner.finalScore} points ! 🎉`,
                created_at: new Date().toISOString(),
                isSystem: true,
                isWinner: true
            };
            setChatMessages(prev => [...prev.slice(-50), winnerMessage]);

            // Toast de victoire
            toast?.success('🏆 Compétition terminée !', `${winner.user.name} est le grand gagnant !`);
        }
    };

    const handleStartRecording = async () => {
        if (!isUserParticipant) {
            toast?.warning('Participation requise', 'Vous devez être inscrit pour enregistrer');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleSubmitRecording(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // Timer d'enregistrement (max 3 minutes)
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 180) { // 3 minutes max
                        handleStopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

            toast?.success('Enregistrement', 'Enregistrement démarré ! Maximum 3 minutes');
            setShowRecordModal(true);

        } catch (error) {
            console.error('Erreur microphone:', error);
            toast?.error('Erreur', 'Impossible d\'accéder au microphone');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }

            // Arrêter tous les tracks audio
            if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleSubmitRecording = async (audioBlob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'performance.wav');
            formData.append('competition_id', id);
            formData.append('duration', recordingTime);

            const response = await fetch('/api/competitions/submit-performance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                toast?.success('Soumission réussie', 'Votre performance a été soumise !');
                setShowRecordModal(false);
                loadParticipants(); // Recharger les participants
            } else {
                throw new Error(result.message || 'Erreur lors de la soumission');
            }

        } catch (error) {
            console.error('Erreur soumission:', error);
            toast?.error('Erreur', error.message || 'Erreur lors de la soumission');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // En mode démonstration, ajouter le message localement
        if (isDemoMode) {
            const message = {
                id: Date.now(),
                user: { name: user?.name || 'Visiteur Demo' },
                message: newMessage,
                created_at: new Date().toISOString(),
                isOwn: true
            };

            setChatMessages(prev => [...prev.slice(-50), message]);
            setNewMessage('');
            return;
        }

        if (!token) {
            toast?.warning('Connexion requise', 'Connectez-vous pour chatter');
            return;
        }

        try {
            const response = await fetch('/api/competitions/chat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    competition_id: id,
                    message: newMessage
                })
            });

            const result = await response.json();

            if (response.ok) {
                const message = {
                    id: Date.now(),
                    user: { name: user?.name || 'Vous' },
                    message: newMessage,
                    created_at: new Date().toISOString(),
                    isOwn: true
                };

                setChatMessages(prev => [...prev.slice(-50), message]);
                setNewMessage('');
            }

        } catch (error) {
            console.error('Erreur envoi message:', error);
        }
    };

    const handleReaction = async (type) => {
        if (!currentPerformer) {
            toast?.warning('Aucun participant', 'Aucune performance en cours');
            return;
        }

        // En mode démonstration, simuler la réaction localement
        if (isDemoMode) {
            setReactions(prev => ({
                ...prev,
                [currentPerformer.id]: {
                    ...prev[currentPerformer.id],
                    [type]: (prev[currentPerformer.id]?.[type] || 0) + 1
                }
            }));

            toast?.success('Réaction envoyée', `Votre ${type} a été envoyé !`);
            return;
        }

        if (!token) {
            toast?.warning('Connexion requise', 'Connectez-vous pour réagir');
            return;
        }

        try {
            const response = await fetch('/api/competitions/react', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participant_id: currentPerformer.id,
                    reaction_type: type
                })
            });

            if (response.ok) {
                setReactions(prev => ({
                    ...prev,
                    [currentPerformer.id]: {
                        ...prev[currentPerformer.id],
                        [type]: (prev[currentPerformer.id]?.[type] || 0) + 1
                    }
                }));

                toast?.success('Réaction envoyée', `Votre ${type} a été envoyé !`);
            }

        } catch (error) {
            console.error('Erreur réaction:', error);
        }
    };

    const handleVote = async (participantId, voteType) => {
        // En mode démonstration, simuler le vote localement
        if (isDemoMode) {
            setUserVotes(prev => ({
                ...prev,
                [participantId]: voteType
            }));

            toast?.success('Vote enregistré', 'Votre vote a été pris en compte !');
            return;
        }

        if (!token) {
            toast?.warning('Connexion requise', 'Connectez-vous pour voter');
            return;
        }

        try {
            const response = await fetch('/api/competitions/vote', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participant_id: participantId,
                    vote_type: voteType
                })
            });

            if (response.ok) {
                setUserVotes(prev => ({
                    ...prev,
                    [participantId]: voteType
                }));

                toast?.success('Vote enregistré', 'Votre vote a été pris en compte !');
            }

        } catch (error) {
            console.error('Erreur vote:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPhaseDisplay = () => {
        switch (phase) {
            case 'waiting':
                return { text: 'En attente', color: 'secondary', icon: faClock };
            case 'performing':
                return { text: 'Performance', color: 'success', icon: faMicrophone };
            case 'voting':
                return { text: 'Votes', color: 'warning', icon: faThumbsUp };
            case 'results':
                return { text: 'Résultats', color: 'info', icon: faTrophy };
            default:
                return { text: 'Live', color: 'danger', icon: faPlay };
        }
    };

    const handleStartCompetition = () => {
        if (!isAdmin) {
            toast?.warning('Accès restreint', 'Seul l\'administrateur peut lancer la compétition');
            return;
        }

        if (participants.length === 0) {
            toast?.warning('Aucun participant', 'Attendez qu\'au moins un participant s\'inscrive');
            return;
        }

        // Lancer la compétition
        setCompetitionStarted(true);
        setPhase('performing');
        
        // Sélectionner le premier participant
        const firstPerformer = participants.find(p => p.status !== 'completed') || participants[0];
        setCurrentPerformer(firstPerformer);

        // Mettre à jour les statuts des participants
        setParticipants(prev => prev.map(p => ({
            ...p,
            status: p.id === firstPerformer.id ? 'performing' : 'waiting'
        })));

        // Message système de lancement
        const startMessage = {
            id: Date.now(),
            user: { name: 'Système 🎤' },
            message: `🚀 La compétition commence ! ${firstPerformer.user.name} ouvre le bal !`,
            created_at: new Date().toISOString(),
            isSystem: true
        };
        setChatMessages(prev => [...prev.slice(-50), startMessage]);

        toast?.success('🎤 Compétition lancée !', 'La compétition a officiellement commencé');
    };

    const handleNextParticipant = () => {
        if (!isAdmin) {
            toast?.warning('Accès restreint', 'Seul l\'administrateur peut changer de participant');
            return;
        }

        if (!competitionStarted) {
            toast?.warning('Compétition non lancée', 'Lancez d\'abord la compétition');
            return;
        }

        // Trouver le prochain participant en attente
        const waitingParticipants = participants.filter(p => p.status === 'waiting');
        
        if (waitingParticipants.length === 0) {
            // Tous les participants ont terminé, passer aux résultats
            setPhase('results');
            designateWinner();
            toast?.info('🏁 Fin des performances', 'Tous les participants ont chanté !');
            return;
        }

        const nextPerformer = waitingParticipants[0];
        
        // Mettre à jour les statuts
        setParticipants(prev => prev.map(p => {
            if (p.id === currentPerformer?.id) return { ...p, status: 'completed' };
            if (p.id === nextPerformer.id) return { ...p, status: 'performing' };
            return p;
        }));
        
        setCurrentPerformer(nextPerformer);
        
        // Message système
        const nextMessage = {
            id: Date.now(),
            user: { name: 'Système 🎤' },
            message: `🎵 ${nextPerformer.user.name} monte sur scène ! À vous de jouer !`,
            created_at: new Date().toISOString(),
            isSystem: true
        };
        setChatMessages(prev => [...prev.slice(-50), nextMessage]);

        toast?.success('🎵 Participant suivant', `C'est au tour de ${nextPerformer.user.name} !`);
    };

    // ============= FONCTIONS LIVE AUDIO WEBRTC =============

    // Configuration STUN/TURN pour WebRTC
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    // Initialiser WebSocket pour signaling WebRTC
    const initializeWebRTCSocket = () => {
        if (isDemoMode) {
            // En mode démo, on simule les connexions
            return;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/audio/${roomId}`;
        
        webrtcSocket.current = new WebSocket(wsUrl);

        webrtcSocket.current.onopen = () => {
            console.log('🔗 WebSocket audio connecté');
            toast?.success('Audio Live', 'Connexion audio établie');
        };

        webrtcSocket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebRTCSignaling(data);
        };

        webrtcSocket.current.onclose = () => {
            console.log('❌ WebSocket audio fermé');
            toast?.warning('Audio Live', 'Connexion audio fermée');
        };

        webrtcSocket.current.onerror = (error) => {
            console.error('❌ Erreur WebSocket audio:', error);
            toast?.error('Audio Live', 'Erreur de connexion audio');
        };
    };

    // Gérer la signalisation WebRTC
    const handleWebRTCSignaling = async (data) => {
        const { type, userId, offer, answer, candidate } = data;

        switch (type) {
            case 'user-joined':
                await createPeerConnection(userId);
                break;

            case 'user-left':
                removePeerConnection(userId);
                break;

            case 'offer':
                await handleOffer(userId, offer);
                break;

            case 'answer':
                await handleAnswer(userId, answer);
                break;

            case 'ice-candidate':
                await handleIceCandidate(userId, candidate);
                break;

            case 'user-speaking':
                // Mise en évidence du participant qui parle
                highlightSpeaker(userId);
                break;
        }
    };

    // Créer une connexion peer-to-peer
    const createPeerConnection = async (userId) => {
        try {
            const peerConnection = new RTCPeerConnection(rtcConfig);
            peerConnections.current.set(userId, peerConnection);

            // Ajouter le stream local
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            // Gérer les ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate && webrtcSocket.current) {
                    webrtcSocket.current.send(JSON.stringify({
                        type: 'ice-candidate',
                        targetUserId: userId,
                        candidate: event.candidate
                    }));
                }
            };

            // Gérer les streams distants
            peerConnection.ontrack = (event) => {
                const [remoteStream] = event.streams;
                addRemoteStream(userId, remoteStream);
            };

            return peerConnection;
        } catch (error) {
            console.error('❌ Erreur création peer connection:', error);
            toast?.error('Audio Live', 'Erreur de connexion peer');
        }
    };

    // Démarrer la diffusion audio
    const startAudioBroadcast = async () => {
        try {
            // Vérifier si l'utilisateur est le participant actuel
            if (!currentPerformer || currentPerformer.user.id !== user?.id) {
                toast?.warning('Audio Live', 'Seul le participant actuel peut diffuser');
                return;
            }

            setIsBroadcasting(true);
            
            // Obtenir le microphone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                } 
            });

            setLocalStream(stream);
            
            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            // Initialiser WebRTC si pas en mode démo
            if (!isDemoMode) {
                initializeWebRTCSocket();
                
                // Notifier les autres participants
                if (webrtcSocket.current) {
                    webrtcSocket.current.send(JSON.stringify({
                        type: 'start-broadcasting',
                        userId: user.id,
                        userName: user.name
                    }));
                }
            }

            // Détecter quand l'utilisateur parle
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            const detectSpeaking = () => {
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
                
                if (volume > 30) { // Seuil de détection de voix
                    // Notifier que l'utilisateur parle
                    if (webrtcSocket.current && !isDemoMode) {
                        webrtcSocket.current.send(JSON.stringify({
                            type: 'user-speaking',
                            userId: user.id
                        }));
                    }
                }
                
                if (isBroadcasting) {
                    requestAnimationFrame(detectSpeaking);
                }
            };

            detectSpeaking();

            toast?.success('🎤 Audio Live', 'Diffusion audio démarrée !');
            
        } catch (error) {
            console.error('❌ Erreur diffusion audio:', error);
            toast?.error('Audio Live', 'Impossible d\'accéder au microphone');
            setIsBroadcasting(false);
        }
    };

    // Écouter les autres participants
    const startListening = async () => {
        try {
            setIsListening(true);
            
            if (!isDemoMode) {
                initializeWebRTCSocket();
                
                // Rejoindre la room d'écoute
                if (webrtcSocket.current) {
                    webrtcSocket.current.send(JSON.stringify({
                        type: 'join-room',
                        userId: user?.id || 'anonymous',
                        userName: user?.name || 'Auditeur'
                    }));
                }
            } else {
                // En mode démo, simuler l'écoute
                simulateDemoAudio();
            }

            toast?.success('🎧 Audio Live', 'Écoute activée !');
            
        } catch (error) {
            console.error('❌ Erreur écoute audio:', error);
            toast?.error('Audio Live', 'Erreur d\'écoute audio');
            setIsListening(false);
        }
    };

    // Arrêter la diffusion audio
    const stopAudioBroadcast = () => {
        setIsBroadcasting(false);
        
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        // Fermer toutes les connexions peer
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();

        if (webrtcSocket.current) {
            webrtcSocket.current.send(JSON.stringify({
                type: 'stop-broadcasting',
                userId: user?.id
            }));
            webrtcSocket.current.close();
        }

        toast?.info('🎤 Audio Live', 'Diffusion audio arrêtée');
    };

    // Arrêter l'écoute
    const stopListening = () => {
        setIsListening(false);
        
        // Arrêter tous les streams distants
        remoteStreams.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        setRemoteStreams(new Map());

        // Fermer les connexions peer
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();

        if (webrtcSocket.current) {
            webrtcSocket.current.close();
        }

        toast?.info('🎧 Audio Live', 'Écoute arrêtée');
    };

    // Ajouter un stream distant
    const addRemoteStream = (userId, stream) => {
        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(userId, stream);
            return newStreams;
        });

        // Créer un élément audio pour ce stream
        const audioElement = document.createElement('audio');
        audioElement.srcObject = stream;
        audioElement.autoplay = true;
        audioElement.volume = 0.8;
        
        remoteAudiosRef.current.set(userId, audioElement);
        
        console.log(`🎵 Stream audio reçu de l'utilisateur ${userId}`);
    };

    // Supprimer une connexion peer
    const removePeerConnection = (userId) => {
        const pc = peerConnections.current.get(userId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(userId);
        }

        const audioElement = remoteAudiosRef.current.get(userId);
        if (audioElement) {
            audioElement.remove();
            remoteAudiosRef.current.delete(userId);
        }

        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(userId);
            return newStreams;
        });
    };

    // Gérer les offers WebRTC
    const handleOffer = async (userId, offer) => {
        try {
            const peerConnection = await createPeerConnection(userId);
            await peerConnection.setRemoteDescription(offer);
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            if (webrtcSocket.current) {
                webrtcSocket.current.send(JSON.stringify({
                    type: 'answer',
                    targetUserId: userId,
                    answer: answer
                }));
            }
        } catch (error) {
            console.error('❌ Erreur gestion offer:', error);
        }
    };

    // Gérer les answers WebRTC
    const handleAnswer = async (userId, answer) => {
        try {
            const peerConnection = peerConnections.current.get(userId);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(answer);
            }
        } catch (error) {
            console.error('❌ Erreur gestion answer:', error);
        }
    };

    // Gérer les ICE candidates
    const handleIceCandidate = async (userId, candidate) => {
        try {
            const peerConnection = peerConnections.current.get(userId);
            if (peerConnection) {
                await peerConnection.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error('❌ Erreur gestion ICE candidate:', error);
        }
    };

    // Mettre en évidence le participant qui parle
    const highlightSpeaker = (userId) => {
        // Ajouter une classe CSS pour mettre en évidence
        const speakerElement = document.querySelector(`[data-participant-id="${userId}"]`);
        if (speakerElement) {
            speakerElement.classList.add('speaking');
            setTimeout(() => {
                speakerElement.classList.remove('speaking');
            }, 1000);
        }
    };

    // Simuler l'audio en mode démo
    const simulateDemoAudio = () => {
        if (!currentPerformer) return;
        
        // Simuler l'audio du participant actuel
        const demoMessage = {
            id: Date.now(),
            user: { name: 'Système Audio 🎵' },
            message: `🔊 Vous écoutez maintenant ${currentPerformer.user.name} en direct !`,
            created_at: new Date().toISOString(),
            isSystem: true
        };
        setChatMessages(prev => [...prev.slice(-50), demoMessage]);
        
        // Simuler la détection de voix
        setTimeout(() => {
            highlightSpeaker(currentPerformer.id);
        }, 2000);
    };

    // ============= FIN FONCTIONS WEBRTC =============

    if (loading) {
        return <LoadingScreen />;
    }

    if (!competition) {
        return (
            <Container className="py-5 text-center">
                <h3>Compétition non trouvée</h3>
                <Button as={Link} to="/competitions" variant="primary">
                    Retour aux compétitions
                </Button>
            </Container>
        );
    }

    const phaseInfo = getPhaseDisplay();

    return (
        <div className="min-vh-100 bg-dark text-white live-competition-bg">
            {/* Header de diffusion */}
            <div className="live-header bg-gradient-dark py-3 border-bottom border-secondary">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="d-flex align-items-center">
                                <Button
                                    as={Link}
                                    to={`/competitions/${id}`}
                                    variant="outline-light"
                                    size="sm"
                                    className="me-3"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </Button>

                                <div className="live-indicator me-3">
                                    <span className="live-dot"></span>
                                    <span className="fw-bold text-danger">EN DIRECT</span>
                                    {isDemoMode && (
                                        <Badge bg="warning" className="ms-2">
                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                            DEMO
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h5 className="mb-0 fw-bold">
                                        {competition.title}
                                        {isDemoMode && <small className=" text-muted ms-2">(Mode Démonstration)</small>}
                                    </h5>
                                    <small className="text-light">Organisé par {competition.user?.name}</small>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-3">
                                <Badge bg={phaseInfo.color} className="fs-6 px-3 py-2">
                                    <FontAwesomeIcon icon={phaseInfo.icon} className="me-2" />
                                    {phaseInfo.text}
                                </Badge>

                                <div className="d-flex align-items-center text-light">
                                    <FontAwesomeIcon icon={faEye} className="me-2" />
                                    <span className="fw-bold">{viewers.toLocaleString()}</span>
                                    <small className="ms-1">spectateurs</small>
                                </div>

                                <div className="d-flex align-items-center text-light">
                                    <FontAwesomeIcon icon={faClock} className="me-2" />
                                    <span className="fw-bold">{timeLeft}</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Contenu principal */}
            <Container fluid className="py-3">
                <Row className="g-3">
                    {/* Zone de performance principale */}
                    <Col lg={8}>
                        <AnimatedElement animation="slideInLeft" delay={100}>
                            {/* Bouton de lancement pour l'admin */}
                            {isAdmin && !competitionStarted && (
                                <Card className="bg-gradient-primary border-0 mb-3 admin-control-card">
                                    <Card.Body className="text-center py-4">
                                        <div className="admin-badge mb-3">
                                            <FontAwesomeIcon icon={faCrown} className="me-2" />
                                            PANNEAU ADMINISTRATEUR
                                        </div>
                                        <h4 className="text-white mb-3">
                                            <FontAwesomeIcon icon={faPlay} className="me-2" />
                                            Prêt à lancer la compétition ?
                                        </h4>
                                        <p className="text-light mb-4">
                                            {participants.length} participant(s) inscrit(s) • Cliquez pour commencer le show !
                                        </p>
                                        <Button
                                            variant="warning"
                                            size="lg"
                                            onClick={handleStartCompetition}
                                            className="start-competition-btn"
                                            disabled={participants.length === 0}
                                        >
                                            <FontAwesomeIcon icon={faRocket} className="me-2" />
                                            🎤 LANCER LA COMPÉTITION
                                        </Button>
                                        {participants.length === 0 && (
                                            <div className="mt-3">
                                                <small className="text-warning">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                                                    En attente de participants...
                                                </small>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Contrôles admin pendant la compétition */}
                            {isAdmin && competitionStarted && phase !== 'results' && (
                                <Card className="bg-warning bg-opacity-10 border-warning mb-3 admin-live-controls">
                                    <Card.Body className="py-3">
                                        <Row className="align-items-center">
                                            <Col md={8}>
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon icon={faCrown} className="text-warning me-2" />
                                                    <div>
                                                        <h6 className="mb-0 text-white">Contrôles Admin</h6>
                                                        <small className="text-muted">
                                                            Participant actuel : {currentPerformer?.user?.name || 'Aucun'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={4} className="text-end">
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={handleNextParticipant}
                                                    className="next-participant-btn"
                                                >
                                                    <FontAwesomeIcon icon={faPlay} className="me-2" />
                                                    Participant suivant
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Lecteur/Scène principale */}
                            <Card className="bg-dark border-secondary mb-3 performance-stage">
                                <Card.Body className="p-4">
                                    {currentPerformer ? (
                                        <div className="text-center">
                                            <div className="performer-spotlight mb-4">
                                                <img
                                                    src={currentPerformer.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPerformer.user?.name || 'Artiste')}&background=3b82f6&color=fff`}
                                                    alt={currentPerformer.user?.name}
                                                    className="rounded-circle performer-avatar"
                                                />
                                                <div className="performer-glow"></div>
                                            </div>

                                            <h3 className="text-white fw-bold mb-2">{currentPerformer.user?.name}</h3>
                                            <h5 className="text-primary mb-3">
                                                {currentPerformer.performance_title || 'Performance en cours'}
                                            </h5>

                                            {/* Réactions en temps réel */}
                                            <div className="reactions-display mb-4">
                                                <div className="d-flex justify-content-center gap-4">
                                                    <div className="reaction-count">
                                                        <FontAwesomeIcon icon={faHeart} className="text-danger" />
                                                        <span className="ms-1">{reactions[currentPerformer.id]?.hearts || 0}</span>
                                                    </div>
                                                    <div className="reaction-count">
                                                        <FontAwesomeIcon icon={faThumbsUp} className="text-success" />
                                                        <span className="ms-1">{reactions[currentPerformer.id]?.likes || 0}</span>
                                                    </div>
                                                    <div className="reaction-count">
                                                        <FontAwesomeIcon icon={faFire} className="text-warning" />
                                                        <span className="ms-1">{reactions[currentPerformer.id]?.fire || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Boutons de réaction */}
                                            <div className="reaction-buttons mb-4">
                                                <h6 className="text-light mb-3">Réagissez en temps réel :</h6>
                                                <div className="d-flex justify-content-center gap-3">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="lg"
                                                        onClick={() => handleReaction('hearts')}
                                                        className="reaction-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faHeart} className="me-2" />
                                                        J'adore
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        size="lg"
                                                        onClick={() => handleReaction('likes')}
                                                        className="reaction-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                                                        Excellent
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="lg"
                                                        onClick={() => handleReaction('fire')}
                                                        className="reaction-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faFire} className="me-2" />
                                                        Feu !
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Vote final si disponible */}
                                            {phase === 'voting' && (
                                                <div className="vote-section">
                                                    <h6 className="text-light mb-3">Votez pour cette performance :</h6>
                                                    <div className="d-flex justify-content-center gap-3">
                                                        <Button
                                                            variant={userVotes[currentPerformer.id] === 'up' ? "success" : "outline-success"}
                                                            size="lg"
                                                            onClick={() => handleVote(currentPerformer.id, 'up')}
                                                            className="vote-btn"
                                                        >
                                                            <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                                                            Excellent
                                                        </Button>
                                                        <Button
                                                            variant={userVotes[currentPerformer.id] === 'down' ? "danger" : "outline-danger"}
                                                            size="lg"
                                                            onClick={() => handleVote(currentPerformer.id, 'down')}
                                                            className="vote-btn"
                                                        >
                                                            <FontAwesomeIcon icon={faThumbsDown} className="me-2" />
                                                            Pas terrible
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Affichage des résultats finaux */}
                                            {phase === 'results' && (
                                                <div className="results-section">
                                                    <h4 className="text-warning mb-3">
                                                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                                        Compétition Terminée !
                                                    </h4>
                                                    <p className="text-light mb-3">
                                                        Les votes sont maintenant fermés. Voici le classement final basé sur les réactions du public !
                                                    </p>
                                                    <div className="final-winner-display">
                                                        {participants.length > 0 && participants[0].finalScore !== undefined && (
                                                            <div className="winner-spotlight">
                                                                <div className="winner-crown">👑</div>
                                                                <img
                                                                    src={participants[0].user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participants[0].user?.name || 'Gagnant')}&background=ffd700&color=000`}
                                                                    alt={participants[0].user?.name}
                                                                    className="winner-avatar"
                                                                />
                                                                <h5 className="winner-name text-warning mt-2">{participants[0].user?.name}</h5>
                                                                <div className="winner-score">{participants[0].finalScore} points</div>
                                                                <div className="winner-confetti">🎉🎊🎉</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faMicrophone} size="3x" className="text-muted mb-3" />
                                            <h4 className="text-light">En attente du prochain participant...</h4>
                                            <p className="text-muted">La prochaine performance va bientôt commencer</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Bouton d'enregistrement pour les participants */}
                            {isUserParticipant && (
                                <Card className="bg-dark border-secondary mb-3">
                                    <Card.Body className="text-center">
                                        <h5 className="text-white mb-3">
                                            <FontAwesomeIcon icon={faMicrophone} className="me-2 text-primary" />
                                            Votre tour !
                                        </h5>
                                        <p className="text-muted mb-3">
                                            Enregistrez votre performance (maximum 3 minutes)
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleStartRecording}
                                            disabled={isRecording}
                                            className="record-btn"
                                        >
                                            <FontAwesomeIcon icon={isRecording ? faRecordVinyl : faMicrophone} className="me-2" />
                                            {isRecording ? 'Enregistrement...' : 'Commencer à chanter'}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Classement en temps réel */}
                            <Card className="bg-dark border-secondary">
                                <Card.Header className="bg-transparent border-secondary">
                                    <h5 className="mb-0 text-white fw-bold">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                        Classement en temps réel
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {participants.length > 0 ? (
                                        <Row className="g-2">
                                            {participants
                                                .map(participant => {
                                                    const participantReactions = reactions[participant.id] || {};
                                                    const hearts = participantReactions.hearts || 0;
                                                    const likes = participantReactions.likes || 0;
                                                    const fire = participantReactions.fire || 0;
                                                    const totalScore = (hearts * 3) + (likes * 2) + (fire * 1);
                                                    
                                                    return {
                                                        ...participant,
                                                        hearts,
                                                        likes, 
                                                        fire,
                                                        totalScore
                                                    };
                                                })
                                                .sort((a, b) => b.totalScore - a.totalScore)
                                                .map((participant, index) => {
                                                    const isWinner = phase === 'results' && index === 0;
                                                    const isLeader = phase !== 'results' && index === 0 && participant.totalScore > 0;
                                                    
                                                    return (
                                                        <Col key={participant.id} md={6} lg={4}>
                                                            <div 
                                                                className={`participant-rank-card ${participant.id === currentPerformer?.id ? 'performing' : ''} ${isWinner ? 'winner' : ''} ${isLeader ? 'leader' : ''} ${index < 3 ? 'podium' : ''}`}
                                                                data-participant-id={participant.id}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <div className="rank-position me-3">
                                                                        {isWinner && '🏆'}
                                                                        {!isWinner && index === 0 && participant.totalScore > 0 && '👑'}
                                                                        {index === 1 && <span className="text-light">🥈</span>}
                                                                        {index === 2 && <span className="text-light">🥉</span>}
                                                                        {index > 2 && <span className="text-muted">#{index + 1}</span>}
                                                                    </div>
                                                                    <img
                                                                        src={participant.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.user?.name || 'Artiste')}&background=3b82f6&color=fff`}
                                                                        alt={participant.user?.name}
                                                                        className="rounded-circle me-2"
                                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold text-white">{participant.user?.name}</div>
                                                                        <div className="participant-score">
                                                                            <small className="text-warning">{participant.totalScore} pts</small>
                                                                            <span className="score-breakdown ms-2">
                                                                                <small className="text-danger">❤️{participant.hearts}</small>
                                                                                <small className="text-success ms-1">👍{participant.likes}</small>
                                                                                <small className="text-warning ms-1">🔥{participant.fire}</small>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {participant.id === currentPerformer?.id && phase !== 'results' && (
                                                                        <Badge bg="success" className="ms-2">
                                                                            <FontAwesomeIcon icon={faMicrophone} className="me-1" />
                                                                            EN COURS
                                                                        </Badge>
                                                                    )}
                                                                    {isWinner && (
                                                                        <Badge bg="warning" className="ms-2 winner-badge">
                                                                            <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                                                            GAGNANT
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    );
                                                })}
                                        </Row>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted">Aucun participant pour l'instant</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>

                    {/* Sidebar - Chat et informations */}
                    <Col lg={4}>
                        <AnimatedElement animation="slideInRight" delay={200}>
                            {/* Informations de la compétition */}
                            <Card className="bg-dark border-secondary mb-3">
                                <Card.Header className="bg-transparent border-secondary">
                                    <h6 className="mb-0 text-white fw-bold">
                                        <FontAwesomeIcon icon={faCoins} className="me-2 text-warning" />
                                        Cagnotte : {formatCurrency(competition.entry_fee * (competition.current_participants || 0))}
                                    </h6>
                                </Card.Header>
                                <Card.Body className="py-2">
                                    <div className="d-flex justify-content-between text-light small">
                                        <span>Participants:</span>
                                        <span>{participants.length}/{competition.max_participants}</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-light small">
                                        <span>Spectateurs:</span>
                                        <span>{viewers.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-light small">
                                        <span>Temps restant:</span>
                                        <span>{timeLeft}</span>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Chat en direct */}
                            <Card className="bg-dark border-secondary chat-container">
                                <Card.Header className="bg-transparent border-secondary">
                                    <h6 className="mb-0 text-white fw-bold">
                                        <FontAwesomeIcon icon={faComment} className="me-2 text-primary" />
                                        Chat en direct ({chatMessages.length})
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="chat-messages" ref={chatContainerRef}>
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own' : ''} ${msg.isSystem ? 'system' : ''} ${msg.isWinner ? 'winner' : ''}`}>
                                                <div className="d-flex align-items-start">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <span className={`chat-username fw-bold ${msg.isSystem ? 'text-warning' : 'text-primary'}`}>
                                                                {msg.user?.name || 'Anonyme'}
                                                            </span>
                                                            <small className="text-muted ms-2">
                                                                {formatTime(msg.created_at)}
                                                            </small>
                                                        </div>
                                                        <div className={`chat-text ${msg.isWinner ? 'winner-text' : 'text-light'}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-transparent border-secondary">
                                    <Form onSubmit={handleSendMessage}>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder={token ? "Écrivez votre message..." : "Connectez-vous pour chatter"}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                disabled={!token}
                                                className="bg-dark text-light border-secondary"
                                            />
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={!newMessage.trim() || !token}
                                            >
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Card.Footer>
                            </Card>
                        </AnimatedElement>
                    </Col>
                </Row>
            </Container>

            {/* Modal d'enregistrement */}
            <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} centered>
                <Modal.Header closeButton className="bg-dark text-white border-secondary">
                    <Modal.Title>
                        <FontAwesomeIcon icon={faMicrophone} className="me-2 text-primary" />
                        Enregistrement en cours
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    <div className="text-center">
                        <div className="recording-indicator mb-4">
                            <div className="recording-dot"></div>
                            <h5 className="text-danger">ENREGISTREMENT</h5>
                        </div>
                        
                        <div className="recording-time mb-4">
                            <h2 className="text-white">{formatRecordingTime(recordingTime)}</h2>
                            <p className="text-muted">Maximum : 3:00</p>
                        </div>

                        <ProgressBar 
                            now={(recordingTime / 180) * 100} 
                            variant="danger" 
                            className="mb-4"
                            style={{ height: '8px' }}
                        />

                        <Alert variant="info" className="mb-4">
                            <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                            <strong>Conseil :</strong> Restez près du microphone et chantez clairement !
                        </Alert>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="danger" onClick={handleStopRecording}>
                        <FontAwesomeIcon icon={faStopCircle} className="me-2" />
                        Arrêter l'enregistrement
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* =============== PANNEAU AUDIO LIVE =============== */}
            <Card className="bg-dark border-warning mb-3 live-audio-panel">
                <Card.Header className="bg-transparent border-warning">
                    <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                        <FontAwesomeIcon icon={faHeadphones} className="me-2 text-warning" />
                        🎵 Audio Live - Écoutez en temps réel
                        {isLiveAudioEnabled && (
                            <Badge bg="success" className="ms-2 audio-live-badge">
                                <FontAwesomeIcon icon={faVolumeUp} className="me-1" />
                                ACTIF
                            </Badge>
                        )}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        {/* Section Écoute */}
                        <Col md={6}>
                            <div className="audio-control-section">
                                <h6 className="text-light mb-3">
                                    <FontAwesomeIcon icon={faHeadphones} className="me-2 text-info" />
                                    Écouter les performances
                                </h6>
                                <p className="text-muted small mb-3">
                                    Écoutez les participants en temps réel comme un appel audio
                                </p>
                                <div className="d-flex gap-2">
                                    {!isListening ? (
                                        <Button
                                            variant="info"
                                            onClick={startListening}
                                            className="audio-control-btn"
                                        >
                                            <FontAwesomeIcon icon={faHeadphones} className="me-2" />
                                            🎧 Commencer l'écoute
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline-info"
                                            onClick={stopListening}
                                            className="audio-control-btn"
                                        >
                                            <FontAwesomeIcon icon={faStop} className="me-2" />
                                            Arrêter l'écoute
                                        </Button>
                                    )}
                                </div>
                                
                                {isListening && (
                                    <div className="listening-status mt-3">
                                        <div className="d-flex align-items-center text-info">
                                            <div className="audio-pulse me-2"></div>
                                            <small>Écoute active • {remoteStreams.size} participant(s) connecté(s)</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Col>

                        {/* Section Diffusion */}
                        <Col md={6}>
                            <div className="audio-control-section">
                                <h6 className="text-light mb-3">
                                    <FontAwesomeIcon icon={faMicrophone} className="me-2 text-danger" />
                                    Diffuser votre voix
                                </h6>
                                <p className="text-muted small mb-3">
                                    {currentPerformer?.user?.id === user?.id ? 
                                        "C'est votre tour ! Diffusez votre performance en direct" :
                                        "Seul le participant actuel peut diffuser"
                                    }
                                </p>
                                <div className="d-flex gap-2">
                                    {!isBroadcasting ? (
                                        <Button
                                            variant="danger"
                                            onClick={startAudioBroadcast}
                                            disabled={!currentPerformer || currentPerformer.user?.id !== user?.id}
                                            className="audio-control-btn"
                                        >
                                            <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                                            🎤 Diffuser ma voix
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline-danger"
                                            onClick={stopAudioBroadcast}
                                            className="audio-control-btn"
                                        >
                                            <FontAwesomeIcon icon={faStop} className="me-2" />
                                            Arrêter la diffusion
                                        </Button>
                                    )}
                                </div>

                                {isBroadcasting && (
                                    <div className="broadcasting-status mt-3">
                                        <div className="d-flex align-items-center text-danger">
                                            <div className="broadcast-pulse me-2"></div>
                                            <small>Diffusion en cours • {audioConnections.size} auditeur(s)</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Statut des connexions audio */}
                    {(isListening || isBroadcasting) && (
                        <div className="audio-connections-status mt-4 pt-3 border-top border-secondary">
                            <h6 className="text-light mb-3">
                                <FontAwesomeIcon icon={faUsers} className="me-2 text-success" />
                                Connexions Audio ({remoteStreams.size + (isBroadcasting ? 1 : 0)} actives)
                            </h6>
                            <Row className="g-2">
                                {/* Votre diffusion */}
                                {isBroadcasting && (
                                    <Col md={6} lg={4}>
                                        <div className="audio-connection-card broadcasting">
                                            <div className="d-flex align-items-center">
                                                <div className="connection-avatar me-2">
                                                    <FontAwesomeIcon icon={faMicrophone} className="text-danger" />
                                                </div>
                                                <div>
                                                    <div className="connection-name">Vous (diffusion)</div>
                                                    <div className="connection-status">
                                                        <span className="text-danger">🔴 EN DIRECT</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                {/* Connexions distantes */}
                                {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                                    <Col key={userId} md={6} lg={4}>
                                        <div className="audio-connection-card listening">
                                            <div className="d-flex align-items-center">
                                                <div className="connection-avatar me-2">
                                                    <FontAwesomeIcon icon={faHeadphones} className="text-info" />
                                                </div>
                                                <div>
                                                    <div className="connection-name">Participant {userId}</div>
                                                    <div className="connection-status">
                                                        <span className="text-info">🎧 Écoute</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* Mode démo indication */}
                    {isDemoMode && (
                        <Alert variant="warning" className="mt-3 mb-0">
                            <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                            <strong>Mode Démo :</strong> L'audio live est simulé. En mode réel, vous entendrez vraiment les autres participants !
                        </Alert>
                    )}
                </Card.Body>
            </Card>
            {/* =============== FIN PANNEAU AUDIO LIVE =============== */}

            {/* Élément audio caché pour WebRTC */}
            <audio ref={localAudioRef} className="hidden-audio" muted></audio>

            <style jsx>{`
                .live-competition-bg {
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    min-height: 100vh;
                    color: #ffffff;
                }

                .live-header {
                    backdrop-filter: blur(10px);
                    background: rgba(0, 0, 0, 0.8) !important;
                    color: #ffffff;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ffffff;
                }

                .live-dot {
                    width: 12px;
                    height: 12px;
                    background: #dc3545;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                .recording-dot {
                    width: 20px;
                    height: 20px;
                    background: #dc3545;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .performance-stage {
                    background: linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(111, 66, 193, 0.1) 100%) !important;
                    border: 2px solid rgba(13, 110, 253, 0.3) !important;
                    color: #ffffff;
                }

                .performer-spotlight {
                    position: relative;
                    display: inline-block;
                }

                .performer-avatar {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    border: 4px solid #0d6efd;
                    box-shadow: 0 0 30px rgba(13, 110, 253, 0.5);
                    position: relative;
                    z-index: 2;
                }

                .performer-glow {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: radial-gradient(circle, rgba(13, 110, 253, 0.3) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: glow 2s ease-in-out infinite alternate;
                }

                @keyframes glow {
                    from { transform: scale(1); opacity: 0.8; }
                    to { transform: scale(1.1); opacity: 0.4; }
                }

                .reactions-display {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 15px;
                    margin-bottom: 20px;
                    color: #ffffff;
                }

                .reaction-count {
                    display: flex;
                    align-items: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #ffffff;
                }

                .reaction-btn, .vote-btn, .record-btn {
                    transition: all 0.3s ease;
                    border-width: 2px;
                    color: #ffffff;
                }

                .reaction-btn:hover, .vote-btn:hover, .record-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    color: #ffffff;
                }

                .participant-rank-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                    color: #ffffff;
                }

                .participant-rank-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }

                .participant-rank-card.performing {
                    border-color: #198754;
                    background: rgba(25, 135, 84, 0.1);
                    box-shadow: 0 0 20px rgba(25, 135, 84, 0.3);
                }

                .participant-rank-card.podium {
                    border-color: #ffc107;
                    background: rgba(255, 193, 7, 0.1);
                }

                .participant-rank-card.winner {
                    border-color: #ffd700;
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.1));
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
                    animation: winner-glow 2s ease-in-out infinite alternate;
                }

                .participant-rank-card.leader {
                    border-color: #00d4aa;
                    background: rgba(0, 212, 170, 0.1);
                    box-shadow: 0 0 20px rgba(0, 212, 170, 0.3);
                }

                @keyframes winner-glow {
                    from { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
                    to { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
                }

                .rank-position {
                    font-size: 1.2rem;
                    font-weight: bold;
                    min-width: 30px;
                    text-align: center;
                    color: #ffffff;
                }

                .chat-container {
                    height: 500px;
                    display: flex;
                    flex-direction: column;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    max-height: 400px;
                    background: rgba(0, 0, 0, 0.2);
                }

                .chat-message {
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .chat-message.own {
                    background: rgba(13, 110, 253, 0.1);
                    margin: 0 -12px;
                    padding: 8px 12px;
                    border-radius: 4px;
                }

                .chat-username {
                    font-size: 0.9rem;
                    color: #3b82f6;
                }

                .chat-text {
                    font-size: 0.9rem;
                    line-height: 1.4;
                    word-wrap: break-word;
                    color: #ffffff;
                }

                /* Scrollbar personnalisée */
                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(13, 110, 253, 0.5);
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(13, 110, 253, 0.7);
                }

                .admin-control-card {
                    background: linear-gradient(135deg, rgba(13, 110, 253, 0.15) 0%, rgba(111, 66, 193, 0.15) 100%) !important;
                    border: 2px solid rgba(13, 110, 253, 0.4) !important;
                    color: #ffffff;
                }

                .admin-badge {
                    background: rgba(255, 193, 7, 0.2);
                    border: 1px solid rgba(255, 193, 7, 0.4);
                    border-radius: 5px;
                    padding: 4px 8px;
                    font-size: 0.8rem;
                    color: #ffc107;
                    font-weight: bold;
                    display: inline-block;
                }

                .start-competition-btn {
                    transition: all 0.3s ease;
                    border-width: 2px;
                    font-weight: 700;
                    padding: 12px 24px;
                    border-radius: 8px;
                    background: #ffc107;
                    color: #000000;
                    border-color: #ffc107;
                }

                .start-competition-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
                    background: #ffcd39;
                    color: #000000;
                }

                .admin-live-controls {
                    border: 1px solid rgba(255, 193, 7, 0.4) !important;
                    background: rgba(255, 193, 7, 0.08) !important;
                    color: #ffffff;
                }

                .next-participant-btn {
                    transition: all 0.3s ease;
                    font-weight: 600;
                    border-radius: 6px;
                    background: #ffc107;
                    color: #000000;
                    border-color: #ffc107;
                }

                .next-participant-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px rgba(255, 193, 7, 0.3);
                    background: #ffcd39;
                    color: #000000;
                }

                /* Styles pour les résultats et le gagnant */
                .participant-score {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .score-breakdown {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }

                .winner-badge {
                    animation: winner-pulse 1.5s ease-in-out infinite;
                }

                @keyframes winner-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .results-section {
                    text-align: center;
                    padding: 2rem;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 15px;
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    margin: 2rem 0;
                    color: #ffffff;
                }

                .final-winner-display {
                    margin-top: 2rem;
                }

                .winner-spotlight {
                    position: relative;
                    display: inline-block;
                    padding: 2rem;
                    background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 50%, transparent 70%);
                    border-radius: 50%;
                    animation: spotlight-rotate 4s linear infinite;
                }

                @keyframes spotlight-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .winner-crown {
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 2rem;
                    animation: crown-bounce 2s ease-in-out infinite;
                }

                @keyframes crown-bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-10px); }
                }

                .winner-avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 4px solid #ffd700;
                    object-fit: cover;
                    animation: winner-avatar-pulse 2s ease-in-out infinite;
                }

                @keyframes winner-avatar-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
                }

                .winner-name {
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    color: #ffc107;
                }

                .winner-score {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #ffd700;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }

                .winner-confetti {
                    position: absolute;
                    top: -20px;
                    left: -20px;
                    right: -20px;
                    font-size: 1.5rem;
                    animation: confetti-fall 3s ease-in-out infinite;
                }

                @keyframes confetti-fall {
                    0% { transform: translateY(-20px); opacity: 0; }
                    50% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(20px); opacity: 0; }
                }

                .chat-message.system {
                    background: rgba(255, 193, 7, 0.15);
                    border-left: 4px solid #ffc107;
                    margin: 8px -12px;
                    padding: 12px;
                    border-radius: 8px;
                    color: #ffffff;
                }

                .chat-message.winner {
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.1));
                    border: 2px solid #ffd700;
                    margin: 12px -12px;
                    padding: 15px;
                    border-radius: 10px;
                    animation: winner-message-glow 2s ease-in-out infinite alternate;
                    color: #ffffff;
                }

                @keyframes winner-message-glow {
                    from { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
                    to { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
                }

                .winner-text {
                    color: #ffd700 !important;
                    font-weight: bold;
                    font-size: 1.1rem;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .performer-avatar {
                        width: 80px;
                        height: 80px;
                    }

                    .reaction-buttons .d-flex {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .reactions-display .d-flex {
                        flex-wrap: wrap;
                        gap: 15px;
                    }

                    .admin-control-card h4 {
                        font-size: 1.2rem;
                    }

                    .start-competition-btn {
                        font-size: 0.9rem;
                        padding: 10px 20px;
                    }
                }

                /* =============== STYLES AUDIO LIVE =============== */
                .live-audio-panel {
                    border: 2px solid rgba(255, 193, 7, 0.4) !important;
                    background: rgba(255, 193, 7, 0.05) !important;
                }

                .audio-live-badge {
                    animation: audio-pulse 2s ease-in-out infinite;
                }

                @keyframes audio-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }

                .audio-control-section {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    padding: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .audio-control-btn {
                    transition: all 0.3s ease;
                    border-width: 2px;
                    font-weight: 600;
                    border-radius: 6px;
                    min-width: 180px;
                }

                .audio-control-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .audio-pulse {
                    width: 8px;
                    height: 8px;
                    background: #17a2b8;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                .broadcast-pulse {
                    width: 8px;
                    height: 8px;
                    background: #dc3545;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                .audio-connections-status {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    padding: 15px;
                }

                .audio-connection-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    padding: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }

                .audio-connection-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-1px);
                }

                .audio-connection-card.broadcasting {
                    border-color: rgba(220, 53, 69, 0.3);
                    background: rgba(220, 53, 69, 0.1);
                }

                .audio-connection-card.listening {
                    border-color: rgba(23, 162, 184, 0.3);
                    background: rgba(23, 162, 184, 0.1);
                }

                .connection-avatar {
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                }

                .connection-name {
                    font-weight: 600;
                    color: #ffffff;
                    font-size: 0.9rem;
                }

                .connection-status {
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                /* Indication du participant qui parle */
                .participant-rank-card.speaking {
                    border-color: #00ff88 !important;
                    background: rgba(0, 255, 136, 0.15) !important;
                    box-shadow: 0 0 25px rgba(0, 255, 136, 0.4) !important;
                    animation: speaking-pulse 1s ease-in-out infinite;
                }

                @keyframes speaking-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }

                /* Audio caché pour WebRTC */
                .hidden-audio {
                    display: none;
                }

                /* Responsive audio controls */
                @media (max-width: 768px) {
                    .audio-control-btn {
                        min-width: 150px;
                        font-size: 0.9rem;
                        padding: 8px 15px;
                    }

                    .audio-control-section {
                        padding: 12px;
                    }

                    .audio-connections-status {
                        padding: 12px;
                    }

                    .connection-name {
                        font-size: 0.8rem;
                    }

                    .connection-status {
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveCompetition;
