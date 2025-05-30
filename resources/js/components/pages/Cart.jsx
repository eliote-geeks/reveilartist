import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faPlus, faMinus, faShoppingCart, faCreditCard,
    faLock, faEuroSign, faPlay, faTag, faCheck, faHeart,
    faArrowLeft, faShoppingBag, faMusic, faCalendarAlt,
    faTicketAlt, faMapMarkerAlt, faDownload, faUsers
} from '@fortawesome/free-solid-svg-icons';
import FloatingActionButton from '../common/FloatingActionButton';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const Cart = () => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemsByType
    } = useCart();
    const toast = useToast();

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoMessage, setPromoMessage] = useState('');

    const validPromoCodes = {
        'REVEIL20': { discount: 0.20, description: '20% de réduction' },
        'URBAN10': { discount: 0.10, description: '10% de réduction' },
        'NEWUSER': { discount: 0.15, description: '15% de réduction pour les nouveaux utilisateurs' }
    };

    const soundItems = getItemsByType('sound');
    const eventItems = getItemsByType('event');

    const handleUpdateQuantity = (itemId, itemType, newQuantity) => {
        if (newQuantity === 0) {
            handleRemoveItem(itemId, itemType);
            return;
        }
        updateQuantity(itemId, itemType, newQuantity);
    };

    const handleRemoveItem = (itemId, itemType) => {
        removeFromCart(itemId, itemType);
        toast.success('Article retiré', 'L\'article a été retiré de votre panier');
    };

    const applyPromoCode = () => {
        const promo = validPromoCodes[promoCode.toUpperCase()];
        if (promo) {
            setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
            setPromoMessage(`Code promo appliqué : ${promo.description}`);
            toast.success('Code promo', `${promo.description} appliquée`);
        } else {
            setPromoMessage('Code promo invalide');
            toast.error('Code invalide', 'Le code promo saisi n\'existe pas');
        }
        setPromoCode('');
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoMessage('');
        toast.info('Code promo retiré', 'La réduction a été supprimée');
    };

    const getSubtotal = () => {
        return getTotalPrice();
    };

    const getDiscount = () => {
        return appliedPromo ? getSubtotal() * appliedPromo.discount : 0;
    };

    const getTotal = () => {
        return getSubtotal() - getDiscount();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleClearCart = () => {
        clearCart();
        toast.success('Panier vidé', 'Tous les articles ont été retirés du panier');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center" style={{ paddingTop: '80px' }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6} className="text-center">
                            <div className="empty-cart-illustration mb-4 p-5">
                                <FontAwesomeIcon icon={faShoppingCart} size="5x" className="text-muted mb-4" />
                                <h3 className="fw-bold text-muted mb-3">Votre panier est vide</h3>
                                <p className="text-secondary mb-4">
                                    Découvrez notre catalogue de sons et événements, et ajoutez vos favoris au panier
                                </p>
                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        variant="primary"
                                        size="lg"
                                        className="px-4"
                                    >
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Explorer les sons
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/events"
                                        variant="outline-primary"
                                        size="lg"
                                        className="px-4"
                                    >
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                        Voir les événements
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <FloatingActionButton />
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light" style={{ paddingTop: '80px' }}>
            {/* Header de la page */}
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="py-4">
                        <Row className="align-items-center">
                            <Col>
                                <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-3"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                        Continuer mes achats
                                    </Button>
                                    <div>
                                        <h2 className="fw-bold mb-1">Mon Panier</h2>
                                        <p className="text-muted mb-0 small">
                                                {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier
                                                {soundItems.length > 0 && (
                                                    <> • {soundItems.length} son{soundItems.length > 1 ? 's' : ''}</>
                                                )}
                                                {eventItems.length > 0 && (
                                                    <> • {eventItems.length} ticket{eventItems.length > 1 ? 's' : ''}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {cartItems.length > 0 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={handleClearCart}
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                                            Vider le panier
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                <Row className="g-4">
                    {/* Liste des articles */}
                    <Col lg={8}>
                        {/* Sons */}
                        {soundItems.length > 0 && (
                            <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white border-bottom-0">
                                <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                        Sons ({soundItems.length})
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="border-0 p-3">Son</th>
                                                <th className="border-0 p-3 text-center">Prix unitaire</th>
                                                <th className="border-0 p-3 text-center">Quantité</th>
                                                <th className="border-0 p-3 text-center">Total</th>
                                                <th className="border-0 p-3 text-center" width="50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                                {soundItems.map(item => (
                                                    <tr key={`sound-${item.id}`} className="border-bottom">
                                                    <td className="p-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="position-relative me-3">
                                                                <img
                                                                    src={item.cover}
                                                                    alt={item.title}
                                                                    className="rounded"
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                />
                                                                <div className="position-absolute top-50 start-50 translate-middle">
                                                                    <Button
                                                                            as={Link}
                                                                            to={`/sound/${item.id}`}
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="rounded-circle p-1 shadow-sm"
                                                                        style={{ width: '24px', height: '24px' }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlay} className="text-primary" style={{ fontSize: '10px' }} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold mb-1">{item.title}</h6>
                                                                <p className="text-muted mb-1 small">par {item.artist}</p>
                                                                    <div className="d-flex gap-2">
                                                                <Badge bg="light" text="dark" className="small">
                                                                    {item.duration}
                                                                </Badge>
                                                                        <Badge bg="secondary" className="small">
                                                                            {item.category}
                                                                        </Badge>
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="fw-bold">{formatCurrency(item.price)}</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.type, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="rounded-circle p-1"
                                                                style={{ width: '32px', height: '32px' }}
                                                            >
                                                                <FontAwesomeIcon icon={faMinus} style={{ fontSize: '10px' }} />
                                                            </Button>
                                                            <span className="mx-3 fw-bold" style={{ minWidth: '20px' }}>
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.type, item.quantity + 1)}
                                                                className="rounded-circle p-1"
                                                                style={{ width: '32px', height: '32px' }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '10px' }} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="fw-bold text-primary">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                                onClick={() => handleRemoveItem(item.id, item.type)}
                                                                className="rounded-circle p-1"
                                                                style={{ width: '32px', height: '32px' }}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Tickets d'événements */}
                        {eventItems.length > 0 && (
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white border-bottom-0">
                                    <h5 className="fw-bold mb-0">
                                        <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-success" />
                                        Tickets d'événements ({eventItems.length})
                                    </h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="table-responsive">
                                        <Table className="mb-0 align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 p-3">Événement</th>
                                                    <th className="border-0 p-3 text-center">Prix unitaire</th>
                                                    <th className="border-0 p-3 text-center">Quantité</th>
                                                    <th className="border-0 p-3 text-center">Total</th>
                                                    <th className="border-0 p-3 text-center" width="50">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eventItems.map(item => (
                                                    <tr key={`event-${item.id}`} className="border-bottom">
                                                        <td className="p-3">
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={item.poster || item.cover}
                                                                    alt={item.title}
                                                                    className="rounded me-3"
                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                />
                                                                <div>
                                                                    <h6 className="fw-bold mb-1">{item.title}</h6>
                                                                    <p className="text-muted mb-1 small">
                                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                                        {new Date(item.event_date).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                    <p className="text-muted mb-0 small">
                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                        {item.venue}, {item.city}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className="fw-bold">{formatCurrency(item.ticket_price)}</span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.type, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="rounded-circle p-1"
                                                                    style={{ width: '32px', height: '32px' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faMinus} style={{ fontSize: '10px' }} />
                                                                </Button>
                                                                <span className="mx-3 fw-bold" style={{ minWidth: '20px' }}>
                                                                    {item.quantity}
                                                                </span>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateQuantity(item.id, item.type, item.quantity + 1)}
                                                                    disabled={item.max_attendees && item.quantity >= item.max_attendees}
                                                                    className="rounded-circle p-1"
                                                                    style={{ width: '32px', height: '32px' }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: '10px' }} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className="fw-bold text-success">
                                                                {formatCurrency(item.ticket_price * item.quantity)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(item.id, item.type)}
                                                            className="rounded-circle p-1"
                                                            style={{ width: '32px', height: '32px' }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                        )}

                        {/* Code promo */}
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom-0">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faTag} className="me-2 text-success" />
                                    Code promotionnel
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                {!appliedPromo ? (
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Entrez votre code promo"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                                        />
                                        <Button variant="outline-primary" onClick={applyPromoCode}>
                                            Appliquer
                                        </Button>
                                    </InputGroup>
                                ) : (
                                    <Alert variant="success" className="mb-0 d-flex align-items-center justify-content-between">
                                        <div>
                                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                                            <strong>{appliedPromo.code}</strong> - {appliedPromo.description}
                                        </div>
                                        <Button variant="outline-success" size="sm" onClick={removePromo}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </Alert>
                                )}
                                {promoMessage && !appliedPromo && (
                                    <div className="text-danger small mt-2">{promoMessage}</div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Résumé de commande */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                            <Card.Header className="bg-primary text-white">
                                <h5 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                    Résumé de la commande
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Sous-total ({getTotalItems()} articles)</span>
                                        <span className="fw-bold">{formatCurrency(getSubtotal())}</span>
                                    </div>

                                    {soundItems.length > 0 && (
                                        <div className="d-flex justify-content-between mb-1 small text-muted">
                                            <span>• {soundItems.length} son{soundItems.length > 1 ? 's' : ''}</span>
                                            <span>{formatCurrency(soundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                                        </div>
                                    )}

                                    {eventItems.length > 0 && (
                                        <div className="d-flex justify-content-between mb-2 small text-muted">
                                            <span>• {eventItems.length} ticket{eventItems.length > 1 ? 's' : ''}</span>
                                            <span>{formatCurrency(eventItems.reduce((sum, item) => sum + (item.ticket_price * item.quantity), 0))}</span>
                                        </div>
                                    )}

                                    {appliedPromo && (
                                        <div className="d-flex justify-content-between mb-2 text-success">
                                            <span>Réduction ({appliedPromo.code})</span>
                                            <span className="fw-bold">-{formatCurrency(getDiscount())}</span>
                                        </div>
                                    )}
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold fs-5">Total</span>
                                        <span className="fw-bold fs-5 text-primary">{formatCurrency(getTotal())}</span>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="fw-bold"
                                    >
                                        <FontAwesomeIcon icon={faLock} className="me-2" />
                                        Procéder au paiement
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        variant="outline-primary"
                                    >
                                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                                        Continuer mes achats
                                    </Button>
                                </div>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        <FontAwesomeIcon icon={faLock} className="me-1" />
                                        Paiement 100% sécurisé
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Suggestions */}
                        <Card className="border-0 shadow-sm mt-4">
                            <Card.Header className="bg-white border-bottom-0">
                                <h6 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faHeart} className="me-2 text-danger" />
                                    Vous pourriez aussi aimer
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3 p-2 border rounded">
                                    <img
                                        src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop"
                                        alt="Suggestion"
                                        className="rounded me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-medium small">Afro Beats Mix</div>
                                        <div className="text-muted small">BeatMaker237</div>
                                        <div className="text-primary small fw-bold">2,000 FCFA</div>
                                    </div>
                                    <Button variant="outline-primary" size="sm">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <FloatingActionButton />
        </div>
    );
};

export default Cart;
