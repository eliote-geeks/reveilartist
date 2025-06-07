import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faVideo,
    faUpload,
    faArrowLeft,
    faPlay,
    faImage,
    faMusic,
    faTag,
    faUser,
    faCalendarAlt,
    faCheck,
    faTimes,
    faInfoCircle,
    faTrophy,
    faAward,
    faStar,
    faCrown
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AddClip = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: '',
        video_file: null,
        thumbnail_file: null,
        credits: {
            director: '',
            producer: '',
            cinematographer: '',
            editor: ''
        }
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const categories = [
        'Afrobeat', 'Rap', 'Makossa', 'Gospel', 'Zouk', 'Jazz', 'Pop',
        'R&B', 'Reggae', 'Hip-Hop', 'Soul', 'Blues', 'Rock'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('credits.')) {
            const creditField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                credits: {
                    ...prev.credits,
                    [creditField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Effacer l'erreur pour ce champ
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (file) {
            setFormData(prev => ({
                ...prev,
                [name]: file
            }));

            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (event) => {
                if (name === 'video_file') {
                    setVideoPreview(event.target.result);
                } else if (name === 'thumbnail_file') {
                    setThumbnailPreview(event.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        }

        if (!formData.category) {
            newErrors.category = 'La catégorie est requise';
        }

        if (!formData.video_file) {
            newErrors.video_file = 'Le fichier vidéo est requis';
        }

        if (!formData.thumbnail_file) {
            newErrors.thumbnail_file = 'La miniature est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const simulateUpload = () => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                setUploadProgress(Math.min(progress, 100));
            }, 200);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast?.error('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulation de l'upload
            await simulateUpload();

            // Ici, vous feriez l'appel API réel
            // const formDataToSend = new FormData();
            // Object.keys(formData).forEach(key => {
            //     if (key === 'credits') {
            //         formDataToSend.append(key, JSON.stringify(formData[key]));
            //     } else {
            //         formDataToSend.append(key, formData[key]);
            //     }
            // });

            toast?.success('Succès', 'Votre clip a été ajouté avec succès !');
            navigate('/clips');
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            toast?.error('Erreur', 'Une erreur est survenue lors de l\'upload');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getRewardInfo = () => {
        return [
            { type: 'Bronze', icon: faTrophy, threshold: '10K+', color: '#cd7f32' },
            { type: 'Argent', icon: faStar, threshold: '50K+', color: '#c0c0c0' },
            { type: 'Or', icon: faAward, threshold: '100K+', color: '#ffd700' },
            { type: 'Platine', icon: faTrophy, threshold: '500K+', color: '#e5e4e2' },
            { type: 'Diamant', icon: faCrown, threshold: '1M+', color: '#00d4ff' }
        ];
    };

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            <Container className="py-4">
                {/* Navigation */}
                <AnimatedElement animation="slideInLeft" delay={100}>
                    <Button
                        as={Link}
                        to="/clips"
                        variant="outline-primary"
                        className="mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour aux clips
                    </Button>
                </AnimatedElement>

                <Row className="justify-content-center">
                    <Col lg={8}>
                        {/* En-tête */}
                        <AnimatedElement animation="slideInUp" delay={200}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Body className="text-center py-5">
                                    <FontAwesomeIcon icon={faVideo} size="3x" className="text-primary mb-3" />
                                    <h1 className="h3 fw-bold mb-2">Ajouter un clip vidéo</h1>
                                    <p className="text-muted mb-0">
                                        Partagez votre créativité avec la communauté et gagnez des récompenses !
                                    </p>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>

                        {/* Système de récompenses */}
                        <AnimatedElement animation="slideInUp" delay={300}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Body>
                                    <h5 className="fw-bold mb-3">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                        Système de récompenses
                                    </h5>
                                    <p className="text-muted mb-3">
                                        Votre clip peut gagner des récompenses basées sur le nombre de vues :
                                    </p>
                                    <Row className="g-2">
                                        {getRewardInfo().map((reward, index) => (
                                            <Col key={index} xs={6} md={2}>
                                                <div className="text-center p-2">
                                                    <FontAwesomeIcon
                                                        icon={reward.icon}
                                                        style={{ color: reward.color }}
                                                        className="mb-1"
                                                    />
                                                    <div className="small fw-bold">{reward.type}</div>
                                                    <div className="small text-muted">{reward.threshold}</div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>

                        {/* Formulaire */}
                        <AnimatedElement animation="slideInUp" delay={400}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <Form onSubmit={handleSubmit}>
                                        {/* Informations de base */}
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3">
                                                <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                                                Informations de base
                                            </h6>

                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Titre du clip *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="title"
                                                            value={formData.title}
                                                            onChange={handleInputChange}
                                                            placeholder="Ex: Mon nouveau clip..."
                                                            isInvalid={!!errors.title}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.title}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Catégorie *</Form.Label>
                                                        <Form.Select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            isInvalid={!!errors.category}
                                                        >
                                                            <option value="">Choisir une catégorie</option>
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
                                                        <Form.Label className="fw-bold">Tags</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="tags"
                                                            value={formData.tags}
                                                            onChange={handleInputChange}
                                                            placeholder="Ex: cameroun, musique, culture..."
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Séparez les tags par des virgules
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Description *</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            placeholder="Décrivez votre clip..."
                                                            isInvalid={!!errors.description}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.description}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Fichiers */}
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3">
                                                <FontAwesomeIcon icon={faUpload} className="me-2 text-primary" />
                                                Fichiers
                                            </h6>

                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Fichier vidéo *</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            name="video_file"
                                                            accept="video/*"
                                                            onChange={handleFileChange}
                                                            isInvalid={!!errors.video_file}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.video_file}
                                                        </Form.Control.Feedback>
                                                        <Form.Text className="text-muted">
                                                            Formats acceptés: MP4, AVI, MOV (max 500MB)
                                                        </Form.Text>

                                                        {videoPreview && (
                                                            <div className="mt-2">
                                                                <video
                                                                    src={videoPreview}
                                                                    controls
                                                                    className="img-fluid rounded"
                                                                    style={{ maxHeight: '200px' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold">Miniature *</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            name="thumbnail_file"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                            isInvalid={!!errors.thumbnail_file}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.thumbnail_file}
                                                        </Form.Control.Feedback>
                                                        <Form.Text className="text-muted">
                                                            Formats acceptés: JPG, PNG (max 5MB)
                                                        </Form.Text>

                                                        {thumbnailPreview && (
                                                            <div className="mt-2">
                                                                <img
                                                                    src={thumbnailPreview}
                                                                    alt="Aperçu miniature"
                                                                    className="img-fluid rounded"
                                                                    style={{ maxHeight: '150px' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Crédits */}
                                        <div className="mb-4">
                                            <h6 className="fw-bold mb-3">
                                                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                                Crédits (optionnel)
                                            </h6>

                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Réalisateur</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="credits.director"
                                                            value={formData.credits.director}
                                                            onChange={handleInputChange}
                                                            placeholder="Nom du réalisateur"
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Producteur</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="credits.producer"
                                                            value={formData.credits.producer}
                                                            onChange={handleInputChange}
                                                            placeholder="Nom du producteur"
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Directeur photo</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="credits.cinematographer"
                                                            value={formData.credits.cinematographer}
                                                            onChange={handleInputChange}
                                                            placeholder="Nom du directeur photo"
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Monteur</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="credits.editor"
                                                            value={formData.credits.editor}
                                                            onChange={handleInputChange}
                                                            placeholder="Nom du monteur"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Progress bar pendant l'upload */}
                                        {uploading && (
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-bold">Upload en cours...</span>
                                                    <span>{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <ProgressBar
                                                    now={uploadProgress}
                                                    variant="primary"
                                                    animated
                                                />
                                            </div>
                                        )}

                                        {/* Boutons */}
                                        <div className="d-flex gap-3 justify-content-end">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => navigate('/clips')}
                                                disabled={uploading}
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="me-2" />
                                                Annuler
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={uploading}
                                            >
                                                <FontAwesomeIcon icon={uploading ? faUpload : faCheck} className="me-2" />
                                                {uploading ? 'Upload en cours...' : 'Publier le clip'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>

                    {/* Sidebar avec conseils */}
                    <Col lg={4}>
                        <AnimatedElement animation="slideInRight" delay={500}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-primary text-white">
                                    <h6 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                        Conseils pour un bon clip
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <h6 className="fw-bold">
                                            <FontAwesomeIcon icon={faVideo} className="me-2 text-primary" />
                                            Qualité vidéo
                                        </h6>
                                        <ul className="small text-muted mb-0">
                                            <li>Résolution minimum: 720p</li>
                                            <li>Format recommandé: MP4</li>
                                            <li>Durée: 30 secondes à 10 minutes</li>
                                        </ul>
                                    </div>

                                    <div className="mb-3">
                                        <h6 className="fw-bold">
                                            <FontAwesomeIcon icon={faImage} className="me-2 text-success" />
                                            Miniature
                                        </h6>
                                        <ul className="small text-muted mb-0">
                                            <li>Ratio 16:9 recommandé</li>
                                            <li>Image claire et attrayante</li>
                                            <li>Évitez le texte trop petit</li>
                                        </ul>
                                    </div>

                                    <div className="mb-3">
                                        <h6 className="fw-bold">
                                            <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                                            Tags et description
                                        </h6>
                                        <ul className="small text-muted mb-0">
                                            <li>Utilisez des mots-clés pertinents</li>
                                            <li>Décrivez le contenu clairement</li>
                                            <li>Mentionnez le genre musical</li>
                                        </ul>
                                    </div>

                                    <Alert variant="info" className="small">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                                        Plus votre clip est de qualité, plus il a de chances d'obtenir des vues et des récompenses !
                                    </Alert>
                                </Card.Body>
                            </Card>
                        </AnimatedElement>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .upload-area {
                    border: 2px dashed #dee2e6;
                    border-radius: 10px;
                    padding: 40px 20px;
                    text-align: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .upload-area:hover {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                }

                .upload-area.dragover {
                    border-color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                }

                .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                }

                .form-select:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                    transform: translateY(-1px);
                }

                .progress {
                    height: 8px;
                    border-radius: 4px;
                }

                .progress-bar {
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .upload-area {
                        padding: 30px 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddClip;
