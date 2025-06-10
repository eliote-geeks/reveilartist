import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEnvelope, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const PrivacyPolicy = () => {
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
                                <FontAwesomeIcon icon={faShieldAlt} className="me-3" />
                                Politique de Confidentialité
                            </h1>
                            <p className="lead mb-0">
                                Votre vie privée est importante pour nous
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <div className="mb-4 text-center">
                                    <small className="text-muted">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                        Dernière mise à jour : Décembre 2024
                                    </small>
                                </div>

                                <div className="privacy-content">
                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">1. Introduction</h3>
                                        <p>
                                            Reveilart4artist, société camerounaise située à Yaoundé, Quartier Messassi,
                                            s'engage à protéger et respecter votre vie privée. Cette politique explique
                                            comment nous collectons, utilisons et protégeons vos données personnelles
                                            lorsque vous utilisez notre plateforme musicale.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">2. Données que nous collectons</h3>
                                        <h5 className="fw-bold mb-2">2.1 Informations d'inscription</h5>
                                        <ul>
                                            <li>Nom et prénom</li>
                                            <li>Adresse email</li>
                                            <li>Mot de passe (crypté)</li>
                                            <li>Date de naissance (optionnelle)</li>
                                        </ul>

                                        <h5 className="fw-bold mb-2 mt-3">2.2 Données d'utilisation</h5>
                                        <ul>
                                            <li>Historique d'écoute et de téléchargement</li>
                                            <li>Préférences musicales</li>
                                            <li>Interactions avec la plateforme (likes, commentaires)</li>
                                            <li>Données de navigation et cookies</li>
                                        </ul>

                                        <h5 className="fw-bold mb-2 mt-3">2.3 Informations de paiement</h5>
                                        <ul>
                                            <li>Données de facturation (via nos partenaires de paiement sécurisés)</li>
                                            <li>Historique des transactions</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">3. Utilisation de vos données</h3>
                                        <p>Nous utilisons vos données personnelles pour :</p>
                                        <ul>
                                            <li>Fournir et améliorer nos services</li>
                                            <li>Personnaliser votre expérience musicale</li>
                                            <li>Traiter vos achats et téléchargements</li>
                                            <li>Vous envoyer des notifications importantes</li>
                                            <li>Assurer la sécurité de la plateforme</li>
                                            <li>Respecter nos obligations légales</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">4. Partage des données</h3>
                                        <p>
                                            Nous ne vendons jamais vos données personnelles. Nous pouvons les partager
                                            uniquement dans les cas suivants :
                                        </p>
                                        <ul>
                                            <li>Avec votre consentement explicite</li>
                                            <li>Avec nos prestataires de services (paiement, hébergement)</li>
                                            <li>Pour répondre à des obligations légales</li>
                                            <li>Pour protéger nos droits et ceux de nos utilisateurs</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">5. Sécurité des données</h3>
                                        <p>
                                            Nous mettons en place des mesures techniques et organisationnelles
                                            appropriées pour protéger vos données :
                                        </p>
                                        <ul>
                                            <li>Chiffrement des données sensibles</li>
                                            <li>Accès restreint aux données personnelles</li>
                                            <li>Surveillance continue de nos systèmes</li>
                                            <li>Formation régulière de nos équipes</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">6. Vos droits</h3>
                                        <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
                                        <ul>
                                            <li><strong>Droit d'accès :</strong> Consulter les données que nous détenons sur vous</li>
                                            <li><strong>Droit de rectification :</strong> Corriger des informations inexactes</li>
                                            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                                            <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format standard</li>
                                            <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">7. Cookies</h3>
                                        <p>
                                            Notre site utilise des cookies pour améliorer votre expérience.
                                            Ces cookies nous permettent de :
                                        </p>
                                        <ul>
                                            <li>Mémoriser vos préférences</li>
                                            <li>Analyser l'utilisation du site</li>
                                            <li>Personnaliser le contenu</li>
                                            <li>Assurer la sécurité</li>
                                        </ul>
                                        <p>
                                            Vous pouvez gérer vos préférences de cookies dans les paramètres
                                            de votre navigateur.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">8. Conservation des données</h3>
                                        <p>
                                            Nous conservons vos données personnelles aussi longtemps que nécessaire
                                            pour fournir nos services et respecter nos obligations légales.
                                            Les données inactives sont supprimées après 3 ans d'inactivité.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">9. Modifications de cette politique</h3>
                                        <p>
                                            Nous pouvons modifier cette politique de confidentialité occasionnellement.
                                            Les modifications importantes vous seront notifiées par email ou via
                                            une notification sur la plateforme.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">10. Contact</h3>
                                        <p>
                                            Pour toute question concernant cette politique de confidentialité
                                            ou l'exercice de vos droits, contactez-nous :
                                        </p>
                                        <div className="contact-info bg-light p-4 rounded">
                                            <p className="mb-2">
                                                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                                <strong>Email :</strong> reveilart4artist@gmail.com
                                            </p>
                                            <p className="mb-0">
                                                <strong>Adresse :</strong> Yaoundé, Quartier Messassi, Cameroun
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .privacy-content h3 {
                    color: #495057;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 0.5rem;
                }

                .privacy-content ul {
                    padding-left: 1.5rem;
                }

                .privacy-content li {
                    margin-bottom: 0.5rem;
                }

                .contact-info {
                    border-left: 4px solid #667eea;
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
