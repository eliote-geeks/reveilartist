import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
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
    faClock,
    faMusic,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import ToastNotification from '../common/ToastNotification';
import '../../../css/admin.css';

const AddEvent = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({
        title: '',
        message: '',
        variant: 'success'
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        venue: '',
        address: '',
        city: 'Yaoundé',
        country: 'Cameroun',
        event_date: '',
        start_time: '',
        end_time: '',
        poster_image: null,
        gallery_images: [],
        is_free: false,
        ticket_price: '',
        max_attendees: '',
        artists: [],
        sponsors: [],
        requirements: '',
        contact_phone: '',
        contact_email: '',
        website_url: '',
        social_links: {}
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [artistsInput, setArtistsInput] = useState('');
    const [sponsorsInput, setSponsorsInput] = useState('');

    const categories = [
        'concert', 'festival', 'showcase', 'workshop', 'conference', 'party'
    ];

    const categoryLabels = {
        'concert': 'Concert',
        'festival': 'Festival',
        'showcase': 'Showcase',
        'workshop': 'Atelier',
        'conference': 'Conférence',
        'party': 'Soirée'
    };

    const cities = [
        'Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam',
        'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe'
    ];

    const showToastNotification = (title, message, variant = 'success') => {
        setToastConfig({ title, message, variant });
        setShowToast(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'artists') {
            setArtistsInput(value);
            // Convertir les artistes en tableau
            const artistsArray = value.split(',').map(artist => artist.trim()).filter(artist => artist);
            setFormData(prev => ({
                ...prev,
                artists: artistsArray
            }));
        } else if (name === 'sponsors') {
            setSponsorsInput(value);
            // Convertir les sponsors en tableau
            const sponsorsArray = value.split(',').map(sponsor => sponsor.trim()).filter(sponsor => sponsor);
            setFormData(prev => ({
                ...prev,
                sponsors: sponsorsArray
            }));
        } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e, type) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (type === 'poster') {
            const file = files[0];

        // Validate image file
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, poster_image: 'Format d\'image non supporté. Utilisez JPG ou PNG.' }));
            return;
        }

            if (file.size > 2 * 1024 * 1024) { // 2MB
                setErrors(prev => ({ ...prev, poster_image: 'L\'image ne doit pas dépasser 2MB.' }));
            return;
        }

            setFormData(prev => ({ ...prev, poster_image: file }));

        // Create image preview
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);

        // Clear error
            setErrors(prev => ({ ...prev, poster_image: '' }));

        } else if (type === 'gallery') {
            // Validate gallery images
            const validFiles = [];
            const errorMessages = [];

            files.forEach((file, index) => {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    errorMessages.push(`Image ${index + 1}: Format non supporté`);
                    return;
                }

                if (file.size > 2 * 1024 * 1024) {
                    errorMessages.push(`Image ${index + 1}: Taille trop importante (max 2MB)`);
                    return;
                }

                validFiles.push(file);
            });

            if (errorMessages.length > 0) {
                setErrors(prev => ({ ...prev, gallery_images: errorMessages.join(', ') }));
                return;
            }

            setFormData(prev => ({ ...prev, gallery_images: validFiles }));

            // Create image previews
            const previews = validFiles.map(file => URL.createObjectURL(file));
            setGalleryPreviews(previews);

            // Clear error
            setErrors(prev => ({ ...prev, gallery_images: '' }));
        }
    };

    const removeImage = (type, index = null) => {
        if (type === 'poster') {
            setFormData(prev => ({ ...prev, poster_image: null }));
        setImagePreview(null);
        } else if (type === 'gallery' && index !== null) {
            setFormData(prev => ({
                ...prev,
                gallery_images: prev.gallery_images.filter((_, i) => i !== index)
            }));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic info validation
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (!formData.description.trim()) newErrors.description = 'La description est requise';
        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (!formData.venue.trim()) newErrors.venue = 'Le lieu est requis';
        if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
        if (!formData.event_date) newErrors.event_date = 'La date est requise';
        if (!formData.start_time) newErrors.start_time = 'L\'heure de début est requise';

        // Date validation
        if (formData.event_date && new Date(formData.event_date) < new Date()) {
            newErrors.event_date = 'La date ne peut pas être dans le passé';
        }

        // Price validation for paid events
        if (!formData.is_free && (!formData.ticket_price || formData.ticket_price <= 0)) {
            newErrors.ticket_price = 'Le prix du billet doit être supérieur à 0 pour un événement payant';
        }

        // Contact validation
        if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Le téléphone de contact est requis';
        if (!formData.contact_email.trim()) newErrors.contact_email = 'L\'email de contact est requis';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== DÉBUT SOUMISSION ÉVÉNEMENT ===');
        console.log('FormData:', formData);
        console.log('User:', user);
        console.log('Token:', token);

        if (!validateForm()) {
            console.log('Validation échouée, erreurs:', errors);
            return;
        }

        setLoading(true);

        try {
            // Créer FormData pour l'upload de fichiers
            const submitData = new FormData();

            console.log('Création du FormData pour événement...');

            // Ajouter les données du formulaire (champs requis par le contrôleur)
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('venue', formData.venue);
            submitData.append('address', formData.address);
            submitData.append('city', formData.city);
            submitData.append('country', formData.country);
            submitData.append('event_date', formData.event_date);
            submitData.append('start_time', formData.start_time);
            if (formData.end_time) submitData.append('end_time', formData.end_time);
            submitData.append('is_free', formData.is_free ? '1' : '0');
            if (!formData.is_free && formData.ticket_price) {
                submitData.append('ticket_price', formData.ticket_price);
            }
            if (formData.max_attendees) submitData.append('max_attendees', formData.max_attendees);
            if (formData.requirements) submitData.append('requirements', formData.requirements);
            submitData.append('contact_phone', formData.contact_phone);
            submitData.append('contact_email', formData.contact_email);
            if (formData.website_url) submitData.append('website_url', formData.website_url);

            // Ajouter les artistes (format array attendu par le contrôleur)
            if (formData.artists && formData.artists.length > 0) {
                formData.artists.forEach((artist, index) => {
                    submitData.append(`artists[${index}]`, artist);
                });
            }

            // Ajouter les sponsors (format array attendu par le contrôleur)
            if (formData.sponsors && formData.sponsors.length > 0) {
                formData.sponsors.forEach((sponsor, index) => {
                    submitData.append(`sponsors[${index}]`, sponsor);
                });
            }

            // Ajouter les fichiers
            if (formData.poster_image) {
                submitData.append('poster_image', formData.poster_image);
                console.log('Affiche ajoutée:', formData.poster_image.name);
            }

            if (formData.gallery_images && formData.gallery_images.length > 0) {
                formData.gallery_images.forEach((image, index) => {
                    submitData.append(`gallery_images[${index}]`, image);
                });
                console.log('Images galerie ajoutées:', formData.gallery_images.length);
            }

            // Debug: Afficher toutes les données FormData
            console.log('=== CONTENU FORMDATA ÉVÉNEMENT ===');
            for (let pair of submitData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            console.log('Envoi de la requête à /api/events...');

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: submitData
            });

            console.log('Réponse reçue:', response.status, response.statusText);

            const data = await response.json();
            console.log('Données de réponse:', data);

            if (response.ok) {
                showToastNotification(
                    'Événement créé avec succès !',
                    'Il sera disponible après validation par notre équipe.',
                    'success'
                );
                console.log('✅ Succès!');

                // Réinitialiser le formulaire
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    venue: '',
                    address: '',
                    city: 'Yaoundé',
                    country: 'Cameroun',
                    event_date: '',
                    start_time: '',
                    end_time: '',
                    poster_image: null,
                    gallery_images: [],
                    is_free: false,
                    ticket_price: '',
                    max_attendees: '',
                    artists: [],
                    sponsors: [],
                    requirements: '',
                    contact_phone: '',
                    contact_email: '',
                    website_url: '',
                    social_links: {}
                });
                setImagePreview(null);
                setGalleryPreviews([]);
                setArtistsInput('');
                setSponsorsInput('');
                setErrors({});

                // Rediriger après succès (optionnel)
                setTimeout(() => {
                    navigate('/events');
                }, 3000);
            } else {
                console.log('❌ Erreur serveur:', data);
                if (data.errors) {
                    setErrors(data.errors);
                    // Afficher la première erreur dans le toast
                    const firstError = Object.values(data.errors)[0];
                    const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    showToastNotification(
                        'Erreur de validation',
                        errorMessage,
                        'error'
                    );
                } else {
                    showToastNotification(
                        'Erreur',
                        data.message || 'Erreur lors de la création de l\'événement',
                        'error'
                    );
                }
            }

        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            showToastNotification(
                'Erreur de connexion',
                'Impossible de contacter le serveur. Veuillez réessayer.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Vous devez être connecté pour créer un événement.
                </Alert>
            </Container>
        );
    }

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Header */}
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="d-flex align-items-center py-3">
                        <Button
                            as={Link}
                            to="/dashboard"
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
                {showToast && (
                    <ToastNotification
                        show={showToast}
                        title={toastConfig.title}
                        message={toastConfig.message}
                        variant={toastConfig.variant}
                        onClose={() => setShowToast(false)}
                    />
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
                                                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.category}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Description *</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Décrivez votre événement..."
                                                    isInvalid={!!errors.description}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Date *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="event_date"
                                                    value={formData.event_date}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    isInvalid={!!errors.event_date}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.event_date}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Heure début *</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="start_time"
                                                    value={formData.start_time}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.start_time}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.start_time}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Heure fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="end_time"
                                                    value={formData.end_time}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Artistes participants</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={artistsInput}
                                                    onChange={(e) => handleInputChange({ target: { name: 'artists', value: e.target.value } })}
                                                    placeholder="Ex: DJ Cameroun, BeatMaster237 (séparés par des virgules)"
                                                />
                                                <Form.Text className="text-muted">
                                                    Séparez les noms par des virgules
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Capacité maximale</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="max_attendees"
                                                    value={formData.max_attendees}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: 1000"
                                                    min="1"
                                                />
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
                                                <Form.Label className="fw-medium">Ville</Form.Label>
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
                                        <h5 className="fw-bold mb-0">
                                            <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-warning" />
                                        Billetterie
                                        </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="is_free"
                                                    checked={formData.is_free}
                                                    onChange={handleInputChange}
                                                    label="Événement gratuit"
                                                    className="mb-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        {!formData.is_free && (
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-medium">Prix du billet (FCFA) *</Form.Label>
                                                    <div className="input-group">
                                                            <Form.Control
                                                                type="number"
                                                            name="ticket_price"
                                                            value={formData.ticket_price}
                                                            onChange={handleInputChange}
                                                                placeholder="0"
                                                                min="0"
                                                                step="500"
                                                            isInvalid={!!errors.ticket_price}
                                                        />
                                                        <span className="input-group-text">FCFA</span>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.ticket_price}
                                                        </Form.Control.Feedback>
                                    </div>
                                                </Form.Group>
                                            </Col>
                                        )}
                                        </Row>
                                </Card.Body>
                            </Card>

                            {/* Contact et informations supplémentaires */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                                        Contact et informations
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Téléphone de contact *</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="contact_phone"
                                                    value={formData.contact_phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: +237 6XX XXX XXX"
                                                    isInvalid={!!errors.contact_phone}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contact_phone}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Email de contact *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="contact_email"
                                                    value={formData.contact_email}
                                                    onChange={handleInputChange}
                                                    placeholder="contact@reveilart4artist.com"
                                                    isInvalid={!!errors.contact_email}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contact_email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Site web</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="website_url"
                                                    value={formData.website_url}
                                                    onChange={handleInputChange}
                                                    placeholder="https://www.reveilart4artist.com"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Sponsors</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={sponsorsInput}
                                                    onChange={(e) => handleInputChange({ target: { name: 'sponsors', value: e.target.value } })}
                                                    placeholder="Ex: Orange Cameroun, MTN (séparés par des virgules)"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Exigences particulières</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="requirements"
                                                    value={formData.requirements}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Âge minimum 18 ans, code vestimentaire..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Upload d'affiche */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                        Affiche de l'événement
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {!formData.poster_image ? (
                                        <div
                                            className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                            style={{ borderColor: '#dee2e6', cursor: 'pointer', minHeight: '200px' }}
                                            onClick={() => document.getElementById('posterImage').click()}
                                        >
                                            <FontAwesomeIcon icon={faImage} size="3x" className="text-muted mb-3" />
                                            <p className="mb-2">Cliquez pour uploader une affiche</p>
                                            <small className="text-muted">JPG, PNG (max 2MB)<br />Recommandé: 1200x630px</small>
                                            <Form.Control
                                                id="posterImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'poster')}
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
                                                onClick={() => removeImage('poster')}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </Button>
                                        </div>
                                    )}
                                    {errors.poster_image && (
                                        <div className="text-danger small mt-2">{errors.poster_image}</div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Upload galerie */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        Galerie d'images
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div
                                        className="upload-zone border-2 border-dashed rounded p-3 text-center mb-3"
                                        style={{ borderColor: '#dee2e6', cursor: 'pointer' }}
                                        onClick={() => document.getElementById('galleryImages').click()}
                                    >
                                        <FontAwesomeIcon icon={faImage} className="text-muted mb-2" />
                                        <p className="mb-0 small">Ajouter des images</p>
                                        <Form.Control
                                            id="galleryImages"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => handleImageUpload(e, 'gallery')}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {galleryPreviews.length > 0 && (
                                        <Row className="g-2">
                                            {galleryPreviews.map((preview, index) => (
                                                <Col xs={6} key={index}>
                                                    <div className="position-relative">
                                                        <img
                                                            src={preview}
                                                            alt={`Gallery ${index + 1}`}
                                                            className="img-fluid rounded"
                                                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-1"
                                                            onClick={() => removeImage('gallery', index)}
                                                            style={{ padding: '2px 6px', fontSize: '12px' }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}

                                    {errors.gallery_images && (
                                        <div className="text-danger small mt-2">{errors.gallery_images}</div>
                                    )}
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
                                            <FontAwesomeIcon icon={loading ? faSpinner : faSave} className="me-2" spin={loading} />
                                            {loading ? 'Création...' : 'Créer l\'événement'}
                                        </Button>
                                    </div>

                                    <hr />

                                    <div className="text-center">
                                        <small className="text-muted">
                                            L'événement sera publié après validation par l'équipe d'administration
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
