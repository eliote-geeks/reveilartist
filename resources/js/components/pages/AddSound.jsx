import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
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
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../../css/admin.css';

const AddSound = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        description: '',
        category: '',
        genre: '',
        price: '',
        tags: '',
        license: 'standard',
        isExclusive: false,
        allowRemix: true,
        audioFile: null,
        coverImage: null
    });

    const [previews, setPreviews] = useState({
        audio: null,
        cover: null,
        audioDuration: 0
    });

    const categories = [
        'Afrobeat', 'Hip-Hop', 'R&B', 'Traditional', 'Electronic',
        'Jazz', 'Reggae', 'Gospel', 'Makossa', 'Bikutsi', 'Ndombolo'
    ];

    const licenses = [
        { value: 'standard', label: 'Licence Standard', description: 'Usage commercial limité' },
        { value: 'extended', label: 'Licence Étendue', description: 'Usage commercial illimité' },
        { value: 'exclusive', label: 'Licence Exclusive', description: 'Acheteur unique' }
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

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'audio') {
            // Validate audio file
            const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, audioFile: 'Format audio non supporté. Utilisez MP3, WAV ou FLAC.' }));
                return;
            }

            setFormData(prev => ({ ...prev, audioFile: file }));

            // Create audio preview
            const audioUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, audio: audioUrl }));

            // Get audio duration
            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                setPreviews(prev => ({ ...prev, audioDuration: audio.duration }));
            });

        } else if (type === 'cover') {
            // Validate image file
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, coverImage: 'Format d\'image non supporté. Utilisez JPG, PNG ou WebP.' }));
                return;
            }

            setFormData(prev => ({ ...prev, coverImage: file }));

            // Create image preview
            const imageUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, cover: imageUrl }));
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

        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (!formData.artist.trim()) newErrors.artist = 'L\'artiste est requis';
        if (!formData.category) newErrors.category = 'La catégorie est requise';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
        if (!formData.audioFile) newErrors.audioFile = 'Le fichier audio est requis';

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

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess('Son ajouté avec succès !');

            // Redirect after success
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }, 2500);
    };

    const removeFile = (type) => {
        if (type === 'audio') {
            setFormData(prev => ({ ...prev, audioFile: null }));
            setPreviews(prev => ({ ...prev, audio: null, audioDuration: 0 }));
            setIsPlaying(false);
        } else if (type === 'cover') {
            setFormData(prev => ({ ...prev, coverImage: null }));
            setPreviews(prev => ({ ...prev, cover: null }));
        }
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
                            <h3 className="mb-0 fw-bold">Ajouter un nouveau son</h3>
                            <small className="text-muted">Uploadez et configurez votre piste audio</small>
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
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                        Informations de base
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Titre du son *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Afro Fusion Beat"
                                                    isInvalid={!!errors.title}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.title}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Artiste *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="artist"
                                                    value={formData.artist}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: DJ Cameroun"
                                                    isInvalid={!!errors.artist}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.artist}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Catégorie *</Form.Label>
                                                <Form.Select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.category}
                                                >
                                                    <option value="">Sélectionner une catégorie</option>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.category}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Genre</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="genre"
                                                    value={formData.genre}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: Afrobeat moderne"
                                                />
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
                                                    placeholder="Décrivez votre son..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Tags</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="tags"
                                                    value={formData.tags}
                                                    onChange={handleInputChange}
                                                    placeholder="afro, beat, dance (séparés par des virgules)"
                                                />
                                                <Form.Text className="text-muted">
                                                    Séparez les tags par des virgules
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Prix (FCFA) *</Form.Label>
                                                <div className="input-group">
                                                    <Form.Control
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                        placeholder="0"
                                                        min="0"
                                                        step="500"
                                                        isInvalid={!!errors.price}
                                                    />
                                                    <span className="input-group-text">FCFA</span>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.price}
                                                    </Form.Control.Feedback>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Upload de fichiers */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faUpload} className="me-2 text-success" />
                                        Fichiers
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-4">
                                        {/* Upload audio */}
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Fichier audio *</Form.Label>
                                                {!formData.audioFile ? (
                                                    <div
                                                        className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                                        style={{ borderColor: '#dee2e6', cursor: 'pointer' }}
                                                        onClick={() => document.getElementById('audioFile').click()}
                                                    >
                                                        <FontAwesomeIcon icon={faMusic} size="2x" className="text-muted mb-2" />
                                                        <p className="mb-2">Cliquez pour uploader un fichier audio</p>
                                                        <small className="text-muted">MP3, WAV, FLAC (max 50MB)</small>
                                                        <Form.Control
                                                            id="audioFile"
                                                            type="file"
                                                            accept="audio/*"
                                                            onChange={(e) => handleFileUpload(e, 'audio')}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="border rounded p-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                                            <div>
                                                                <div className="fw-medium">{formData.audioFile.name}</div>
                                                                <small className="text-muted">
                                                                    {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                                                                    {previews.audioDuration > 0 && ` • ${formatDuration(previews.audioDuration)}`}
                                                                </small>
                                                            </div>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeFile('audio')}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </Button>
                                                        </div>
                                                        {previews.audio && (
                                                            <div>
                                                                <audio ref={audioRef} src={previews.audio} className="d-none" />
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={toggleAudioPreview}
                                                                >
                                                                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="me-2" />
                                                                    {isPlaying ? 'Pause' : 'Écouter'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {errors.audioFile && (
                                                    <div className="text-danger small mt-1">{errors.audioFile}</div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        {/* Upload cover */}
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-medium">Image de couverture</Form.Label>
                                                {!formData.coverImage ? (
                                                    <div
                                                        className="upload-zone border-2 border-dashed rounded p-4 text-center"
                                                        style={{ borderColor: '#dee2e6', cursor: 'pointer', minHeight: '160px' }}
                                                        onClick={() => document.getElementById('coverImage').click()}
                                                    >
                                                        <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                                                        <p className="mb-2">Cliquez pour uploader une image</p>
                                                        <small className="text-muted">JPG, PNG, WebP (max 5MB)</small>
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
                                                            alt="Cover preview"
                                                            className="img-fluid rounded"
                                                            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-2"
                                                            onClick={() => removeFile('cover')}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </div>
                                                )}
                                                {errors.coverImage && (
                                                    <div className="text-danger small mt-1">{errors.coverImage}</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col lg={4}>
                            {/* Licence et options */}
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                                        Licence et options
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-medium">Type de licence</Form.Label>
                                        {licenses.map(license => (
                                            <Form.Check
                                                key={license.value}
                                                type="radio"
                                                name="license"
                                                value={license.value}
                                                checked={formData.license === license.value}
                                                onChange={handleInputChange}
                                                label={
                                                    <div>
                                                        <div className="fw-medium">{license.label}</div>
                                                        <small className="text-muted">{license.description}</small>
                                                    </div>
                                                }
                                                className="mb-2"
                                            />
                                        ))}
                                    </Form.Group>

                                    <hr />

                                    <Form.Check
                                        type="checkbox"
                                        name="isExclusive"
                                        checked={formData.isExclusive}
                                        onChange={handleInputChange}
                                        label="Son exclusif"
                                        className="mb-2"
                                    />

                                    <Form.Check
                                        type="checkbox"
                                        name="allowRemix"
                                        checked={formData.allowRemix}
                                        onChange={handleInputChange}
                                        label="Autoriser les remixes"
                                        className="mb-2"
                                    />
                                </Card.Body>
                            </Card>

                            {/* Actions */}
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

                                    <div className="d-grid gap-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faSave} className="me-2" />
                                            {loading ? 'Publication...' : 'Publier le son'}
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
                                            Le son sera disponible après validation
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

export default AddSound;
