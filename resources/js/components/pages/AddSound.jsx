import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMusic,
    faUpload,
    faPlay,
    faPause,
    faImage,
    faTag,
    faEuroSign,
    faArrowLeft,
    faSave,
    faEye,
    faTimes,
    faSpinner,
    faInfoCircle,
    faShieldAlt,
    faCopyright,
    faQuestionCircle,
    faClock,
    faMapMarkerAlt,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import '../../../css/admin.css';

const AddSound = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const audioRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        genre: '',
        price: '',
        is_free: false,
        tags: [],
        bpm: '',
        key: '',
        credits: '',
        audio_file: null,
        cover_image: null,
        license_type: 'royalty_free',
        copyright_owner: '',
        composer: '',
        performer: '',
        producer: '',
        release_date: '',
        isrc_code: '',
        publishing_rights: '',
        usage_rights: [],
        commercial_use: true,
        attribution_required: false,
        modifications_allowed: true,
        distribution_allowed: true,
        license_duration: 'perpetual',
        territory: 'worldwide',
        rights_statement: ''
    });

    const [previews, setPreviews] = useState({
        audio: null,
        cover: null,
        audioDuration: 0
    });

    const [tagsInput, setTagsInput] = useState('');
    const [usageRightsInput, setUsageRightsInput] = useState('');

    const licenseTypes = {
        'royalty_free': {
            name: 'Libre de droits (Royalty-Free)',
            description: 'Utilisation illimitée après achat unique, idéal pour la plupart des projets',
            icon: faShieldAlt,
            color: 'success'
        },
        'creative_commons': {
            name: 'Creative Commons',
            description: 'Licence ouverte avec conditions spécifiques (attribution, partage, etc.)',
            icon: faCopyright,
            color: 'info'
        },
        'exclusive': {
            name: 'Licence exclusive',
            description: 'Droits exclusifs transférés à l\'acheteur, une seule vente possible',
            icon: faShieldAlt,
            color: 'warning'
        },
        'custom': {
            name: 'Licence personnalisée',
            description: 'Termes de licence spécifiques définis par l\'auteur',
            icon: faQuestionCircle,
            color: 'secondary'
        }
    };

    const usageRightsOptions = [
        { value: 'broadcast', label: 'Diffusion radio/TV', description: 'Utilisation en radio et télévision' },
        { value: 'streaming', label: 'Plateformes de streaming', description: 'Spotify, Apple Music, etc.' },
        { value: 'sync', label: 'Synchronisation', description: 'Films, publicités, jeux vidéo' },
        { value: 'live', label: 'Performances live', description: 'Concerts, événements en direct' },
        { value: 'remix', label: 'Remix/Sampling', description: 'Modification et échantillonnage autorisés' },
        { value: 'youtube', label: 'Monétisation YouTube', description: 'Utilisation dans du contenu monétisé' }
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/sounds/categories/list', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'tags') {
            setTagsInput(value);
            const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setFormData(prev => ({
                ...prev,
                tags: tagsArray
            }));
        } else if (name === 'usage_rights') {
            setUsageRightsInput(value);
            const rightsArray = value.split(',').map(right => right.trim()).filter(right => right);
            setFormData(prev => ({
                ...prev,
                usage_rights: rightsArray
            }));
        } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleUsageRightsChange = (rightValue, checked) => {
        setFormData(prev => ({
            ...prev,
            usage_rights: checked
                ? [...prev.usage_rights, rightValue]
                : prev.usage_rights.filter(r => r !== rightValue)
        }));
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'audio') {
            const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, audio_file: 'Format audio non supporté. Utilisez MP3, WAV, M4A ou AAC.' }));
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, audio_file: 'Le fichier audio ne doit pas dépasser 20MB.' }));
                return;
            }

            setFormData(prev => ({ ...prev, audio_file: file }));

            const audioUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, audio: audioUrl }));

            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                setPreviews(prev => ({ ...prev, audioDuration: audio.duration }));
            });

            setErrors(prev => ({ ...prev, audio_file: '' }));

        } else if (type === 'cover') {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, cover_image: 'Format d\'image non supporté. Utilisez JPG ou PNG.' }));
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, cover_image: 'L\'image ne doit pas dépasser 2MB.' }));
                return;
            }

            setFormData(prev => ({ ...prev, cover_image: file }));

            const imageUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, cover: imageUrl }));

            setErrors(prev => ({ ...prev, cover_image: '' }));
        }
    };

    const toggleAudioPreview = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const validateForm = () => {
        const newErrors = {};

        // Validation des champs de base
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (!formData.category_id) newErrors.category_id = 'La catégorie est requise';
        if (!formData.is_free && (!formData.price || formData.price <= 0)) {
            newErrors.price = 'Le prix doit être supérieur à 0 pour un son payant';
        }
        if (!formData.audio_file) newErrors.audio_file = 'Le fichier audio est requis';

        // Validation des droits d'auteur (obligatoires)
        if (!formData.copyright_owner || !formData.copyright_owner.trim()) {
            newErrors.copyright_owner = 'Le propriétaire des droits est requis';
        }
        if (!formData.composer || !formData.composer.trim()) {
            newErrors.composer = 'Le compositeur est requis';
        }

        console.log('Validation - Erreurs trouvées:', newErrors);
        console.log('Champs validés:', {
            title: formData.title,
            category_id: formData.category_id,
            copyright_owner: formData.copyright_owner,
            composer: formData.composer,
            audio_file: !!formData.audio_file
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== DÉBUT SOUMISSION ===');
        console.log('FormData:', formData);
        console.log('User:', user);
        console.log('Token:', token);

        if (!validateForm()) {
            console.log('Validation échouée, erreurs:', errors);
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const submitData = new FormData();

            console.log('Création du FormData...');

            // Données de base
            submitData.append('title', formData.title);
            if (formData.description) submitData.append('description', formData.description);
            submitData.append('category_id', formData.category_id);
            if (formData.genre) submitData.append('genre', formData.genre);
            submitData.append('is_free', formData.is_free ? '1' : '0');
            if (!formData.is_free && formData.price) {
                submitData.append('price', formData.price);
            }

            // Informations techniques (seulement si non vides et valides)
            if (formData.bpm && formData.bpm.trim()) submitData.append('bpm', formData.bpm.trim());
            if (formData.key && formData.key.trim()) {
                const cleanKey = formData.key.trim();
                if (cleanKey.length <= 20) { // Respecter la limite de validation
                    submitData.append('key', cleanKey);
                }
            }
            if (formData.credits && formData.credits.trim()) submitData.append('credits', formData.credits.trim());

            // Informations de licence et droits d'auteur (obligatoires)
            submitData.append('license_type', formData.license_type);
            submitData.append('copyright_owner', formData.copyright_owner.trim());
            submitData.append('composer', formData.composer.trim());
            if (formData.performer && formData.performer.trim()) submitData.append('performer', formData.performer.trim());
            if (formData.producer && formData.producer.trim()) submitData.append('producer', formData.producer.trim());
            if (formData.release_date) submitData.append('release_date', formData.release_date);
            if (formData.isrc_code && formData.isrc_code.trim()) {
                const cleanIsrc = formData.isrc_code.trim();
                if (cleanIsrc.length <= 20) { // Respecter la limite de validation
                    submitData.append('isrc_code', cleanIsrc);
                }
            }
            if (formData.publishing_rights && formData.publishing_rights.trim()) submitData.append('publishing_rights', formData.publishing_rights.trim());

            // Droits d'utilisation
            submitData.append('commercial_use', formData.commercial_use ? '1' : '0');
            submitData.append('attribution_required', formData.attribution_required ? '1' : '0');
            submitData.append('modifications_allowed', formData.modifications_allowed ? '1' : '0');
            submitData.append('distribution_allowed', formData.distribution_allowed ? '1' : '0');
            submitData.append('license_duration', formData.license_duration);
            submitData.append('territory', formData.territory);
            if (formData.rights_statement) submitData.append('rights_statement', formData.rights_statement);

            // Tags
            if (formData.tags && formData.tags.length > 0) {
                formData.tags.forEach((tag, index) => {
                    submitData.append(`tags[${index}]`, tag);
                });
            }

            // Droits d'usage
            if (formData.usage_rights && formData.usage_rights.length > 0) {
                formData.usage_rights.forEach((right, index) => {
                    submitData.append(`usage_rights[${index}]`, right);
                });
            }

            // Fichiers
            if (formData.audio_file) {
                submitData.append('audio_file', formData.audio_file);
                console.log('Fichier audio ajouté:', formData.audio_file.name);
            }
            if (formData.cover_image) {
                submitData.append('cover_image', formData.cover_image);
                console.log('Image de couverture ajoutée:', formData.cover_image.name);
            }

            // Debug: Afficher toutes les données FormData
            console.log('=== CONTENU FORMDATA ===');
            for (let pair of submitData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Simulation du progrès
            const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                }
                return prev + 10;
            });
        }, 200);

            console.log('Envoi de la requête à /api/sounds...');

            const response = await fetch('/api/sounds', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: submitData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            console.log('Réponse reçue:', response.status, response.statusText);

            const data = await response.json();
            console.log('Données de réponse:', data);

            if (response.ok) {
                setSuccess('Son ajouté avec succès ! Il sera disponible après validation.');
                console.log('✅ Succès!');

                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } else {
                console.log('❌ Erreur serveur:', data);
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Erreur lors de l\'ajout du son' });
                }
            }

        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = (type) => {
        if (type === 'audio') {
            setFormData(prev => ({ ...prev, audio_file: null }));
            setPreviews(prev => ({ ...prev, audio: null, audioDuration: 0 }));
            setIsPlaying(false);
        } else if (type === 'cover') {
            setFormData(prev => ({ ...prev, cover_image: null }));
            setPreviews(prev => ({ ...prev, cover: null }));
        }
    };

    const HelpTooltip = ({ text, children }) => (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{text}</Tooltip>}
        >
            <span className="d-inline-flex align-items-center">
                {children}
                <FontAwesomeIcon icon={faInfoCircle} className="ms-1 text-muted" style={{ fontSize: '0.8em' }} />
            </span>
        </OverlayTrigger>
    );

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Vous devez être connecté pour ajouter un son.
                </Alert>
            </Container>
        );
    }

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
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
                            <h3 className="mb-0 fw-bold">Ajouter un nouveau son</h3>
                            <small className="text-muted">Uploadez et configurez votre piste audio avec ses droits et licences</small>
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

                {errors.general && (
                    <Alert variant="danger" className="mb-4">
                        {errors.general}
                    </Alert>
                )}

                <Alert variant="info" className="mb-4">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    <strong>Guide rapide :</strong> Remplissez tous les champs marqués d'un *, spécifiez clairement vos droits d'auteur et choisissez le type de licence adapté à votre projet.
                </Alert>

                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                        1. Informations de base
                                    </h5>
                                    <small className="text-muted">Les informations essentielles de votre son</small>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Donnez un titre accrocheur et descriptif à votre son">
                                                <Form.Label className="fw-medium">Titre du son *</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Rythme Afro Moderne 2024"
                                                    isInvalid={!!errors.title}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Choisissez la catégorie qui correspond le mieux à votre style musical">
                                                    <Form.Label className="fw-medium">Catégorie musicale *</Form.Label>
                                                </HelpTooltip>
                                                {categoriesLoading ? (
                                                    <Form.Control as="div" className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                        Chargement...
                                                    </Form.Control>
                                                ) : (
                                                    <Form.Select
                                                        name="category_id"
                                                        value={formData.category_id}
                                                        onChange={handleInputChange}
                                                        isInvalid={!!errors.category_id}
                                                    >
                                                        <option value="">Sélectionner une catégorie</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                )}
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.category_id}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <HelpTooltip text="Décrivez votre son de manière attrayante pour les utilisateurs">
                                                    <Form.Label className="fw-medium">Description</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Décrivez l'ambiance, le style et l'utilisation recommandée de votre son..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <HelpTooltip text="Le genre musical spécifique (ex: Afrobeat, Trap, Gospel)">
                                                    <Form.Label className="fw-medium">Genre musical</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="genre"
                                                    value={formData.genre}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Afrobeat moderne"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <HelpTooltip text="Battements par minute - la vitesse de votre son">
                                                    <Form.Label className="fw-medium">BPM (Tempo)</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="number"
                                                    name="bpm"
                                                    value={formData.bpm}
                                                    onChange={handleInputChange}
                                                    placeholder="120"
                                                    min="60"
                                                    max="200"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <HelpTooltip text="La tonalité principale du morceau (ex: Do majeur = C, La mineur = Am)">
                                                    <Form.Label className="fw-medium">Tonalité</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="key"
                                                    value={formData.key}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Am, C#, F"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCopyright} className="me-2 text-warning" />
                                        2. Droits d'auteur et crédits
                                    </h5>
                                    <small className="text-muted">Informations légales importantes sur la propriété du son</small>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="La personne ou entité qui possède les droits d'auteur sur ce son">
                                                    <Form.Label className="fw-medium">Propriétaire des droits d'auteur *</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="copyright_owner"
                                                    value={formData.copyright_owner}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Jean Dupont ou Studio XYZ"
                                                    isInvalid={!!errors.copyright_owner}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.copyright_owner}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="La personne qui a composé la mélodie et les paroles">
                                                    <Form.Label className="fw-medium">Compositeur *</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="composer"
                                                    value={formData.composer}
                                                    onChange={handleInputChange}
                                                    placeholder="Nom du compositeur"
                                                    isInvalid={!!errors.composer}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.composer}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="L'artiste ou le groupe qui interprète le morceau">
                                                    <Form.Label className="fw-medium">Interprète</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="performer"
                                                    value={formData.performer}
                                                    onChange={handleInputChange}
                                                    placeholder="Nom de l'artiste/groupe"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="La personne responsable de la production du son">
                                                    <Form.Label className="fw-medium">Producteur</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="producer"
                                                    value={formData.producer}
                                                    onChange={handleInputChange}
                                                    placeholder="Nom du producteur"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Date officielle de sortie du morceau">
                                                    <Form.Label className="fw-medium">Date de sortie</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="date"
                                                    name="release_date"
                                                    value={formData.release_date}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Code international d'identification des enregistrements sonores">
                                                    <Form.Label className="fw-medium">Code ISRC</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    name="isrc_code"
                                                    value={formData.isrc_code}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: USUM71703692"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <HelpTooltip text="Informations supplémentaires sur les crédits (musiciens, studios, etc.)">
                                                    <Form.Label className="fw-medium">Crédits supplémentaires</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="credits"
                                                    value={formData.credits}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Mixage par John Smith, Mastering par XYZ Studio, Guitare par..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-success" />
                                        3. Type de licence
                                    </h5>
                                    <small className="text-muted">Définissez comment votre son peut être utilisé</small>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col>
                                            <Form.Group>
                                                <Form.Label className="fw-medium mb-3">Choisissez le type de licence *</Form.Label>
                                                {Object.entries(licenseTypes).map(([key, license]) => (
                                                    <div key={key} className="mb-3">
                                                        <Form.Check
                                                            type="radio"
                                                            name="license_type"
                                                            id={`license_${key}`}
                                                            value={key}
                                                            checked={formData.license_type === key}
                                                            onChange={handleInputChange}
                                                            label={
                                                                <div className="d-flex align-items-center">
                                                                    <FontAwesomeIcon
                                                                        icon={license.icon}
                                                                        className={`me-2 text-${license.color}`}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-medium">{license.name}</div>
                                                                        <small className="text-muted">{license.description}</small>
                                                                    </div>
                                                                </div>
                                                            }
                                                            className="border rounded p-3"
                                                        />
                                                    </div>
                                                ))}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Droits d'utilisation */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faTag} className="me-2 text-info" />
                                        4. Droits d'utilisation
                                    </h5>
                                    <small className="text-muted">Spécifiez dans quels contextes votre son peut être utilisé</small>
                                </Card.Header>
                                <Card.Body>
                                    {/* Utilisations autorisées */}
                                    <Row className="g-4">
                                        <Col>
                                            <Form.Group className="mb-4">
                                                <div className="d-flex align-items-center mb-3">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="text-info me-2" />
                                                    <Form.Label className="fw-medium mb-0">Utilisations autorisées</Form.Label>
                                                </div>
                                                <p className="text-muted small mb-3">
                                                    Cochez toutes les utilisations que vous autorisez pour votre son
                                                </p>
                                                <Row className="g-2">
                                                    {usageRightsOptions.map((option) => (
                                                        <Col md={6} lg={4} key={option.value} className="mb-3">
                                                            <div className="border rounded p-3 h-100">
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id={`usage_${option.value}`}
                                                                    checked={formData.usage_rights.includes(option.value)}
                                                                    onChange={(e) => handleUsageRightsChange(option.value, e.target.checked)}
                                                                    label={
                                                                        <div>
                                                                            <div className="fw-medium text-primary">{option.label}</div>
                                                                            <small className="text-muted">{option.description}</small>
                                                                        </div>
                                                                    }
                                                                    className="mb-0"
                                                                />
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Paramètres de licence */}
                                    <Row className="g-3 mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <div className="d-flex align-items-center mb-2">
                                                    <FontAwesomeIcon icon={faClock} className="text-warning me-2" />
                                                    <HelpTooltip text="Durée pendant laquelle la licence est valide">
                                                        <Form.Label className="fw-medium mb-0">Durée de la licence</Form.Label>
                                                    </HelpTooltip>
                                                </div>
                                                <Form.Select
                                                    name="license_duration"
                                                    value={formData.license_duration}
                                                    onChange={handleInputChange}
                                                    className="form-select-lg"
                                                >
                                                    <option value="perpetual">🌟 Perpétuelle (à vie) - Recommandé</option>
                                                    <option value="1_year">1 an</option>
                                                    <option value="5_years">5 ans</option>
                                                    <option value="10_years">10 ans</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <div className="d-flex align-items-center mb-2">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-success me-2" />
                                                    <HelpTooltip text="Zone géographique où la licence est valide">
                                                        <Form.Label className="fw-medium mb-0">Territoire</Form.Label>
                                                    </HelpTooltip>
                                                </div>
                                                <Form.Select
                                                    name="territory"
                                                    value={formData.territory}
                                                    onChange={handleInputChange}
                                                    className="form-select-lg"
                                                >
                                                    <option value="worldwide">🌍 Monde entier - Recommandé</option>
                                                    <option value="africa">🌍 Afrique</option>
                                                    <option value="cameroon">🇨🇲 Cameroun uniquement</option>
                                                    <option value="francophone">🇫🇷 Pays francophones</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Conditions spécifiques */}
                                    <div className="bg-light rounded p-3 mb-4">
                                        <h6 className="fw-bold mb-3 text-primary">
                                            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                                            Conditions spécifiques
                                        </h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="commercial_use"
                                                        id="commercial_use"
                                                        checked={formData.commercial_use}
                                                        onChange={handleInputChange}
                                                        label={
                                                            <div>
                                                                <strong>💼 Utilisation commerciale autorisée</strong>
                                                                <div className="small text-muted">Permet l'utilisation dans des projets commerciaux</div>
                                                            </div>
                                                        }
                                                        className="border rounded p-3"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="attribution_required"
                                                        id="attribution_required"
                                                        checked={formData.attribution_required}
                                                        onChange={handleInputChange}
                                                        label={
                                                            <div>
                                                                <strong>📝 Attribution requise</strong>
                                                                <div className="small text-muted">L'utilisateur doit mentionner votre nom</div>
                                                            </div>
                                                        }
                                                        className="border rounded p-3"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="modifications_allowed"
                                                        id="modifications_allowed"
                                                        checked={formData.modifications_allowed}
                                                        onChange={handleInputChange}
                                                        label={
                                                            <div>
                                                                <strong>✂️ Modifications autorisées</strong>
                                                                <div className="small text-muted">Permet de modifier, remixer le son</div>
                                                            </div>
                                                        }
                                                        className="border rounded p-3"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="distribution_allowed"
                                                        id="distribution_allowed"
                                                        checked={formData.distribution_allowed}
                                                        onChange={handleInputChange}
                                                        label={
                                                            <div>
                                                                <strong>🔄 Redistribution autorisée</strong>
                                                                <div className="small text-muted">Permet de redistribuer le son modifié</div>
                                                            </div>
                                                        }
                                                        className="border rounded p-3"
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Déclaration des droits */}
                                    <Row className="g-3">
                                        <Col>
                                            <Form.Group>
                                                <div className="d-flex align-items-center mb-2">
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-info me-2" />
                                                    <HelpTooltip text="Déclaration détaillée des droits et restrictions spécifiques">
                                                        <Form.Label className="fw-medium mb-0">Déclaration des droits (optionnel)</Form.Label>
                                                    </HelpTooltip>
                                                </div>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="rights_statement"
                                                    value={formData.rights_statement}
                                                    onChange={handleInputChange}
                                                    placeholder="Ajoutez ici toute condition particulière ou restriction spécifique non couverte par les options ci-dessus..."
                                                    className="form-control-lg"
                                                />
                                                <Form.Text className="text-muted">
                                                    Par exemple : "Interdit pour contenu politique", "Usage limité à 30 secondes", etc.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Résumé des droits sélectionnés */}
                                    {(formData.usage_rights.length > 0 || formData.commercial_use || formData.attribution_required || formData.modifications_allowed || formData.distribution_allowed) && (
                                        <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded">
                                            <h6 className="fw-bold mb-2 text-primary">
                                                📋 Résumé de vos autorisations
                                            </h6>
                                            <div className="small">
                                                {formData.usage_rights.length > 0 && (
                                                    <div className="mb-1">
                                                        <strong>Utilisations:</strong> {formData.usage_rights.map(right =>
                                                            usageRightsOptions.find(opt => opt.value === right)?.label
                                                        ).join(', ')}
                                                    </div>
                                                )}
                                                <div className="mb-1">
                                                    <strong>Commercial:</strong> {formData.commercial_use ? '✅ Autorisé' : '❌ Non autorisé'}
                                                </div>
                                                <div className="mb-1">
                                                    <strong>Attribution:</strong> {formData.attribution_required ? '✅ Requise' : '❌ Non requise'}
                                                </div>
                                                <div className="mb-1">
                                                    <strong>Modifications:</strong> {formData.modifications_allowed ? '✅ Autorisées' : '❌ Non autorisées'}
                                                </div>
                                                <div>
                                                    <strong>Redistribution:</strong> {formData.distribution_allowed ? '✅ Autorisée' : '❌ Non autorisée'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faEuroSign} className="me-2 text-success" />
                                        5. Prix et catégorisation
                                    </h5>
                                    <small className="text-muted">Définissez le prix et les mots-clés pour votre son</small>
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
                                                    label="💝 Son gratuit (recommandé pour débuter)"
                                                    className="mb-3"
                                                />
                                            </Form.Group>
                                        </Col>
                                        {!formData.is_free && (
                                            <Col md={6}>
                                                <Form.Group>
                                                    <HelpTooltip text="Prix en francs CFA. Commencez par des prix attractifs pour vos premiers sons">
                                                        <Form.Label className="fw-medium">Prix de vente (FCFA) *</Form.Label>
                                                    </HelpTooltip>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                            placeholder="Ex: 2500"
                                                        min="0"
                                                        step="500"
                                                        isInvalid={!!errors.price}
                                                    />
                                                    <span className="input-group-text">FCFA</span>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.price}
                                                    </Form.Control.Feedback>
                                                </div>
                                                    <Form.Text className="text-muted">
                                                        Prix suggérés : Instrumentaux 1500-5000 FCFA, Complets 3000-10000 FCFA
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        )}
                                        <Col>
                                            <Form.Group>
                                                <HelpTooltip text="Mots-clés pour aider les utilisateurs à trouver votre son">
                                                    <Form.Label className="fw-medium">Tags (mots-clés)</Form.Label>
                                                </HelpTooltip>
                                                <Form.Control
                                                    type="text"
                                                    value={tagsInput}
                                                    onChange={(e) => handleInputChange({ target: { name: 'tags', value: e.target.value } })}
                                                    placeholder="afro, beat, danse, chill, commercial, radio (séparés par des virgules)"
                                                />
                                                <Form.Text className="text-muted">
                                                    Utilisez des mots-clés que vos clients pourraient rechercher
                                                </Form.Text>
                                                {formData.tags.length > 0 && (
                                                    <div className="mt-2">
                                                        {formData.tags.map((tag, index) => (
                                                            <Badge key={index} bg="secondary" className="me-1 mb-1">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUpload} className="me-2 text-primary" />
                                        6. Fichiers audio et visuels
                                    </h5>
                                    <small className="text-muted">Uploadez votre fichier audio et optionnellement une image de couverture</small>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Fichier audio principal de votre création (obligatoire)">
                                                <Form.Label className="fw-medium">Fichier audio *</Form.Label>
                                                </HelpTooltip>
                                                {!formData.audio_file ? (
                                                    <div
                                                        className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                                        style={{ borderColor: '#dee2e6', cursor: 'pointer', minHeight: '180px' }}
                                                        onClick={() => document.getElementById('audioFile').click()}
                                                    >
                                                        <FontAwesomeIcon icon={faMusic} size="3x" className="text-muted mb-3" />
                                                        <p className="mb-2 fw-medium">📁 Cliquez pour uploader votre son</p>
                                                        <small className="text-muted">
                                                            Formats supportés : MP3, WAV, M4A, AAC<br/>
                                                            Taille maximale : 20MB<br/>
                                                            Qualité recommandée : 320kbps ou plus
                                                        </small>
                                                        <Form.Control
                                                            id="audioFile"
                                                            type="file"
                                                            accept="audio/*"
                                                            onChange={(e) => handleFileUpload(e, 'audio')}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="border rounded p-3 bg-light">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <FontAwesomeIcon icon={faMusic} className="text-primary me-2" />
                                                            <div>
                                                                    <div className="fw-medium">{formData.audio_file.name}</div>
                                                                <small className="text-muted">
                                                                        📏 {(formData.audio_file.size / 1024 / 1024).toFixed(2)} MB
                                                                        {previews.audioDuration > 0 && ` • ⏱️ ${formatDuration(previews.audioDuration)}`}
                                                                </small>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeFile('audio')}
                                                                title="Supprimer le fichier"
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </Button>
                                                        </div>
                                                        {previews.audio && (
                                                            <div className="d-flex gap-2">
                                                                <audio ref={audioRef} src={previews.audio} className="d-none" />
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={toggleAudioPreview}
                                                                    className="flex-grow-1"
                                                                >
                                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="me-2" />
                                                                    {isPlaying ? '⏸️ Pause' : '▶️ Écouter l\'aperçu'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {errors.audio_file && (
                                                    <div className="text-danger small mt-2">
                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                        {errors.audio_file}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <HelpTooltip text="Image qui représentera votre son (optionnel mais recommandé)">
                                                <Form.Label className="fw-medium">Image de couverture</Form.Label>
                                                </HelpTooltip>
                                                {!formData.cover_image ? (
                                                    <div
                                                        className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                                        style={{ borderColor: '#dee2e6', cursor: 'pointer', minHeight: '180px' }}
                                                        onClick={() => document.getElementById('coverImage').click()}
                                                    >
                                                        <FontAwesomeIcon icon={faImage} size="3x" className="text-muted mb-3" />
                                                        <p className="mb-2 fw-medium">🖼️ Ajoutez une image de couverture</p>
                                                        <small className="text-muted">
                                                            Formats : JPG, PNG<br/>
                                                            Taille max : 2MB<br/>
                                                            Dimensions recommandées : 1400x1400px
                                                        </small>
                                                        <Form.Control
                                                            id="coverImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileUpload(e, 'cover')}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="position-relative">
                                                        <img
                                                            src={previews.cover}
                                                            alt="Aperçu de la couverture"
                                                            className="img-fluid rounded"
                                                            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-2"
                                                            onClick={() => removeFile('cover')}
                                                            title="Supprimer l'image"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 rounded-bottom">
                                                            <small>✅ Image prête</small>
                                                        </div>
                                                    </div>
                                                )}
                                                {errors.cover_image && (
                                                    <div className="text-danger small mt-2">
                                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                        {errors.cover_image}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="light" className="mt-3 border">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" />
                                        <strong>💡 Conseil :</strong> Une bonne image de couverture augmente vos chances de vente de 70% ! Choisissez une image qui reflète l'ambiance de votre son.
                                    </Alert>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            <Card className="border-0 shadow-sm sticky-top">
                                <Card.Body>
                                    {loading && (
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <small className="text-muted">Upload en cours...</small>
                                                <small className="text-muted">{uploadProgress}%</small>
                                            </div>
                                            <ProgressBar now={uploadProgress} animated />
                                        </div>
                                    )}

                                    <div className="d-grid gap-2 mb-3">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={loading ? faSpinner : faSave} className="me-2" spin={loading} />
                                            {loading ? 'Publication...' : 'Publier le son'}
                                        </Button>
                                    </div>

                                    <Alert variant="info" className="mb-3">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                        <strong>Validation requise :</strong> Votre son sera vérifié par notre équipe avant publication (24-48h).
                                    </Alert>

                                    <div className="bg-light rounded p-3">
                                        <h6 className="fw-bold mb-2">✅ Checklist avant publication</h6>
                                        <ul className="list-unstyled mb-0 small">
                                            <li className="mb-1">📝 Titre accrocheur et descriptif</li>
                                            <li className="mb-1">🎵 Fichier audio de qualité</li>
                                            <li className="mb-1">👤 Droits d'auteur corrects</li>
                                            <li className="mb-1">📋 Licence adaptée</li>
                                            <li className="mb-1">🏷️ Tags pertinents</li>
                                            <li className="mb-1">💰 Prix réaliste</li>
                                        </ul>
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

export default AddSound;
