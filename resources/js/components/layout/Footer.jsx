import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faMusic, faHeadphones, faUsers, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
    return (
        <footer className="modern-footer">
            <Container>
                <Row className="justify-content-between">
                    {/* Logo et description */}
                    <Col lg={4} md={6} className="mb-4">
                        <div className="footer-brand d-flex align-items-center mb-3">
                            <img
                                src="/images/reveilart-logo.svg"
                                alt="reveilart"
                                style={{ height: '32px', width: 'auto' }}
                                className="me-2"
                            />
                            <span className="fw-bold fs-4 text-white">Reveilart4artist</span>
                        </div>
                        <p className="footer-description mb-3">
                            Découvrez les sons les plus authentiques du Cameroun.
                            Une plateforme dédiée à la promotion de la musique locale.
                        </p>
                        <div className="footer-social">
                            <a href="https://www.facebook.com/profile.php?id=100065203500641" target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                                <FontAwesomeIcon icon={faFacebook} />
                            </a>
                            <a href="#" className="social-link" title="Twitter">
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                            <a href="https://www.instagram.com/blueenergy237?igsh=ODlqdnkxb255YnA4&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a href="https://youtube.com/@reveilart?si=N5KLU82bN7DRd_2B" target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
                                <FontAwesomeIcon icon={faYoutube} />
                            </a>
                        </div>
                    </Col>

                    {/* Navigation */}
                    <Col lg={2} md={3} sm={6} className="mb-4">
                        <h5 className="footer-title">Navigation</h5>
                        <ul className="footer-links">
                            <li><a href="/" className="footer-link">Accueil</a></li>
                            <li><a href="/contact" className="footer-link">Contact</a></li>
                        </ul>
                    </Col>

                    {/* Découvrir */}
                    <Col lg={2} md={3} sm={6} className="mb-4">
                        <h5 className="footer-title">Découvrir</h5>
                        <ul className="footer-links">
                            <li>
                                <a href="#" className="footer-link">
                                    <FontAwesomeIcon icon={faMusic} className="me-2" />
                                    Sons populaires
                                </a>
                            </li>
                            <li>
                                <a href="#" className="footer-link">
                                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                                    Artistes
                                </a>
                            </li>
                            <li>
                                <a href="#" className="footer-link">
                                    <FontAwesomeIcon icon={faHeadphones} className="me-2" />
                                    Nouveautés
                                </a>
                            </li>
                        </ul>
                    </Col>

                    {/* Contact */}
                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="footer-title">Contact</h5>
                        <ul className="footer-contact">
                            <li>
                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                reveilart4artist@gmail.com
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faPhone} className="me-2" />
                                +237 658 98 00 51
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                Yaoundé, Quartier Messassi, Cameroun
                            </li>
                        </ul>
                    </Col>
                </Row>

                <hr className="footer-divider" />

                <Row className="align-items-center">
                    <Col md={4}>
                        <p className="footer-copyright mb-0">
                            © 2024 Reveilart4artist. Tous droits réservés.
                        </p>
                    </Col>
                    <Col md={4} className="text-center">
                        <p className="footer-credit mb-0">
                            Développé par <span className="fw-bold text-primary">Father Paul</span>
                        </p>
                    </Col>
                    <Col md={4} className="text-md-end">
                        <div className="footer-legal">
                            <a href="/privacy-policy" className="legal-link">Politique de confidentialité</a>
                            <a href="/terms-of-service" className="legal-link">Conditions d'utilisation</a>
                            <a href="/legal-notice" className="legal-link">Mentions légales</a>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style jsx>{`
                .modern-footer {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: #ffffff;
                    padding: 4rem 0 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .modern-footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg,
                        rgba(255,255,255,0) 0%,
                        rgba(255,255,255,0.1) 50%,
                        rgba(255,255,255,0) 100%);
                }

                .footer-brand {
                    transition: transform 0.3s ease;
                }

                .footer-brand:hover {
                    transform: translateY(-2px);
                }

                .footer-description {
                    color: rgba(255,255,255,0.7);
                    line-height: 1.6;
                }

                .footer-social {
                    display: flex;
                    gap: 1rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-3px);
                    color: #ffffff;
                }

                .footer-title {
                    color: #ffffff;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .footer-title::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: -0.5rem;
                    width: 30px;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-link {
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    display: block;
                    padding: 0.5rem 0;
                    transition: all 0.3s ease;
                }

                .footer-link:hover {
                    color: #ffffff;
                    transform: translateX(5px);
                }

                .footer-contact {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-contact li {
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                }

                .footer-divider {
                    border-color: rgba(255,255,255,0.1);
                    margin: 2rem 0 1.5rem;
                }

                .footer-copyright {
                    color: rgba(255,255,255,0.5);
                    font-size: 0.9rem;
                }

                .footer-credit {
                    color: rgba(255,255,255,0.7);
                    font-size: 0.9rem;
                }

                .footer-credit .text-primary {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .footer-legal {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                }

                .legal-link {
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                }

                .legal-link:hover {
                    color: #ffffff;
                }

                @media (max-width: 767.98px) {
                    .modern-footer {
                        padding: 3rem 0 1.5rem;
                    }

                    .footer-legal {
                        justify-content: center;
                        margin-top: 1rem;
                    }

                    .footer-copyright {
                        text-align: center;
                    }

                    .footer-credit {
                        text-align: center;
                        margin-top: 0.5rem;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
