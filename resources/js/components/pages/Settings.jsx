import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faUser, faBell, faShieldAlt, faEye, faSave } from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="bg-light min-vh-100" style={{ paddingTop: '80px' }}>
            <Container>
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <AnimatedElement animation="slideInUp" delay={100}>
                            <div className="text-center mb-4">
                                <h1 className="h3 fw-bold mb-2">
                                    <FontAwesomeIcon icon={faCog} className="text-primary me-2" />
                                    Paramètres
                                </h1>
                                <p className="text-secondary">Gérez vos préférences et votre compte</p>
                            </div>
                        </AnimatedElement>
                    </Col>
                </Row>

                {/* Success Alert */}
                {showSuccess && (
                    <Row className="mb-4">
                        <Col>
                            <Alert variant="success" className="text-center">
                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                Paramètres sauvegardés avec succès !
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row>
                    {/* Navigation Sidebar */}
                    <Col lg={3} md={4} className="mb-4">
                        <AnimatedElement animation="slideInLeft" delay={200}>
                            <Card>
                                <Card.Body className="p-0">
                                    <Nav variant="pills" className="flex-column">
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === 'profile'}
                                                onClick={() => setActiveTab('profile')}
                                                className="border-0 text-start rounded-0"
                                            >
                                                <FontAwesomeIcon icon={faUser} className="me-2" />
                                                Profil
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === 'notifications'}
                                                onClick={() => setActiveTab('notifications')}
                                                className="border-0 text-start rounded-0"
                                            >
                                                <FontAwesomeIcon icon={faBell} className="me-2" />
                                                Notifications
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === 'privacy'}
                                                onClick={() => setActiveTab('privacy')}
                                                className="border-0 text-start rounded-0"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                                Confidentialité
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === 'security'}
                                                onClick={() => setActiveTab('security')}
                                                className="border-0 text-start rounded-0"
                                            >
                                                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                                Sécurité
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>

                    {/* Content */}
                    <Col lg={9} md={8}>
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <AnimatedElement animation="slideInRight" delay={300}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">Informations du profil</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nom d'utilisateur</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            defaultValue="reveilartist237"
                                                            placeholder="Votre nom d'utilisateur"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            defaultValue="user@reveilart.com"
                                                            placeholder="Votre adresse email"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Prénom</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            defaultValue="Jean"
                                                            placeholder="Votre prénom"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nom</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            defaultValue="Dupont"
                                                            placeholder="Votre nom"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bio</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    defaultValue="Passionné de musique camerounaise et producteur de beats Afrobeat."
                                                    placeholder="Parlez-nous de vous..."
                                                />
                                            </Form.Group>
                                            <Button variant="primary" onClick={handleSave}>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Sauvegarder
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </AnimatedElement>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <AnimatedElement animation="slideInRight" delay={300}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">Préférences de notifications</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="email-notifications"
                                                    label="Notifications par email"
                                                    defaultChecked
                                                />
                                                <Form.Text className="text-muted">
                                                    Recevez des emails pour les nouveaux sons et événements
                                                </Form.Text>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="push-notifications"
                                                    label="Notifications push"
                                                    defaultChecked
                                                />
                                                <Form.Text className="text-muted">
                                                    Notifications directes sur votre navigateur
                                                </Form.Text>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="marketing-emails"
                                                    label="Emails marketing"
                                                />
                                                <Form.Text className="text-muted">
                                                    Recevez nos offres spéciales et promotions
                                                </Form.Text>
                                            </Form.Group>
                                            <Button variant="primary" onClick={handleSave}>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Sauvegarder
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </AnimatedElement>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                            <AnimatedElement animation="slideInRight" delay={300}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">Paramètres de confidentialité</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="profile-public"
                                                    label="Profil public"
                                                    defaultChecked
                                                />
                                                <Form.Text className="text-muted">
                                                    Votre profil sera visible par tous les utilisateurs
                                                </Form.Text>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="show-email"
                                                    label="Afficher l'email"
                                                />
                                                <Form.Text className="text-muted">
                                                    Votre email sera visible sur votre profil
                                                </Form.Text>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="analytics"
                                                    label="Analyses de données"
                                                    defaultChecked
                                                />
                                                <Form.Text className="text-muted">
                                                    Nous aider à améliorer l'expérience utilisateur
                                                </Form.Text>
                                            </Form.Group>
                                            <Button variant="primary" onClick={handleSave}>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Sauvegarder
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </AnimatedElement>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <AnimatedElement animation="slideInRight" delay={300}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">Sécurité du compte</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mot de passe actuel</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Votre mot de passe actuel"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nouveau mot de passe</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Nouveau mot de passe"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirmer le mot de passe</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Confirmez le nouveau mot de passe"
                                                />
                                            </Form.Group>
                                            <hr />
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="two-factor"
                                                    label="Authentification à deux facteurs"
                                                />
                                                <Form.Text className="text-muted">
                                                    Sécurisez votre compte avec un code SMS
                                                </Form.Text>
                                            </Form.Group>
                                            <Button variant="primary" onClick={handleSave}>
                                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                                Mettre à jour
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </AnimatedElement>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Settings;
