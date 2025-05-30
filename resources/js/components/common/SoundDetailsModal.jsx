import React, { useState } from 'react';
import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faShare,
    faShoppingCart,
    faDownload,
    faClock,
    faCalendar,
    faFileAudio,
    faUser,
    faMusic,
    faTags,
    faHeadphones
} from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from './AudioPlayer';

const SoundDetailsModal = ({ show, onHide, sound, onLike, onAddToCart }) => {
    const [isLiked, setIsLiked] = useState(sound?.isLiked || false);

    if (!sound) return null;

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (onLike) {
            onLike(sound.id, !isLiked);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: sound.title,
                text: `Découvrez "${sound.title}" par ${sound.artist} sur RéveilArt`,
                url: window.location.href
            });
        } else {
            // Fallback pour copier le lien
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold" style={{ fontSize: '18px' }}>
                    Aperçu du son
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
                {/* Cover et infos principales */}
                <Row className="mb-4">
                    <Col md={4}>
                        <div className="position-relative">
                            <img
                                src={sound.cover}
                                alt={sound.title}
                                className="w-100 rounded-3"
                                style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                            />
                            <Badge
                                bg="dark"
                                className="position-absolute top-0 end-0 m-2"
                                style={{ fontSize: '10px' }}
                            >
                                {sound.category || 'Musique'}
                            </Badge>
                        </div>
                    </Col>
                    <Col md={8}>
                        <h3 className="fw-bold mb-2" style={{ fontSize: '20px' }}>
                            {sound.title}
                        </h3>
                        <p className="text-muted mb-3">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            par <Link to={`/artist/${sound.artistId || 1}`} className="text-decoration-none">
                                {sound.artist}
                            </Link>
                        </p>

                        {/* Tags */}
                        {sound.tags && (
                            <div className="mb-3">
                                <FontAwesomeIcon icon={faTags} className="me-2 text-muted" />
                                {sound.tags.map(tag => (
                                    <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        <Row className="text-center mb-3">
                            <Col xs={4}>
                                <div className="fw-bold text-primary">{sound.duration || '3:24'}</div>
                                <small className="text-muted">Durée</small>
                            </Col>
                            <Col xs={4}>
                                <div className="fw-bold text-danger">{sound.likes || 0}</div>
                                <small className="text-muted">J'aime</small>
                            </Col>
                            <Col xs={4}>
                                <div className="fw-bold text-info">{sound.plays || 0}</div>
                                <small className="text-muted">Écoutes</small>
                            </Col>
                        </Row>

                        {/* Prix et actions */}
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-warning fs-4">
                                {sound.price ? `${sound.price.toLocaleString()} FCFA` : 'Gratuit'}
                            </span>

                            <Button
                                variant={isLiked ? "danger" : "outline-danger"}
                                size="sm"
                                onClick={handleLike}
                                style={{ borderRadius: '8px' }}
                            >
                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                {isLiked ? 'Aimé' : 'J\'aime'}
                            </Button>

                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleShare}
                                style={{ borderRadius: '8px' }}
                            >
                                <FontAwesomeIcon icon={faShare} className="me-1" />
                                Partager
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Lecteur audio */}
                <div className="mb-4">
                    <AudioPlayer
                        sound={{...sound, isLiked}}
                        showDetails={false}
                        onLike={handleLike}
                    />
                </div>

                {/* Description */}
                {sound.description && (
                    <div className="mb-4">
                        <h6 className="fw-bold mb-2">
                            <FontAwesomeIcon icon={faMusic} className="me-2" />
                            Description
                        </h6>
                        <p className="text-muted" style={{ lineHeight: 1.6 }}>
                            {sound.description}
                        </p>
                    </div>
                )}

                {/* Informations techniques */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">
                        <FontAwesomeIcon icon={faFileAudio} className="me-2" />
                        Informations techniques
                    </h6>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                            <span>
                                <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
                                Durée
                            </span>
                            <span>{sound.duration || '3:24'}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                            <span>
                                <FontAwesomeIcon icon={faFileAudio} className="me-2 text-muted" />
                                Format
                            </span>
                            <span>{sound.format || 'WAV 48kHz/24bit'}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                            <span>
                                <FontAwesomeIcon icon={faDownload} className="me-2 text-muted" />
                                Taille
                            </span>
                            <span>{sound.fileSize || '12.5 MB'}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                            <span>
                                <FontAwesomeIcon icon={faCalendar} className="me-2 text-muted" />
                                Date d'ajout
                            </span>
                            <span>
                                {sound.uploadDate ?
                                    new Date(sound.uploadDate).toLocaleDateString('fr-FR') :
                                    '15 mars 2024'
                                }
                            </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 py-2">
                            <span>Licence</span>
                            <span className="text-success">Usage Commercial Autorisé</span>
                        </ListGroup.Item>
                    </ListGroup>
                </div>

                {/* Sons similaires */}
                {sound.relatedSounds && sound.relatedSounds.length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold mb-3">
                            <FontAwesomeIcon icon={faHeadphones} className="me-2" />
                            Sons similaires
                        </h6>
                        <Row className="g-2">
                            {sound.relatedSounds.slice(0, 3).map(relatedSound => (
                                <Col md={4} key={relatedSound.id}>
                                    <div className="d-flex align-items-center p-2 bg-light rounded">
                                        <img
                                            src={relatedSound.cover}
                                            alt={relatedSound.title}
                                            className="rounded me-2"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="fw-medium small">{relatedSound.title}</div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>
                                                {relatedSound.artist}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <div className="w-100 d-flex gap-2">
                    <Button
                        variant="warning"
                        className="flex-grow-1 fw-bold"
                        onClick={() => {
                            if (onAddToCart) onAddToCart(sound);
                            onHide();
                        }}
                        style={{ borderRadius: '12px' }}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        Ajouter au Panier
                    </Button>
                    <Button
                        as={Link}
                        to={`/sound/${sound.id}`}
                        variant="outline-primary"
                        onClick={onHide}
                        style={{ borderRadius: '12px' }}
                    >
                        Voir la page complète
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default SoundDetailsModal;
