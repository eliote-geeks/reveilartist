import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faLock,
    faEye,
    faEyeSlash,
    faSave,
    faArrowLeft,
    faCamera,
    faBell,
    faShield
} from '@fortawesome/free-solid-svg-icons';

const ProfileEdit = () => {
    const [profileData, setProfileData] = useState({
        name: 'Jean Dupont',
        email: 'jean.dupont@reveilart4artist.com',
        phone: '+237 690 123 456',
        address: 'Yaoundé, Cameroun',
        bio: 'Passionné de musique urbaine camerounaise'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        eventUpdates: true
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleNotificationChange = (e) => {
        setNotifications({
            ...notifications,
            [e.target.name]: e.target.checked
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Simulation d'API call
        setTimeout(() => {
            setSuccess('Profil mis à jour avec succès !');
            setLoading(false);
        }, 1000);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
            setLoading(false);
            return;
        }

        // Simulation d'API call
        setTimeout(() => {
            setSuccess('Mot de passe modifié avec succès !');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setLoading(false);
        }, 1000);
    };

    const handleNotificationsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');

        // Simulation d'API call
        setTimeout(() => {
            setSuccess('Préférences de notification mises à jour !');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-light min-vh-100 py-4">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8}>
                        {/* Header */}
                        <div className="d-flex align-items-center mb-4">
                            <Button
                                as={Link}
                                to="/profile"
                                variant="outline-secondary"
                                className="me-3"
                                style={{ borderRadius: '8px' }}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </Button>
                            <div>
                                <h2 className="fw-bold mb-1">Modifier mon profil</h2>
                                <p className="text-muted mb-0">Gérez vos informations personnelles et préférences</p>
                            </div>
                        </div>

                        {/* Messages */}
                        {success && (
                            <Alert variant="success" className="mb-4" style={{ borderRadius: '12px' }}>
                                {success}
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="danger" className="mb-4" style={{ borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}

                        {/* Tabs */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <Card.Body className="p-0">
                                <Tabs
                                    defaultActiveKey="profile"
                                    className="px-4 pt-4"
                                    style={{ borderBottom: '1px solid #e9ecef' }}
                                >
                                    {/* Onglet Profil */}
                                    <Tab
                                        eventKey="profile"
                                        title={
                                            <span>
                                                <FontAwesomeIcon icon={faUser} className="me-2" />
                                                Informations personnelles
                                            </span>
                                        }
                                    >
                                        <div className="p-4">
                                            {/* Photo de profil */}
                                            <div className="text-center mb-4">
                                                <div className="position-relative d-inline-block">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                                                        alt="Photo de profil"
                                                        className="rounded-circle"
                                                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                    />
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="position-absolute bottom-0 end-0 rounded-circle"
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        <FontAwesomeIcon icon={faCamera} style={{ fontSize: '12px' }} />
                                                    </Button>
                                                </div>
                                                <div className="mt-2">
                                                    <small className="text-muted">Cliquez pour changer votre photo</small>
                                                </div>
                                            </div>

                                            <Form onSubmit={handleProfileSubmit}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-medium">Nom complet</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type="text"
                                                                    name="name"
                                                                    value={profileData.name}
                                                                    onChange={handleProfileChange}
                                                                    style={{
                                                                        borderRadius: '12px',
                                                                        paddingLeft: '45px',
                                                                        height: '48px'
                                                                    }}
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={faUser}
                                                                    className="position-absolute text-muted"
                                                                    style={{
                                                                        left: '15px',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)'
                                                                    }}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-medium">Email</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type="email"
                                                                    name="email"
                                                                    value={profileData.email}
                                                                    onChange={handleProfileChange}
                                                                    style={{
                                                                        borderRadius: '12px',
                                                                        paddingLeft: '45px',
                                                                        height: '48px'
                                                                    }}
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={faEnvelope}
                                                                    className="position-absolute text-muted"
                                                                    style={{
                                                                        left: '15px',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)'
                                                                    }}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-medium">Téléphone</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type="tel"
                                                                    name="phone"
                                                                    value={profileData.phone}
                                                                    onChange={handleProfileChange}
                                                                    style={{
                                                                        borderRadius: '12px',
                                                                        paddingLeft: '45px',
                                                                        height: '48px'
                                                                    }}
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={faPhone}
                                                                    className="position-absolute text-muted"
                                                                    style={{
                                                                        left: '15px',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)'
                                                                    }}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-medium">Adresse</Form.Label>
                                                            <div className="position-relative">
                                                                <Form.Control
                                                                    type="text"
                                                                    name="address"
                                                                    value={profileData.address}
                                                                    onChange={handleProfileChange}
                                                                    style={{
                                                                        borderRadius: '12px',
                                                                        paddingLeft: '45px',
                                                                        height: '48px'
                                                                    }}
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={faMapMarkerAlt}
                                                                    className="position-absolute text-muted"
                                                                    style={{
                                                                        left: '15px',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)'
                                                                    }}
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-medium">Bio</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="bio"
                                                        value={profileData.bio}
                                                        onChange={handleProfileChange}
                                                        placeholder="Parlez-nous de vous..."
                                                        style={{ borderRadius: '12px' }}
                                                    />
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="fw-medium"
                                                    style={{ borderRadius: '12px' }}
                                                    disabled={loading}
                                                >
                                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                                </Button>
                                            </Form>
                                        </div>
                                    </Tab>

                                    {/* Onglet Mot de passe */}
                                    <Tab
                                        eventKey="password"
                                        title={
                                            <span>
                                                <FontAwesomeIcon icon={faLock} className="me-2" />
                                                Sécurité
                                            </span>
                                        }
                                    >
                                        <div className="p-4">
                                            <Form onSubmit={handlePasswordSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">Mot de passe actuel</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={showPasswords.current ? "text" : "password"}
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordChange}
                                                            style={{
                                                                borderRadius: '12px',
                                                                paddingLeft: '45px',
                                                                paddingRight: '45px',
                                                                height: '48px'
                                                            }}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faLock}
                                                            className="position-absolute text-muted"
                                                            style={{
                                                                left: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)'
                                                            }}
                                                        />
                                                        <Button
                                                            variant="link"
                                                            className="position-absolute p-0 text-muted"
                                                            style={{
                                                                right: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => togglePasswordVisibility('current')}
                                                        >
                                                            <FontAwesomeIcon icon={showPasswords.current ? faEyeSlash : faEye} />
                                                        </Button>
                                                    </div>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium">Nouveau mot de passe</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={showPasswords.new ? "text" : "password"}
                                                            name="newPassword"
                                                            value={passwordData.newPassword}
                                                            onChange={handlePasswordChange}
                                                            style={{
                                                                borderRadius: '12px',
                                                                paddingLeft: '45px',
                                                                paddingRight: '45px',
                                                                height: '48px'
                                                            }}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faLock}
                                                            className="position-absolute text-muted"
                                                            style={{
                                                                left: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)'
                                                            }}
                                                        />
                                                        <Button
                                                            variant="link"
                                                            className="position-absolute p-0 text-muted"
                                                            style={{
                                                                right: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => togglePasswordVisibility('new')}
                                                        >
                                                            <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
                                                        </Button>
                                                    </div>
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-medium">Confirmer le nouveau mot de passe</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type={showPasswords.confirm ? "text" : "password"}
                                                            name="confirmPassword"
                                                            value={passwordData.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                            style={{
                                                                borderRadius: '12px',
                                                                paddingLeft: '45px',
                                                                paddingRight: '45px',
                                                                height: '48px'
                                                            }}
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faLock}
                                                            className="position-absolute text-muted"
                                                            style={{
                                                                left: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)'
                                                            }}
                                                        />
                                                        <Button
                                                            variant="link"
                                                            className="position-absolute p-0 text-muted"
                                                            style={{
                                                                right: '15px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => togglePasswordVisibility('confirm')}
                                                        >
                                                            <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
                                                        </Button>
                                                    </div>
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="fw-medium"
                                                    style={{ borderRadius: '12px' }}
                                                    disabled={loading}
                                                >
                                                    <FontAwesomeIcon icon={faShield} className="me-2" />
                                                    {loading ? 'Modification...' : 'Modifier le mot de passe'}
                                                </Button>
                                            </Form>
                                        </div>
                                    </Tab>

                                    {/* Onglet Notifications */}
                                    <Tab
                                        eventKey="notifications"
                                        title={
                                            <span>
                                                <FontAwesomeIcon icon={faBell} className="me-2" />
                                                Notifications
                                            </span>
                                        }
                                    >
                                        <div className="p-4">
                                            <Form onSubmit={handleNotificationsSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="switch"
                                                        id="emailNotifications"
                                                        name="emailNotifications"
                                                        label="Notifications par email"
                                                        checked={notifications.emailNotifications}
                                                        onChange={handleNotificationChange}
                                                        style={{ fontSize: '16px' }}
                                                    />
                                                    <small className="text-muted">Recevez des notifications par email pour vos commandes</small>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="switch"
                                                        id="pushNotifications"
                                                        name="pushNotifications"
                                                        label="Notifications push"
                                                        checked={notifications.pushNotifications}
                                                        onChange={handleNotificationChange}
                                                        style={{ fontSize: '16px' }}
                                                    />
                                                    <small className="text-muted">Recevez des notifications directement sur votre appareil</small>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="switch"
                                                        id="marketingEmails"
                                                        name="marketingEmails"
                                                        label="Emails promotionnels"
                                                        checked={notifications.marketingEmails}
                                                        onChange={handleNotificationChange}
                                                        style={{ fontSize: '16px' }}
                                                    />
                                                    <small className="text-muted">Recevez nos offres spéciales et nouveautés</small>
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Check
                                                        type="switch"
                                                        id="eventUpdates"
                                                        name="eventUpdates"
                                                        label="Mises à jour d'événements"
                                                        checked={notifications.eventUpdates}
                                                        onChange={handleNotificationChange}
                                                        style={{ fontSize: '16px' }}
                                                    />
                                                    <small className="text-muted">Soyez informé des nouveaux événements et concerts</small>
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="fw-medium"
                                                    style={{ borderRadius: '12px' }}
                                                    disabled={loading}
                                                >
                                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                                    {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                                                </Button>
                                            </Form>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProfileEdit;
