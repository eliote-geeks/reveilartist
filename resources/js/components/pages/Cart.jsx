import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faPlus, faMinus, faShoppingCart, faCreditCard,
    faLock, faEuroSign, faPlay, faTag, faCheck, faHeart,
    faArrowLeft, faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import FloatingActionButton from '../common/FloatingActionButton';

const Cart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            title: "Métro Parisien - Rush Hour",
            artist: "UrbanSonic",
            duration: "3:24",
            price: 2500,
            quantity: 1,
            cover: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop&crop=center"
        },
        {
            id: 2,
            title: "Café de Quartier",
            artist: "CityVibes",
            duration: "4:02",
            price: 3500,
            quantity: 2,
            cover: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&h=100&fit=crop&crop=center"
        }
    ]);

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoMessage, setPromoMessage] = useState('');

    const validPromoCodes = {
        'REVEIL20': { discount: 0.20, description: '20% de réduction' },
        'URBAN10': { discount: 0.10, description: '10% de réduction' },
        'NEWUSER': { discount: 0.15, description: '15% de réduction pour les nouveaux utilisateurs' }
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity === 0) {
            removeItem(id);
            return;
        }
        setCartItems(items =>
            items.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const applyPromoCode = () => {
        const promo = validPromoCodes[promoCode.toUpperCase()];
        if (promo) {
            setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
            setPromoMessage(`Code promo appliqué : ${promo.description}`);
        } else {
            setPromoMessage('Code promo invalide');
        }
        setPromoCode('');
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoMessage('');
    };

    const getSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

    if (cartItems.length === 0) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center" style={{ paddingTop: '80px' }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6} className="text-center">
                            <div className="empty-cart-illustration mb-4">
                                <FontAwesomeIcon icon={faShoppingCart} size="5x" className="text-muted mb-3" />
                                <h3 className="fw-bold text-muted">Votre panier est vide</h3>
                                <p className="text-secondary mb-4">
                                    Découvrez notre catalogue de sons et ajoutez vos favoris au panier
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    <Button
                                        as={Link}
                                        to="/catalog"
                                        variant="primary"
                                        size="lg"
                                        className="px-4"
                                    >
                                        <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                                        Explorer le catalogue
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/"
                                        variant="outline-primary"
                                        size="lg"
                                        className="px-4"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                        Retour à l'accueil
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
                                            {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
                                        </p>
                                    </div>
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
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom-0">
                                <h5 className="fw-bold mb-0">
                                    <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
                                    Articles dans votre panier
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
                                            {cartItems.map(item => (
                                                <tr key={item.id} className="border-bottom">
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
                                                                <Badge bg="light" text="dark" className="small">
                                                                    {item.duration}
                                                                </Badge>
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
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                                                            onClick={() => removeItem(item.id)}
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

                        {/* Code promo */}
                        <Card className="border-0 shadow-sm mt-4">
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
                                        <span>Sous-total ({cartItems.length} articles)</span>
                                        <span className="fw-bold">{formatCurrency(getSubtotal())}</span>
                                    </div>
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
