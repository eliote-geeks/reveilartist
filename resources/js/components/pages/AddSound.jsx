import React, { useState, useRef, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    ProgressBar,
    Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMusic,
    faUpload,
    faPlay,
    faPause,
    faImage,
    faEuroSign,
    faArrowLeft,
    faSave,
    faTimes,
    faSpinner,
    faInfoCircle,
    faShieldAlt,
    faCopyright,
    faCloudUpload,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "../../../css/admin.css";

const AddSound = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const audioRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        // Informations de base (obligatoires)
        title: "",
        description: "",
        category_id: "",
        audio_file: null,

        // Informations techniques (optionnelles)
        genre: "",
        bpm: "",
        key: "",
        credits: "",
        tags: [],

        // Prix et licence
        is_free: true,
        price: "",

        // Image de couverture (optionnelle)
        cover_image: null,

        // Champs de licence et droits d'auteur (optionnels)
        license_type: "",
        copyright_owner: "",
        composer: "",
        performer: "",
        producer: "",
        release_date: "",
        isrc_code: "",
        publishing_rights: "",
        usage_rights: [],
        commercial_use: false,
        attribution_required: false,
        modifications_allowed: false,
        distribution_allowed: false,
        license_duration: "",
        territory: "",
        rights_statement: "",
    });

    const [previews, setPreviews] = useState({
        audio: null,
        cover: null,
        audioDuration: 0,
    });

    const [tagsInput, setTagsInput] = useState("");

    const licenseTypes = [
        { value: "", label: "Sélectionner un type de licence" },
        { value: "royalty_free", label: "Libre de droits" },
        { value: "creative_commons", label: "Creative Commons" },
        { value: "exclusive", label: "Licence exclusive" },
        { value: "custom", label: "Licence personnalisée" },
    ];

    const licenseDurations = [
        { value: "", label: "Sélectionner une durée" },
        { value: "perpetual", label: "Perpétuelle" },
        { value: "1_year", label: "1 an" },
        { value: "5_years", label: "5 ans" },
        { value: "10_years", label: "10 ans" },
    ];

    const territories = [
        { value: "", label: "Sélectionner un territoire" },
        { value: "worldwide", label: "Mondial" },
        { value: "africa", label: "Afrique" },
        { value: "cameroon", label: "Cameroun" },
        { value: "francophone", label: "Pays francophones" },
    ];

    const usageRightsOptions = [
        { value: "broadcast", label: "Diffusion radio/TV" },
        { value: "streaming", label: "Plateformes de streaming" },
        { value: "sync", label: "Synchronisation (films, pub)" },
        { value: "live", label: "Performances live" },
        { value: "remix", label: "Remix/Sampling" },
        { value: "youtube", label: "Monétisation YouTube" },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/sounds/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCategories(data.categories || []);
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des catégories:", error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "tags") {
            setTagsInput(value);
            const tagsArray = value
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag);
            setFormData((prev) => ({
                ...prev,
                tags: tagsArray,
            }));
        } else {
            setFormData((prev) => ({
            ...prev,
                [name]: type === "checkbox" ? checked : value,
        }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleUsageRightsChange = (rightValue, checked) => {
        setFormData((prev) => ({
            ...prev,
            usage_rights: checked
                ? [...prev.usage_rights, rightValue]
                : prev.usage_rights.filter((r) => r !== rightValue),
        }));
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === "audio") {
            const validTypes = [
                "audio/mp3",
                "audio/mpeg",
                "audio/wav",
                "audio/m4a",
                "audio/aac",
                "audio/flac",
            ];
            if (!validTypes.includes(file.type)) {
                setErrors((prev) => ({
                    ...prev,
                    audio_file:
                        "Format audio non supporté. Utilisez MP3, WAV, M4A, AAC ou FLAC.",
                }));
                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    audio_file: "Le fichier audio ne doit pas dépasser 20MB.",
                }));
                return;
            }

            setFormData((prev) => ({ ...prev, audio_file: file }));

            const audioUrl = URL.createObjectURL(file);
            setPreviews((prev) => ({ ...prev, audio: audioUrl }));

            const audio = new Audio(audioUrl);
            audio.addEventListener("loadedmetadata", () => {
                setPreviews((prev) => ({
                    ...prev,
                    audioDuration: audio.duration,
                }));
            });

            setErrors((prev) => ({ ...prev, audio_file: "" }));
        } else if (type === "cover") {
            const validTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!validTypes.includes(file.type)) {
                setErrors((prev) => ({
                    ...prev,
                    cover_image:
                        "Format d'image non supporté. Utilisez JPG ou PNG.",
                }));
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    cover_image: "L'image ne doit pas dépasser 2MB.",
                }));
                return;
            }

            setFormData((prev) => ({ ...prev, cover_image: file }));

            const imageUrl = URL.createObjectURL(file);
            setPreviews((prev) => ({ ...prev, cover: imageUrl }));

            setErrors((prev) => ({ ...prev, cover_image: "" }));
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
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const removeFile = (type) => {
        if (type === "audio") {
            setFormData((prev) => ({ ...prev, audio_file: null }));
            setPreviews((prev) => ({ ...prev, audio: null, audioDuration: 0 }));
            setIsPlaying(false);
        } else if (type === "cover") {
            setFormData((prev) => ({ ...prev, cover_image: null }));
            setPreviews((prev) => ({ ...prev, cover: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Champs obligatoires
        if (!formData.title.trim()) newErrors.title = "Le titre est requis";
        if (!formData.category_id)
            newErrors.category_id = "La catégorie est requise";
        if (!formData.audio_file)
            newErrors.audio_file = "Le fichier audio est requis";

        // Validation du prix si son payant
        if (!formData.is_free && (!formData.price || formData.price <= 0)) {
            newErrors.price = "Le prix doit être supérieur à 0 pour un son payant";
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
        setUploadProgress(0);

        try {
            const submitData = new FormData();

            // Données obligatoires
            submitData.append("title", formData.title);
            submitData.append("category_id", formData.category_id);
            submitData.append("audio_file", formData.audio_file);

            // Données optionnelles de base
            if (formData.description) submitData.append("description", formData.description);
            if (formData.genre) submitData.append("genre", formData.genre);
            if (formData.bpm) submitData.append("bpm", formData.bpm);
            if (formData.key) submitData.append("key", formData.key);
            if (formData.credits) submitData.append("credits", formData.credits);

            // Prix et licence
            submitData.append("is_free", formData.is_free ? "1" : "0");
            if (!formData.is_free && formData.price) {
                submitData.append("price", formData.price);
            }

            // Tags
            if (formData.tags && formData.tags.length > 0) {
                formData.tags.forEach((tag, index) => {
                    submitData.append(`tags[${index}]`, tag);
                });
            }

            // Image de couverture
            if (formData.cover_image) {
                submitData.append("cover_image", formData.cover_image);
            }

            // Champs de licence et droits d'auteur (optionnels)
            if (formData.license_type) submitData.append("license_type", formData.license_type);
            if (formData.copyright_owner) submitData.append("copyright_owner", formData.copyright_owner);
            if (formData.composer) submitData.append("composer", formData.composer);
            if (formData.performer) submitData.append("performer", formData.performer);
            if (formData.producer) submitData.append("producer", formData.producer);
            if (formData.release_date) submitData.append("release_date", formData.release_date);
            if (formData.isrc_code) submitData.append("isrc_code", formData.isrc_code);
            if (formData.publishing_rights) submitData.append("publishing_rights", formData.publishing_rights);
            if (formData.license_duration) submitData.append("license_duration", formData.license_duration);
            if (formData.territory) submitData.append("territory", formData.territory);
            if (formData.rights_statement) submitData.append("rights_statement", formData.rights_statement);

            // Droits d'utilisation booléens
            submitData.append("commercial_use", formData.commercial_use ? "1" : "0");
            submitData.append("attribution_required", formData.attribution_required ? "1" : "0");
            submitData.append("modifications_allowed", formData.modifications_allowed ? "1" : "0");
            submitData.append("distribution_allowed", formData.distribution_allowed ? "1" : "0");

            // Droits d'usage multiples
            if (formData.usage_rights && formData.usage_rights.length > 0) {
                formData.usage_rights.forEach((right, index) => {
                    submitData.append(`usage_rights[${index}]`, right);
                });
            }

            // Simulation du progrès
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                }
                return prev + 10;
            });
        }, 200);

            const response = await fetch("/api/sounds", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: submitData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (response.ok) {
                setSuccess("Son ajouté avec succès ! Il sera disponible après validation.");
                setTimeout(() => {
                    navigate("/profile");
                }, 2000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({
                        general: data.message || "Erreur lors de l'ajout du son",
                    });
                }
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            setErrors({ general: "Erreur de connexion. Veuillez réessayer." });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

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
        <div className="min-vh-100 bg-light" style={{ paddingTop: "80px" }}>
            <Container className="py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                            Ajouter un nouveau son
                        </h2>
                        <p className="text-muted mb-0">Partagez votre création musicale avec la communauté</p>
                    </div>
                    <Button
                        as={Link}
                        to="/dashboard"
                        variant="outline-secondary"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour
                    </Button>
                </div>

                {success && (
                    <Alert variant="success" className="mb-4">
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        {success}
                    </Alert>
                )}

                {errors.general && (
                    <Alert variant="danger" className="mb-4">
                        {errors.general}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        {/* Colonne principale */}
                        <Col lg={8}>
                            {/* Upload audio */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCloudUpload} className="me-2 text-primary" />
                                        Fichier audio *
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                {!formData.audio_file ? (
                    <div
                                            className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                            style={{
                                                borderColor: "#007bff",
                                                cursor: "pointer",
                                                backgroundColor: "#f8f9fa",
                                            }}
                                            onClick={() => document.getElementById("audioFile").click()}
                    >
                        <FontAwesomeIcon icon={faMusic} size="3x" className="text-primary mb-3" />
                                            <h5 className="mb-2">Cliquez ici pour sélectionner votre fichier audio</h5>
                        <p className="text-muted mb-0">
                                                Formats supportés : MP3, WAV, M4A, AAC, FLAC (max 20MB)
                        </p>
                        <Form.Control
                            id="audioFile"
                            type="file"
                            accept="audio/*"
                                                onChange={(e) => handleFileUpload(e, "audio")}
                                                style={{ display: "none" }}
                        />
                    </div>
                ) : (
                                        <div className="bg-light rounded p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faMusic} className="text-success me-3" size="2x" />
                                                    <div>
                                                        <h6 className="mb-1">{formData.audio_file.name}</h6>
                                    <small className="text-muted">
                                        {(formData.audio_file.size / 1024 / 1024).toFixed(2)} MB
                                        {previews.audioDuration > 0 && ` • ${formatDuration(previews.audioDuration)}`}
                                    </small>
                                </div>
                            </div>
                        <Button
                                variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeFile("audio")}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                        </Button>
                        </div>
                        {previews.audio && (
                                                <div>
                                <audio ref={audioRef} src={previews.audio} className="d-none" />
                                <Button
                                    variant="outline-primary"
                                    onClick={toggleAudioPreview}
                                                        size="sm"
                                >
                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="me-2" />
                                                        {isPlaying ? "Pause" : "Écouter"}
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
            </Card.Body>
        </Card>

                            {/* Informations de base */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                    Informations de base
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                    <Col md={8}>
                                            <Form.Group>
                                                <Form.Label>Titre du son *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Beat Afro Moderne 2024"
                                                    isInvalid={!!errors.title}
                                size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                    <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Catégorie *</Form.Label>
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
                                    size="lg"
                                                    >
                                    <option value="">Sélectionner</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </option>
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
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Décrivez l'ambiance, le style et l'utilisation de votre son..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Genre</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="genre"
                                                    value={formData.genre}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Afrobeat, Hip-Hop..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>BPM</Form.Label>
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
                                                <Form.Label>Tonalité</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="key"
                                                    value={formData.key}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Am, C#"
                                                />
                                            </Form.Group>
                                        </Col>
                    <Col>
                        <Form.Group>
                                                <Form.Label>Tags</Form.Label>
                            <Form.Control
                                type="text"
                                value={tagsInput}
                                                    onChange={(e) =>
                                                        handleInputChange({
                                                            target: { name: "tags", value: e.target.value },
                                                        })
                                                    }
                                                    placeholder="beat, instrumental, afro, commercial (séparés par des virgules)"
                            />
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
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Crédits</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="credits"
                                                    value={formData.credits}
                                                    onChange={handleInputChange}
                                                    placeholder="Compositeur, producteur, collaborateurs..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Prix et licence */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faEuroSign} className="me-2 text-success" />
                                        Prix et licence
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
                                    label="💝 Son gratuit (recommandé pour débuter)"
                                    className="mb-3"
                                />
                        {!formData.is_free && (
                                                    <>
                                                        <Form.Label>Prix (FCFA) *</Form.Label>
                                                        <div className="input-group">
                                        <Form.Control
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                                                placeholder="2500"
                                            min="0"
                                            step="500"
                                            isInvalid={!!errors.price}
                                        />
                                        <span className="input-group-text">FCFA</span>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.price}
                                        </Form.Control.Feedback>
                                                </div>
                                                    </>
                                                )}
                                </Form.Group>
                            </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Type de licence</Form.Label>
                                                <Form.Select
                                                    name="license_type"
                                                    value={formData.license_type}
                                                    onChange={handleInputChange}
                                                >
                                                    {licenseTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                    </Row>

                                    <hr className="my-3" />

                                    <h6 className="fw-bold mb-3">Droits d'utilisation</h6>
                                    <Row className="g-2">
                                                    {usageRightsOptions.map((option) => (
                                            <Col md={6} key={option.value}>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id={`usage_${option.value}`}
                                                                    checked={formData.usage_rights.includes(option.value)}
                                                    onChange={(e) =>
                                                        handleUsageRightsChange(option.value, e.target.checked)
                                                    }
                                                    label={option.label}
                                                />
                                                        </Col>
                                                    ))}
                                    </Row>

                                    <hr className="my-3" />

                        <h6 className="fw-bold mb-3">Conditions spécifiques</h6>
                                    <Row className="g-2">
                                            <Col md={6}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="commercial_use"
                                                        checked={formData.commercial_use}
                                                        onChange={handleInputChange}
                                                label="💼 Utilisation commerciale"
                                />
                            </Col>
                            <Col md={6}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="attribution_required"
                                                        checked={formData.attribution_required}
                                                        onChange={handleInputChange}
                                    label="📝 Attribution requise"
                                />
                                            </Col>
                                            <Col md={6}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="modifications_allowed"
                                                        checked={formData.modifications_allowed}
                                                        onChange={handleInputChange}
                                    label="✂️ Modifications autorisées"
                                />
                            </Col>
                            <Col md={6}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="distribution_allowed"
                                                        checked={formData.distribution_allowed}
                                                        onChange={handleInputChange}
                                    label="🔄 Redistribution autorisée"
                                />
                                            </Col>
                                        </Row>

                                    <Row className="g-3 mt-2">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Durée de licence</Form.Label>
                                                <Form.Select
                                                    name="license_duration"
                                                    value={formData.license_duration}
                                                    onChange={handleInputChange}
                                                >
                                                    {licenseDurations.map((duration) => (
                                                        <option key={duration.value} value={duration.value}>
                                                            {duration.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Territoire</Form.Label>
                                                <Form.Select
                                                    name="territory"
                                                    value={formData.territory}
                                                    onChange={handleInputChange}
                                                >
                                                    {territories.map((territory) => (
                                                        <option key={territory.value} value={territory.value}>
                                                            {territory.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Image de couverture */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                        Image de couverture
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                                {!formData.cover_image ? (
                                                    <div
                                            className="upload-zone border-2 border-dashed rounded p-3 text-center"
                                            style={{
                                                borderColor: "#6c757d",
                                                cursor: "pointer",
                                                backgroundColor: "#f8f9fa",
                                            }}
                                            onClick={() => document.getElementById("coverImage").click()}
                                        >
                                            <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                                            <p className="mb-0 small">Cliquez pour ajouter une image</p>
                                            <small className="text-muted">JPG, PNG (max 2MB)</small>
                                                        <Form.Control
                                                            id="coverImage"
                                                            type="file"
                                                            accept="image/*"
                                                onChange={(e) => handleFileUpload(e, "cover")}
                                                style={{ display: "none" }}
                                                        />
                                                    </div>
                                                ) : (
                                        <div className="position-relative">
                                                        <img
                                                            src={previews.cover}
                                                alt="Couverture"
                                                            className="img-fluid rounded"
                                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-2"
                                                onClick={() => removeFile("cover")}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </div>
                                                )}
                                                {errors.cover_image && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.cover_image}
                                                    </div>
                                                )}
                </Card.Body>
            </Card>

                            {/* Droits d'auteur */}
            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faCopyright} className="me-2 text-warning" />
                                        Droits d'auteur
                                    </h5>
                </Card.Header>
                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Propriétaire des droits</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="copyright_owner"
                                            value={formData.copyright_owner}
                                            onChange={handleInputChange}
                                            placeholder="Nom du propriétaire"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Compositeur</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="composer"
                                            value={formData.composer}
                                            onChange={handleInputChange}
                                            placeholder="Nom du compositeur"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Interprète</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="performer"
                                            value={formData.performer}
                                            onChange={handleInputChange}
                                            placeholder="Nom de l'interprète"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Producteur</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="producer"
                                            value={formData.producer}
                                            onChange={handleInputChange}
                                            placeholder="Nom du producteur"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Date de sortie</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="release_date"
                                            value={formData.release_date}
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Code ISRC</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="isrc_code"
                                            value={formData.isrc_code}
                                            onChange={handleInputChange}
                                            placeholder="Ex: USUM71703692"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Droits d'édition</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="publishing_rights"
                                            value={formData.publishing_rights}
                                            onChange={handleInputChange}
                                            placeholder="Maison d'édition, éditeur..."
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Déclaration de droits</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="rights_statement"
                                            value={formData.rights_statement}
                                            onChange={handleInputChange}
                                            placeholder="Informations supplémentaires sur les droits..."
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Barre de progression */}
                                    {loading && (
                        <div className="my-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Publication en cours...</small>
                                                <small className="text-muted">{uploadProgress}%</small>
                                            </div>
                                            <ProgressBar now={uploadProgress} animated />
                                        </div>
                                    )}

                    {/* Actions */}
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                                        <Button
                            as={Link}
                            to="/dashboard"
                            variant="outline-secondary"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Annuler
                        </Button>

                            <Button
                            type="submit"
                                            variant="primary"
                            disabled={loading}
                                            size="lg"
                                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                    Publication...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Publier le son
                                </>
                            )}
                        </Button>
                                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default AddSound;
