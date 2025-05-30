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
    faHeadphones,
    faDownload
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
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        if (onLike) {
            onLike(sound.id, newLikedState);
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
                                    {sound.is_featured && (
                                        <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: '10px' }}>
                                            ⭐ Populaire
                                        </Badge>
                                    )}
                                </h6>
                                <p className="text-muted mb-2 small">
                                    par <Link
                                        to={`/artist/${sound.artistId || 1}`}
                                        className="text-decoration-none"
                                    >
                                        {sound.artist}
                                    </Link>
                                </p>

                                {showPreview && (
                                    <AudioPlayer
                                        sound={sound}
                                        isCompact={true}
                                        showDetails={false}
                                        onLike={handleLike}
                                        onViewMore={handleViewMore}
                                        previewDuration={20}
                                        showPreviewBadge={true}
                                    />
                                )}
                            </div>

                            <div className="text-end">
                                <div className="fw-bold text-warning mb-2">
                                    {sound.is_free || sound.price === 0 ? 'Gratuit' : `${sound.price?.toLocaleString()} FCFA`}
                                </div>
                                <div className="d-flex gap-1">
                                    <Button
                                        variant={isLiked ? "danger" : "outline-danger"}
                                        size="sm"
                                        onClick={handleLike}
                                        style={{ borderRadius: '6px', padding: '4px 8px' }}
                                        title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                                    >
                                        <FontAwesomeIcon
                                            icon={faHeart}
                                            style={{ fontSize: '12px' }}
                                        />
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleViewMore}
                                        style={{ borderRadius: '6px', padding: '4px 8px' }}
                                        title="Voir plus"
                                    >
                                        <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
                                    </Button>
                                    {!sound.is_free && sound.price > 0 && (
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={handleAddToCart}
                                            style={{ borderRadius: '6px', padding: '4px 8px' }}
                                            title="Ajouter au panier"
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '12px' }} />
                                        </Button>
                                    )}
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
                        tags: sound.tags || ['Afrobeat', 'Moderne', 'Dance'],
                        description: sound.description || `Un son ${sound.category?.toLowerCase() || 'musical'} captivant qui apporte de l'énergie et du rythme à vos créations. Parfait pour des projets créatifs, des vidéos ou des productions musicales.`,
                        duration: sound.duration || '3:24',
                        format: 'MP3 320kbps',
                        fileSize: '12.5 MB',
                        uploadDate: sound.created_at || '2024-03-15',
                        likes: sound.likes || 0,
                        plays: sound.plays || 0
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
                                title="Écouter et voir plus"
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
                        {(sound.is_free || sound.price === 0) && (
                            <Badge bg="success">Gratuit</Badge>
                        )}
                        {sound.is_featured && (
                            <Badge bg="warning" text="dark">⭐ Populaire</Badge>
                        )}
                    </div>

                    {/* Like button */}
                    <Button
                        variant="link"
                        className="position-absolute top-0 start-0 m-2 p-1"
                        onClick={handleLike}
                        style={{
                            background: isLiked ? 'rgba(220, 53, 69, 0.9)' : 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px'
                        }}
                        title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <FontAwesomeIcon
                            icon={faHeart}
                            style={{
                                color: isLiked ? '#fff' : '#6c757d',
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
                                previewDuration={20}
                                showPreviewBadge={false}
                            />
                        </div>
                    )}

                    {/* Stats */}
                    <div className="d-flex justify-content-between align-items-center mb-3 small text-muted">
                        <span>
                            <FontAwesomeIcon icon={faHeart} className="me-1" />
                            {sound.likes || 0}
                        </span>
                        <span>
                            <FontAwesomeIcon icon={faHeadphones} className="me-1" />
                            {sound.plays || 0} écoutes
                        </span>
                        {sound.duration && (
                            <span>
                                🕒 {sound.duration}
                            </span>
                        )}
                    </div>

                    {/* Prix et actions */}
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-warning">
                            {sound.is_free || sound.price === 0 ? 'Gratuit' : `${sound.price?.toLocaleString()} FCFA`}
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
                            {!sound.is_free && sound.price > 0 && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={handleAddToCart}
                                    style={{ borderRadius: '6px', padding: '4px 8px' }}
                                    title="Ajouter au panier"
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '12px' }} />
                                </Button>
                            )}
                            {sound.is_free || sound.price === 0 ? (
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => alert('Téléchargement disponible après inscription')}
                                    style={{ borderRadius: '6px', padding: '4px 8px' }}
                                    title="Télécharger"
                                >
                                    <FontAwesomeIcon icon={faDownload} style={{ fontSize: '12px' }} />
                                </Button>
                            ) : null}
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
                    tags: sound.tags || ['Afrobeat', 'Moderne', 'Dance'],
                    description: sound.description || `Un son ${sound.category?.toLowerCase() || 'musical'} captivant qui apporte de l'énergie et du rythme à vos créations. Parfait pour des projets créatifs, des vidéos ou des productions musicales.`,
                    duration: sound.duration || '3:24',
                    format: 'MP3 320kbps',
                    fileSize: '12.5 MB',
                    uploadDate: sound.created_at || '2024-03-15',
                    likes: sound.likes || 0,
                    plays: sound.plays || 0
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
