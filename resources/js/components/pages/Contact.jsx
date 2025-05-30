import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faClock,
    faGlobe,
    faComment,
    faShare,
    faHeart,
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulation d'envoi
        setTimeout(() => {
            setShowAlert(true);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
            setLoading(false);

            // Masquer l'alerte après 5 secondes
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        }, 1500);
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Hero Section */}
            <section className="hero-gradient text-white py-4">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10} className="text-center">
                            <div className="slide-in">
                                <div className="mb-3">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="float-animation text-white"
                                        style={{ fontSize: '2.5rem', opacity: 0.9 }}
                                    />
                                </div>
                                <h1 className="mb-3 fw-bold text-white">
                                    Contactez
                                    <br className="d-md-none" />
                                    <span className="text-gradient-light"> RéveilArt</span>
                                </h1>
                                <p className="mb-0 opacity-90 fs-6">
                                    Nous sommes là pour vous aider avec vos questions
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact Section */}
            <section className="py-5">
                <Container>
                    <Row className="g-4">
                        {/* Informations de contact */}
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4">Nos Coordonnées</h5>

                                    <div className="mb-4">
                                        <div className="d-flex align-items-start mb-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'var(--primary-orange)',
                                                    color: 'white'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Adresse</h6>
                                                <p className="text-muted mb-0 small">
                                                    Quartier Bonapriso,<br />
                                                    Douala, Cameroun
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start mb-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'var(--primary-green)',
                                                    color: 'white'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPhone} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Téléphone</h6>
                                                <p className="text-muted mb-0 small">
                                                    +237 6 XX XX XX XX<br />
                                                    +237 2 XX XX XX XX
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start mb-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'var(--primary-purple)',
                                                    color: 'white'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Email</h6>
                                                <p className="text-muted mb-0 small">
                                                    contact@reveilart4artist.cm<br />
                                                    support@reveilart4artist.cm
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'var(--primary-blue)',
                                                    color: 'white'
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faClock} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Horaires</h6>
                                                <p className="text-muted mb-0 small">
                                                    Lun - Ven: 8h - 18h<br />
                                                    Sam: 9h - 15h
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mb-3">Suivez-nous</h6>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <FontAwesomeIcon icon={faGlobe} />
                                        </Button>
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <FontAwesomeIcon icon={faComment} />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <FontAwesomeIcon icon={faHeart} />
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <FontAwesomeIcon icon={faShare} />
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Formulaire de contact */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4">Envoyez-nous un message</h5>

                                    {showAlert && (
                                        <Alert variant="success" className="mb-4" style={{ borderRadius: '12px' }}>
                                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                            Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-medium small">Nom complet</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Votre nom et prénom"
                                                        required
                                                        style={{
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            fontSize: '14px',
                                                            padding: '12px 16px'
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-medium small">Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="votre.email@exemple.com"
                                                        required
                                                        style={{
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            fontSize: '14px',
                                                            padding: '12px 16px'
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-medium small">Sujet</Form.Label>
                                                    <Form.Select
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        required
                                                        style={{
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            fontSize: '14px',
                                                            padding: '12px 16px'
                                                        }}
                                                    >
                                                        <option value="">Choisissez un sujet</option>
                                                        <option value="support">Support technique</option>
                                                        <option value="partnership">Partenariat</option>
                                                        <option value="artist">Devenir artiste</option>
                                                        <option value="billing">Facturation</option>
                                                        <option value="other">Autre</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-medium small">Message</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={6}
                                                        name="message"
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        placeholder="Décrivez votre demande en détail..."
                                                        required
                                                        style={{
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            fontSize: '14px',
                                                            padding: '12px 16px'
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="text-end mt-4">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="px-4"
                                                style={{
                                                    background: 'var(--primary-purple)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
                                                    padding: '12px 24px'
                                                }}
                                            >
                                                {loading ? (
                                                    <>Envoi en cours...</>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                                        Envoyer le message
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="py-4 bg-white">
                <Container>
                    <div className="text-center mb-4">
                        <h3 className="fw-bold mb-2">Questions Fréquentes</h3>
                        <p className="text-muted small">Trouvez rapidement les réponses à vos questions</p>
                    </div>

                    <Row className="g-3">
                        <Col md={6}>
                            <Card className="border-0 bg-light h-100">
                                <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>
                                        Comment télécharger mes sons achetés ?
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        Après votre achat, rendez-vous dans votre profil puis "Mes Achats" pour télécharger vos sons.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 bg-light h-100">
                                <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>
                                        Comment devenir artiste sur RéveilArt ?
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        Contactez-nous via ce formulaire avec le sujet "Devenir artiste" et nous vous guiderons.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 bg-light h-100">
                                <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>
                                        Quels sont les moyens de paiement acceptés ?
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        Nous acceptons Mobile Money, Orange Money, Visa, Mastercard et PayPal.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 bg-light h-100">
                                <Card.Body className="p-3">
                                    <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>
                                        Puis-je utiliser les sons à des fins commerciales ?
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        Oui, tous nos sons incluent une licence d'usage commercial. Vérifiez les détails sur chaque son.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Contact;
