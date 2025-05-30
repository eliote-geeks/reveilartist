import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Badge, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faDownload, faHeart, faMusic, faSearch, faArrowRight, faVolumeUp, faPause, faFire, faStopwatch, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';

const Home = () => {
    const [playingId, setPlayingId] = useState(null);
    const [activeTab, setActiveTab] = useState('populaires');
    const [displayedSounds, setDisplayedSounds] = useState(6);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const audioRef = useRef(null);
    const loadMoreRef = useRef(null);

    // Catégories musicales
    const musicCategories = [
        { name: 'Afrobeat', count: 125 },
        { name: 'Hip-Hop', count: 98 },
        { name: 'Makossa', count: 67 },
        { name: 'Bikutsi', count: 54 },
        { name: 'R&B', count: 89 },
        { name: 'Electronic', count: 43 },
        { name: 'Jazz', count: 32 },
        { name: 'Trap', count: 76 },
        { name: 'Coupé-Décalé', count: 58 }
    ];

    // Sons populaires (les plus écoutés) avec des liens audio de démo
    const popularSounds = [
        {
            id: 1,
            title: "Urban Fire",
            artist: "BeatMaster237",
            duration: "3:24",
            price: 3500,
            category: "Hip-Hop",
            likes: 1245,
            plays: 25400,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Audio de démo
            trending: true
        },
        {
            id: 2,
            title: "Makossa Vibes",
            artist: "CamerBeats",
            duration: "4:12",
            price: 4000,
            category: "Afrobeat",
            likes: 2189,
            plays: 45600,
            cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: true
        },
        {
            id: 3,
            title: "Street Symphony",
            artist: "UrbanSonic",
            duration: "2:58",
            price: 3000,
            category: "Trap",
            likes: 912,
            plays: 18900,
            cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: false
        },
        {
            id: 4,
            title: "Douala Nights",
            artist: "NightBeats",
            duration: "3:45",
            price: 2800,
            category: "R&B",
            likes: 756,
            plays: 12300,
            cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: false
        },
        {
            id: 5,
            title: "Afro Fusion",
            artist: "FusionProd",
            duration: "4:02",
            price: 0, // Gratuit
            category: "Afro-Fusion",
            likes: 1534,
            plays: 28700,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: true
        },
        {
            id: 6,
            title: "Bikutsi Modern",
            artist: "ModernBeats237",
            duration: "3:18",
            price: 2500,
            category: "Bikutsi",
            likes: 823,
            plays: 15600,
            cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: false
        },
        {
            id: 7,
            title: "Jazz Cameroon",
            artist: "SmoothJazz237",
            duration: "4:33",
            price: 0, // Gratuit
            category: "Jazz",
            likes: 667,
            plays: 11200,
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: false
        },
        {
            id: 8,
            title: "Electronic Vibes",
            artist: "TechnoBeats",
            duration: "3:56",
            price: 3200,
            category: "Electronic",
            likes: 889,
            plays: 16800,
            cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            trending: true
        }
    ];

    // Featured sounds (alias pour popularSounds)
    const featuredSounds = popularSounds;

    // Sons récents/disponibles
    const availableSounds = [
        {
            id: 9,
            title: "Fresh Vibes",
            artist: "NewWave237",
            duration: "3:12",
            price: "2 000",
            category: "Chill",
            likes: 245,
            plays: 1400,
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: true
        },
        {
            id: 10,
            title: "City Flow",
            artist: "FlowMaster",
            duration: "2:45",
            price: "1 800",
            category: "House",
            likes: 189,
            plays: 890,
            cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: true
        },
        {
            id: 11,
            title: "Tropical Beat",
            artist: "IslandBeats",
            duration: "3:33",
            price: "2 200",
            category: "Tropical",
            likes: 312,
            plays: 2100,
            cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: false
        },
        {
            id: 12,
            title: "Urban Dreams",
            artist: "DreamProd",
            duration: "4:08",
            price: "2 800",
            category: "Ambient",
            likes: 567,
            plays: 3400,
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: false
        },
        {
            id: 13,
            title: "Bass Drop",
            artist: "ElectroVibes",
            duration: "2:55",
            price: "3 100",
            category: "Electronic",
            likes: 445,
            plays: 2800,
            cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: false
        },
        {
            id: 14,
            title: "Smooth Jazz",
            artist: "JazzCamer",
            duration: "4:22",
            price: "2 600",
            category: "Jazz",
            likes: 298,
            plays: 1900,
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=280&h=160&fit=crop&crop=center",
            audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            isNew: true
        }
    ];

    const getCurrentSounds = () => {
        return activeTab === 'populaires' ? popularSounds : availableSounds;
    };

    const handlePlayPause = (sound) => {
        if (currentPlaying?.id === sound.id && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (currentPlaying?.id !== sound.id) {
                setCurrentPlaying(sound);
                audioRef.current.src = sound.audioUrl;
            }
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleAudioPreview = (id) => {
        const sound = getCurrentSounds().find(s => s.id === id);
        if (!sound) return;

        // Jouer seulement 30 secondes d'aperçu
        setPlayingId(id);
        audioRef.current.src = sound.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);

        // Arrêter après 30 secondes
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
                setPlayingId(null);
            }
        }, 30000);
    };

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setPlayingId(null);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        return duration ? (currentTime / duration) * 100 : 0;
    };

    // Infinite scroll effect
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    loadMoreSounds();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [loading, displayedSounds]);

    const loadMoreSounds = () => {
        const currentSounds = getCurrentSounds();
        if (displayedSounds >= currentSounds.length) return;

        setLoading(true);
        setTimeout(() => {
            setDisplayedSounds(prev => Math.min(prev + 3, currentSounds.length));
            setLoading(false);
        }, 800);
    };

    // Reset displayed sounds when changing tab
    useEffect(() => {
        setDisplayedSounds(6);
    }, [activeTab]);

    return (
        <div className="bg-light min-vh-100">
            {/* Lecteur audio invisible */}
            <audio ref={audioRef} preload="metadata" />

            {/* Hero Section Moderne */}
            <section className="hero-gradient text-white">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <AnimatedElement animation="fadeIn" delay={100}>
                                {/* Logo Section */}
                                <div className="mb-4">
                                    <AnimatedElement animation="bounceIn" delay={300}>
                                    <img
                                        src="/images/reveilart-logo.svg"
                                            alt="reveilart"
                                            style={{ height: '40px' }}
                                            className="mb-3"
                                        />
                                    </AnimatedElement>
                                    <AnimatedElement animation="slideInUp" delay={500}>
                                        <h1 className="display-6 fw-bold text-white mb-3">
                                            Réveillez votre talent artistique
                                        </h1>
                                    </AnimatedElement>
                                    <AnimatedElement animation="slideInUp" delay={600}>
                                        <p className="fs-6 text-white opacity-75">
                                            avec <span className="fw-semibold">reveilart</span>
                                        </p>
                                    </AnimatedElement>
                                </div>

                                {/* Subheading */}
                                <AnimatedElement animation="fadeIn" delay={700}>
                                    <p className="mb-4 opacity-90 text-sm">
                                    Découvrez les sons les plus authentiques du Cameroun
                                </p>
                                </AnimatedElement>

                                {/* Action Buttons */}
                                <AnimatedElement animation="slideInUp" delay={800}>
                                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                                    <Button
                                        variant="warning"
                                            size="sm"
                                            className="px-3 py-2 fw-medium rounded-lg btn-glow"
                                    >
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Explorer maintenant
                                    </Button>
                                    <Button
                                        variant="outline-light"
                                            size="sm"
                                            className="px-3 py-2 fw-medium rounded-lg btn-pulse"
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                                        Rechercher
                                    </Button>
                                    </div>
                                </AnimatedElement>
                            </AnimatedElement>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="section-padding bg-white">
                <Container>
                    <Row className="text-center g-3">
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={200}>
                                <div className="stat-card">
                                    <div className="stat-number">2.5K+</div>
                                    <div className="stat-label">Sons disponibles</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={300}>
                                <div className="stat-card">
                                    <div className="stat-number">400+</div>
                                    <div className="stat-label">Artistes</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={400}>
                                <div className="stat-card">
                                    <div className="stat-number">50+</div>
                                    <div className="stat-label">Événements</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                        <Col md={3} sm={6}>
                            <AnimatedElement animation="scaleIn" delay={500}>
                                <div className="stat-card">
                                    <div className="stat-number">10K+</div>
                                    <div className="stat-label">Utilisateurs</div>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Actions rapides Section */}
            <section className="section-padding">
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={100}>
                                <div className="text-center">
                                    <h2 className="h4 fw-bold mb-2">Partagez votre talent</h2>
                                    <p className="text-secondary text-sm">Ajoutez vos créations sur reveilart</p>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <AnimatedElement animation="slideInLeft" delay={200}>
                                        <Card className="quick-action-card h-100 border-0 shadow-sm">
                                            <Card.Body className="text-center p-4">
                                                <div className="quick-action-icon mb-3">
                                                    <FontAwesomeIcon icon={faMusic} className="fa-2x text-primary" />
                                                </div>
                                                <Card.Title className="h5 mb-2">Ajouter un Son</Card.Title>
                                                <Card.Text className="text-secondary mb-3">
                                                    Partagez vos beats, instrumentales et compositions musicales
                                                </Card.Text>
                                                <Button
                                                    as={Link}
                                                    to="/add-sound"
                                                    variant="primary"
                                                    className="btn-action-quick"
                                                >
                                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                                    Ajouter un son
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                                <Col md={6}>
                                    <AnimatedElement animation="slideInRight" delay={300}>
                                        <Card className="quick-action-card h-100 border-0 shadow-sm">
                                            <Card.Body className="text-center p-4">
                                                <div className="quick-action-icon mb-3">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="fa-2x text-success" />
                                                </div>
                                                <Card.Title className="h5 mb-2">Créer un Événement</Card.Title>
                                                <Card.Text className="text-secondary mb-3">
                                                    Organisez concerts, showcases et événements musicaux
                                                </Card.Text>
                                                <Button
                                                    as={Link}
                                                    to="/add-event"
                                                    variant="success"
                                                    className="btn-action-quick"
                                                >
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                                    Créer un événement
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Section */}
            <section className="section-padding">
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={100}>
                                <div className="text-center">
                                    <h2 className="h4 fw-bold mb-2">Explorez par catégories</h2>
                                    <p className="text-secondary text-sm">Trouvez le son parfait pour votre projet</p>
                                </div>
                            </AnimatedElement>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                {musicCategories.map((category, index) => (
                                    <AnimatedElement key={category.name} animation="bounceIn" delay={200 + (index * 100)}>
                                        <a href={`/catalog?category=${category.name}`} className="category-pill category-pill-animated">
                                            {category.name}
                                            <Badge bg="light" text="dark" className="ms-2 text-xs">
                                                {category.count}
                                            </Badge>
                                        </a>
                                    </AnimatedElement>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Sounds Section */}
            <section className="section-padding bg-white">
                <Container>
                    <Row className="mb-4">
                        <Col md={8}>
                            <AnimatedElement animation="slideInLeft" delay={100}>
                                <h3 className="h5 fw-bold mb-2">Sons populaires</h3>
                                <p className="text-secondary text-sm">Les créations les plus appréciées de la communauté</p>
                            </AnimatedElement>
                        </Col>
                        <Col md={4} className="text-md-end">
                            <AnimatedElement animation="slideInRight" delay={200}>
                                <Button variant="outline-primary" size="sm" className="rounded-lg btn-hover-lift">
                                    Voir tout
                                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                </Button>
                            </AnimatedElement>
                        </Col>
                    </Row>

                    {/* Navigation Pills */}
                    <Row className="mb-3">
                        <Col>
                            <AnimatedElement animation="slideInUp" delay={300}>
                                <Nav variant="pills" className="nav-fill">
                                    {['Populaires', 'Récents', 'Gratuits', 'Premium'].map((tab, index) => (
                                        <Nav.Item key={tab}>
                                            <Nav.Link
                                                active={index === 0}
                                                className="text-sm rounded-lg nav-pill-animated"
                                                onClick={() => {}}
                                            >
                                                {tab}
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </AnimatedElement>
                        </Col>
                    </Row>

                    {/* Sounds Grid */}
                    <Row className="g-3">
                        {featuredSounds.slice(0, 8).map((sound, index) => (
                            <Col key={sound.id} lg={3} md={4} sm={6}>
                                    <AnimatedElement
                                    animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
                                    delay={400 + (index * 150)}
                                >
                                    <Card className="sound-card sound-card-enhanced h-100">
                                        <div className="position-relative">
                                            <Card.Img
                                                variant="top"
                                                src={sound.cover}
                                                alt={sound.title}
                                                className="sound-image"
                                            />
                                            <div className="sound-play-overlay">
                                                <Button
                                                    className="play-button play-button-enhanced"
                                                    onClick={() => handlePlayPause(sound)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={currentPlaying?.id === sound.id && isPlaying ? faPause : faPlay}
                                                    />
                                                </Button>
                                                    </div>
                                            {sound.price === 0 && (
                                                <Badge
                                                    bg="success"
                                                    className="position-absolute top-0 start-0 m-2 text-xs badge-pulse"
                                                >
                                                    Gratuit
                                                </Badge>
                                            )}
                                                        {sound.trending && (
                                                <Badge
                                                    bg="danger"
                                                    className="position-absolute top-0 end-0 m-2 text-xs badge-fire"
                                                >
                                                                <FontAwesomeIcon icon={faFire} className="me-1" />
                                                                Trending
                                                            </Badge>
                                                        )}
                                                </div>

                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="flex-grow-1">
                                                    <Card.Title className="h6 mb-1 text-truncate">
                                                    {sound.title}
                                                    </Card.Title>
                                                    <Card.Text className="small text-muted mb-2">
                                                        par {sound.artist}
                                                    </Card.Text>
                                                </div>
                                                <Badge bg="light" text="dark" className="text-xs badge-category">
                                                    {sound.category}
                                                </Badge>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <small className="text-muted stat-item">
                                                        <FontAwesomeIcon icon={faHeart} className="me-1 text-danger" />
                                                                {sound.likes}
                                                    </small>
                                                    <small className="text-muted stat-item">
                                                        <FontAwesomeIcon icon={faPlay} className="me-1 text-primary" />
                                                        {sound.plays}
                                                        </small>
                                                </div>
                                                <div className="text-end">
                                                    {sound.price > 0 ? (
                                                        <span className="fw-bold text-primary small price-tag">
                                                            {sound.price.toLocaleString()} F
                                                        </span>
                                                    ) : (
                                                        <span className="fw-bold text-success small price-tag">
                                                            Gratuit
                                                        </span>
                                                    )}
                                                </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </AnimatedElement>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            <style jsx>{`
                /* Enhanced animations and effects */
                .btn-glow {
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-glow:hover {
                    box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
                    transform: translateY(-2px);
                }

                .btn-pulse {
                    animation: pulse 2s infinite;
                }

                .btn-hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
                }

                .stat-card {
                    padding: 1rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    background: rgba(139, 92, 246, 0.05);
                    border: 1px solid rgba(139, 92, 246, 0.1);
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(139, 92, 246, 0.1);
                    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
                }

                .category-pill-animated {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    overflow: hidden;
                }

                .category-pill-animated::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }

                .category-pill-animated:hover::before {
                    left: 100%;
                }

                .category-pill-animated:hover {
                    transform: translateY(-3px) scale(1.05);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.25);
                }

                .nav-pill-animated {
                    position: relative;
                    overflow: hidden;
                }

                .nav-pill-animated::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 3px;
                    background: var(--primary-color);
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-pill-animated:hover::after,
                .nav-pill-animated.active::after {
                    width: 80%;
                }

                .sound-card-enhanced {
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform-origin: center;
                    will-change: transform;
                }

                .sound-card-enhanced:hover {
                    transform: translateY(-8px) rotateX(5deg);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
                }

                .play-button-enhanced {
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    position: relative;
                    overflow: hidden;
                }

                .play-button-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(139, 92, 246, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: all 0.3s ease;
                }

                .play-button-enhanced:hover::before {
                    width: 120%;
                    height: 120%;
                }

                .play-button-enhanced:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
                }

                .badge-pulse {
                    animation: badgePulse 2s infinite;
                }

                .badge-fire {
                    animation: fire 1.5s infinite alternate;
                }

                .badge-category {
                    transition: all 0.3s ease;
                }

                .sound-card-enhanced:hover .badge-category {
                    background: var(--primary-color) !important;
                    color: white !important;
                    transform: scale(1.1);
                }

                .stat-item {
                    transition: all 0.3s ease;
                }

                .sound-card-enhanced:hover .stat-item {
                    transform: scale(1.1);
                }

                .price-tag {
                    transition: all 0.3s ease;
                    position: relative;
                }

                .sound-card-enhanced:hover .price-tag {
                    transform: scale(1.15);
                    text-shadow: 0 0 10px currentColor;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                    }
                }

                @keyframes badgePulse {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                    }
                    70% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                    }
                }

                @keyframes fire {
                    0% {
                        transform: scale(1) rotate(-1deg);
                        filter: hue-rotate(0deg);
                    }
                    100% {
                        transform: scale(1.1) rotate(1deg);
                        filter: hue-rotate(10deg);
                    }
                }

                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .sound-card-enhanced:hover {
                        transform: translateY(-4px);
                    }

                    .btn-glow:hover,
                    .btn-hover-lift:hover,
                    .category-pill-animated:hover {
                        transform: translateY(-1px);
                    }

                    .play-button-enhanced:hover {
                        transform: scale(1.1);
                    }

                    .stat-card:hover {
                        transform: translateY(-2px);
                    }
                }

                /* Performance optimizations */
                .sound-card-enhanced,
                .play-button-enhanced,
                .category-pill-animated,
                .stat-card {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }
            `}</style>
        </div>
    );
};

export default Home;
