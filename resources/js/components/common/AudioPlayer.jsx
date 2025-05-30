import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay,
    faPause,
    faVolumeLow,
    faVolumeHigh,
    faHeart,
    faEye,
    faForward,
    faBackward
} from '@fortawesome/free-solid-svg-icons';

const AudioPlayer = ({
    sound,
    isCompact = false,
    showDetails = true,
    onLike,
    onViewMore,
    autoPlay = false,
    previewDuration = 20, // Durée de la preview en secondes
    showPreviewBadge = true
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPreview, setIsPreview] = useState(true);
    const [previewTimeLeft, setPreviewTimeLeft] = useState(previewDuration);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const timeUpdateInterval = useRef(null);

    // URL audio pour preview
    const audioUrl = sound.preview_url || sound.file_url || '/audio/demo.mp3';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
            if (autoPlay && !isPlaying) {
                handlePlay();
            }
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            setError(null);
        };

        const handleError = (e) => {
            setError('Erreur de lecture audio');
            setIsLoading(false);
            setIsPlaying(false);
            console.error('Audio error:', e);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setPreviewTimeLeft(previewDuration);
        };

        const handleTimeUpdate = () => {
            if (audio && !audio.paused) {
                const current = audio.currentTime;
                setCurrentTime(current);

                // Gérer la limitation de preview
                if (isPreview && current >= previewDuration) {
                    audio.pause();
                    setIsPlaying(false);
                    setCurrentTime(previewDuration);
                    setPreviewTimeLeft(0);
                    return;
                }

                if (isPreview) {
                    setPreviewTimeLeft(Math.max(0, previewDuration - current));
                }
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [autoPlay, isPreview, previewDuration]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
        }
    }, [volume]);

    const handlePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            setIsLoading(true);

            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                await audio.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Play error:', error);
            setError('Impossible de lire le fichier audio');
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        const progressBar = progressRef.current;

        if (!audio || !progressBar || isPreview) return; // Pas de seek en mode preview

        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickPercent = clickX / rect.width;
        const newTime = clickPercent * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercent = () => {
        if (isPreview) {
            return duration > 0 ? (currentTime / previewDuration) * 100 : 0;
        }
        return duration > 0 ? (currentTime / duration) * 100 : 0;
    };

    if (error) {
        return (
            <div className="text-center text-muted small">
                <p className="mb-0">{error}</p>
            </div>
        );
    }

    // Version compacte pour les cartes
    if (isCompact) {
        return (
            <div className="audio-player-compact">
                <audio ref={audioRef} src={audioUrl} preload="metadata" />

                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handlePlay}
                        disabled={isLoading}
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', padding: '0' }}
                    >
                        <FontAwesomeIcon
                            icon={isLoading ? faForward : (isPlaying ? faPause : faPlay)}
                            style={{ fontSize: '12px' }}
                            spin={isLoading}
                        />
                    </Button>

                    <div className="flex-grow-1">
                        <div
                            ref={progressRef}
                            className="progress"
                            style={{ height: '4px', cursor: isPreview ? 'default' : 'pointer' }}
                            onClick={handleProgressClick}
                        >
                            <div
                                className="progress-bar bg-primary"
                                style={{ width: `${getProgressPercent()}%` }}
                            />
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <small className="text-muted">
                                {formatTime(currentTime)}
                                {isPreview && showPreviewBadge && (
                                    <span className="text-warning ms-1">
                                        (Preview {Math.ceil(previewTimeLeft)}s)
                                    </span>
                                )}
                            </small>
                            <small className="text-muted">
                                {formatTime(isPreview ? previewDuration : duration)}
                            </small>
                        </div>
                    </div>

                    {onViewMore && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={onViewMore}
                            style={{ width: '32px', height: '32px', padding: '0' }}
                        >
                            <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Version complète
    return (
        <Card className="audio-player border-0" style={{ borderRadius: '12px', background: 'rgba(255, 255, 255, 0.95)' }}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <Card.Body className="p-3">
                {showDetails && (
                    <div className="d-flex align-items-center mb-3">
                        <img
                            src={sound.cover}
                            alt={sound.title}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                {sound.title}
                                {isPreview && showPreviewBadge && (
                                    <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '10px' }}>
                                        Preview
                                    </span>
                                )}
                            </h6>
                            <small className="text-muted">par {sound.artist}</small>
                        </div>
                    </div>
                )}

                {/* Contrôles de lecture */}
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Button
                        variant="primary"
                        onClick={handlePlay}
                        disabled={isLoading}
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <FontAwesomeIcon
                            icon={isLoading ? faForward : (isPlaying ? faPause : faPlay)}
                            spin={isLoading}
                        />
                    </Button>

                    <div className="flex-grow-1">
                        {/* Barre de progression */}
                        <div
                            ref={progressRef}
                            className="progress mb-2"
                            style={{
                                height: '6px',
                                cursor: isPreview ? 'default' : 'pointer',
                                borderRadius: '3px'
                            }}
                            onClick={handleProgressClick}
                        >
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${getProgressPercent()}%`,
                                    background: isPreview ? '#ffc107' : '#0d6efd'
                                }}
                            />
                        </div>

                        {/* Temps */}
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                {formatTime(currentTime)}
                                {isPreview && previewTimeLeft > 0 && (
                                    <span className="text-warning ms-1">
                                        / {Math.ceil(previewTimeLeft)}s restant
                                    </span>
                                )}
                            </small>
                            <small className="text-muted">
                                {formatTime(isPreview ? previewDuration : duration)}
                            </small>
                        </div>
                    </div>

                    {/* Contrôle du volume */}
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                            icon={volume > 0.5 ? faVolumeHigh : faVolumeLow}
                            className="text-muted"
                            style={{ fontSize: '14px' }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            style={{ width: '60px' }}
                        />
                    </div>
                </div>

                {/* Actions */}
                {(onLike || onViewMore) && (
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                            {onLike && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onLike(sound.id)}
                                >
                                    <FontAwesomeIcon icon={faHeart} className="me-1" />
                                    J'aime
                                </Button>
                            )}
                        </div>

                        {onViewMore && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={onViewMore}
                            >
                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                Voir plus
                            </Button>
                        )}
                    </div>
                )}

                {/* Message de preview */}
                {isPreview && showPreviewBadge && (
                    <div className="text-center mt-2">
                        <small className="text-warning">
                            <FontAwesomeIcon icon={faForward} className="me-1" />
                            Preview limitée à {previewDuration} secondes
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AudioPlayer;
