import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, InputGroup, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faQuestionCircle, faMusic, faUser, faShoppingCart,
    faTicketAlt, faDownload, faShieldAlt, faEnvelope, faUsers,
    faHeadphones, faClock, faMoneyBillWave, faGlobe
} from '@fortawesome/free-solid-svg-icons';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Toutes les questions', icon: faQuestionCircle },
        { id: 'account', label: 'Compte utilisateur', icon: faUser },
        { id: 'music', label: 'Sons et musique', icon: faMusic },
        { id: 'purchase', label: 'Achats et paiements', icon: faShoppingCart },
        { id: 'events', label: 'Événements', icon: faTicketAlt },
        { id: 'technical', label: 'Problèmes techniques', icon: faShieldAlt },
        { id: 'artist', label: 'Compte artiste', icon: faUsers }
    ];

    const faqs = [
        {
            id: 1,
            category: 'account',
            question: "Comment créer un compte sur Reveil4artist ?",
            answer: "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite de la page d'accueil. Remplissez le formulaire avec vos informations personnelles et confirmez votre adresse email. Vous pouvez également vous inscrire via vos réseaux sociaux."
        },
        {
            id: 2,
            category: 'account',
            question: "J'ai oublié mon mot de passe, que faire ?",
            answer: "Cliquez sur 'Mot de passe oublié ?' sur la page de connexion. Saisissez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe."
        },
        {
            id: 3,
            category: 'music',
            question: "Comment télécharger un son gratuit ?",
            answer: "Les sons gratuits peuvent être téléchargés directement. Cliquez sur le bouton 'Télécharger' sur la page du son. Vous devez être connecté à votre compte pour télécharger."
        },
        {
            id: 4,
            category: 'music',
            question: "Quelle est la différence entre sons gratuits et payants ?",
            answer: "Les sons gratuits peuvent être écoutés et téléchargés librement. Les sons payants offrent une prévisualisation de 20 secondes et nécessitent un achat pour le téléchargement complet."
        },
        {
            id: 5,
            category: 'purchase',
            question: "Quels moyens de paiement acceptez-vous ?",
            answer: "Nous acceptons les cartes bancaires (Visa, MasterCard), PayPal et Mobile Money (Orange Money, MTN Money) pour les utilisateurs camerounais."
        },
        {
            id: 6,
            category: 'purchase',
            question: "Comment fonctionne le panier d'achat ?",
            answer: "Ajoutez les sons ou billets d'événements à votre panier, puis procédez au paiement. Vos achats sont immédiatement disponibles dans votre profil après confirmation du paiement."
        },
        {
            id: 7,
            category: 'events',
            question: "Comment acheter des billets pour un événement ?",
            answer: "Consultez la page de l'événement, cliquez sur 'Acheter un billet', choisissez la quantité et ajoutez au panier. Finalisez votre achat pour recevoir votre billet électronique."
        },
        {
            id: 8,
            category: 'events',
            question: "Puis-je annuler ou modifier ma réservation ?",
            answer: "Les annulations sont possibles jusqu'à 48h avant l'événement. Contactez notre support pour modifier ou annuler votre réservation."
        },
        {
            id: 9,
            category: 'technical',
            question: "Pourquoi le lecteur audio ne fonctionne pas ?",
            answer: "Vérifiez votre connexion internet et assurez-vous que votre navigateur est à jour. Essayez de désactiver les bloqueurs de publicité qui peuvent interférer avec la lecture."
        },
        {
            id: 10,
            category: 'technical',
            question: "Les téléchargements sont lents, que faire ?",
            answer: "La vitesse dépend de votre connexion internet. Pour les gros fichiers, utilisez un gestionnaire de téléchargement ou téléchargez à un moment de faible affluence."
        },
        {
            id: 11,
            category: 'artist',
            question: "Comment devenir artiste sur la plateforme ?",
            answer: "Créez un compte puis demandez le statut d'artiste via votre profil. Vous devrez fournir des informations sur votre activité musicale pour validation."
        },
        {
            id: 12,
            category: 'artist',
            question: "Comment uploader mes sons ?",
            answer: "Une fois votre statut d'artiste validé, utilisez l'espace artiste pour uploader vos créations. Respectez les formats supportés (MP3, WAV) et les conditions d'utilisation."
        },
        {
            id: 13,
            category: 'music',
            question: "Puis-je utiliser les sons téléchargés commercialement ?",
            answer: "Cela dépend de la licence du son. Consultez les conditions d'utilisation de chaque son dans sa page de détails avant utilisation commerciale."
        },
        {
            id: 14,
            category: 'account',
            question: "Comment supprimer mon compte ?",
            answer: "Contactez notre support à reveilart4artist@gmail.com pour demander la suppression de votre compte. Cette action est irréversible."
        },
        {
            id: 15,
            category: 'purchase',
            question: "Puis-je obtenir un remboursement ?",
            answer: "Les remboursements sont possibles dans les 24h suivant l'achat si le contenu n'a pas été téléchargé. Contactez notre support pour faire une demande."
        }
    ];

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = searchTerm === '' ||
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Hero Section */}
            <div className="bg-gradient-primary text-white py-5" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3">
                                <FontAwesomeIcon icon={faQuestionCircle} className="me-3" />
                                Foire Aux Questions
                            </h1>
                            <p className="lead mb-4">
                                Trouvez rapidement les réponses à vos questions sur Reveil4artist
                            </p>
                            <Badge bg="light" text="dark" className="px-3 py-2">
                                <FontAwesomeIcon icon={faClock} className="me-2" />
                                Mise à jour : Décembre 2024
                            </Badge>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                {/* Barre de recherche */}
                <Row className="mb-4">
                    <Col lg={8} className="mx-auto">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3 text-center">
                                    <FontAwesomeIcon icon={faSearch} className="me-2 text-primary" />
                                    Rechercher dans la FAQ
                                </h5>
                                <InputGroup size="lg">
                                    <Form.Control
                                        type="text"
                                        placeholder="Tapez votre question..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <InputGroup.Text>
                                        <FontAwesomeIcon icon={faSearch} />
                                    </InputGroup.Text>
                                </InputGroup>
                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        {filteredFAQs.length} question(s) trouvée(s)
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Sidebar catégories */}
                    <Col lg={3}>
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                            <Card.Header className="bg-white border-bottom-0">
                                <h6 className="fw-bold mb-0">Catégories</h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {categories.map(category => (
                                    <Button
                                        key={category.id}
                                        variant={activeCategory === category.id ? "primary" : "link"}
                                        className={`w-100 text-start border-0 rounded-0 py-3 px-4 ${
                                            activeCategory === category.id ? 'text-white' : 'text-dark'
                                        }`}
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        <FontAwesomeIcon icon={category.icon} className="me-3" />
                                        {category.label}
                                    </Button>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Questions et réponses */}
                    <Col lg={9}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom-0 p-4">
                                <h4 className="fw-bold mb-0">
                                    Questions fréquentes
                                    {activeCategory !== 'all' && (
                                        <Badge bg="primary" className="ms-3">
                                            {categories.find(c => c.id === activeCategory)?.label}
                                        </Badge>
                                    )}
                                </h4>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {filteredFAQs.length > 0 ? (
                                    <Accordion defaultActiveKey="0" flush>
                                        {filteredFAQs.map((faq, index) => (
                                            <Accordion.Item key={faq.id} eventKey={index.toString()}>
                                                <Accordion.Header>
                                                    <span className="fw-medium">{faq.question}</span>
                                                </Accordion.Header>
                                                <Accordion.Body className="py-4">
                                                    <p className="mb-0 text-muted" style={{ lineHeight: '1.6' }}>
                                                        {faq.answer}
                                                    </p>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faQuestionCircle} size="3x" className="text-muted mb-3" />
                                        <h5 className="text-muted">Aucune question trouvée</h5>
                                        <p className="text-muted">
                                            Essayez de modifier votre recherche ou sélectionnez une autre catégorie.
                                        </p>
                                        <Button variant="outline-primary" onClick={() => {
                                            setSearchTerm('');
                                            setActiveCategory('all');
                                        }}>
                                            Réinitialiser les filtres
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Section contact */}
                <Row className="mt-5 pt-4 border-top">
                    <Col className="text-center">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <FontAwesomeIcon icon={faEnvelope} size="3x" className="text-primary mb-3" />
                                <h4 className="fw-bold mb-3">Vous n'avez pas trouvé votre réponse ?</h4>
                                <p className="text-muted mb-4">
                                    Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter !
                                </p>
                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <Button variant="primary" size="lg" href="/contact">
                                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                        Nous contacter
                                    </Button>
                                    <Button variant="outline-primary" size="lg" href="mailto:reveilart4artist@gmail.com">
                                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                        Email direct
                                    </Button>
                                </div>
                                <div className="mt-4 pt-3 border-top">
                                    <div className="row text-center">
                                        <div className="col-md-4">
                                            <FontAwesomeIcon icon={faClock} className="text-success me-2" />
                                            <small className="text-muted">Réponse sous 24h</small>
                                        </div>
                                        <div className="col-md-4">
                                            <FontAwesomeIcon icon={faGlobe} className="text-info me-2" />
                                            <small className="text-muted">Support en français</small>
                                        </div>
                                        <div className="col-md-4">
                                            <FontAwesomeIcon icon={faHeadphones} className="text-warning me-2" />
                                            <small className="text-muted">Équipe dédiée</small>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .sticky-top {
                    position: sticky;
                    top: 100px;
                }

                .accordion-button:not(.collapsed) {
                    background-color: rgba(102, 126, 234, 0.1);
                    border-color: rgba(102, 126, 234, 0.2);
                }

                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(102, 126, 234, 0.3);
                }

                @media (max-width: 991.98px) {
                    .sticky-top {
                        position: relative;
                        top: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default FAQ;
