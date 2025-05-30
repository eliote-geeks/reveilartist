import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faSignInAlt, faUserPlus, faBars,
    faMusic, faUsers, faCalendarAlt, faShoppingCart,
    faSearch, faTh, faPlus, faTimes
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const location = useLocation();

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
        setShowMobileMenu(!showMobileMenu);
    };

    const closeMobileMenu = () => {
        setIsOpen(false);
        setShowMobileMenu(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <Navbar expand="lg" className="custom-navbar shadow-sm" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 brand-enhanced">
                        <img
                            src="/images/reveilart-logo.svg"
                            alt="reveilart"
                            height="28"
                            className="me-2 brand-logo"
                        />
                        <span className="brand-text">Reveilart4artist</span>
                    </Navbar.Brand>

                    {/* Desktop Navigation */}
                    <div className="d-none d-lg-flex align-items-center me-auto">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/"
                                className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
                            >
                                <FontAwesomeIcon icon={faSearch} className="me-1" />
                                Accueil
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/catalog"
                                className={`nav-link-custom ${isActive('/catalog') ? 'active' : ''}`}
                            >
                                <FontAwesomeIcon icon={faMusic} className="me-1" />
                                Catalogue
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/artists"
                                className={`nav-link-custom ${isActive('/artists') ? 'active' : ''}`}
                            >
                                <FontAwesomeIcon icon={faUsers} className="me-1" />
                                Artistes
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/events"
                                className={`nav-link-custom ${isActive('/events') ? 'active' : ''}`}
                            >
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                Événements
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/categories"
                                className={`nav-link-custom ${isActive('/categories') ? 'active' : ''}`}
                            >
                                <FontAwesomeIcon icon={faTh} className="me-1" />
                                Catégories
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/dashboard"
                                className={`nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`}
                            >
                                Dashboard
                            </Nav.Link>
                        </Nav>
                    </div>

                    {/* Desktop Actions */}
                    <div className="d-none d-lg-flex align-items-center">
                        <NavDropdown
                            title={
                                <span className="nav-dropdown-title">
                                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                                    Ajouter
                                </span>
                            }
                            id="add-content-dropdown"
                            className="nav-link-custom me-3"
                        >
                            <NavDropdown.Item as={Link} to="/add-sound" className="dropdown-item-custom">
                                <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                Nouveau Son
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/add-event" className="dropdown-item-custom">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                                Nouvel Événement
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Nav.Link
                            as={Link}
                            to="/cart"
                            className={`nav-link-custom me-2 ${isActive('/cart') ? 'active' : ''}`}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                            <span className="d-none d-xl-inline">Panier</span>
                        </Nav.Link>

                        <NavDropdown
                            title={<FontAwesomeIcon icon={faUser} />}
                            id="user-dropdown"
                            className="nav-link-custom me-2"
                        >
                            <NavDropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                                Mon Profil
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/profile/edit" className="dropdown-item-custom">
                                Modifier Profil
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/login" className="dropdown-item-custom">
                                Connexion
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Button
                            as={Link}
                            to="/register"
                            variant="primary"
                            size="sm"
                            className="btn-custom"
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                            S'inscrire
                        </Button>
                    </div>

                    {/* Mobile Toggle */}
                    <Button
                        variant="outline-light"
                        className="d-lg-none mobile-toggle"
                        onClick={toggleNavbar}
                        aria-expanded={showMobileMenu}
                    >
                        <FontAwesomeIcon
                            icon={showMobileMenu ? faTimes : faBars}
                            className={`toggle-icon ${showMobileMenu ? 'rotated' : ''}`}
                        />
                    </Button>
                </Container>
            </Navbar>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${showMobileMenu ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <img
                            src="/images/reveilart-logo.svg"
                            alt="reveilart"
                            height="24"
                            className="me-2"
                        />
                        <span className="fw-bold">Reveilart4artist</span>
                    </div>

                    <Nav className="mobile-nav">
                        <Nav.Link
                            as={Link}
                            to="/"
                            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faSearch} />
                            <span>Accueil</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/catalog"
                            className={`mobile-nav-link ${isActive('/catalog') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faMusic} />
                            <span>Catalogue</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/artists"
                            className={`mobile-nav-link ${isActive('/artists') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faUsers} />
                            <span>Artistes</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/events"
                            className={`mobile-nav-link ${isActive('/events') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>Événements</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/categories"
                            className={`mobile-nav-link ${isActive('/categories') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faTh} />
                            <span>Catégories</span>
                        </Nav.Link>

                        <div className="mobile-nav-divider"></div>

                        <Nav.Link
                            as={Link}
                            to="/add-sound"
                            className="mobile-nav-link mobile-action-link"
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faMusic} />
                            <span>Ajouter un Son</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/add-event"
                            className="mobile-nav-link mobile-action-link"
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>Créer un Événement</span>
                        </Nav.Link>

                        <div className="mobile-nav-divider"></div>

                        <Nav.Link
                            as={Link}
                            to="/cart"
                            className={`mobile-nav-link ${isActive('/cart') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            <span>Panier</span>
                        </Nav.Link>

                        <Nav.Link
                            as={Link}
                            to="/profile"
                            className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faUser} />
                            <span>Mon Profil</span>
                        </Nav.Link>
                    </Nav>

                    <div className="mobile-menu-footer">
                        <Button
                            as={Link}
                            to="/login"
                            variant="outline-primary"
                            className="w-100 mb-2"
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                            Connexion
                        </Button>
                        <Button
                            as={Link}
                            to="/register"
                            variant="primary"
                            className="w-100"
                            onClick={closeMobileMenu}
                        >
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            S'inscrire
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-navbar {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border-light);
                    padding: 0.75rem 0;
                    height: 70px;
                    transition: all 0.3s ease;
                }

                .brand-enhanced {
                    display: flex;
                    align-items: center;
                    transition: all 0.3s ease;
                }

                .brand-enhanced:hover {
                    transform: scale(1.02);
                }

                .brand-logo {
                    transition: transform 0.3s ease;
                }

                .brand-enhanced:hover .brand-logo {
                    transform: rotate(5deg);
                }

                .brand-text {
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .mobile-toggle {
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--primary-color);
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .mobile-toggle:hover {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                    transform: scale(1.05);
                }

                .toggle-icon {
                    transition: transform 0.3s ease;
                }

                .toggle-icon.rotated {
                    transform: rotate(180deg);
                }

                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 1040;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .mobile-menu-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                .mobile-menu-content {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 320px;
                    max-width: 85vw;
                    height: 100vh;
                    background: white;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .mobile-menu-overlay.active .mobile-menu-content {
                    transform: translateX(0);
                }

                .mobile-menu-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    display: flex;
                    align-items: center;
                    background: var(--bg-secondary);
                    font-size: 1.1rem;
                    color: var(--primary-color);
                }

                .mobile-nav {
                    flex: 1;
                    padding: 1rem 0;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border-left: 3px solid transparent;
                }

                .mobile-nav-link:hover {
                    background: rgba(139, 92, 246, 0.05);
                    color: var(--primary-color);
                    border-left-color: var(--primary-color);
                    transform: translateX(5px);
                }

                .mobile-nav-link.active {
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--primary-color);
                    border-left-color: var(--primary-color);
                    font-weight: 600;
                }

                .mobile-nav-link svg {
                    width: 20px;
                    margin-right: 1rem;
                    text-align: center;
                }

                .mobile-action-link {
                    background: rgba(139, 92, 246, 0.05);
                    color: var(--primary-color);
                    font-weight: 500;
                }

                .mobile-nav-divider {
                    height: 1px;
                    background: var(--border-light);
                    margin: 0.5rem 1.5rem;
                }

                .mobile-menu-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--border-light);
                    background: var(--bg-secondary);
                }

                .nav-dropdown-title {
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .dropdown-item-custom {
                    padding: 0.75rem 1rem;
                    transition: all 0.2s ease;
                    border-radius: 6px;
                    margin: 0.125rem;
                }

                .dropdown-item-custom:hover {
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--primary-color);
                    transform: translateX(5px);
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .custom-navbar {
                        height: 64px;
                        padding: 0.5rem 0;
                    }

                    .mobile-menu-content {
                        width: 280px;
                    }

                    .mobile-nav-link {
                        padding: 0.875rem 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .mobile-menu-content {
                        width: 100vw;
                        max-width: 100vw;
                    }
                }
            `}</style>
        </>
    );
};

export default Header;
