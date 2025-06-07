import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, InputGroup, ProgressBar, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../common/LoadingScreen';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const LiveCompetition = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [competition, setCompetition] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [currentPerformer, setCurrentPerformer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [votes, setVotes] = useState({});
    const [viewers, setViewers] = useState(157);
    const [phase, setPhase] = useState('registration'); // registration, performance, voting, results

    const toast = useToast();
    const { user, token } = useAuth();

    // Données mockées étendues
    const mockCompetition = {
        id: 1,
        title: "Battle de Rap Camerounais",
        artist: "MC Thunder",
        artist_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face",
        category: "Rap",
        entry_fee: 5000,
        prize_pool: 150000,
        max_participants: 20,
        current_participants: 15,
        status: "active",
        start_time: "2024-01-20T20:00:00",
        end_time: "2024-01-20T22:00:00",
        duration: 120,
        participants: [
            {
                id: 1,
                name: "Rap Master CM",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
                performance_order: 1,
                performance_title: "Cameroun Mon Pays",
                status: "completed",
                votes: 245,
                score: 87
            },
            {
                id: 2,
                name: "Flow Princess",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=50&h=50&fit=crop&crop=face",
                performance_order: 2,
                performance_title: "Queen of the Flow",
                status: "performing",
                votes: 189,
                score: 0
            },
            {
                id: 3,
                name: "Freestyle King",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
                performance_order: 3,
                performance_title: "Impro de Folie",
                status: "waiting",
                votes: 0,
                score: 0
            }
        ]
    };

    const mockChatMessages = [
        { id: 1, user: "Mélomane237", message: "Incroyable performance ! 🔥", timestamp: new Date(Date.now() - 30000) },
        { id: 2, user: "RapFan", message: "Le flow est impressionnant", timestamp: new Date(Date.now() - 25000) },
        { id: 3, user: "MusicLover", message: "Allez Flow Princess ! 💪", timestamp: new Date(Date.now() - 20000) },
        { id: 4, user: "Beatmaker", message: "La technique est au top niveau", timestamp: new Date(Date.now() - 15000) },
        { id: 5, user: "FanCM", message: "Représente le Cameroun ! 🇨🇲", timestamp: new Date(Date.now() - 10000) }
    ];

    useEffect(() => {
        loadCompetition();
        setChatMessages(mockChatMessages);
    }, [id]);

    useEffect(() => {
        // Timer en temps réel
        const timer = setInterval(() => {
            updateTimeLeft();
            // Simuler l'augmentation du nombre de viewers
            setViewers(prev => prev + Math.floor(Math.random() * 3));
        }, 1000);

        return () => clearInterval(timer);
    }, [competition]);

    useEffect(() => {
        // Simuler les messages du chat en temps réel
        const chatTimer = setInterval(() => {
            if (Math.random() > 0.7) { // 30% de chance d'avoir un nouveau message
                addRandomChatMessage();
            }
        }, 5000);

        return () => clearInterval(chatTimer);
    }, []);

    const loadCompetition = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCompetition(mockCompetition);
            setCurrentPerformer(mockCompetition.participants.find(p => p.status === 'performing'));
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            toast.error('Erreur', 'Compétition non trouvée');
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const updateTimeLeft = () => {
        if (!competition) return;

        const now = new Date();
        const end = new Date(competition.end_time);
        const diff = end - now;

        if (diff <= 0) {
            setTimeLeft('Terminé');
            setPhase('results');
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const addRandomChatMessage = () => {
        const randomUsers = ["MusicFan", "RapLover", "Beatmaster", "FlowExpert", "CamerounPride"];
        const randomMessages = [
            "Excellente performance ! 🎵",
            "Le niveau est incroyable ce soir",
            "Bravo à tous les participants ! 👏",
            "La compétition est serrée !",
            "Cameroun représente ! 🇨🇲",
            "Le flow est parfait ! 🔥",
            "Qui va gagner selon vous ?",
            "Performance de haut niveau ! ⭐"
        ];

        const newMsg = {
            id: Date.now(),
            user: randomUsers[Math.floor(Math.random() * randomUsers.length)],
            message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev.slice(-20), newMsg]); // Garder seulement les 20 derniers messages
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        const message = {
            id: Date.now(),
            user: user?.name || 'Anonyme',
            message: newMessage,
            timestamp: new Date(),
            isOwn: true
        };

        setChatMessages(prev => [...prev.slice(-20), message]);
        setNewMessage('');
    };

    const handleVote = (participantId, voteType) => {
        if (!token) {
            toast.warning('Connexion requise', 'Vous devez être connecté pour voter');
            return;
        }

        setVotes(prev => ({
            ...prev,
            [participantId]: voteType
        }));

        toast.success('Vote enregistré', `Votre vote a été pris en compte !`);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getPhaseDisplay = () => {
        switch (phase) {
            case 'registration':
                return { text: 'Inscriptions', color: 'primary', icon: faClock };
            case 'performance':
                return { text: 'Performances', color: 'success', icon: faMicrophone };
            case 'voting':
                return { text: 'Votes', color: 'warning', icon: faThumbsUp };
            case 'results':
                return { text: 'Résultats', color: 'info', icon: faTrophy };
            default:
                return { text: 'En cours', color: 'secondary', icon: faPlay };
        }
    };

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
                                </div>

                                <div>
                                    <h5 className="mb-0 fw-bold">{competition.title}</h5>
                                    <small className="text-light">par {competition.artist}</small>
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
                            {/* Lecteur/Scène principale */}
                            <Card className="bg-dark border-secondary mb-3 performance-stage">
                                <Card.Body className="p-4">
                                    {currentPerformer ? (
                                        <div className="text-center">
                                            <div className="performer-spotlight mb-4">
                                                <img
                                                    src={currentPerformer.avatar}
                                                    alt={currentPerformer.name}
                                                    className="rounded-circle performer-avatar"
                                                />
                                                <div className="performer-glow"></div>
                                            </div>

                                            <h3 className="text-white fw-bold mb-2">{currentPerformer.name}</h3>
                                            <h5 className="text-primary mb-3">{currentPerformer.performance_title}</h5>

                                            <div className="performance-controls mb-4">
                                                <Button
                                                    variant={isPlaying ? "outline-warning" : "outline-success"}
                                                    size="lg"
                                                    className="me-3"
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                >
                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="me-2" />
                                                    {isPlaying ? 'Pause' : 'Écouter'}
                                                </Button>

                                                <Button
                                                    variant="outline-light"
                                                    size="lg"
                                                    onClick={() => setIsMuted(!isMuted)}
                                                >
                                                    <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                                                </Button>
                                            </div>

                                            {/* Votes en temps réel */}
                                            <div className="vote-section">
                                                <h6 className="text-light mb-3">Votez pour cette performance :</h6>
                                                <div className="d-flex justify-content-center gap-3">
                                                    <Button
                                                        variant={votes[currentPerformer.id] === 'up' ? "success" : "outline-success"}
                                                        size="lg"
                                                        onClick={() => handleVote(currentPerformer.id, 'up')}
                                                        className="vote-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                                                        J'adore ({currentPerformer.votes})
                                                    </Button>
                                                    <Button
                                                        variant={votes[currentPerformer.id] === 'down' ? "danger" : "outline-danger"}
                                                        size="lg"
                                                        onClick={() => handleVote(currentPerformer.id, 'down')}
                                                        className="vote-btn"
                                                    >
                                                        <FontAwesomeIcon icon={faThumbsDown} className="me-2" />
                                                        Bof
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faMicrophone} size="3x" className="text-muted mb-3" />
                                            <h4 className="text-light">En attente du prochain participant...</h4>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Classement en temps réel */}
                            <Card className="bg-dark border-secondary">
                                <Card.Header className="bg-transparent border-secondary">
                                    <h5 className="mb-0 text-white fw-bold">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                        Classement en temps réel
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-2">
                                        {competition.participants
                                            .sort((a, b) => b.votes - a.votes)
                                            .map((participant, index) => (
                                                <Col key={participant.id} md={4}>
                                                    <div className={`participant-rank-card ${participant.status === 'performing' ? 'performing' : ''} ${index < 3 ? 'podium' : ''}`}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="rank-position me-3">
                                                                {index === 0 && <FontAwesomeIcon icon={faCrown} className="text-warning" />}
                                                                {index === 1 && <span className="text-light">🥈</span>}
                                                                {index === 2 && <span className="text-light">🥉</span>}
                                                                {index > 2 && <span className="text-muted">#{index + 1}</span>}
                                                            </div>
                                                            <img
                                                                src={participant.avatar}
                                                                alt={participant.name}
                                                                className="rounded-circle me-2"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-grow-1">
                                                                <div className="fw-bold text-white">{participant.name}</div>
                                                                <small className="text-muted">{participant.votes} votes</small>
                                                            </div>
                                                            {participant.status === 'performing' && (
                                                                <Badge bg="success" className="ms-2">
                                                                    <FontAwesomeIcon icon={faMicrophone} className="me-1" />
                                                                    LIVE
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                    </Row>
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
                                        Cagnotte : {formatCurrency(competition.prize_pool)}
                                    </h6>
                                </Card.Header>
                                <Card.Body className="py-2">
                                    <div className="d-flex justify-content-between text-light small">
                                        <span>Participants:</span>
                                        <span>{competition.current_participants}/{competition.max_participants}</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-light small">
                                        <span>Spectateurs:</span>
                                        <span>{viewers.toLocaleString()}</span>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Chat en direct */}
                            <Card className="bg-dark border-secondary chat-container">
                                <Card.Header className="bg-transparent border-secondary">
                                    <h6 className="mb-0 text-white fw-bold">
                                        <FontAwesomeIcon icon={faComment} className="me-2 text-primary" />
                                        Chat en direct
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="chat-messages">
                                        {chatMessages.map((msg) => (
                                            <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own' : ''}`}>
                                                <div className="d-flex align-items-start">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <span className="chat-username fw-bold text-primary">{msg.user}</span>
                                                            <small className="text-muted ms-2">{formatTime(msg.timestamp)}</small>
                                                        </div>
                                                        <div className="chat-text text-light">{msg.message}</div>
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

            <style jsx>{`
                .live-competition-bg {
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                    min-height: 100vh;
                }

                .live-header {
                    backdrop-filter: blur(10px);
                    background: rgba(0, 0, 0, 0.8) !important;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .live-dot {
                    width: 12px;
                    height: 12px;
                    background: #dc3545;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .performance-stage {
                    background: linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(111, 66, 193, 0.1) 100%) !important;
                    border: 2px solid rgba(13, 110, 253, 0.3) !important;
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

                .vote-btn {
                    transition: all 0.3s ease;
                    border-width: 2px;
                }

                .vote-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .participant-rank-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
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

                .rank-position {
                    font-size: 1.2rem;
                    font-weight: bold;
                    min-width: 30px;
                    text-align: center;
                }

                .chat-container {
                    height: 500px;
                    display: flex;
                    flex-direction: column;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    max-height: 400px;
                }

                .chat-message {
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chat-message.own {
                    background: rgba(13, 110, 253, 0.1);
                    margin: 0 -12px;
                    padding: 8px 12px;
                    border-radius: 4px;
                }

                .chat-username {
                    font-size: 0.9rem;
                }

                .chat-text {
                    font-size: 0.9rem;
                    line-height: 1.4;
                    word-wrap: break-word;
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

                /* Responsive */
                @media (max-width: 768px) {
                    .performer-avatar {
                        width: 80px;
                        height: 80px;
                    }

                    .performance-controls {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                    }

                    .vote-section .d-flex {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveCompetition;
