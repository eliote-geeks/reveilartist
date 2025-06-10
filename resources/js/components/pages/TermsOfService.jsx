import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faEnvelope, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const TermsOfService = () => {
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
                                <FontAwesomeIcon icon={faFileContract} className="me-3" />
                                Conditions d'Utilisation
                            </h1>
                            <p className="lead mb-0">
                                Règles d'utilisation de la plateforme Reveil4artist
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

                                <div className="terms-content">
                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">1. Acceptation des conditions</h3>
                                        <p>
                                            En accédant et en utilisant la plateforme Reveil4artist, vous acceptez
                                            d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas
                                            ces conditions, veuillez ne pas utiliser notre service.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">2. Description du service</h3>
                                        <p>
                                            Reveil4artist est une plateforme musicale camerounaise qui permet :
                                        </p>
                                        <ul>
                                            <li>L'écoute et le téléchargement de musiques locales</li>
                                            <li>L'achat de billets pour des événements musicaux</li>
                                            <li>La promotion d'artistes camerounais</li>
                                            <li>L'interaction entre artistes et fans</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">3. Inscription et compte utilisateur</h3>
                                        <h5 className="fw-bold mb-2">3.1 Conditions d'inscription</h5>
                                        <ul>
                                            <li>Vous devez être âgé d'au moins 13 ans</li>
                                            <li>Fournir des informations exactes et complètes</li>
                                            <li>Maintenir la confidentialité de vos identifiants</li>
                                            <li>Un seul compte par personne</li>
                                        </ul>

                                        <h5 className="fw-bold mb-2 mt-3">3.2 Responsabilité du compte</h5>
                                        <p>
                                            Vous êtes responsable de toutes les activités qui se déroulent
                                            sous votre compte. Informez-nous immédiatement de toute
                                            utilisation non autorisée.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">4. Utilisation autorisée</h3>
                                        <p>Vous pouvez utiliser notre plateforme pour :</p>
                                        <ul>
                                            <li>Écouter de la musique à des fins personnelles</li>
                                            <li>Télécharger du contenu légalement autorisé</li>
                                            <li>Acheter des billets d'événements</li>
                                            <li>Interagir respectueusement avec la communauté</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">5. Utilisations interdites</h3>
                                        <p>Il est strictement interdit de :</p>
                                        <ul>
                                            <li>Redistribuer, revendre ou partager le contenu acheté</li>
                                            <li>Utiliser des bots ou scripts automatisés</li>
                                            <li>Contourner nos mesures de sécurité</li>
                                            <li>Télécharger illégalement du contenu payant</li>
                                            <li>Publier du contenu offensant ou diffamatoire</li>
                                            <li>Violer les droits d'auteur</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">6. Propriété intellectuelle</h3>
                                        <h5 className="fw-bold mb-2">6.1 Contenu de la plateforme</h5>
                                        <p>
                                            Tous les contenus (musiques, images, textes) sont protégés par
                                            les droits d'auteur. L'achat d'un contenu vous donne uniquement
                                            le droit d'utilisation personnelle.
                                        </p>

                                        <h5 className="fw-bold mb-2 mt-3">6.2 Contenu utilisateur</h5>
                                        <p>
                                            En soumettant du contenu, vous garantissez détenir tous les
                                            droits nécessaires et accordez à Reveil4artist une licence
                                            d'utilisation dans le cadre du service.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">7. Achats et paiements</h3>
                                        <h5 className="fw-bold mb-2">7.1 Prix et facturation</h5>
                                        <ul>
                                            <li>Tous les prix sont en francs CFA (XAF)</li>
                                            <li>Les prix peuvent changer sans préavis</li>
                                            <li>Le paiement est exigé avant le téléchargement</li>
                                        </ul>

                                        <h5 className="fw-bold mb-2 mt-3">7.2 Remboursements</h5>
                                        <p>
                                            Les remboursements sont possibles dans les 24h suivant l'achat
                                            si le contenu n'a pas été téléchargé, sauf cas exceptionnels.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">8. Événements et billets</h3>
                                        <ul>
                                            <li>Les billets sont nominatifs et non transférables</li>
                                            <li>Annulation possible jusqu'à 48h avant l'événement</li>
                                            <li>Nous ne sommes pas responsables de l'annulation d'événements</li>
                                            <li>Présentation obligatoire d'une pièce d'identité</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">9. Limitation de responsabilité</h3>
                                        <p>
                                            Reveil4artist ne saurait être tenu responsable de :
                                        </p>
                                        <ul>
                                            <li>L'interruption temporaire du service</li>
                                            <li>La perte de données due à des problèmes techniques</li>
                                            <li>L'utilisation inappropriée du contenu par les utilisateurs</li>
                                            <li>Les dommages indirects ou consécutifs</li>
                                        </ul>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">10. Suspension et résiliation</h3>
                                        <p>
                                            Nous nous réservons le droit de suspendre ou résilier votre
                                            compte en cas de violation de ces conditions, sans préavis
                                            et sans remboursement.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">11. Modifications des conditions</h3>
                                        <p>
                                            Ces conditions peuvent être modifiées à tout moment.
                                            Les modifications importantes seront notifiées aux utilisateurs.
                                            L'utilisation continue du service constitue une acceptation
                                            des nouvelles conditions.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">12. Droit applicable</h3>
                                        <p>
                                            Ces conditions sont régies par le droit camerounais.
                                            Tout litige sera soumis aux tribunaux compétents de Yaoundé.
                                        </p>
                                    </section>

                                    <section className="mb-5">
                                        <h3 className="h4 fw-bold text-primary mb-3">13. Contact</h3>
                                        <p>
                                            Pour toute question concernant ces conditions d'utilisation :
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
                .terms-content h3 {
                    color: #495057;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 0.5rem;
                }

                .terms-content ul {
                    padding-left: 1.5rem;
                }

                .terms-content li {
                    margin-bottom: 0.5rem;
                }

                .contact-info {
                    border-left: 4px solid #667eea;
                }
            `}</style>
        </div>
    );
};

export default TermsOfService;
