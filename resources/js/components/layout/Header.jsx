import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Badge, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faSignInAlt, faUserPlus, faBars, faSignOutAlt,
    faMusic, faUsers, faCalendarAlt, faShoppingCart,
    faSearch, faTh, faPlus, faTimes, faCog, faHeart,
    faTachometerAlt, faUserCircle, faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout, isAuthenticated, loading, isArtist, isProducer, isAdmin } = useAuth();

    // Mettre à jour le timestamp de la photo quand l'utilisateur change
    useEffect(() => {
        if (user) {
            setPhotoTimestamp(Date.now());
        }
    }, [user?.profile_photo_url]);

    // Écouter les événements de mise à jour de photo
    useEffect(() => {
        const handlePhotoUpdate = (event) => {
            setPhotoTimestamp(event.detail.timestamp);
        };

        window.addEventListener('photoUpdated', handlePhotoUpdate);

        return () => {
            window.removeEventListener('photoUpdated', handlePhotoUpdate);
        };
    }, []);

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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const canCreateContent = () => {
        return isArtist() || isProducer() || isAdmin();
    };

    if (loading) {
        return (
            <Navbar expand="lg" className="custom-navbar shadow-sm" fixed="top">
                <Container>
                    <Navbar.Brand className="fw-bold fs-4">
                        <Spinner size="sm" className="me-2" />
                        Reveil4artist
                    </Navbar.Brand>
                </Container>
            </Navbar>
        );
    }

    return (
        <>
            <Navbar expand="lg" className="custom-navbar shadow-sm" fixed="top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 brand-enhanced">
                        <img
                            src="/images/reveilart-logo.svg"
                            alt="Reveil4artist"
                            height="28"
                            className="me-2 brand-logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline';
                            }}
                        />
                        <FontAwesomeIcon
                            icon={faMusic}
                            className="me-2 text-primary"
                            style={{ display: 'none' }}
                        />
                        <span className="brand-text">Reveil4artist</span>
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

                            {isAuthenticated && isAdmin() && (
                                <Nav.Link
                                    as={Link}
                                    to="/dashboard"
                                    className={`nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`}
                                >
                                    <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />
                                    Dashboard
                                </Nav.Link>
                            )}
                        </Nav>
                    </div>

                    {/* Desktop Actions */}
                    <div className="d-none d-lg-flex align-items-center">
                        {isAuthenticated && canCreateContent() && (
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
                        )}

                        {isAuthenticated && (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to="/cart"
                                    className={`nav-link-custom me-2 ${isActive('/cart') ? 'active' : ''}`}
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                                    <span className="d-none d-xl-inline">Panier</span>
                                </Nav.Link>

                                <Nav.Link
                                    as={Link}
                                    to="/favorites"
                                    className={`nav-link-custom me-2 ${isActive('/favorites') ? 'active' : ''}`}
                                >
                                    <FontAwesomeIcon icon={faHeart} className="me-1" />
                                    <span className="d-none d-xl-inline">Favoris</span>
                                </Nav.Link>

                                <NavDropdown
                                    title={
                                        <span className="user-dropdown-title">
                                            <img
                                                src={`${user.profile_photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}?t=${photoTimestamp}`}
                                                alt={user.name}
                                                className="user-avatar me-2"
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                key={photoTimestamp}
                                            />
                                            <span className="d-none d-xl-inline">{user.name}</span>
                                            <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'artist' ? 'primary' : user.role === 'producer' ? 'success' : 'secondary'} className="ms-2 small">
                                                {user.role}
                                            </Badge>
                                        </span>
                                    }
                                    id="user-dropdown"
                                    className="nav-link-custom me-2"
                                >
                                    <NavDropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                                        <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                                        Mon Profil
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/profile/edit" className="dropdown-item-custom">
                                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                                        Modifier Profil
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="dropdown-item-custom text-danger">
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                        Déconnexion
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="outline-primary"
                                    size="sm"
                                    className="btn-custom auth-btn"
                                >
                                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                                    <span>Connexion</span>
                                </Button>
                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="primary"
                                    size="sm"
                                    className="btn-custom auth-btn"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                    <span>S'inscrire</span>
                                </Button>
                            </div>
                        )}
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
                            alt="Reveil4artist"
                            height="24"
                            className="me-2"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline-block';
                            }}
                        />
                        <FontAwesomeIcon
                            icon={faMusic}
                            className="me-2 text-primary"
                            style={{ display: 'none' }}
                        />
                        <span className="fw-bold">Reveil4artist</span>
                        {isAuthenticated && (
                            <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'artist' ? 'primary' : user.role === 'producer' ? 'success' : 'secondary'} className="ms-auto">
                                {user.role}
                            </Badge>
                        )}
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

                        {isAuthenticated && (
                            <>
                                <div className="mobile-nav-divider"></div>

                                {isAdmin() && (
                                    <Nav.Link
                                        as={Link}
                                        to="/dashboard"
                                        className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                        onClick={closeMobileMenu}
                                    >
                                        <FontAwesomeIcon icon={faTachometerAlt} />
                                        <span>Dashboard</span>
                                    </Nav.Link>
                                )}

                                {canCreateContent() && (
                                    <>
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
                                    </>
                                )}

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
                                    to="/favorites"
                                    className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    <FontAwesomeIcon icon={faHeart} />
                                    <span>Favoris</span>
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
                            </>
                        )}
                    </Nav>

                    <div className="mobile-menu-footer">
                        {isAuthenticated ? (
                            <div className="user-info-mobile">
                                <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                    <img
                                        src={`${user.profile_photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}?t=${photoTimestamp}`}
                                        alt={user.name}
                                        className="rounded-circle me-3"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        key={photoTimestamp}
                                    />
                                    <div>
                                        <div className="fw-bold">{user.name}</div>
                                        <small className="text-muted">{user.email}</small>
                                    </div>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    className="w-100"
                                    onClick={() => {
                                        handleLogout();
                                        closeMobileMenu();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                    Déconnexion
                                </Button>
                            </div>
                        ) : (
                            <div className="auth-buttons-mobile">
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
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-navbar {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border-light);
                    padding: 0.75rem 0;
                    height: var(--header-height, 70px);
                    transition: all 0.3s ease;
                }

                .brand-enhanced {
                    display: flex;
                    align-items: center;
                    transition: all 0.3s ease;
                    text-decoration: none;
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
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .nav-link-custom {
                    color: #6b7280;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    margin: 0 0.25rem;
                }

                .nav-link-custom:hover {
                    color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.1);
                    transform: translateY(-1px);
                }

                .nav-link-custom.active {
                    color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.15);
                    font-weight: 600;
                }

                .user-avatar {
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    transition: all 0.3s ease;
                }

                .user-avatar:hover {
                    border-color: #8b5cf6;
                    transform: scale(1.05);
                }

                .user-dropdown-title {
                    display: flex;
                    align-items: center;
                }

                .nav-dropdown-title {
                    display: flex;
                    align-items: center;
                    color: #6b7280;
                    font-weight: 500;
                }

                .dropdown-item-custom {
                    padding: 0.75rem 1rem;
                    transition: all 0.2s ease;
                }

                .dropdown-item-custom:hover {
                    background: rgba(139, 92, 246, 0.1);
                    color: #8b5cf6;
                    transform: translateX(5px);
                }

                .btn-custom {
                    border-radius: 8px;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    transition: all 0.3s ease;
                }

                .btn-custom:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                }

                .auth-btn {
                    min-width: 100px;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-width: 2px;
                }

                .auth-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.25);
                }

                .auth-btn.btn-outline-primary {
                    color: #8b5cf6;
                    border-color: #8b5cf6;
                    background: rgba(139, 92, 246, 0.05);
                    backdrop-filter: blur(10px);
                }

                .auth-btn.btn-outline-primary:hover {
                    color: white;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border-color: #8b5cf6;
                }

                .auth-btn.btn-primary {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border: 2px solid transparent;
                    position: relative;
                    overflow: hidden;
                }

                .auth-btn.btn-primary:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }

                .auth-btn.btn-primary:hover:before {
                    left: 100%;
                }

                .auth-buttons-mobile {
                    padding: 0 1rem;
                }

                .auth-buttons-mobile .btn {
                    border-radius: 12px;
                    font-weight: 500;
                    padding: 0.75rem 1rem;
                }

                .mobile-toggle {
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    background: rgba(139, 92, 246, 0.1);
                    color: #8b5cf6;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .mobile-toggle:hover {
                    background: #8b5cf6;
                    color: white;
                    border-color: #8b5cf6;
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
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    background: #f9fafb;
                    font-size: 1.1rem;
                    color: #8b5cf6;
                }

                .mobile-nav {
                    flex: 1;
                    padding: 1rem 0;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    color: #6b7280;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border-left: 3px solid transparent;
                }

                .mobile-nav-link:hover {
                    background: rgba(139, 92, 246, 0.05);
                    color: #8b5cf6;
                    border-left-color: #8b5cf6;
                    transform: translateX(5px);
                }

                .mobile-nav-link.active {
                    background: rgba(139, 92, 246, 0.1);
                    color: #8b5cf6;
                    border-left-color: #8b5cf6;
                    font-weight: 600;
                }

                .mobile-nav-link.mobile-action-link {
                    background: rgba(139, 92, 246, 0.05);
                    margin: 0.25rem 1rem;
                    border-radius: 8px;
                    border-left: none;
                }

                .mobile-nav-divider {
                    height: 1px;
                    background: #e5e7eb;
                    margin: 1rem 1.5rem;
                }

                .mobile-menu-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                }

                .user-info-mobile {
                    text-align: center;
                }

                @media (max-width: 991.98px) {
                    .custom-navbar {
                        height: var(--header-height-mobile, 60px);
                    }
                }
            `}</style>
        </>
    );
};

export default Header;
