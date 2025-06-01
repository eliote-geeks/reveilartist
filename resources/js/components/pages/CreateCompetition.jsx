import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Badge, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrophy,
    faMusic,
    faClock,
    faUsers,
    faCoins,
    faCalendarAlt,
    faMapMarkerAlt,
    faEdit,
    faPlus,
    faMinus,
    faCheck,
    faExclamationTriangle,
    faInfoCircle,
    faEye,
    faArrowLeft,
    faRocket,
    faMicrophone,
    faHeadphones,
    faList,
    faPercent,
    faTimes,
    faChartBar,
    faFire,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import { AnimatedElement } from '../common/PageTransition';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const CreateCompetition = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        entry_fee: '',
        max_participants: '',
        start_date: '',
        start_time: '',
        duration: '',
        rules: [''],
        prizes: [
            { position: 1, percentage: 50, label: '1er Prix' },
            { position: 2, percentage: 30, label: '2ème Prix' },
            { position: 3, percentage: 20, label: '3ème Prix' }
        ],
        judging_criteria: [
            { name: 'Flow/Rythme', weight: 30 },
            { name: 'Originalité', weight: 25 },
            { name: 'Technique', weight: 25 },
            { name: 'Présence scénique', weight: 20 }
        ],
        image: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const navigate = useNavigate();
    const toast = useToast();
    const { user, isArtist, isProducer, isAdmin } = useAuth();

    const categories = [
        'Rap', 'Afrobeat', 'Makossa', 'Gospel', 'Jazz',
        'Reggae', 'Hip-Hop', 'RnB', 'Pop', 'Folk'
    ];

    useEffect(() => {
        if (!isArtist() && !isProducer() && !isAdmin()) {
            if (toast) {
                toast.error('Accès refusé', 'Vous devez être artiste ou producteur pour créer une compétition');
            }
            navigate('/competitions');
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Calcul automatique de la cagnotte
        if (name === 'entry_fee' || name === 'max_participants') {
            calculatePrizePool();
        }
    };

    const calculatePrizePool = () => {
        const entryFee = parseInt(formData.entry_fee) || 0;
        const maxParticipants = parseInt(formData.max_participants) || 0;
        return entryFee * maxParticipants;
    };

    const addRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [...prev.rules, '']
        }));
    };

    const removeRule = (index) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const updateRule = (index, value) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.map((rule, i) => i === index ? value : rule)
        }));
    };

    const addCriteria = () => {
        setFormData(prev => ({
            ...prev,
            judging_criteria: [...prev.judging_criteria, { name: '', weight: 0 }]
        }));
    };

    const removeCriteria = (index) => {
        setFormData(prev => ({
            ...prev,
            judging_criteria: prev.judging_criteria.filter((_, i) => i !== index)
        }));
    };

    const updateCriteria = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            judging_criteria: prev.judging_criteria.map((criteria, i) =>
                i === index ? { ...criteria, [field]: value } : criteria
            )
        }));
    };

    const getTotalCriteriaWeight = () => {
        return formData.judging_criteria.reduce((total, criteria) => total + (parseInt(criteria.weight) || 0), 0);
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
                if (!formData.description.trim()) newErrors.description = 'La description est requise';
                if (!formData.category) newErrors.category = 'La catégorie est requise';
                break;
            case 2:
                if (!formData.entry_fee || formData.entry_fee < 500) newErrors.entry_fee = 'Frais minimum: 500 XAF';
                if (!formData.max_participants || formData.max_participants < 2) newErrors.max_participants = 'Minimum 2 participants';
                if (!formData.start_date) newErrors.start_date = 'Date requise';
                if (!formData.start_time) newErrors.start_time = 'Heure requise';
                if (!formData.duration || formData.duration < 30) newErrors.duration = 'Durée minimum: 30 minutes';
                break;
            case 3:
                const validRules = formData.rules.filter(rule => rule.trim());
                if (validRules.length < 1) newErrors.rules = 'Au moins une règle est requise';
                break;
            case 4:
                const totalWeight = getTotalCriteriaWeight();
                if (totalWeight !== 100) newErrors.judging_criteria = `Total doit être 100% (actuellement: ${totalWeight}%)`;
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        try {
            setIsSubmitting(true);

            // Simuler l'envoi
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (toast) {
                toast.success('Compétition créée', 'Votre compétition a été créée avec succès !');
            }
            navigate('/competitions');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            if (toast) {
                toast.error('Erreur', 'Erreur lors de la création de la compétition');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const StepIndicator = () => (
        <div className="step-indicator mb-4">
            <div className="d-flex align-items-center justify-content-center">
                {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                        <div
                            className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                            onClick={() => currentStep > step && setCurrentStep(step)}
                        >
                            {currentStep > step ? (
                                <FontAwesomeIcon icon={faCheck} />
                            ) : (
                                step
                            )}
                        </div>
                        {step < 4 && (
                            <div className={`step-connector ${currentStep > step ? 'completed' : ''}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="step-labels mt-2">
                <Row>
                    <Col xs={3} className="text-center">
                        <small className={currentStep >= 1 ? 'text-primary fw-bold' : 'text-muted'}>
                            Informations
                        </small>
                    </Col>
                    <Col xs={3} className="text-center">
                        <small className={currentStep >= 2 ? 'text-primary fw-bold' : 'text-muted'}>
                            Configuration
                        </small>
                    </Col>
                    <Col xs={3} className="text-center">
                        <small className={currentStep >= 3 ? 'text-primary fw-bold' : 'text-muted'}>
                            Règles
                        </small>
                    </Col>
                    <Col xs={3} className="text-center">
                        <small className={currentStep >= 4 ? 'text-primary fw-bold' : 'text-muted'}>
                            Critères
                        </small>
                    </Col>
                </Row>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <AnimatedElement animation="slideInRight" delay={100}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faEdit} size="2x" className="text-primary mb-2" />
                        <h4 className="fw-bold">Informations générales</h4>
                        <p className="text-muted">Décrivez votre compétition musicale</p>
                    </div>

                    <Form>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                        Titre de la compétition *
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Battle de Rap Urbain 2024"
                                        isInvalid={!!errors.title}
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.title}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faEdit} className="me-2 text-primary" />
                                        Description *
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Décrivez votre compétition, son ambiance, ce qui la rend unique..."
                                        isInvalid={!!errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.description}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        {formData.description.length}/500 caractères
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-success" />
                                        Catégorie musicale *
                                    </Form.Label>
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
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-info" />
                                        Image de couverture
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData(prev => ({...prev, image: e.target.files[0]}))}
                                    />
                                    <Form.Text className="text-muted">
                                        Format recommandé: 400x250px (optionnel)
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    const renderStep2 = () => (
        <AnimatedElement animation="slideInRight" delay={100}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faClock} size="2x" className="text-primary mb-2" />
                        <h4 className="fw-bold">Configuration</h4>
                        <p className="text-muted">Paramètres financiers et temporels</p>
                    </div>

                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faCoins} className="me-2 text-warning" />
                                        Frais d'inscription (XAF) *
                                    </Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="number"
                                            name="entry_fee"
                                            value={formData.entry_fee}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 5000"
                                            min="500"
                                            isInvalid={!!errors.entry_fee}
                                        />
                                        <InputGroup.Text>XAF</InputGroup.Text>
                                    </InputGroup>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.entry_fee}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faUsers} className="me-2 text-info" />
                                        Nombre max de participants *
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="max_participants"
                                        value={formData.max_participants}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 20"
                                        min="2"
                                        max="50"
                                        isInvalid={!!errors.max_participants}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.max_participants}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                                        Date de début *
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        isInvalid={!!errors.start_date}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.start_date}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                                        Heure de début *
                                    </Form.Label>
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

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                                        Durée (minutes) *
                                    </Form.Label>
                                    <Form.Select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.duration}
                                    >
                                        <option value="">Choisir la durée</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 heure</option>
                                        <option value="90">1h30</option>
                                        <option value="120">2 heures</option>
                                        <option value="180">3 heures</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.duration}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            {formData.entry_fee && formData.max_participants && (
                                <Col md={12}>
                                    <Alert variant="info" className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faChartBar} className="me-2" />
                                        <div>
                                            <strong>Cagnotte totale prévue: {formatCurrency(calculatePrizePool())}</strong>
                                            <div className="small text-muted">
                                                {formData.entry_fee} XAF × {formData.max_participants} participants
                                            </div>
                                        </div>
                                    </Alert>
                                </Col>
                            )}
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    const renderStep3 = () => (
        <AnimatedElement animation="slideInRight" delay={100}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faList} size="2x" className="text-primary mb-2" />
                        <h4 className="fw-bold">Règles de la compétition</h4>
                        <p className="text-muted">Définissez les règles pour vos participants</p>
                    </div>

                    <Form>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Form.Label className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faCheck} className="me-2 text-success" />
                                    Règles *
                                </Form.Label>
                                <Button variant="outline-primary" size="sm" onClick={addRule}>
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    Ajouter
                                </Button>
                            </div>

                            {formData.rules.map((rule, index) => (
                                <div key={index} className="mb-2">
                                    <InputGroup>
                                        <InputGroup.Text>{index + 1}.</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            value={rule}
                                            onChange={(e) => updateRule(index, e.target.value)}
                                            placeholder="Ex: Performance de 3 minutes maximum"
                                        />
                                        {formData.rules.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => removeRule(index)}
                                            >
                                                <FontAwesomeIcon icon={faMinus} />
                                            </Button>
                                        )}
                                    </InputGroup>
                                </div>
                            ))}

                            {errors.rules && (
                                <div className="text-danger small mt-1">
                                    {errors.rules}
                                </div>
                            )}
                        </div>

                        <Alert variant="light" className="border">
                            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" />
                            <strong>Règles suggérées :</strong>
                            <ul className="mb-0 mt-2">
                                <li>Durée de performance par participant</li>
                                <li>Contenu autorisé/interdit</li>
                                <li>Format de participation (live, enregistré)</li>
                                <li>Critères de disqualification</li>
                            </ul>
                        </Alert>

                        <div className="mt-4">
                            <h6 className="fw-bold mb-3">
                                <FontAwesomeIcon icon={faTrophy} className="me-2 text-warning" />
                                Répartition des prix
                            </h6>

                            {formData.prizes.map((prize, index) => (
                                <div key={index} className="mb-2">
                                    <Row className="align-items-center">
                                        <Col md={3}>
                                            <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'light'} className="p-2">
                                                {prize.label}
                                            </Badge>
                                        </Col>
                                        <Col md={3}>
                                            <InputGroup size="sm">
                                                <Form.Control
                                                    type="number"
                                                    value={prize.percentage}
                                                    onChange={(e) => {
                                                        const newPrizes = [...formData.prizes];
                                                        newPrizes[index].percentage = parseInt(e.target.value) || 0;
                                                        setFormData(prev => ({...prev, prizes: newPrizes}));
                                                    }}
                                                    min="0"
                                                    max="100"
                                                />
                                                <InputGroup.Text>%</InputGroup.Text>
                                            </InputGroup>
                                        </Col>
                                        <Col md={6}>
                                            <div className="text-muted small">
                                                {formatCurrency(calculatePrizePool() * prize.percentage / 100)}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ))}

                            <div className="mt-2 small text-muted">
                                Total: {formData.prizes.reduce((sum, prize) => sum + prize.percentage, 0)}%
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    const renderStep4 = () => (
        <AnimatedElement animation="slideInRight" delay={100}>
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faChartBar} size="2x" className="text-primary mb-2" />
                        <h4 className="fw-bold">Critères de jugement</h4>
                        <p className="text-muted">Définissez comment les performances seront évaluées</p>
                    </div>

                    <Form>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Form.Label className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faPercent} className="me-2 text-success" />
                                    Critères d'évaluation
                                </Form.Label>
                                <Button variant="outline-primary" size="sm" onClick={addCriteria}>
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    Ajouter
                                </Button>
                            </div>

                            {formData.judging_criteria.map((criteria, index) => (
                                <div key={index} className="mb-3">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <InputGroup>
                                                <InputGroup.Text>
                                                    <FontAwesomeIcon icon={faStar} />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="text"
                                                    value={criteria.name}
                                                    onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                                                    placeholder="Ex: Technique vocale"
                                                />
                                            </InputGroup>
                                        </Col>
                                        <Col md={4}>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    value={criteria.weight}
                                                    onChange={(e) => updateCriteria(index, 'weight', parseInt(e.target.value) || 0)}
                                                    min="0"
                                                    max="100"
                                                    placeholder="Poids"
                                                />
                                                <InputGroup.Text>%</InputGroup.Text>
                                            </InputGroup>
                                        </Col>
                                        <Col md={2}>
                                            {formData.judging_criteria.length > 1 && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeCriteria(index)}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            ))}

                            <div className="mt-3">
                                <ProgressBar
                                    now={getTotalCriteriaWeight()}
                                    variant={getTotalCriteriaWeight() === 100 ? 'success' : 'warning'}
                                    label={`${getTotalCriteriaWeight()}%`}
                                />
                                <div className="text-center mt-1 small">
                                    {getTotalCriteriaWeight() === 100 ? (
                                        <span className="text-success">
                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                            Répartition correcte
                                        </span>
                                    ) : (
                                        <span className="text-warning">
                                            Le total doit égaler 100%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {errors.judging_criteria && (
                                <div className="text-danger small mt-2">
                                    {errors.judging_criteria}
                                </div>
                            )}
                        </div>

                        <Alert variant="light" className="border">
                            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" />
                            <strong>Critères suggérés :</strong>
                            <ul className="mb-0 mt-2 small">
                                <li>Technique (voix, instruments)</li>
                                <li>Créativité/Originalité</li>
                                <li>Présence scénique</li>
                                <li>Respect du thème</li>
                                <li>Interaction avec le public</li>
                            </ul>
                        </Alert>
                    </Form>
                </Card.Body>
            </Card>
        </AnimatedElement>
    );

    if (!user || (!isArtist() && !isProducer() && !isAdmin())) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-warning mb-3" />
                    <h4>Accès refusé</h4>
                    <p className="text-muted">Vous devez être artiste ou producteur pour accéder à cette page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light avoid-header-overlap">
            {/* Header */}
            <div className="bg-gradient-primary text-white py-4">
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <Button
                                variant="outline-light"
                                className="me-3"
                                onClick={() => navigate('/competitions')}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </Button>
                            <FontAwesomeIcon icon={faRocket} size="2x" className="me-3" />
                            <span className="h2 fw-bold">Créer une compétition</span>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-light"
                                onClick={() => setShowPreview(true)}
                                disabled={!formData.title}
                            >
                                <FontAwesomeIcon icon={faEye} className="me-2" />
                                Aperçu
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-4">
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <StepIndicator />

                        <Form onSubmit={handleSubmit}>
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}

                            {/* Navigation */}
                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                    Précédent
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button variant="primary" onClick={nextStep}>
                                        Suivant
                                        <FontAwesomeIcon icon={faArrowLeft} className="ms-2" style={{transform: 'rotate(180deg)'}} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        variant="success"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faRocket} className="me-2" />
                                                Créer la compétition
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .step-indicator .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid #e9ecef;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #6c757d;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .step-indicator .step-circle.active {
                    border-color: #667eea;
                    color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .step-indicator .step-circle.completed {
                    background: #667eea;
                    border-color: #667eea;
                    color: white;
                }

                .step-indicator .step-connector {
                    height: 3px;
                    background: #e9ecef;
                    flex: 1;
                    margin: 0 10px;
                    transition: all 0.3s ease;
                }

                .step-indicator .step-connector.completed {
                    background: #667eea;
                }

                .form-control:focus,
                .form-select:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .card {
                    background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
                }

                .alert {
                    border-radius: 12px;
                }

                .form-control,
                .form-select {
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
};

export default CreateCompetition;
