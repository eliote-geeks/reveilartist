import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMusic, faUsers, faHeart, faGlobe, faLightbulb, faHandshake,
    faShield, faStar, faPlay, faHeadphones, faMicrophone,
    faGuitar, faDrum, faCompactDisc, faAward, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const About = () => {
    const teamMembers = [
        {
            name: "Alexandre Kouma",
            role: "Fondateur & CEO",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            description: "Passionné de musique et d'innovation, Alexandre a créé Reveilart4artist pour démocratiser l'accès à la création musicale au Cameroun."
        },
        {
            name: "Marie Nkoa",
            role: "Directrice Artistique",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
            description: "Avec plus de 10 ans d'expérience dans l'industrie musicale, Marie guide notre vision artistique et supervise la qualité des contenus."
        },
        {
            name: "David Mballa",
            role: "CTO",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            description: "Expert en technologie et développement, David assure la robustesse et l'innovation de notre plateforme technologique."
        },
        {
            name: "Sarah Biya",
            role: "Community Manager",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            description: "Sarah anime notre communauté d'artistes et veille à créer un environnement bienveillant pour tous nos utilisateurs."
        }
    ];

    const values = [
        {
            icon: faMusic,
            title: "Passion Musicale",
            description: "La musique est au cœur de tout ce que nous faisons. Nous croyons au pouvoir transformateur de la musique pour unir et inspirer."
        },
        {
            icon: faUsers,
            title: "Communauté",
            description: "Nous bâtissons une communauté inclusive où chaque artiste, producteur et mélomane peut s'épanouir et grandir ensemble."
        },
        {
            icon: faLightbulb,
            title: "Innovation",
            description: "Nous innovons constamment pour offrir les meilleures technologies et fonctionnalités à notre communauté musicale."
        },
        {
            icon: faHandshake,
            title: "Collaboration",
            description: "Nous facilitons la collaboration entre artistes et créons des opportunités de networking dans l'industrie musicale."
        },
        {
            icon: faShield,
            title: "Intégrité",
            description: "Nous protégeons les droits des artistes et garantissons une rémunération équitable pour leur travail créatif."
        },
        {
            icon: faGlobe,
            title: "Rayonnement",
            description: "Nous aidons les artistes camerounais à faire rayonner leur talent au-delà des frontières nationales."
        }
    ];

    const milestones = [
        {
            year: "2023",
            title: "Lancement de Reveilart4artist",
            description: "Création de la plateforme avec les premières fonctionnalités de partage et vente de sons."
        },
        {
            year: "2023",
            title: "1000 Premiers Artistes",
            description: "Atteinte du premier millier d'artistes inscrits sur la plateforme."
        },
        {
            year: "2024",
            title: "Système d'Événements",
            description: "Lancement du système de gestion et billetterie d'événements musicaux."
        },
        {
            year: "2024",
            title: "Expansion Régionale",
            description: "Ouverture aux artistes de toute l'Afrique Centrale avec support multilingue."
        }
    ];

    const stats = [
        { number: "1,500+", label: "Artistes actifs", icon: faUsers },
        { number: "5,000+", label: "Sons disponibles", icon: faMusic },
        { number: "10,000+", label: "Téléchargements", icon: faPlay },
        { number: "50+", label: "Événements organisés", icon: faCalendarAlt }
    ];

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Hero Section */}
            <section className="hero-about py-5 bg-gradient" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <Container>
                    <Row className="align-items-center min-vh-50">
                        <Col lg={6}>
                            <h1 className="display-4 fw-bold mb-4 text-dark">
                                Réveillez votre talent musical
                            </h1>
                            <p className="lead mb-4 text-dark">
                                Reveilart4artist est la première plateforme musicale camerounaise dédiée aux artistes,
                                producteurs et mélomanes. Nous démocratisons l'accès à la création musicale et
                                révolutionnons l'industrie musicale en Afrique.
                            </p>
                            <div className="d-flex gap-3">
                                <Button as={Link} to="/register" variant="outline-dark" size="lg">
                                    Rejoindre la communauté
                                </Button>
                                <Button as={Link} to="/catalog" variant="outline-dark" size="lg">
                                    Explorer les sons
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="text-center">
                            <div className="position-relative">
                                <img
                                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop"
                                    alt="Musique"
                                    className="img-fluid rounded-3 shadow-lg"
                                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                                />
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <Button variant="light" className="rounded-circle p-3 shadow">
                                        <FontAwesomeIcon icon={faPlay} size="2x" className="text-primary" />
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Mission Section */}
            <section className="py-5">
            <Container>
                    <Row className="justify-content-center text-center mb-5">
                        <Col lg={8}>
                            <h2 className="fw-bold mb-4">Notre Mission</h2>
                            <p className="lead text-muted">
                                Créer un écosystème musical dynamique où les artistes camerounais peuvent créer,
                                partager, vendre leur musique et organiser des événements tout en développant
                                une communauté passionnée de mélomanes.
                            </p>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        <Col md={4} className="text-center">
                            <div className="mission-card p-4">
                                <FontAwesomeIcon icon={faMicrophone} size="3x" className="text-primary mb-3" />
                                <h4 className="fw-bold mb-3">Pour les Artistes</h4>
                                <p className="text-muted">
                                    Donnez vie à vos créations musicales avec nos outils professionnels.
                                    Vendez vos sons, organisez vos concerts et développez votre fanbase.
                                </p>
                            </div>
                        </Col>
                        <Col md={4} className="text-center">
                            <div className="mission-card p-4">
                                <FontAwesomeIcon icon={faHeadphones} size="3x" className="text-success mb-3" />
                                <h4 className="fw-bold mb-3">Pour les Mélomanes</h4>
                                <p className="text-muted">
                                    Découvrez des talents émergents, achetez des sons uniques et participez
                                    aux événements musicaux les plus excitants du Cameroun.
                                </p>
                            </div>
                        </Col>
                        <Col md={4} className="text-center">
                            <div className="mission-card p-4">
                                <FontAwesomeIcon icon={faCompactDisc} size="3x" className="text-warning mb-3" />
                                <h4 className="fw-bold mb-3">Pour l'Industrie</h4>
                                <p className="text-muted">
                                    Nous structurons l'industrie musicale camerounaise en créant des
                                    opportunités durables et équitables pour tous les acteurs.
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Statistiques */}
            <section className="py-5 bg-white">
                <Container>
                    <Row className="text-center">
                        {stats.map((stat, index) => (
                            <Col md={3} key={index} className="mb-4">
                                <div className="stat-item">
                                    <FontAwesomeIcon icon={stat.icon} size="2x" className="text-primary mb-3" />
                                    <h3 className="fw-bold text-primary">{stat.number}</h3>
                                    <p className="text-muted">{stat.label}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Nos Valeurs */}
            <section className="py-5">
                <Container>
                    <Row className="justify-content-center text-center mb-5">
                        <Col lg={8}>
                            <h2 className="fw-bold mb-4">Nos Valeurs</h2>
                            <p className="lead text-muted">
                                Ces valeurs guident chacune de nos décisions et façonnent l'expérience
                                que nous offrons à notre communauté.
                            </p>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        {values.map((value, index) => (
                            <Col md={6} lg={4} key={index}>
                                <Card className="border-0 shadow-sm h-100 hover-card">
                                    <Card.Body className="p-4 text-center">
                                        <div className="value-icon mb-3">
                                            <FontAwesomeIcon icon={value.icon} size="2x" className="text-primary" />
                                        </div>
                                        <h5 className="fw-bold mb-3">{value.title}</h5>
                                        <p className="text-muted">{value.description}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Notre Histoire */}
            <section className="py-5 bg-white">
                <Container>
                    <Row className="justify-content-center text-center mb-5">
                        <Col lg={8}>
                            <h2 className="fw-bold mb-4">Notre Histoire</h2>
                            <p className="lead text-muted">
                                De l'idée à la réalisation, découvrez les étapes clés qui ont marqué
                                l'évolution de Reveilart4artist.
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={8} className="mx-auto">
                            <div className="timeline">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker">
                                            <div className="timeline-dot"></div>
                                        </div>
                                        <div className="timeline-content">
                                            <Badge bg="primary" className="mb-2">{milestone.year}</Badge>
                                            <h5 className="fw-bold">{milestone.title}</h5>
                                            <p className="text-muted">{milestone.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Notre Équipe */}
            <section className="py-5">
                <Container>
                    <Row className="justify-content-center text-center mb-5">
                        <Col lg={8}>
                            <h2 className="fw-bold mb-4">Notre Équipe</h2>
                            <p className="lead text-muted">
                                Rencontrez les personnes passionnées qui travaillent chaque jour pour
                                faire de Reveilart4artist la meilleure plateforme musicale d'Afrique.
                            </p>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        {teamMembers.map((member, index) => (
                            <Col md={6} lg={3} key={index}>
                                <Card className="border-0 shadow-sm text-center team-card">
                                    <Card.Body className="p-4">
                                        <div className="team-avatar mb-3">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="rounded-circle"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <h5 className="fw-bold mb-1">{member.name}</h5>
                                        <p className="text-primary mb-3">{member.role}</p>
                                        <p className="text-muted small">{member.description}</p>
                            </Card.Body>
                        </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Call to Action */}
            <section className="py-5 bg-primary text-white">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h3 className="fw-bold mb-3">Prêt à révéler votre talent ?</h3>
                            <p className="lead mb-0">
                                Rejoignez des milliers d'artistes qui font déjà confiance à Reveilart4artist
                                pour développer leur carrière musicale.
                            </p>
                        </Col>
                        <Col lg={4} className="text-end">
                            <div className="d-grid gap-2 d-lg-flex justify-content-lg-end">
                                <Button as={Link} to="/register" variant="light" size="lg">
                                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                                    Rejoindre maintenant
                                </Button>
                            </div>
                    </Col>
                </Row>
            </Container>
            </section>

            <style jsx>{`
                .hero-about {
                    min-height: 60vh;
                }

                .mission-card {
                    transition: transform 0.3s ease;
                }

                .mission-card:hover {
                    transform: translateY(-5px);
                }

                .hover-card {
                    transition: all 0.3s ease;
                }

                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
                }

                .value-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(102, 126, 234, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                }

                .timeline {
                    position: relative;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 30px;
                    width: 2px;
                    height: 100%;
                    background: #e9ecef;
                }

                .timeline-item {
                    position: relative;
                    padding-left: 80px;
                    margin-bottom: 50px;
                }

                .timeline-marker {
                    position: absolute;
                    left: 0;
                    top: 0;
                }

                .timeline-dot {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #667eea;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .timeline-dot::before {
                    content: '';
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                }

                .team-card {
                    transition: all 0.3s ease;
                }

                .team-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important;
                }

                .team-avatar {
                    position: relative;
                }

                .team-avatar::after {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border: 2px solid rgba(102, 126, 234, 0.2);
                    border-radius: 50%;
                }

                .stat-item {
                    padding: 20px;
                    transition: transform 0.3s ease;
                }

                .stat-item:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default About;
