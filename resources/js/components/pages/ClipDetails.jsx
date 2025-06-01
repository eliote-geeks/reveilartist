import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Tab, Tabs, ListGroup, Form, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay,
    faPause,
    faVolumeMute,
    faVolumeUp,
    faExpand,
    faCompress,
    faArrowLeft,
    faHeart,
    faShare,
    faDownload,
    faEye,
    faThumbsUp,
    faComment,
    faPlus,
    faStar,
    faTrophy,
    faAward,
    faCrown,
    faUser,
    faCalendarAlt,
    faVideo,
    faMusic,
    faTag,
    faFlag,
    faReply,
    faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ClipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [clip, setClip] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [volume, setVolume] = useState(100);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [showShareModal, setShowShareModal] = useState(false);
    const [activeTab, setActiveTab] = useState('comments');
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const toast = useToast();
    const { user, token } = useAuth();

    // Données mockées
    const mockClip = {
        id: 1,
        title: "Cameroun Mon Beau Pays",
        description: "Un clip magnifique célébrant la beauté du Cameroun avec des paysages époustouflants. Cette œuvre artistique combine la musique traditionnelle camerounaise avec des éléments modernes pour créer une expérience audiovisuelle unique qui honore notre patrimoine culturel.",
        artist: "Bella Voix",
        artist_id: 1,
        artist_avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=100&h=100&fit=crop&crop=face",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop",
        video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "3:45",
        views: 1250000,
        likes: 45600,
        comments: 2300,
        shares: 890,
        category: "Afrobeat",
        release_date: "2024-01-15T10:00:00",
        featured: true,
        tags: ["Cameroun", "Patriotique", "Afrobeat", "Culture", "Musique traditionnelle"],
        credits: {
            director: "Jean-Baptiste Nkomo",
            producer: "Productions Makossa",
            cinematographer: "Marie Duval",
            editor: "Paul Essomba"
        },
        related_clips: [
            {
                id: 2,
                title: "Flow de Minuit",
                artist: "MC Thunder",
                thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
                views: 750000,
                duration: "4:12"
            },
            {
                id: 3,
                title: "Makossa Revolution",
                artist: "Papa Makossa",
                thumbnail: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300&h=200&fit=crop",
                views: 380000,
                duration: "5:20"
            }
        ]
    };

    const mockComments = [
        {
            id: 1,
            user: "Fan de musique",
            user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
            content: "Magnifique clip ! Ça me rend fier d'être camerounais 🇨🇲",
            likes: 45,
            replies: 3,
            timestamp: "2024-01-16T10:30:00",
            liked: false
        },
        {
            id: 2,
            user: "Mélomane237",
            user_avatar: "https://images.unsplash.com/photo-1494790108755-2616c3b7b572?w=50&h=50&fit=crop&crop=face",
            content: "La production est exceptionnelle ! Bravo à toute l'équipe 👏",
            likes: 32,
            replies: 1,
            timestamp: "2024-01-16T14:22:00",
            liked: true
        },
        {
            id: 3,
            user: "Artiste en herbe",
            user_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
            content: "Une source d'inspiration pour la nouvelle génération d'artistes camerounais 🎵",
            likes: 28,
            replies: 0,
            timestamp: "2024-01-16T16:45:00",
            liked: false
        }
    ];

    useEffect(() => {
        loadClip();
    }, [id]);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateTime = () => setCurrentTime(video.currentTime);
            const updateDuration = () => setDuration(video.duration);

            video.addEventListener('timeupdate', updateTime);
            video.addEventListener('loadedmetadata', updateDuration);

            return () => {
                video.removeEventListener('timeupdate', updateTime);
                video.removeEventListener('loadedmetadata', updateDuration);
            };
        }
    }, [clip]);

    const loadClip = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setClip(mockClip);
            setLikesCount(mockClip.likes);
        } catch (error) {
            console.error('Erreur lors du chargement du clip:', error);
            if (toast) {
                toast.error('Erreur', 'Clip non trouvé');
            }
            navigate('/clips');
        } finally {
            setLoading(false);
        }
    };

    const getRewardBadge = (views) => {
        if (views >= 1000000) {
            return { type: 'Diamant', icon: faCrown, color: 'primary', bgColor: 'linear-gradient(45deg, #b9f2ff, #00d4ff)' };
        } else if (views >= 500000) {
            return { type: 'Platine', icon: faTrophy, color: 'secondary', bgColor: 'linear-gradient(45deg, #e8e8e8, #c0c0c0)' };
        } else if (views >= 100000) {
            return { type: 'Or', icon: faAward, color: 'warning', bgColor: 'linear-gradient(45deg, #ffd700, #ffed4e)' };
        } else if (views >= 50000) {
            return { type: 'Argent', icon: faStar, color: 'light', bgColor: 'linear-gradient(45deg, #f8f9fa, #e9ecef)' };
        } else if (views >= 10000) {
            return { type: 'Bronze', icon: faTrophy, color: 'warning', bgColor: 'linear-gradient(45deg, #cd7f32, #b8860b)' };
        }
        return null;
    };

    const formatViews = (views) => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume / 100;
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (video && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            video.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (video) {
            if (!isFullscreen) {
                video.requestFullscreen?.() || video.webkitRequestFullscreen?.();
            } else {
                document.exitFullscreen?.() || document.webkitExitFullscreen?.();
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        if (toast) {
            toast.success('', isLiked ? 'Like retiré' : 'Clip liké !');
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const handleDownload = () => {
        if (toast) {
            toast.info('Téléchargement', 'Le téléchargement va commencer...');
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        if (toast) {
            toast.success('Commentaire ajouté', 'Votre commentaire a été publié');
        }
        setNewComment('');
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light avoid-header-overlap d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <h5 className="text-muted">Chargement du clip...</h5>
                </div>
            </div>
        );
    }

    if (!clip) {
        return (
            <Container className="py-5 text-center">
                <h3>Clip non trouvé</h3>
                <Button as={Link} to="/clips" variant="primary">
                    Retour aux clips
                </Button>
            </Container>
        );
    }

    const reward = getRewardBadge(clip.views);

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            <Container className="py-4">
                {/* Navigation */}
                <AnimatedElement animation="slideInLeft" delay={100}>
                    <Button
                        as={Link}
                        to="/clips"
                        variant="outline-primary"
                        className="mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour aux clips
                    </Button>
                </AnimatedElement>

                <Row className="g-4">
                    {/* Lecteur vidéo */}
                    <Col lg={8}>
                        <AnimatedElement animation="slideInLeft" delay={200}>
                            <Card className="border-0 shadow-sm video-card">
                                <div className="video-container">
                                    <video
                                        ref={videoRef}
                                        className="video-player"
                                        poster={clip.thumbnail}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                    >
                                        <source src={clip.video_url} type="video/mp4" />
                                        Votre navigateur ne supporte pas la lecture vidéo.
                                    </video>

                                    {/* Contrôles personnalisés */}
                                    <div className="video-controls">
                                        <div className="progress-bar-container" onClick={handleSeek}>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="controls-bottom">
                                            <div className="controls-left">
                                                <Button
                                                    variant="link"
                                                    className="control-btn"
                                                    onClick={togglePlay}
                                                >
                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                                                </Button>

                                                <Button
                                                    variant="link"
                                                    className="control-btn"
                                                    onClick={toggleMute}
                                                >
                                                    <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
                                                </Button>

                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="volume-slider"
                                                />

                                                <span className="time-display">
                                                    {formatTime(currentTime)} / {formatTime(duration)}
                                                </span>
                                            </div>

                                            <div className="controls-right">
                                                <Button
                                                    variant="link"
                                                    className="control-btn"
                                                    onClick={toggleFullscreen}
                                                >
                                                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </AnimatedElement>

                        {/* Informations du clip */}
                        <AnimatedElement animation="slideInUp" delay={300}>
                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h1 className="h3 fw-bold mb-2">{clip.title}</h1>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Badge bg="light" text="dark">{clip.category}</Badge>
                                                {reward && (
                                                    <Badge
                                                        className="reward-badge-inline"
                                                        style={{ background: reward.bgColor, color: 'white' }}
                                                    >
                                                        <FontAwesomeIcon icon={reward.icon} className="me-1" />
                                                        {reward.type}
                                                    </Badge>
                                                )}
                                                {clip.featured && (
                                                    <Badge bg="danger">
                                                        <FontAwesomeIcon icon={faStar} className="me-1" />
                                                        Populaire
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="clip-stats mb-4">
                                        <Row className="g-3">
                                            <Col xs={6} md={3}>
                                                <div className="stat-item">
                                                    <FontAwesomeIcon icon={faEye} className="stat-icon text-primary" />
                                                    <div>
                                                        <div className="stat-number">{formatViews(clip.views)}</div>
                                                        <div className="stat-label">Vues</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="stat-item">
                                                    <FontAwesomeIcon icon={faThumbsUp} className="stat-icon text-success" />
                                                    <div>
                                                        <div className="stat-number">{formatViews(likesCount)}</div>
                                                        <div className="stat-label">J'aime</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="stat-item">
                                                    <FontAwesomeIcon icon={faComment} className="stat-icon text-info" />
                                                    <div>
                                                        <div className="stat-number">{formatViews(clip.comments)}</div>
                                                        <div className="stat-label">Commentaires</div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <div className="stat-item">
                                                    <FontAwesomeIcon icon={faShare} className="stat-icon text-warning" />
                                                    <div>
                                                        <div className="stat-number">{formatViews(clip.shares)}</div>
                                                        <div className="stat-label">Partages</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="action-buttons mb-4">
                                        <Row className="g-2">
                                            <Col xs={6} md={3}>
                                                <Button
                                                    variant={isLiked ? "success" : "outline-success"}
                                                    className="w-100"
                                                    onClick={handleLike}
                                                >
                                                    <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                                                    {isLiked ? 'Aimé' : 'J\'aime'}
                                                </Button>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Button
                                                    variant="outline-primary"
                                                    className="w-100"
                                                    onClick={handleShare}
                                                >
                                                    <FontAwesomeIcon icon={faShare} className="me-2" />
                                                    Partager
                                                </Button>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Button
                                                    variant="outline-info"
                                                    className="w-100"
                                                    onClick={handleDownload}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                    Télécharger
                                                </Button>
                                            </Col>
                                            <Col xs={6} md={3}>
                                                <Button
                                                    variant="outline-danger"
                                                    className="w-100"
                                                >
                                                    <FontAwesomeIcon icon={faFlag} className="me-2" />
                                                    Signaler
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="description">
                                        <h6 className="fw-bold mb-2">Description</h6>
                                        <p className="text-muted">{clip.description}</p>
                                        <small className="text-secondary">
                                            Publié le {formatDate(clip.release_date)}
                                        </small>
                                    </div>

                                    {clip.tags && clip.tags.length > 0 && (
                                        <div className="mt-3">
                                            <h6 className="fw-bold mb-2">Tags</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {clip.tags.map((tag, index) => (
                                                    <Badge key={index} bg="light" text="dark" className="tag-badge">
                                                        <FontAwesomeIcon icon={faTag} className="me-1" />
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </AnimatedElement>

                        {/* Onglets (Commentaires, Crédits) */}
                        <AnimatedElement animation="slideInUp" delay={400}>
                            <Card className="border-0 shadow-sm mt-4">
                                <Card.Body>
                                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                        <Tab
                                            eventKey="comments"
                                            title={
                                                <span>
                                                    <FontAwesomeIcon icon={faComment} className="me-2" />
                                                    Commentaires ({mockComments.length})
                                                </span>
                                            }
                                        >
                                            {token ? (
                                                <div className="mb-4">
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Ajouter un commentaire</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            placeholder="Partagez votre avis sur ce clip..."
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    <div className="d-flex justify-content-end mt-2">
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleAddComment}
                                                            disabled={!newComment.trim()}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                            Publier
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info mb-4">
                                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                                    Connectez-vous pour laisser un commentaire
                                                </div>
                                            )}

                                            <div className="comments-list">
                                                {mockComments.map((comment) => (
                                                    <div key={comment.id} className="comment-item">
                                                        <div className="d-flex">
                                                            <img
                                                                src={comment.user_avatar}
                                                                alt={comment.user}
                                                                className="comment-avatar me-3"
                                                            />
                                                            <div className="flex-grow-1">
                                                                <div className="comment-header">
                                                                    <span className="fw-bold">{comment.user}</span>
                                                                    <small className="text-muted ms-2">
                                                                        {formatDate(comment.timestamp)}
                                                                    </small>
                                                                </div>
                                                                <p className="comment-content mb-2">{comment.content}</p>
                                                                <div className="comment-actions">
                                                                    <Button variant="link" size="sm" className="p-0 me-3">
                                                                        <FontAwesomeIcon
                                                                            icon={faThumbsUp}
                                                                            className={comment.liked ? "text-primary" : "text-muted"}
                                                                        />
                                                                        <span className="ms-1">{comment.likes}</span>
                                                                    </Button>
                                                                    <Button variant="link" size="sm" className="p-0 me-3">
                                                                        <FontAwesomeIcon icon={faReply} className="text-muted" />
                                                                        <span className="ms-1">Répondre</span>
                                                                    </Button>
                                                                    {comment.replies > 0 && (
                                                                        <Button variant="link" size="sm" className="p-0">
                                                                            <span className="text-primary">{comment.replies} réponse{comment.replies > 1 ? 's' : ''}</span>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Tab>

                                        <Tab
                                            eventKey="credits"
                                            title={
                                                <span>
                                                    <FontAwesomeIcon icon={faVideo} className="me-2" />
                                                    Crédits
                                                </span>
                                            }
                                        >
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <div className="credit-item">
                                                        <strong>Réalisateur :</strong>
                                                        <span className="ms-2">{clip.credits.director}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="credit-item">
                                                        <strong>Producteur :</strong>
                                                        <span className="ms-2">{clip.credits.producer}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="credit-item">
                                                        <strong>Directeur photo :</strong>
                                                        <span className="ms-2">{clip.credits.cinematographer}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="credit-item">
                                                        <strong>Monteur :</strong>
                                                        <span className="ms-2">{clip.credits.editor}</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Tab>
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>

                    {/* Sidebar */}
                    <Col lg={4}>
                        {/* Artiste */}
                        <AnimatedElement animation="slideInRight" delay={200}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Body className="text-center">
                                    <img
                                        src={clip.artist_avatar}
                                        alt={clip.artist}
                                        className="artist-avatar mb-3"
                                    />
                                    <h5 className="fw-bold">{clip.artist}</h5>
                                    <p className="text-muted small mb-3">Artiste musical</p>
                                    <div className="d-grid gap-2">
                                        <Button
                                            as={Link}
                                            to={`/artists/${clip.artist_id}`}
                                            variant="primary"
                                        >
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Voir le profil
                                        </Button>
                                        <Button variant="outline-primary">
                                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                                            Suivre
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>

                        {/* Clips similaires */}
                        <AnimatedElement animation="slideInRight" delay={300}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0">
                                    <h6 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faVideo} className="me-2 text-primary" />
                                        Clips similaires
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {clip.related_clips.map((relatedClip) => (
                                        <div key={relatedClip.id} className="related-clip-item">
                                            <Link to={`/clips/${relatedClip.id}`} className="text-decoration-none">
                                                <Row className="g-0">
                                                    <Col xs={4}>
                                                        <div className="related-thumbnail-container">
                                                            <img
                                                                src={relatedClip.thumbnail}
                                                                alt={relatedClip.title}
                                                                className="related-thumbnail"
                                                            />
                                                            <div className="related-duration">{relatedClip.duration}</div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={8}>
                                                        <div className="p-3">
                                                            <h6 className="mb-1 line-clamp-2">{relatedClip.title}</h6>
                                                            <small className="text-primary fw-bold">{relatedClip.artist}</small>
                                                            <div className="text-muted small">
                                                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                                                {formatViews(relatedClip.views)} vues
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Link>
                                        </div>
                                    ))}
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>
                </Row>
            </Container>

            {/* Modal de partage */}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faShare} className="me-2 text-primary" />
                        Partager le clip
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <img src={clip.thumbnail} alt={clip.title} className="img-fluid rounded mb-3" style={{ maxHeight: '200px' }} />
                        <h6 className="fw-bold">{clip.title}</h6>
                        <small className="text-muted">par {clip.artist}</small>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Lien du clip</Form.Label>
                        <Form.Control
                            type="text"
                            value={`${window.location.origin}/clips/${clip.id}`}
                            readOnly
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant="primary">Partager sur Facebook</Button>
                        <Button variant="info">Partager sur Twitter</Button>
                        <Button variant="success">Partager sur WhatsApp</Button>
                        <Button variant="outline-secondary">Copier le lien</Button>
                    </div>
                </Modal.Body>
            </Modal>

            <style jsx>{`
                .video-card {
                    overflow: hidden;
                }

                .video-container {
                    position: relative;
                    background: #000;
                }

                .video-player {
                    width: 100%;
                    height: auto;
                    max-height: 500px;
                    display: block;
                }

                .video-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    color: white;
                    padding: 20px 15px 15px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .video-container:hover .video-controls {
                    opacity: 1;
                }

                .progress-bar-container {
                    margin-bottom: 10px;
                    cursor: pointer;
                }

                .progress-bar {
                    height: 4px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #667eea;
                    transition: width 0.1s ease;
                }

                .controls-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .controls-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .control-btn {
                    color: white !important;
                    padding: 5px 10px;
                    font-size: 1.1rem;
                }

                .control-btn:hover {
                    color: #667eea !important;
                }

                .volume-slider {
                    width: 80px;
                }

                .time-display {
                    font-size: 0.9rem;
                    min-width: 80px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-icon {
                    font-size: 1.5rem;
                }

                .stat-number {
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .stat-label {
                    color: #6c757d;
                    font-size: 0.85rem;
                }

                .reward-badge-inline {
                    border: 2px solid white;
                    font-weight: bold;
                }

                .tag-badge {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .tag-badge:hover {
                    background: #667eea !important;
                    color: white !important;
                }

                .comment-item {
                    padding: 20px 0;
                    border-bottom: 1px solid #e9ecef;
                }

                .comment-item:last-child {
                    border-bottom: none;
                }

                .comment-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .comment-content {
                    line-height: 1.5;
                }

                .comment-actions {
                    display: flex;
                    align-items: center;
                }

                .artist-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .related-clip-item {
                    border-bottom: 1px solid #e9ecef;
                    transition: background 0.2s ease;
                }

                .related-clip-item:hover {
                    background: #f8f9fa;
                }

                .related-clip-item:last-child {
                    border-bottom: none;
                }

                .related-thumbnail-container {
                    position: relative;
                    aspect-ratio: 16/9;
                    overflow: hidden;
                }

                .related-thumbnail {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .related-duration {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                }

                .credit-item {
                    padding: 10px 0;
                    border-bottom: 1px solid #e9ecef;
                }

                .credit-item:last-child {
                    border-bottom: none;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .video-player {
                        max-height: 300px;
                    }

                    .controls-left {
                        gap: 8px;
                    }

                    .volume-slider {
                        width: 60px;
                    }

                    .time-display {
                        font-size: 0.8rem;
                        min-width: 70px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ClipDetails;
