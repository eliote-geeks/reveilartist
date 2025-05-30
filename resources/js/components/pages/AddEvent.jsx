import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt,
    faMapMarkerAlt,
    faTicketAlt,
    faImage,
    faUsers,
    faEuroSign,
    faArrowLeft,
    faSave,
    faEye,
    faTimes,
    faPlus,
    faEdit,
    faTrash,
    faClock,
    faMusic
} from '@fortawesome/free-solid-svg-icons';
import '../../../css/admin.css';

const AddEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        venue: '',
        address: '',
        city: 'Yaoundé',
        capacity: '',
        artists: '',
        organizer: '',
        phone: '',
        email: '',
        website: '',
        eventImage: null,
        isPublic: true,
        allowRefunds: true
    });

    const [ticketTypes, setTicketTypes] = useState([
        { id: 1, name: 'Standard', price: '', quantity: '', description: '' }
    ]);

    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        'Concert', 'Festival', 'Showcase', 'Soirée', 'Battle',
        'Workshop', 'Masterclass', 'Tribute', 'Launch Party'
    ];

    const cities = [
        'Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam',
        'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe'
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate image file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, eventImage: 'Format d\'image non supporté. Utilisez JPG, PNG ou WebP.' }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setErrors(prev => ({ ...prev, eventImage: 'L\'image ne doit pas dépasser 5MB.' }));
            return;
        }

        setFormData(prev => ({ ...prev, eventImage: file }));

        // Create image preview
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);

        // Clear error
        setErrors(prev => ({ ...prev, eventImage: '' }));
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, eventImage: null }));
        setImagePreview(null);
    };

    const addTicketType = () => {
        const newId = Math.max(...ticketTypes.map(t => t.id)) + 1;
        setTicketTypes(prev => [...prev, {
            id: newId,
            name: '',
            price: '',
            quantity: '',
            description: ''
        }]);
    };

    const updateTicketType = (id, field, value) => {
        setTicketTypes(prev => prev.map(ticket =>
            ticket.id === id ? { ...ticket, [field]: value } : ticket
        ));
    };

    const removeTicketType = (id) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(prev => prev.filter(ticket => ticket.id !== id));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic info validation
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (!formData.date) newErrors.date = 'La date est requise';
        if (!formData.time) newErrors.time = 'L\'heure est requise';
        if (!formData.venue.trim()) newErrors.venue = 'Le lieu est requis';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
        if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'La capacité doit être supérieure à 0';
        if (!formData.organizer.trim()) newErrors.organizer = 'L\'organisateur est requis';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis';

        // Date validation
        if (formData.date && new Date(formData.date) < new Date()) {
            newErrors.date = 'La date ne peut pas être dans le passé';
        }

        // Ticket validation
        const validTickets = ticketTypes.filter(ticket =>
            ticket.name.trim() && ticket.price > 0 && ticket.quantity > 0
        );
        if (validTickets.length === 0) {
            newErrors.tickets = 'Au moins un type de billet valide est requis';
        }

        // Check total ticket quantity doesn't exceed capacity
        const totalTickets = validTickets.reduce((sum, ticket) => sum + parseInt(ticket.quantity || 0), 0);
        if (totalTickets > parseInt(formData.capacity || 0)) {
            newErrors.tickets = 'Le nombre total de billets ne peut pas dépasser la capacité du lieu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess('Événement créé avec succès !');

            // Redirect after success
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }, 2000);
    };

    const getTotalTickets = () => {
        return ticketTypes.reduce((sum, ticket) => sum + parseInt(ticket.quantity || 0), 0);
    };

    const getLowestPrice = () => {
        const prices = ticketTypes
            .filter(ticket => ticket.price > 0)
            .map(ticket => parseFloat(ticket.price));
        return prices.length > 0 ? Math.min(...prices) : 0;
    };

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Header */}
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="d-flex align-items-center py-3">
                        <Button
                            as={Link}
                            to="/"
                            variant="outline-secondary"
                            className="me-3"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Retour
                        </Button>
                        <div>
                            <h3 className="mb-0 fw-bold">Créer un nouvel événement</h3>
                            <small className="text-muted">Organisez et publiez votre événement musical</small>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {success && (
                    <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {success}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        {/* Colonne principale */}
                        <Col lg={8}>
                            {/* Informations de base */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                                        Informations de l'événement
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Titre de l'événement *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: RéveilArt Festival 2024"
                                                    isInvalid={!!errors.title}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Catégorie *</Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.category}
                                                >
                                                    <option value="">Sélectionner</option>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.category}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Décrivez votre événement..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Date *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    isInvalid={!!errors.date}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.date}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Heure *</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="time"
                                                    value={formData.time}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.time}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.time}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Artistes participants</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="artists"
                                                    value={formData.artists}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: DJ Cameroun, BeatMaster237..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Capacité maximale *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="capacity"
                                                    value={formData.capacity}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 1000"
                                                    min="1"
                                                    isInvalid={!!errors.capacity}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.capacity}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Lieu et localisation */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-success" />
                                        Lieu et localisation
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Nom du lieu *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="venue"
                                                    value={formData.venue}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Palais des Sports"
                                                    isInvalid={!!errors.venue}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.venue}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Ville *</Form.Label>
                                                <Form.Select
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                >
                                                    {cities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Adresse complète *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Rue de la Réunification, Yaoundé"
                                                    isInvalid={!!errors.address}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.address}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Gestion des billets */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">
                                            <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-warning" />
                                            Types de billets
                                        </h5>
                                        <Button variant="outline-primary" size="sm" onClick={addTicketType}>
                                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                                            Ajouter un type
                                        </Button>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {errors.tickets && (
                                        <Alert variant="danger" className="mb-3">
                                            {errors.tickets}
                                        </Alert>
                                    )}

                                    <div className="table-responsive">
                                        <Table className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Nom du billet</th>
                                                    <th>Prix (FCFA)</th>
                                                    <th>Quantité</th>
                                                    <th>Description</th>
                                                    <th width="50">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ticketTypes.map(ticket => (
                                                    <tr key={ticket.id}>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                value={ticket.name}
                                                                onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                                                                placeholder="Ex: Standard"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                value={ticket.price}
                                                                onChange={(e) => updateTicketType(ticket.id, 'price', e.target.value)}
                                                                placeholder="0"
                                                                min="0"
                                                                step="500"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                value={ticket.quantity}
                                                                onChange={(e) => updateTicketType(ticket.id, 'quantity', e.target.value)}
                                                                placeholder="0"
                                                                min="1"
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                value={ticket.description}
                                                                onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                                                                placeholder="Accès standard..."
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeTicketType(ticket.id)}
                                                                disabled={ticketTypes.length === 1}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    <div className="mt-3 p-2 bg-light rounded">
                                        <Row>
                                            <Col md={6}>
                                                <small className="text-muted">
                                                    <strong>Total billets :</strong> {getTotalTickets().toLocaleString()}
                                                </small>
                                            </Col>
                                            <Col md={6} className="text-end">
                                                <small className="text-muted">
                                                    <strong>À partir de :</strong> {getLowestPrice().toLocaleString()} FCFA
                                                </small>
                                            </Col>
                                        </Row>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Informations de contact */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                                        Organisateur et contact
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Nom de l'organisateur *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="organizer"
                                                    value={formData.organizer}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: RéveilArt Productions"
                                                    isInvalid={!!errors.organizer}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.organizer}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Téléphone *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +237 6XX XXX XXX"
                                                    isInvalid={!!errors.phone}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Email *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="contact@reveilart4artist.com"
                                                    isInvalid={!!errors.email}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Site web</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    placeholder="https://www.reveilart4artist.com"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Upload d'image */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                        Image de l'événement
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {!formData.eventImage ? (
                                        <div
                                            className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                            style={{ borderColor: '#dee2e6', cursor: 'pointer', minHeight: '200px' }}
                                            onClick={() => document.getElementById('eventImage').click()}
                                        >
                                            <FontAwesomeIcon icon={faImage} size="3x" className="text-muted mb-3" />
                                            <p className="mb-2">Cliquez pour uploader une image</p>
                                            <small className="text-muted">JPG, PNG, WebP (max 5MB)<br />Recommandé: 1200x630px</small>
                                            <Form.Control
                                                id="eventImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="position-relative">
                                            <img
                                                src={imagePreview}
                                                alt="Event preview"
                                                className="img-fluid rounded"
                                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 m-2"
                                                onClick={removeImage}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </Button>
                                        </div>
                                    )}
                                    {errors.eventImage && (
                                        <div className="text-danger small mt-2">{errors.eventImage}</div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Options */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">Options</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Check
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleInputChange}
                                        label="Événement public"
                                        className="mb-3"
                                    />

                                    <Form.Check
                                        type="checkbox"
                                        name="allowRefunds"
                                        checked={formData.allowRefunds}
                                        onChange={handleInputChange}
                                        label="Autoriser les remboursements"
                                        className="mb-3"
                                    />
                                </Card.Body>
                            </Card>

                            {/* Actions */}
                            <Card className="border-0 shadow-sm sticky-top">
                                <Card.Body>
                                    <div className="d-grid gap-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faSave} className="me-2" />
                                            {loading ? 'Création...' : 'Créer l\'événement'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faEye} className="me-2" />
                                            Sauver comme brouillon
                                        </Button>
                                    </div>

                                    <hr />

                                    <div className="text-center">
                                        <small className="text-muted">
                                            L'événement sera publié après validation
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </div>
    );
};

export default AddEvent;
