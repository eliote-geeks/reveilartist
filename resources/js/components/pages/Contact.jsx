import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope, faPhone, faMapMarkerAlt, faPaperPlane, faCheck,
    faMusic, faClock, faGlobe, faUsers, faHeadset, faQuestionCircle,
    faComments, faShieldAlt, faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
    const { user } = useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        category: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const categories = [
        { value: 'general', label: 'Question générale', icon: faQuestionCircle },
        { value: 'support', label: 'Support technique', icon: faHeadset },
        { value: 'billing', label: 'Facturation et paiements', icon: faTicketAlt },
        { value: 'artist', label: 'Compte artiste', icon: faMusic },
        { value: 'partnership', label: 'Partenariat', icon: faUsers },
        { value: 'copyright', label: 'Droits d\'auteur', icon: faShieldAlt },
        { value: 'bug', label: 'Signaler un bug', icon: faComments },
        { value: 'feature', label: 'Demande de fonctionnalité', icon: faComments }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Le sujet est requis';
        }

        if (!formData.category) {
            newErrors.category = 'Veuillez sélectionner une catégorie';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Le message est requis';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Le message doit contenir au moins 10 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur s\'est produite');
            }

            setIsSubmitted(true);
            toast.success('Message envoyé', data.message);

            // Reset form
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                subject: '',
                category: '',
                message: ''
            });

        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            toast.error('Erreur', error.message || 'Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Hero Section */}
            <div className="bg-gradient-primary text-white py-5" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3">
                                <FontAwesomeIcon icon={faEnvelope} className="me-3" />
                                Contactez-nous
                            </h1>
                            <p className="lead mb-4">
                                Notre équipe est là pour vous aider à tirer le meilleur parti de Reveil4artist.
                                N'hésitez pas à nous contacter pour toute question ou suggestion.
                            </p>
                            <Badge bg="light" text="dark" className="px-3 py-2">
                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                Temps de réponse moyen : moins de 24h
                            </Badge>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                <Row className="g-4">
                    {/* Formulaire de contact principal */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom-0 py-4">
                                <h4 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faPaperPlane} className="me-2 text-primary" />
                                    Envoyez-nous un message
                                </h4>
                                <p className="text-muted mb-0 mt-2">
                                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                                </p>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {isSubmitted && (
                                    <Alert variant="success" className="mb-4 d-flex align-items-center">
                                        <FontAwesomeIcon icon={faCheck} className="me-3 fs-4" />
                                        <div>
                                            <strong>Message envoyé avec succès !</strong>
                                            <div className="small mt-1">Nous vous répondrons dans les plus brefs délais.</div>
                                        </div>
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">
                                                    <FontAwesomeIcon icon={faUsers} className="me-2 text-muted" />
                                                    Nom complet *
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                    placeholder="Votre nom complet"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">
                                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" />
                                                    Adresse email *
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.email}
                                                    placeholder="votre@email.com"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">
                                                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2 text-muted" />
                                                    Catégorie de votre demande *
                                                </Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.category}
                                                    size="lg"
                                                >
                                                    <option value="">Choisissez le type de votre demande</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.category}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">
                                                    <FontAwesomeIcon icon={faComments} className="me-2 text-muted" />
                                                    Sujet de votre message *
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.subject}
                                                    placeholder="Résumez votre demande en quelques mots"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.subject}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">
                                                    <FontAwesomeIcon icon={faComments} className="me-2 text-muted" />
                                                    Votre message *
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={6}
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.message}
                                                    placeholder="Décrivez votre question, problème ou suggestion en détail. Plus vous serez précis, mieux nous pourrons vous aider."
                                                    style={{ resize: 'vertical' }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.message}
                                                </Form.Control.Feedback>
                                                <Form.Text className={`${formData.message.length >= 10 ? 'text-success' : 'text-muted'}`}>
                                                    <FontAwesomeIcon icon={formData.message.length >= 10 ? faCheck : faClock} className="me-1" />
                                                    {formData.message.length}/10 caractères minimum
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                <div className="text-muted small">
                                                    <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-success" />
                                                    Vos données sont protégées et ne seront jamais partagées
                                                </div>
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    disabled={isSubmitting}
                                                    size="lg"
                                                    className="px-4"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Spinner size="sm" className="me-2" />
                                                            Envoi en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                                            Envoyer le message
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Sidebar avec informations */}
                    <Col lg={4}>
                        {/* Informations de contact */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                                    Nos coordonnées
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="contact-item p-3 border-bottom">
                                    <div className="d-flex align-items-center">
                                        <div className="contact-icon me-3">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="fw-medium">Email principal</div>
                                            <a href="mailto:support@reveil4artist.com" className="text-decoration-none small">
                                                support@reveil4artist.com
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-item p-3 border-bottom">
                                    <div className="d-flex align-items-center">
                                        <div className="contact-icon me-3">
                                            <FontAwesomeIcon icon={faPhone} className="text-success" />
                                        </div>
                                        <div>
                                            <div className="fw-medium">Téléphone</div>
                                            <div className="text-muted small">+237 6XX XX XX XX</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-item p-3">
                                    <div className="d-flex align-items-center">
                                        <div className="contact-icon me-3">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-warning" />
                                        </div>
                                        <div>
                                            <div className="fw-medium">Siège social</div>
                                            <div className="text-muted small">Douala, Cameroun</div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Horaires d'ouverture */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white border-bottom-0">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faClock} className="me-2 text-info" />
                                    Horaires de support
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="schedule-item d-flex justify-content-between mb-2">
                                    <span className="fw-medium">Lundi - Vendredi</span>
                                    <Badge bg="success">8h - 18h</Badge>
                                </div>
                                <div className="schedule-item d-flex justify-content-between mb-2">
                                    <span className="fw-medium">Samedi</span>
                                    <Badge bg="warning">9h - 15h</Badge>
                                </div>
                                <div className="schedule-item d-flex justify-content-between">
                                    <span className="fw-medium">Dimanche</span>
                                    <Badge bg="secondary">Fermé</Badge>
                                </div>
                                <hr />
                                <div className="text-center">
                                    <small className="text-muted">
                                        <FontAwesomeIcon icon={faGlobe} className="me-1" />
                                        Support 24/7 via email
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Réseaux sociaux */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="text-center">
                                <h6 className="fw-bold mb-3">Suivez-nous</h6>
                                <div className="d-flex gap-3 justify-content-center">
                                    <a href="#" className="social-link facebook" title="Facebook">
                                        <FontAwesomeIcon icon={faFacebook} />
                                    </a>
                                    <a href="#" className="social-link twitter" title="Twitter">
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </a>
                                    <a href="#" className="social-link instagram" title="Instagram">
                                        <FontAwesomeIcon icon={faInstagram} />
                                    </a>
                                    <a href="#" className="social-link youtube" title="YouTube">
                                        <FontAwesomeIcon icon={faYoutube} />
                                    </a>
                                </div>
                                <p className="text-muted small mt-3 mb-0">
                                    Restez connecté avec la communauté Reveil4artist
                                </p>
                            </Card.Body>
                        </Card>

                        {/* Support rapide */}
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-success text-white">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faHeadset} className="me-2" />
                                    Aide rapide
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted mb-3 small">
                                    Besoin d'une réponse immédiate ? Explorez nos ressources d'aide.
                                </p>
                                <div className="d-grid gap-2">
                                    <Button variant="outline-primary" size="sm">
                                        <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                                        FAQ complète
                                    </Button>
                                    <Button variant="outline-success" size="sm">
                                        <FontAwesomeIcon icon={faComments} className="me-2" />
                                        Chat en direct
                                    </Button>
                                    <Button variant="outline-info" size="sm">
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Guide artiste
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Section statistiques */}
                <Row className="mt-5 pt-4 border-top">
                    <Col className="text-center mb-4">
                        <h3 className="fw-bold mb-4">Reveil4artist en chiffres</h3>
                    </Col>
                    <Col md={3} className="text-center mb-4">
                        <div className="stat-item p-4">
                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
                            <h4 className="fw-bold text-primary">1000+</h4>
                            <p className="text-muted mb-0">Artistes actifs</p>
                        </div>
                    </Col>
                    <Col md={3} className="text-center mb-4">
                        <div className="stat-item p-4">
                            <FontAwesomeIcon icon={faMusic} size="3x" className="text-success mb-3" />
                            <h4 className="fw-bold text-success">5000+</h4>
                            <p className="text-muted mb-0">Sons disponibles</p>
                        </div>
                    </Col>
                    <Col md={3} className="text-center mb-4">
                        <div className="stat-item p-4">
                            <FontAwesomeIcon icon={faClock} size="3x" className="text-warning mb-3" />
                            <h4 className="fw-bold text-warning">&lt; 24h</h4>
                            <p className="text-muted mb-0">Temps de réponse</p>
                        </div>
                    </Col>
                    <Col md={3} className="text-center mb-4">
                        <div className="stat-item p-4">
                            <FontAwesomeIcon icon={faGlobe} size="3x" className="text-info mb-3" />
                            <h4 className="fw-bold text-info">24/7</h4>
                            <p className="text-muted mb-0">Support disponible</p>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .contact-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(102, 126, 234, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .social-link {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 1.2rem;
                }

                .social-link:hover {
                    transform: translateY(-3px);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .social-link.facebook {
                    background: linear-gradient(135deg, #3b5998, #4c70ba);
                }
                .social-link.twitter {
                    background: linear-gradient(135deg, #1da1f2, #1991db);
                }
                .social-link.instagram {
                    background: linear-gradient(135deg, #e4405f, #fd1d1d, #fcb045);
                }
                .social-link.youtube {
                    background: linear-gradient(135deg, #ff0000, #ff4444);
                }

                .contact-item:hover {
                    background-color: rgba(102, 126, 234, 0.05);
                }

                .stat-item {
                    transition: transform 0.3s ease;
                }

                .stat-item:hover {
                    transform: translateY(-5px);
                }

                .schedule-item {
                    padding: 0.25rem 0;
                }

                @media (max-width: 768px) {
                    .social-link {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;
