import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScale, faEnvelope, faCalendarAlt, faBuilding, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const LegalNotice = () => {
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
                                <FontAwesomeIcon icon={faBalanceScale} className="me-3" />
                                Mentions Légales
                            </h1>
                            <p className="lead mb-0">
                                Informations légales et réglementaires
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

                                <div className="legal-content">
                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">1. Identification de l'éditeur</h3>
                                        <div className="company-info bg-light p-4 rounded">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                                                        <strong>Dénomination sociale :</strong><br />
                                                        Reveil4artist
                                                    </p>
                                                    <p className="mb-2">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                                                        <strong>Siège social :</strong><br />
                                                        Yaoundé, Quartier Messassi<br />
                                                        Cameroun
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                                        <strong>Email :</strong><br />
                                                        reveilart4artist@gmail.com
                                                    </p>
                                                    <p className="mb-2">
                                                        <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                                        <strong>Téléphone :</strong><br />
                                                        +237 658 98 00 51
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">2. Directeur de la publication</h3>
                                        <p>
                                            Le directeur de la publication est le représentant légal de Reveil4artist.
                                        </p>
                                        <p>
                                            <strong>Contact :</strong> reveilart4artist@gmail.com
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">3. Hébergement</h3>
                                        <p>
                                            Le site web est hébergé par des services d'hébergement cloud sécurisés
                                            conformes aux standards internationaux de sécurité et de protection des données.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">4. Propriété intellectuelle</h3>
                                        <h5 className="fw-bold mb-2">4.1 Marques et logos</h5>
                                        <p>
                                            La marque "Reveil4artist", le logo et tous les éléments graphiques
                                            du site sont la propriété exclusive de Reveil4artist et sont protégés
                                            par les lois sur la propriété intellectuelle.
                                        </p>

                                        <h5 className="fw-bold mb-2 mt-3">4.2 Contenus musicaux</h5>
                                        <p>
                                            Tous les contenus musicaux diffusés sur la plateforme sont protégés
                                            par les droits d'auteur. Leur utilisation est strictement encadrée
                                            par les licences accordées par les ayants droit.
                                        </p>

                                        <h5 className="fw-bold mb-2 mt-3">4.3 Contenu du site</h5>
                                        <p>
                                            L'ensemble du contenu du site (textes, images, vidéos, designs)
                                            est protégé par les droits d'auteur et ne peut être reproduit
                                            sans autorisation écrite préalable.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">5. Données personnelles</h3>
                                        <p>
                                            Le traitement des données personnelles est régi par notre
                                            <a href="/privacy-policy" className="text-primary"> Politique de Confidentialité</a>.
                                        </p>
                                        <p>
                                            Conformément à la réglementation en vigueur au Cameroun et aux
                                            standards internationaux, vous disposez d'un droit d'accès,
                                            de rectification et de suppression de vos données personnelles.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">6. Cookies</h3>
                                        <p>
                                            Notre site utilise des cookies pour améliorer votre expérience
                                            de navigation et analyser l'utilisation du site. En continuant
                                            à naviguer, vous acceptez l'utilisation de ces cookies.
                                        </p>
                                        <p>
                                            Vous pouvez configurer votre navigateur pour refuser les cookies,
                                            mais certaines fonctionnalités du site pourraient ne plus être accessibles.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">7. Limitation de responsabilité</h3>
                                        <p>
                                            Reveil4artist s'efforce de fournir des informations exactes et à jour,
                                            mais ne peut garantir l'exactitude, la complétude ou l'actualité
                                            de toutes les informations diffusées.
                                        </p>
                                        <p>
                                            Reveil4artist ne saurait être tenu responsable de :
                                        </p>
                                        <ul>
                                            <li>L'interruption temporaire ou définitive du service</li>
                                            <li>Les dommages directs ou indirects liés à l'utilisation du site</li>
                                            <li>Les virus ou autres éléments nuisibles</li>
                                            <li>L'utilisation frauduleuse du site par des tiers</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">8. Liens externes</h3>
                                        <p>
                                            Notre site peut contenir des liens vers des sites externes.
                                            Reveil4artist n'a aucun contrôle sur ces sites et décline
                                            toute responsabilité quant à leur contenu ou leur politique
                                            de confidentialité.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">9. Droit applicable</h3>
                                        <p>
                                            Les présentes mentions légales sont soumises au droit camerounais.
                                            En cas de litige, les tribunaux camerounais seront seuls compétents.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">10. Déclaration CNIL</h3>
                                        <p>
                                            Conformément à la réglementation camerounaise sur la protection
                                            des données personnelles, Reveil4artist respecte les obligations
                                            de déclaration et de protection des données.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">11. Crédits</h3>
                                        <div className="credits bg-light p-4 rounded">
                                            <h6 className="fw-bold mb-3">Réalisation technique</h6>
                                            <p className="mb-2">
                                                <strong>Développement :</strong> Équipe technique Reveil4artist
                                            </p>
                                            <p className="mb-2">
                                                <strong>Design :</strong> Équipe créative Reveil4artist
                                            </p>
                                            <p className="mb-0">
                                                <strong>Maintenance :</strong> Service technique Reveil4artist
                                            </p>
                                        </div>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">12. Contact juridique</h3>
                                        <p>
                                            Pour toute question juridique ou réclamation concernant le site :
                                        </p>
                                        <div className="contact-info bg-light p-4 rounded">
                                            <p className="mb-2">
                                                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                                                <strong>Email :</strong> reveilart4artist@gmail.com
                                            </p>
                                            <p className="mb-2">
                                                <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                                                <strong>Téléphone :</strong> +237 658 98 00 51
                                            </p>
                                            <p className="mb-0">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
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
                .legal-content h3 {
                    color: #495057;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 0.5rem;
                }

                .legal-content ul {
                    padding-left: 1.5rem;
                }

                .legal-content li {
                    margin-bottom: 0.5rem;
                }

                .company-info, .contact-info, .credits {
                    border-left: 4px solid #667eea;
                }

                .company-info p, .contact-info p, .credits p {
                    line-height: 1.6;
                }
            `}</style>
        </div>
    );
};

export default LegalNotice;
