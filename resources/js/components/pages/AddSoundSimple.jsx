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
    faPlay,
    faPause,
    faImage,
    faEuroSign,
    faArrowLeft,
    faSave,
    faTimes,
    faSpinner,
    faCloudUpload,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const AddSoundSimple = () => {
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
        // Champs obligatoires
        title: "",
        category_id: "",
        audio_file: null,

        // Champs optionnels de base
        description: "",
        genre: "",
        bpm: "",
        key: "",
        credits: "",
        tags: [],

        // Prix
        is_free: true,
        price: "",

        // Image de couverture
        cover_image: null,

        // Champs de droits d'auteur simplifiés
        copyright_owner: "",
        composer: "",
        license_type: "",
    });

    const [previews, setPreviews] = useState({
        audio: null,
        cover: null,
        audioDuration: 0,
    });

    const [tagsInput, setTagsInput] = useState("");

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
                    audio_file: "Format audio non supporté. Utilisez MP3, WAV, M4A, AAC ou FLAC.",
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
                    cover_image: "Format d'image non supporté. Utilisez JPG ou PNG.",
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

        if (!formData.title.trim()) newErrors.title = "Le titre est requis";
        if (!formData.category_id) newErrors.category_id = "La catégorie est requise";
        if (!formData.audio_file) newErrors.audio_file = "Le fichier audio est requis";
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

            // Données optionnelles
            if (formData.description) submitData.append("description", formData.description);
            if (formData.genre) submitData.append("genre", formData.genre);
            if (formData.bpm) submitData.append("bpm", formData.bpm);
            if (formData.key) submitData.append("key", formData.key);
            if (formData.credits) submitData.append("credits", formData.credits);
            if (formData.copyright_owner) submitData.append("copyright_owner", formData.copyright_owner);
            if (formData.composer) submitData.append("composer", formData.composer);
            if (formData.license_type) submitData.append("license_type", formData.license_type);

            // Prix
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
                        <p className="text-muted mb-0">Partagez votre création musicale</p>
                    </div>
                    <Button as={Link} to="/dashboard" variant="outline-secondary">
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
                                            <h5 className="mb-2">Cliquez pour sélectionner votre fichier audio</h5>
                                            <p className="text-muted mb-0">
                                                Formats : MP3, WAV, M4A, AAC, FLAC (max 20MB)
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
                                                <Button variant="outline-danger" size="sm" onClick={() => removeFile("audio")}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </Button>
                                            </div>
                                            {previews.audio && (
                                                <div>
                                                    <audio ref={audioRef} src={previews.audio} className="d-none" />
                                                    <Button variant="outline-primary" onClick={toggleAudioPreview} size="sm">
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
                                    <h5 className="fw-bold mb-0">Informations de base</h5>
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
                                                    placeholder="Décrivez votre son..."
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
                                                    placeholder="Ex: Afrobeat"
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
                                                    placeholder="Ex: Am"
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
                                                    placeholder="beat, instrumental, afro (séparés par des virgules)"
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
                                                    placeholder="Compositeur, producteur..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Prix */}
                            <Card className="border-0 shadow-sm">
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
                                                    label="💝 Son gratuit"
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
                                                    <option value="">Sélectionner</option>
                                                    <option value="royalty_free">Libre de droits</option>
                                                    <option value="creative_commons">Creative Commons</option>
                                                    <option value="exclusive">Licence exclusive</option>
                                                    <option value="custom">Licence personnalisée</option>
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
                                            style={{ cursor: "pointer", backgroundColor: "#f8f9fa" }}
                                            onClick={() => document.getElementById("coverImage").click()}
                                        >
                                            <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                                            <p className="mb-0 small">Cliquez pour ajouter</p>
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
                                        <div className="text-danger small mt-2">{errors.cover_image}</div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Droits d'auteur */}
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white">
                                    <h5 className="fw-bold mb-0">Droits d'auteur</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Propriétaire des droits</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="copyright_owner"
                                            value={formData.copyright_owner}
                                            onChange={handleInputChange}
                                            placeholder="Votre nom"
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Compositeur</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="composer"
                                            value={formData.composer}
                                            onChange={handleInputChange}
                                            placeholder="Nom du compositeur"
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
                        <Button as={Link} to="/dashboard" variant="outline-secondary" disabled={loading}>
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Annuler
                        </Button>

                        <Button type="submit" variant="primary" disabled={loading} size="lg">
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

export default AddSoundSimple;
