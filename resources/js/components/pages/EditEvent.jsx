import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSave,
    faArrowLeft,
    faSpinner,
    faCalendarAlt,
    faMapMarkerAlt,
    faImage,
    faUsers,
    faEuroSign,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState(null);
    const [errors, setErrors] = useState({});

    // États pour les fichiers
    const [posterImage, setPosterImage] = useState(null);
    const [featuredImage, setFeaturedImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [posterPreview, setPosterPreview] = useState(null);
    const [featuredPreview, setFeaturedPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // États pour les images existantes
    const [currentPosterImage, setCurrentPosterImage] = useState('');
    const [currentFeaturedImage, setCurrentFeaturedImage] = useState('');
    const [currentGalleryImages, setCurrentGalleryImages] = useState([]);
    const [removePosterImage, setRemovePosterImage] = useState(false);
    const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);
    const [removeGalleryImages, setRemoveGalleryImages] = useState(false);

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

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            const response = await fetch(`/api/events/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                const eventData = data.event;
                setEvent(eventData);

                // Vérifier les permissions
                if (!canEditEvent(eventData, user)) {
                    toast.error('Erreur', 'Vous n\'avez pas les permissions pour modifier cet événement');
                    navigate('/dashboard');
                    return;
                }

                // Remplir le formulaire avec tous les champs
                setFormData({
                    // Informations principales
                    title: eventData.title || '',
                    description: eventData.description || '',
                    category: eventData.category || '',
                    status: eventData.status || 'pending',

                    // Lieu et date
                    venue: eventData.venue || '',
                    location: eventData.location || '',
                    address: eventData.address || '',
                    city: eventData.city || '',
                    country: eventData.country || 'Cameroun',
                    event_date: eventData.event_date ? eventData.event_date.split('T')[0] : '',
                    start_time: eventData.start_time ? eventData.start_time.substring(0, 5) : '',
                    end_time: eventData.end_time ? eventData.end_time.substring(0, 5) : '',

                    // Tarification
                    is_free: Boolean(eventData.is_free),
                    ticket_price: eventData.ticket_price || '',
                    price_min: eventData.price_min || '',
                    price_max: eventData.price_max || '',
                    tickets: eventData.tickets || '',

                    // Capacité
                    capacity: eventData.capacity || '',
                    max_attendees: eventData.max_attendees || '',

                    // Artistes et sponsors
                    artist: eventData.artist || '',
                    artists: Array.isArray(eventData.artists) ? eventData.artists.join(', ') :
                            (typeof eventData.artists === 'string' ? eventData.artists : ''),
                    sponsors: Array.isArray(eventData.sponsors) ? eventData.sponsors.join(', ') :
                             (typeof eventData.sponsors === 'string' ? eventData.sponsors : ''),

                    // Contact
                    contact_phone: eventData.contact_phone || '',
                    contact_email: eventData.contact_email || '',
                    website_url: eventData.website_url || '',

                    // Réseaux sociaux
                    facebook_url: eventData.facebook_url || '',
                    instagram_url: eventData.instagram_url || '',
                    twitter_url: eventData.twitter_url || '',
                    social_links: eventData.social_links || '',

                    // Options avancées
                    requirements: eventData.requirements || '',
                    is_featured: Boolean(eventData.is_featured),
                    featured: Boolean(eventData.featured)
                });

                // Charger les images existantes
                setCurrentPosterImage(eventData.poster_image || '');
                setCurrentFeaturedImage(eventData.featured_image || '');
                setCurrentGalleryImages(Array.isArray(eventData.gallery_images) ? eventData.gallery_images :
                                      (eventData.gallery_images ? JSON.parse(eventData.gallery_images) : []));
            } else {
                toast.error('Erreur', 'Impossible de charger l\'événement');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const canEditEvent = (event, user) => {
        if (!user) return false;
        return user.role === 'admin' || user.id === event.user_id;
    };

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
            setRemovePosterImage(false);
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
            setRemoveFeaturedImage(false);
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
        setRemoveGalleryImages(false);
        setErrors(prev => ({
            ...prev,
            gallery_images: ''
        }));
    };

    const clearPosterImage = () => {
        setPosterImage(null);
        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
            setPosterPreview(null);
        }
        setRemovePosterImage(true);
        document.getElementById('poster_image').value = '';
    };

    const clearFeaturedImage = () => {
        setFeaturedImage(null);
        if (featuredPreview) {
            URL.revokeObjectURL(featuredPreview);
            setFeaturedPreview(null);
        }
        setRemoveFeaturedImage(true);
        document.getElementById('featured_image').value = '';
    };

    const clearGalleryImages = () => {
        setGalleryImages([]);
        galleryPreviews.forEach(url => URL.revokeObjectURL(url));
        setGalleryPreviews([]);
        setRemoveGalleryImages(true);
        document.getElementById('gallery_images').value = '';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }

        if (!formData.event_date) {
            newErrors.event_date = 'La date est requise';
        }

        if (!formData.start_time) {
            newErrors.start_time = 'L\'heure de début est requise';
        }

        if (!formData.venue.trim()) {
            newErrors.venue = 'Le lieu est requis';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Le nom du lieu est requis';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'L\'adresse est requise';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'La ville est requise';
        }

        if (!formData.category) {
            newErrors.category = 'La catégorie est requise';
        }

        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'L\'email de contact est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Format d\'email invalide';
        }

        if (!formData.contact_phone.trim()) {
            newErrors.contact_phone = 'Le téléphone de contact est requis';
        }

        if (!formData.is_free && (!formData.ticket_price || formData.ticket_price <= 0)) {
            newErrors.ticket_price = 'Le prix du billet est requis pour un événement payant';
        }

        if (formData.max_attendees && formData.max_attendees <= 0) {
            newErrors.max_attendees = 'Le nombre maximum de participants doit être positif';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            // Utiliser FormData pour envoyer les fichiers
            const formDataToSend = new FormData();

            // Ajouter _method pour Laravel
            formDataToSend.append('_method', 'PUT');

            // Ajouter tous les champs du formulaire
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    if (typeof formData[key] === 'boolean') {
                        formDataToSend.append(key, formData[key] ? '1' : '0');
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            // Traiter les artistes et sponsors
            if (formData.artists) {
                const artists = formData.artists.split(',').map(a => a.trim()).filter(a => a).join(',');
                formDataToSend.append('artists', artists);
            }
            if (formData.sponsors) {
                const sponsors = formData.sponsors.split(',').map(s => s.trim()).filter(s => s).join(',');
                formDataToSend.append('sponsors', sponsors);
            }

            // Ajouter les indicateurs de suppression
            if (removePosterImage) {
                formDataToSend.append('remove_poster_image', '1');
            }
            if (removeFeaturedImage) {
                formDataToSend.append('remove_featured_image', '1');
            }
            if (removeGalleryImages) {
                formDataToSend.append('remove_gallery_images', '1');
            }

            // Ajouter les nouveaux fichiers images
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

            const response = await fetch(`/api/events/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Succès', 'Événement mis à jour avec succès');
                navigate('/dashboard?tab=events');
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                }
                toast.error('Erreur', data.message || 'Impossible de mettre à jour l\'événement');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { value: 'festival', label: 'Festival' },
        { value: 'concert', label: 'Concert' },
        { value: 'showcase', label: 'Showcase' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'conference', label: 'Conférence' },
        { value: 'party', label: 'Soirée' }
    ];

    const statuses = [
        { value: 'draft', label: 'Brouillon' },
        { value: 'pending', label: 'En attente' },
        { value: 'published', label: 'Publié' }
    ];

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ paddingTop: '80px' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" size="lg" className="mb-3" />
                    <h5 className="text-muted">Chargement de l'événement...</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            <Container className="py-4">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                            Modifier l'événement
                        </h2>
                        <p className="text-muted mb-0">Modifiez les informations de votre événement</p>
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
                        {/* Informations principales */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">Informations principales</h5>
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
                                                    placeholder="Nom de votre événement"
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
                                                    placeholder="Décrivez votre événement..."
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
                                                    <option value="">Sélectionner une catégorie</option>
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
                                                        Seuls les admins peuvent modifier le statut
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Date et lieu */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                                        Date et lieu
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Date de l'événement *</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="event_date"
                                                    value={formData.event_date}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.event_date}
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

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Lieu *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="venue"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.venue}
                                                    placeholder="Nom du lieu"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.venue}
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
                                                    placeholder="Ville de l'événement"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.city}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Adresse</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Adresse complète"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Participants et tarification */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                                        Participants et tarification
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Nombre maximum de participants</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="max_attendees"
                                                    value={formData.max_attendees}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.max_attendees}
                                                    placeholder="Capacité maximale"
                                                    min="1"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.max_attendees}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <div className="d-flex align-items-center mb-2">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="is_free"
                                                        checked={formData.is_free}
                                                        onChange={handleChange}
                                                        label="Événement gratuit"
                                                        className="me-3"
                                                    />
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="is_featured"
                                                        checked={formData.is_featured}
                                                        onChange={handleChange}
                                                        label="Événement mis en avant"
                                                        disabled={user?.role !== 'admin'}
                                                    />
                                                </div>
                                                {!formData.is_free && (
                                                    <>
                                                        <Form.Label>Prix du billet (XAF) *</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="ticket_price"
                                                            value={formData.ticket_price}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.ticket_price}
                                                            placeholder="Prix en Francs CFA"
                                                            min="0"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.ticket_price}
                                                        </Form.Control.Feedback>
                                                    </>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Section Médias */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                        Images et médias
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        {/* Image poster */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Image poster</Form.Label>

                                                {/* Image actuelle */}
                                                {currentPosterImage && !removePosterImage && !posterPreview && (
                                                    <div className="mb-2 p-2 border rounded bg-info bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-info fw-bold">Image actuelle:</small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearPosterImage}
                                                            >
                                                                Supprimer
                                                            </Button>
                                                        </div>
                                                        <img
                                                            src={`/storage/${currentPosterImage}`}
                                                            alt="Poster actuel"
                                                            className="img-fluid rounded"
                                                            style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                )}

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

                                                {/* Nouvelle image sélectionnée */}
                                                {posterPreview && (
                                                    <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-success fw-bold">Nouvelle image:</small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearPosterImage}
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

                                                {removePosterImage && (
                                                    <div className="mt-2 p-2 border rounded bg-warning bg-opacity-10">
                                                        <small className="text-warning fw-bold">
                                                            ⚠️ L'image poster actuelle sera supprimée
                                                        </small>
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        {/* Image principale */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Image principale</Form.Label>

                                                {/* Image actuelle */}
                                                {currentFeaturedImage && !removeFeaturedImage && !featuredPreview && (
                                                    <div className="mb-2 p-2 border rounded bg-info bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-info fw-bold">Image actuelle:</small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearFeaturedImage}
                                                            >
                                                                Supprimer
                                                            </Button>
                                                        </div>
                                                        <img
                                                            src={`/storage/${currentFeaturedImage}`}
                                                            alt="Image principale actuelle"
                                                            className="img-fluid rounded"
                                                            style={{ maxHeight: '120px', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                )}

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

                                                {/* Nouvelle image sélectionnée */}
                                                {featuredPreview && (
                                                    <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-success fw-bold">Nouvelle image:</small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearFeaturedImage}
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

                                                {removeFeaturedImage && (
                                                    <div className="mt-2 p-2 border rounded bg-warning bg-opacity-10">
                                                        <small className="text-warning fw-bold">
                                                            ⚠️ L'image principale actuelle sera supprimée
                                                        </small>
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        {/* Galerie */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label>Galerie d'images (max 10)</Form.Label>

                                                {/* Images actuelles */}
                                                {currentGalleryImages.length > 0 && !removeGalleryImages && galleryPreviews.length === 0 && (
                                                    <div className="mb-2 p-2 border rounded bg-info bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <small className="text-info fw-bold">
                                                                Galerie actuelle ({currentGalleryImages.length} image(s)):
                                                            </small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearGalleryImages}
                                                            >
                                                                Supprimer toutes
                                                            </Button>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {currentGalleryImages.map((image, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={`/storage/${image}`}
                                                                    alt={`Galerie ${index + 1}`}
                                                                    className="rounded"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

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

                                                {/* Nouvelles images sélectionnées */}
                                                {galleryPreviews.length > 0 && (
                                                    <div className="mt-2 p-2 border rounded bg-success bg-opacity-10">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <small className="text-success fw-bold">
                                                                Nouvelles images ({galleryPreviews.length}):
                                                            </small>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={clearGalleryImages}
                                                            >
                                                                Annuler
                                                            </Button>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {galleryPreviews.map((preview, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={preview}
                                                                    alt={`Nouvelle ${index + 1}`}
                                                                    className="rounded"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {removeGalleryImages && (
                                                    <div className="mt-2 p-2 border rounded bg-warning bg-opacity-10">
                                                        <small className="text-warning fw-bold">
                                                            ⚠️ Toutes les images de la galerie actuelle seront supprimées
                                                        </small>
                                                    </div>
                                                )}

                                                <Form.Text className="text-muted">
                                                    Formats acceptés: JPG, PNG, WEBP (max 5MB par image)
                                                </Form.Text>
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
                                    <h5 className="fw-bold mb-0">Artistes et sponsors</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Artistes</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="artists"
                                            value={formData.artists}
                                            onChange={handleChange}
                                            placeholder="Séparez par des virgules"
                                        />
                                        <Form.Text className="text-muted">
                                            Ex: Artiste 1, Artiste 2, Artiste 3
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Sponsors</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="sponsors"
                                            value={formData.sponsors}
                                            onChange={handleChange}
                                            placeholder="Séparez par des virgules"
                                        />
                                        <Form.Text className="text-muted">
                                            Ex: Sponsor 1, Sponsor 2
                                        </Form.Text>
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Contact */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">Informations de contact</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email de contact *</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.contact_email}
                                            placeholder="contact@example.com"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.contact_email}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Téléphone de contact *</Form.Label>
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

                                    <Form.Group>
                                        <Form.Label>Site web</Form.Label>
                                        <Form.Control
                                            type="url"
                                            name="website_url"
                                            value={formData.website_url}
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            {/* Informations supplémentaires */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">Informations supplémentaires</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <Form.Label>Exigences particulières</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="requirements"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="Age minimum, dress code, etc."
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Actions */}
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/dashboard?tab=events')}
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
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default EditEvent;
