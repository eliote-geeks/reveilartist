import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faArrowLeft,
    faSpinner,
    faCalendar,
    faMapMarkerAlt,
    faUsers,
    faEuroSign,
    faImage,
    faPhone,
    faGlobe,
    faMusic,
    faCog
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AddEventComplete = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // État pour les fichiers
    const [posterImage, setPosterImage] = useState(null);
    const [featuredImage, setFeaturedImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [posterPreview, setPosterPreview] = useState(null);
    const [featuredPreview, setFeaturedPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [formData, setFormData] = useState({
        // Informations principales
        title: '',
        description: '',
        category: '',
        status: 'pending',

        // Lieu et date
        venue: '',
        location: '',
        address: '',
        city: '',
        country: 'Cameroun',
        event_date: '',
        start_time: '',
        end_time: '',

        // Tarification
        is_free: false,
        ticket_price: '',
        price_min: '',
        price_max: '',
        tickets: '',

        // Capacité
        capacity: '',
        max_attendees: '',

        // Artistes et sponsors
        artist: '',
        artists: '',
        sponsors: '',

        // Contact
        contact_phone: '',
        contact_email: '',
        website_url: '',

        // Réseaux sociaux
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        social_links: '',

        // Options avancées
        requirements: '',
        is_featured: false,
        featured: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePosterImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    poster_image: 'Veuillez sélectionner un fichier image valide.'
                }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    poster_image: 'L\'image est trop volumineuse (max 5MB).'
                }));
                return;
            }

            setPosterImage(file);
            setPosterPreview(URL.createObjectURL(file));
            setErrors(prev => ({
                ...prev,
                poster_image: ''
            }));
        }
    };

    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    featured_image: 'Veuillez sélectionner un fichier image valide.'
                }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    featured_image: 'L\'image est trop volumineuse (max 5MB).'
                }));
                return;
            }

            setFeaturedImage(file);
            setFeaturedPreview(URL.createObjectURL(file));
            setErrors(prev => ({
                ...prev,
                featured_image: ''
            }));
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length > 10) {
            setErrors(prev => ({
                ...prev,
                gallery_images: 'Maximum 10 images pour la galerie.'
            }));
            return;
        }

        const validFiles = [];
        const newPreviews = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    gallery_images: 'Tous les fichiers doivent être des images.'
                }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    gallery_images: 'Chaque image doit faire moins de 5MB.'
                }));
                return;
            }

            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setGalleryImages(validFiles);
        setGalleryPreviews(newPreviews);
        setErrors(prev => ({
            ...prev,
            gallery_images: ''
        }));
    };

    const removePosterImage = () => {
        setPosterImage(null);
        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
            setPosterPreview(null);
        }
        document.getElementById('poster_image').value = '';
    };

    const removeFeaturedImage = () => {
        setFeaturedImage(null);
        if (featuredPreview) {
            URL.revokeObjectURL(featuredPreview);
            setFeaturedPreview(null);
        }
        document.getElementById('featured_image').value = '';
    };

    const removeGalleryImages = () => {
        setGalleryImages([]);
        galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        setGalleryPreviews([]);
        document.getElementById('gallery_images').value = '';
    };

    const validateForm = () => {
        const newErrors = {};

        // Champs requis
        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }

        if (!formData.category) {
            newErrors.category = 'La catégorie est requise';
        }

        if (!formData.venue.trim()) {
            newErrors.venue = 'Le lieu est requis';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'L\'adresse est requise';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'La ville est requise';
        }

        if (!formData.event_date) {
            newErrors.event_date = 'La date de l\'événement est requise';
        } else {
            const eventDate = new Date(formData.event_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                newErrors.event_date = 'La date de l\'événement doit être dans le futur';
            }
        }

        if (!formData.start_time) {
            newErrors.start_time = 'L\'heure de début est requise';
        }

        if (!formData.contact_phone.trim()) {
            newErrors.contact_phone = 'Le téléphone de contact est requis';
        }

        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'L\'email de contact est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'L\'email n\'est pas valide';
        }

        // Validation des prix
        if (!formData.is_free) {
            if (!formData.ticket_price || parseFloat(formData.ticket_price) <= 0) {
                newErrors.ticket_price = 'Le prix du billet est requis pour un événement payant';
            }
        }

        // Validation des capacités
        if (formData.capacity && parseInt(formData.capacity) <= 0) {
            newErrors.capacity = 'La capacité doit être supérieure à 0';
        }

        if (formData.max_attendees && parseInt(formData.max_attendees) <= 0) {
            newErrors.max_attendees = 'Le nombre maximum de participants doit être supérieur à 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Erreur', 'Veuillez corriger les erreurs du formulaire');
            return;
        }

        setSaving(true);

        try {
            // Utiliser FormData pour envoyer les fichiers
            const formDataToSend = new FormData();

            // Ajouter tous les champs du formulaire
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    if (key === 'artists' || key === 'sponsors') {
                        // Convertir les chaînes séparées par virgules en JSON
                        const items = formData[key] ? formData[key].split(',').map(t => t.trim()).filter(t => t) : [];
                        formDataToSend.append(key, JSON.stringify(items));
                    } else if (key === 'tickets') {
                        // Si on a configuré des billets en JSON
                        if (formData[key]) {
                            formDataToSend.append(key, formData[key]);
                        }
                    } else if (typeof formData[key] === 'boolean') {
                        formDataToSend.append(key, formData[key] ? '1' : '0');
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            // Ajouter les fichiers images
            if (posterImage) {
                formDataToSend.append('poster_image', posterImage);
            }
            if (featuredImage) {
                formDataToSend.append('featured_image', featuredImage);
            }
            if (galleryImages.length > 0) {
                galleryImages.forEach((file, index) => {
                    formDataToSend.append(`gallery_images[${index}]`, file);
                });
            }

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Succès', 'Événement créé avec succès');
                // Nettoyer les URLs d'objet
                if (posterPreview) URL.revokeObjectURL(posterPreview);
                if (featuredPreview) URL.revokeObjectURL(featuredPreview);
                galleryPreviews.forEach(url => URL.revokeObjectURL(url));
                navigate('/dashboard?tab=events');
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                }
                throw new Error(data.message || 'Impossible de créer l\'événement');
            }
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            toast.error('Erreur', error.message || 'Erreur de connexion au serveur');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { value: '', label: 'Sélectionner une catégorie' },
        { value: 'concert', label: 'Concert' },
        { value: 'festival', label: 'Festival' },
        { value: 'showcase', label: 'Showcase' },
        { value: 'workshop', label: 'Atelier' },
        { value: 'conference', label: 'Conférence' },
        { value: 'party', label: 'Fête' },
        { value: 'soiree', label: 'Soirée' }
    ];

    const statuses = [
        { value: 'draft', label: 'Brouillon' },
        { value: 'pending', label: 'En attente' },
        { value: 'published', label: 'Publié' }
    ];

    const countries = [
        'Cameroun', 'France', 'Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Tchad', 'Gabon'
    ];

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            <Container className="py-4">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <FontAwesomeIcon icon={faCalendar} className="me-2 text-primary" />
                            Créer un événement
                        </h2>
                        <p className="text-muted mb-0">Organisez votre événement musical</p>
                    </div>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/dashboard?tab=events')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour
                    </Button>
                </div>

                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        {/* Colonne principale */}
                        <Col lg={8}>
                            {/* Informations principales */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                        Informations principales
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Titre de l'événement *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.title}
                                                    placeholder="Titre de votre événement"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Description *</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.description}
                                                    placeholder="Décrivez votre événement en détail..."
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Catégorie *</Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.category}
                                                >
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

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Statut</Form.Label>
                                                <Form.Select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    disabled={user?.role !== 'admin'}
                                                >
                                                    {statuses.map(status => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                {user?.role !== 'admin' && (
                                                    <Form.Text className="text-muted">
                                                        Statut par défaut: En attente
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Lieu et date */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                                        Lieu et date
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Lieu/Venue *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="venue"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.venue}
                                                    placeholder="Ex: Stade Ahmadou Ahidjo"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.venue}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Nom du lieu</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="Nom spécifique du lieu"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Adresse complète *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.address}
                                                    placeholder="Adresse complète du lieu"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.address}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Ville *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.city}
                                                    placeholder="Ville"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.city}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Pays</Form.Label>
                                                <Form.Select
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                >
                                                    {countries.map(country => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Date de l'événement *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="event_date"
                                                    value={formData.event_date}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.event_date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.event_date}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Heure de début *</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="start_time"
                                                    value={formData.start_time}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.start_time}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.start_time}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Heure de fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="end_time"
                                                    value={formData.end_time}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Tarification */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faEuroSign} className="me-2 text-primary" />
                                        Tarification
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <Form.Check
                                                type="checkbox"
                                                name="is_free"
                                                checked={formData.is_free}
                                                onChange={handleChange}
                                                label="🎁 Événement gratuit"
                                                className="mb-3"
                                            />
                                        </Col>

                                        {!formData.is_free && (
                                            <>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Prix du billet (FCFA) *</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="ticket_price"
                                                            value={formData.ticket_price}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.ticket_price}
                                                            placeholder="Ex: 5000"
                                                            min="0"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.ticket_price}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Prix minimum (FCFA)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="price_min"
                                                            value={formData.price_min}
                                                            onChange={handleChange}
                                                            placeholder="Prix minimum"
                                                            min="0"
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Prix maximum (FCFA)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="price_max"
                                                            value={formData.price_max}
                                                            onChange={handleChange}
                                                            placeholder="Prix maximum"
                                                            min="0"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        )}

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Configuration des billets (JSON)</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="tickets"
                                                    value={formData.tickets}
                                                    onChange={handleChange}
                                                    placeholder='Ex: [{"type":"Standard","price":5000,"description":"Accès standard","available":100}]'
                                                />
                                                <Form.Text className="text-muted">
                                                    Configuration avancée des types de billets en format JSON
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Capacité */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                                        Capacité et participants
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Capacité totale</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="capacity"
                                                    value={formData.capacity}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.capacity}
                                                    placeholder="Ex: 1000"
                                                    min="1"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.capacity}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Maximum de participants</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="max_attendees"
                                                    value={formData.max_attendees}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.max_attendees}
                                                    placeholder="Ex: 800"
                                                    min="1"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.max_attendees}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Artistes et sponsors */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                        Artistes et sponsors
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Artiste principal</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="artist"
                                            value={formData.artist}
                                            onChange={handleChange}
                                            placeholder="Nom de l'artiste principal"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Artistes participants</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="artists"
                                            value={formData.artists}
                                            onChange={handleChange}
                                            placeholder="Séparez par des virgules"
                                        />
                                        <Form.Text className="text-muted">
                                            Ex: Locko, Charlotte Dipanda, Tenor
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Sponsors</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="sponsors"
                                            value={formData.sponsors}
                                            onChange={handleChange}
                                            placeholder="Séparez par des virgules"
                                        />
                                        <Form.Text className="text-muted">
                                            Ex: MTN Cameroun, Orange Cameroun
                                        </Form.Text>
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Contact */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                        Contact
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Téléphone *</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleChange}
                                            isInvalid={!!errors.contact_phone}
                                            placeholder="+237 6XX XXX XXX"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.contact_phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.contact_email}
                                            placeholder="contact@event.com"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.contact_email}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Site web</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="website_url"
                                            value={formData.website_url}
                                            onChange={handleChange}
                                            placeholder="https://www.event.com"
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Réseaux sociaux */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" />
                                        Réseaux sociaux
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Facebook</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="facebook_url"
                                            value={formData.facebook_url}
                                            onChange={handleChange}
                                            placeholder="https://facebook.com/event"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Instagram</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="instagram_url"
                                            value={formData.instagram_url}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/event"
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Twitter</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="twitter_url"
                                            value={formData.twitter_url}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/event"
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Images */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                        Images
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {/* Image poster */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Image poster</Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="poster_image"
                                            accept="image/*"
                                            onChange={handlePosterImageChange}
                                            isInvalid={!!errors.poster_image}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.poster_image}
                                        </Form.Control.Feedback>

                                        {posterPreview && (
                                            <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="text-success fw-bold">Aperçu:</small>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={removePosterImage}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                                <img
                                                    src={posterPreview}
                                                    alt="Aperçu poster"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Image principale */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Image principale</Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="featured_image"
                                            accept="image/*"
                                            onChange={handleFeaturedImageChange}
                                            isInvalid={!!errors.featured_image}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.featured_image}
                                        </Form.Control.Feedback>

                                        {featuredPreview && (
                                            <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className="text-success fw-bold">Aperçu:</small>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={removeFeaturedImage}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                                <img
                                                    src={featuredPreview}
                                                    alt="Aperçu image principale"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Galerie */}
                                    <Form.Group>
                                        <Form.Label>Galerie (max 10)</Form.Label>
                                        <Form.Control
                                            type="file"
                                            id="gallery_images"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGalleryImagesChange}
                                            isInvalid={!!errors.gallery_images}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.gallery_images}
                                        </Form.Control.Feedback>

                                        {galleryPreviews.length > 0 && (
                                            <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-success fw-bold">
                                                        {galleryPreviews.length} image(s) sélectionnée(s)
                                                    </small>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={removeGalleryImages}
                                                    >
                                                        Tout supprimer
                                                    </Button>
                                                </div>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {galleryPreviews.map((preview, index) => (
                                                        <img
                                                            key={index}
                                                            src={preview}
                                                            alt={`Galerie ${index + 1}`}
                                                            className="rounded"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Options avancées */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
                                        Options avancées
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Exigences</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="requirements"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="Ex: Âge minimum, dress code, etc."
                                        />
                                    </Form.Group>

                                    {user?.role === 'admin' && (
                                        <div className="d-flex flex-column gap-2">
                                            <Form.Check
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={handleChange}
                                                label="⭐ Événement mis en avant"
                                            />
                                            <Form.Check
                                                type="checkbox"
                                                name="featured"
                                                checked={formData.featured}
                                                onChange={handleChange}
                                                label="🌟 Featured"
                                            />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Actions */}
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/dashboard?tab=events')}
                            disabled={saving}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving}
                            size="lg"
                        >
                            {saving ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Créer l'événement
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default AddEventComplete;
