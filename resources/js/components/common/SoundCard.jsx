import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faShoppingCart,
    faEye,
    faPlay,
    faPause,
    faHeadphones
} from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from './AudioPlayer';
import SoundDetailsModal from './SoundDetailsModal';

const SoundCard = ({
    sound,
    onLike,
    onAddToCart,
    isCompact = false,
    showPreview = true
}) => {
    const [showModal, setShowModal] = useState(false);
    const [isLiked, setIsLiked] = useState(sound.isLiked || false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (onLike) {
            onLike(sound.id, !isLiked);
        }
    };

    const handleViewMore = () => {
        setShowModal(true);
    };

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(sound);
        }
    };

    // Version compacte pour les listes
    if (isCompact) {
        return (
            <>
                <Card className="sound-card-compact border-0 shadow-sm">
                    <Card.Body className="p-3">
                        <div className="d-flex align-items-center">
                            <img
                                src={sound.cover}
                                alt={sound.title}
                                className="rounded me-3"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />

                            <div className="flex-grow-1">
                                <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                    {sound.title}
                                </h6>
                                <p className="text-muted mb-2 small">par {sound.artist}</p>

                                {showPreview && (
                                    <AudioPlayer
                                        sound={sound}
                                        isCompact={true}
                                        showDetails={false}
                                        onLike={handleLike}
                                        onViewMore={handleViewMore}
                                    />
                                )}
                            </div>

                            <div className="text-end">
                                <div className="fw-bold text-warning mb-2">
                                    {sound.price ? `${sound.price.toLocaleString()} FCFA` : 'Gratuit'}
                                </div>
                                <div className="d-flex gap-1">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleViewMore}
                                        style={{ borderRadius: '6px', padding: '4px 8px' }}
                                        title="Voir plus"
                                    >
                                        <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
                                    </Button>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={handleAddToCart}
                                        style={{ borderRadius: '6px', padding: '4px 8px' }}
                                        title="Ajouter au panier"
                                    >
                                        <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '12px' }} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <SoundDetailsModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    sound={{
                        ...sound,
                        isLiked,
                        tags: ['Afrobeat', 'Moderne', 'Dance'],
                        description: `Un son ${sound.category?.toLowerCase() || 'musical'} captivant qui apporte de l'énergie et du rythme à vos créations. Parfait pour des projets créatifs, des vidéos ou des productions musicales.`,
                        duration: '3:24',
                        format: 'WAV 48kHz/24bit',
                        fileSize: '12.5 MB',
                        uploadDate: '2024-03-15',
                        likes: Math.floor(Math.random() * 500) + 50,
                        plays: Math.floor(Math.random() * 2000) + 100
                    }}
                    onLike={handleLike}
                    onAddToCart={onAddToCart}
                />
            </>
        );
    }

    // Version normale pour les grilles
    return (
        <>
            <Card className="sound-card h-100 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                {/* Cover Image */}
                <div className="position-relative">
                    <Card.Img
                        variant="top"
                        src={sound.cover}
                        alt={sound.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                    />

                    {/* Overlay avec actions rapides */}
                    <div
                        className="card-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                        }}
                    >
                        <div className="d-flex gap-2">
                            <Button
                                variant="warning"
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px' }}
                                onClick={handleViewMore}
                            >
                                <FontAwesomeIcon icon={faPlay} />
                            </Button>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="position-absolute top-0 end-0 p-2">
                        {sound.category && (
                            <Badge bg="dark" className="mb-1 d-block">
                                {sound.category}
                            </Badge>
                        )}
                        {sound.price === 0 && (
                            <Badge bg="success">Gratuit</Badge>
                        )}
                    </div>

                    {/* Like button */}
                    <Button
                        variant="link"
                        className="position-absolute top-0 start-0 m-2 p-1"
                        onClick={handleLike}
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px'
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faHeart}
                            style={{
                                color: isLiked ? '#dc3545' : '#6c757d',
                                fontSize: '14px'
                            }}
                        />
                    </Button>
                </div>

                <Card.Body className="p-3">
                    {/* Titre et artiste */}
                    <div className="mb-3">
                        <Card.Title className="mb-1 fw-bold" style={{ fontSize: '16px' }}>
                            {sound.title}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-0">
                            par <Link
                                to={`/artist/${sound.artistId || 1}`}
                                className="text-decoration-none"
                            >
                                {sound.artist}
                            </Link>
                        </Card.Text>
                    </div>

                    {/* Preview audio */}
                    {showPreview && (
                        <div className="mb-3">
                            <AudioPlayer
                                sound={sound}
                                isCompact={true}
                                showDetails={false}
                                onLike={handleLike}
                                onViewMore={handleViewMore}
                            />
                        </div>
                    )}

                    {/* Stats */}
                    <div className="d-flex justify-content-between align-items-center mb-3 small text-muted">
                        <span>
                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                            {sound.likes || Math.floor(Math.random() * 100)}
                        </span>
                        <span>
                            <FontAwesomeIcon icon={faHeadphones} className="me-1" />
                            {sound.plays || Math.floor(Math.random() * 500)} écoutes
                        </span>
                    </div>

                    {/* Prix et actions */}
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-warning">
                            {sound.price ? `${sound.price.toLocaleString()} FCFA` : 'Gratuit'}
                        </span>
                        <div className="d-flex gap-1">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleViewMore}
                                style={{ borderRadius: '6px', padding: '4px 8px' }}
                                title="Voir plus"
                            >
                                <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
                            </Button>
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={handleAddToCart}
                                style={{ borderRadius: '6px', padding: '4px 8px' }}
                                title="Ajouter au panier"
                            >
                                <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '12px' }} />
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <SoundDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                sound={{
                    ...sound,
                    isLiked,
                    tags: ['Afrobeat', 'Moderne', 'Dance'],
                    description: `Un son ${sound.category?.toLowerCase() || 'musical'} captivant qui apporte de l'énergie et du rythme à vos créations. Parfait pour des projets créatifs, des vidéos ou des productions musicales.`,
                    duration: '3:24',
                    format: 'WAV 48kHz/24bit',
                    fileSize: '12.5 MB',
                    uploadDate: '2024-03-15',
                    likes: Math.floor(Math.random() * 500) + 50,
                    plays: Math.floor(Math.random() * 2000) + 100
                }}
                onLike={handleLike}
                onAddToCart={onAddToCart}
            />

            <style jsx>{`
                .sound-card:hover .card-overlay {
                    opacity: 1 !important;
                }
            `}</style>
        </>
    );
};

export default SoundCard;
