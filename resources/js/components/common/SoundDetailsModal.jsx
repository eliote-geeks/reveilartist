import React from 'react';
import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart, faDownload, faShoppingCart, faEye, faClock,
    faCalendar, faFileAudio, faUser, faPlay, faShare
} from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from './AudioPlayer';

const SoundDetailsModal = ({
    show,
    onHide,
    sound,
    onLike,
    onAddToCart
}) => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: sound.title,
                text: `Découvrez "${sound.title}" par ${sound.artist}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        }
    };

    const handleAddToCart = () => {
        if (sound.is_free || sound.price === 0) {
            alert('Ce son est gratuit ! Vous pouvez le télécharger directement.');
            return;
        }

        if (onAddToCart) {
            onAddToCart(sound);
        }
    };

    if (!sound) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <div className="d-flex gap-2">
                    {sound.category && (
                        <Badge bg="dark">{sound.category}</Badge>
                    )}
                    {sound.is_featured && (
                        <Badge bg="warning" text="dark">⭐ Populaire</Badge>
                    )}
                    {(sound.is_free || sound.price === 0) && (
                        <Badge bg="success">Gratuit</Badge>
                    )}
                </div>
            </Modal.Header>

            <Modal.Body className="pt-2">
                <Row>
                    {/* Image de couverture */}
                    <Col md={5} className="mb-3">
                        <div className="position-relative">
                            <img
                                src={sound.cover}
                                alt={sound.title}
                                className="rounded w-100"
                                style={{ height: '250px', objectFit: 'cover' }}
                            />
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <Button
                                    variant="warning"
                                    className="rounded-circle shadow-lg"
                                    style={{ width: '60px', height: '60px' }}
                                >
                                    <FontAwesomeIcon icon={faPlay} size="lg" />
                                </Button>
                            </div>
                        </div>
                    </Col>

                    {/* Informations principales */}
                    <Col md={7}>
                        <h4 className="fw-bold mb-2">{sound.title}</h4>
                        <p className="text-muted mb-3">
                            par <span className="fw-medium">{sound.artist}</span>
                        </p>

                        {/* Tags */}
                        {sound.tags && sound.tags.length > 0 && (
                            <div className="mb-3">
                                {sound.tags.map(tag => (
                                    <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-muted small mb-3">{sound.description}</p>

                        {/* Stats */}
                        <div className="d-flex gap-4 mb-3 small text-muted">
                            <span>
                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                {sound.likes} likes
                            </span>
                            <span>
                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                {sound.plays} écoutes
                            </span>
                            <span>
                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                {sound.downloads || 0} téléchargements
                            </span>
                        </div>

                        {/* Prix */}
                        <div className="mb-3">
                            <span className="fw-bold text-warning fs-4">
                                {sound.is_free || sound.price === 0
                                    ? 'Gratuit'
                                    : `${sound.price?.toLocaleString()} FCFA`
                                }
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 mb-3">
                            <Button
                                variant={sound.isLiked ? "danger" : "outline-danger"}
                                size="sm"
                                onClick={() => onLike && onLike(sound.id)}
                            >
                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                {sound.isLiked ? 'Aimé' : 'J\'aime'}
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleShare}
                            >
                                <FontAwesomeIcon icon={faShare} className="me-1" />
                                Partager
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Player audio */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-2">Prévisualisation</h6>
                    <AudioPlayer
                        sound={sound}
                        isCompact={false}
                        showDetails={false}
                        onLike={onLike}
                        previewDuration={20}
                        showPreviewBadge={true}
                    />
                </div>

                {/* Informations techniques */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">Informations Techniques</h6>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                            <span>
                                <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                                Durée
                            </span>
                            <span>{sound.duration}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                            <span>
                                <FontAwesomeIcon icon={faFileAudio} className="me-2 text-muted" />
                                Format
                            </span>
                            <span>{sound.format}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                            <span>
                                <FontAwesomeIcon icon={faDownload} className="me-2 text-muted" />
                                Taille
                            </span>
                            <span>{sound.fileSize}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                            <span>
                                <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                Date d'ajout
                            </span>
                            <span>{new Date(sound.uploadDate).toLocaleDateString('fr-FR')}</span>
                        </ListGroup.Item>
                        {sound.genre && (
                            <ListGroup.Item className="d-flex justify-content-between px-0">
                                <span>Genre</span>
                                <span>{sound.genre}</span>
                            </ListGroup.Item>
                        )}
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                            <span>Usage commercial</span>
                            <span className="text-success">Autorisé</span>
                        </ListGroup.Item>
                    </ListGroup>
                </div>

                {/* Informations artiste */}
                <div className="bg-light rounded p-3">
                    <h6 className="fw-bold mb-2">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        À propos de l'artiste
                    </h6>
                    <div className="d-flex align-items-center">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sound.artist)}&size=40`}
                            alt={sound.artist}
                            className="rounded-circle me-3"
                            width="40"
                            height="40"
                        />
                        <div>
                            <div className="fw-bold">{sound.artist}</div>
                            <small className="text-muted">Producteur musical</small>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <div>
                        <span className="fw-bold text-warning fs-5">
                            {sound.is_free || sound.price === 0
                                ? 'Gratuit'
                                : `${sound.price?.toLocaleString()} FCFA`
                            }
                        </span>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={onHide}>
                            Fermer
                        </Button>
                        {sound.is_free || sound.price === 0 ? (
                            <Button variant="success" onClick={() => alert('Téléchargement disponible après inscription')}>
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Télécharger Gratuitement
                            </Button>
                        ) : (
                            <Button variant="dark" onClick={handleAddToCart}>
                                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                Ajouter au Panier
                            </Button>
                        )}
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default SoundDetailsModal;
