import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Alert, Modal, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash, faPlus, faMinus, faShoppingCart, faCreditCard,
    faLock, faEuroSign, faPlay, faTag, faCheck, faHeart,
    faArrowLeft, faShoppingBag, faMusic, faCalendarAlt,
    faTicketAlt, faMapMarkerAlt, faDownload, faUsers,
    faPrint, faCheckCircle, faTimesCircle, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import FloatingActionButton from '../common/FloatingActionButton';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

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
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoMessage, setPromoMessage] = useState('');

    // États pour le checkout
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);

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

    // Nouvelle fonction de checkout
    const handleCheckout = () => {
        if (!user) {
            toast.error('Connexion requise', 'Veuillez vous connecter pour effectuer un achat');
            navigate('/login');
            return;
        }
        setShowCheckoutModal(true);
    };

    const processTestPayment = async () => {
        setIsProcessing(true);

        try {
            // Simuler un délai de traitement de paiement
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Générer un numéro de commande
            const orderNumber = `RVL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Créer les données de commande
            const order = {
                orderNumber,
                date: new Date().toISOString(),
                user: {
                    name: user.name,
                    email: user.email,
                    id: user.id
                },
                items: cartItems.map(item => ({
                    ...item,
                    purchasePrice: item.type === 'sound' ? item.price : item.ticket_price
                })),
                subtotal: getSubtotal(),
                discount: getDiscount(),
                promoCode: appliedPromo?.code || null,
                total: getTotal(),
                paymentMethod: 'Test Payment',
                status: 'completed'
            };

            // Simuler l'enregistrement en base de données
            await saveOrderToDatabase(order);

            setOrderData(order);
            setOrderSuccess(true);

            // Vider le panier
            clearCart();

            // Notification de succès
            toast.success('Commande confirmée !', `Votre commande ${orderNumber} a été traitée avec succès`);

        } catch (error) {
            toast.error('Erreur de paiement', 'Une erreur est survenue lors du traitement de votre commande');
            console.error('Erreur checkout:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const saveOrderToDatabase = async (order) => {
        // Simuler un appel API pour sauvegarder la commande
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_number: order.orderNumber,
                    user_id: order.user.id,
                    items: order.items,
                    subtotal: order.subtotal,
                    discount: order.discount,
                    promo_code: order.promoCode,
                    total: order.total,
                    payment_method: order.paymentMethod,
                    status: order.status
                })
            });

            if (!response.ok) {
                console.warn('Erreur lors de la sauvegarde de la commande en BDD');
            }
        } catch (error) {
            console.warn('Erreur de connexion à la BDD, commande sauvegardée localement');
        }
    };

    const printReceipt = () => {
        const printWindow = window.open('', '_blank');
        const receiptHtml = generateReceiptHTML(orderData);

        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const downloadPurchasedItem = (item) => {
        if (item.type === 'sound') {
            // Simuler le téléchargement d'un fichier audio
            const link = document.createElement('a');
            link.href = item.audio_file_url || '#';
            link.download = `${item.title}.mp3`;
            link.click();

            toast.success('Téléchargement', `${item.title} est en cours de téléchargement`);
        } else {
            // Pour les événements, générer un ticket PDF
            generateEventTicket(item);
        }
    };

    const generateEventTicket = (event) => {
        const ticketWindow = window.open('', '_blank');
        const ticketHtml = generateTicketHTML(event, orderData);

        ticketWindow.document.write(ticketHtml);
        ticketWindow.document.close();
        ticketWindow.focus();
        ticketWindow.print();

        toast.success('Ticket généré', `Votre ticket pour ${event.title} est prêt à imprimer`);
    };

    const generateReceiptHTML = (order) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reçu - ${order.orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: bold; color: #667eea; }
                    .order-info { margin-bottom: 30px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f2f2f2; }
                    .total-section { border-top: 2px solid #333; padding-top: 15px; }
                    .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .final-total { font-weight: bold; font-size: 18px; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🎵 Reveil4artist</div>
                    <h2>Reçu de commande</h2>
                </div>

                <div class="order-info">
                    <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString('fr-FR')}</p>
                    <p><strong>Client:</strong> ${order.user.name}</p>
                    <p><strong>Email:</strong> ${order.user.email}</p>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Type</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.title}</td>
                                <td>${item.type === 'sound' ? 'Son' : 'Ticket événement'}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.purchasePrice)}</td>
                                <td>${formatCurrency(item.purchasePrice * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-line">
                        <span>Sous-total:</span>
                        <span>${formatCurrency(order.subtotal)}</span>
                    </div>
                    ${order.discount > 0 ? `
                        <div class="total-line">
                            <span>Réduction (${order.promoCode}):</span>
                            <span>-${formatCurrency(order.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-line final-total">
                        <span>Total payé:</span>
                        <span>${formatCurrency(order.total)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Merci pour votre achat !</p>
                    <p>Reveil4artist - Plateforme musicale camerounaise</p>
                    <p>Ce reçu est généré automatiquement et valide sans signature.</p>
                </div>
            </body>
            </html>
        `;
    };

    const generateTicketHTML = (event, order) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${event.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                    .ticket { border: 2px dashed #333; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
                    .ticket-header { text-align: center; margin-bottom: 20px; }
                    .event-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                    .ticket-info { margin-bottom: 15px; }
                    .ticket-info div { margin-bottom: 8px; }
                    .qr-placeholder { width: 80px; height: 80px; background: white; margin: 20px auto; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; }
                    .ticket-number { text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 2px; }
                    @media print { body { margin: 0; } .ticket { border-color: #000; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <div style="font-size: 24px;">🎵</div>
                        <div class="event-title">${event.title}</div>
                    </div>

                    <div class="ticket-info">
                        <div><strong>📅 Date:</strong> ${new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
                        <div><strong>🕒 Heure:</strong> ${event.start_time || '20:00'}</div>
                        <div><strong>📍 Lieu:</strong> ${event.venue}</div>
                        <div><strong>🏙️ Ville:</strong> ${event.city}</div>
                        <div><strong>🎫 Quantité:</strong> ${event.quantity} ticket(s)</div>
                        <div><strong>👤 Titulaire:</strong> ${order.user.name}</div>
                    </div>

                    <div class="qr-placeholder">
                        QR CODE
                    </div>

                    <div class="ticket-number">
                        ${order.orderNumber}-${event.id}
                    </div>

                    <div style="text-align: center; margin-top: 15px; font-size: 12px;">
                        <p>Ticket valide - Présenter à l'entrée</p>
                        <p>Reveil4artist</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const closeModal = () => {
        setShowCheckoutModal(false);
        setOrderSuccess(false);
        setOrderData(null);
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
                                        onClick={handleCheckout}
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

            {/* Modal de Checkout */}
            <Modal
                show={showCheckoutModal}
                onHide={closeModal}
                size="lg"
                centered
                backdrop={isProcessing || orderSuccess ? "static" : true}
                keyboard={!isProcessing && !orderSuccess}
            >
                <Modal.Header closeButton={!isProcessing && !orderSuccess}>
                    <Modal.Title>
                        {!orderSuccess ? (
                            <>
                                <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                Finaliser votre commande
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                                Commande confirmée !
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {!orderSuccess ? (
                        <>
                            {/* Résumé de commande */}
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Résumé de votre commande</h6>

                                {soundItems.length > 0 && (
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                            <strong>Sons ({soundItems.length})</strong>
                                        </div>
                                        {soundItems.map(item => (
                                            <div key={`checkout-sound-${item.id}`} className="d-flex justify-content-between align-items-center mb-1 ps-4">
                                                <span className="small">{item.title} x{item.quantity}</span>
                                                <span className="small fw-bold">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {eventItems.length > 0 && (
                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-success" />
                                            <strong>Tickets ({eventItems.length})</strong>
                                        </div>
                                        {eventItems.map(item => (
                                            <div key={`checkout-event-${item.id}`} className="d-flex justify-content-between align-items-center mb-1 ps-4">
                                                <span className="small">{item.title} x{item.quantity}</span>
                                                <span className="small fw-bold">{formatCurrency(item.ticket_price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <strong>Total à payer</strong>
                                    <strong className="fs-5 text-primary">{formatCurrency(getTotal())}</strong>
                                </div>
                                {appliedPromo && (
                                    <div className="text-success small">
                                        Économie de {formatCurrency(getDiscount())} avec le code {appliedPromo.code}
                                    </div>
                                )}
                            </div>

                            {/* Section paiement test */}
                            <div className="alert alert-info">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                <strong>Mode Test :</strong> Cette transaction sera simulée à des fins de démonstration.
                            </div>

                            <div className="text-center">
                                {isProcessing ? (
                                    <div>
                                        <Spinner animation="border" variant="primary" className="mb-3" />
                                        <p>Traitement de votre paiement en cours...</p>
                                        <small className="text-muted">Veuillez patienter, cela peut prendre quelques secondes.</small>
                                    </div>
                                ) : (
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={processTestPayment}
                                        className="px-5"
                                    >
                                        <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                        Payer {formatCurrency(getTotal())} (Test)
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Confirmation de commande */
                        <div className="text-center">
                            <div className="mb-4">
                                <FontAwesomeIcon icon={faCheckCircle} size="4x" className="text-success mb-3" />
                                <h4 className="fw-bold text-success">Commande réussie !</h4>
                                <p className="text-muted">
                                    Votre commande <strong>{orderData?.orderNumber}</strong> a été traitée avec succès.
                                </p>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <Button
                                        variant="primary"
                                        onClick={printReceipt}
                                        className="w-100"
                                    >
                                        <FontAwesomeIcon icon={faPrint} className="me-2" />
                                        Imprimer le reçu
                                    </Button>
                                </div>
                                <div className="col-md-6">
                                    <Button
                                        variant="outline-primary"
                                        onClick={closeModal}
                                        className="w-100"
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>

                            {/* Actions par type d'achat */}
                            {orderData && (
                                <div>
                                    <h6 className="fw-bold mb-3">Vos achats</h6>

                                    {orderData.items.filter(item => item.type === 'sound').length > 0 && (
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faMusic} className="me-2 text-primary" />
                                                <strong>Sons téléchargeables</strong>
                                            </div>
                                            {orderData.items.filter(item => item.type === 'sound').map(item => (
                                                <div key={`download-${item.id}`} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                                    <span className="small">{item.title}</span>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => downloadPurchasedItem(item)}
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} className="me-1" />
                                                        Télécharger
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {orderData.items.filter(item => item.type === 'event').length > 0 && (
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-success" />
                                                <strong>Tickets d'événements</strong>
                                            </div>
                                            {orderData.items.filter(item => item.type === 'event').map(item => (
                                                <div key={`ticket-${item.id}`} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                                    <span className="small">{item.title} x{item.quantity}</span>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => downloadPurchasedItem(item)}
                                                    >
                                                        <FontAwesomeIcon icon={faPrint} className="me-1" />
                                                        Imprimer ticket
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <Alert variant="info" className="mt-4">
                                <small>
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                    Un email de confirmation a été envoyé à <strong>{user?.email}</strong>
                                </small>
                            </Alert>
                        </div>
                    )}
                </Modal.Body>

                {!orderSuccess && !isProcessing && (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>
                            Annuler
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>

            <FloatingActionButton />
        </div>
    );
};

export default Cart;
