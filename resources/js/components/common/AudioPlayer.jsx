import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlay,
    faPause,
    faHeart,
    faVolumeUp,
    faVolumeMute,
    faForward,
    faBackward
} from '@fortawesome/free-solid-svg-icons';

const AudioPlayer = ({
    sound,
    isCompact = false,
    showDetails = true,
    onLike,
    onViewMore
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(sound.isLiked || false);
    const audioRef = useRef(null);

    // Mock audio URL - en production, cela viendrait de votre API
    const audioUrl = `https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav`; // Sample audio

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        const progressBar = e.currentTarget;
        const clickX = e.nativeEvent.offsetX;
        const width = progressBar.offsetWidth;
        const newTime = (clickX / width) * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value / 100;
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
    };

    const toggleLike = () => {
        setIsLiked(!isLiked);
        if (onLike) {
            onLike(sound.id, !isLiked);
        }
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    if (isCompact) {
        return (
            <div className="audio-player-compact d-flex align-items-center gap-2">
                <audio ref={audioRef} src={audioUrl} preload="metadata" />

                <Button
                    variant="warning"
                    size="sm"
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={togglePlay}
                >
                    <FontAwesomeIcon
                        icon={isPlaying ? faPause : faPlay}
                        style={{ fontSize: '12px' }}
                    />
                </Button>

                <div
                    className="progress-container flex-grow-1"
                    style={{ height: '4px', cursor: 'pointer' }}
                    onClick={handleSeek}
                >
                    <ProgressBar
                        now={progress}
                        style={{ height: '4px' }}
                        variant="warning"
                    />
                </div>

                <small className="text-muted" style={{ fontSize: '11px', minWidth: '35px' }}>
                    {formatTime(currentTime)}
                </small>

                <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={toggleLike}
                >
                    <FontAwesomeIcon
                        icon={faHeart}
                        style={{
                            fontSize: '14px',
                            color: isLiked ? '#dc3545' : '#6c757d'
                        }}
                    />
                </Button>
            </div>
        );
    }

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
                            </h6>
                            <small className="text-muted">par {sound.artist}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="link"
                                className="p-0"
                                onClick={toggleLike}
                            >
                                <FontAwesomeIcon
                                    icon={faHeart}
                                    style={{
                                        fontSize: '16px',
                                        color: isLiked ? '#dc3545' : '#6c757d'
                                    }}
                                />
                            </Button>
                            {onViewMore && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onViewMore(sound)}
                                    style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                    Voir plus
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="d-flex align-items-center gap-3 mb-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => {
                            audioRef.current.currentTime = Math.max(0, currentTime - 10);
                        }}
                    >
                        <FontAwesomeIcon icon={faBackward} style={{ fontSize: '12px' }} />
                    </Button>

                    <Button
                        variant="warning"
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '45px', height: '45px' }}
                        onClick={togglePlay}
                    >
                        <FontAwesomeIcon
                            icon={isPlaying ? faPause : faPlay}
                            style={{ fontSize: '16px' }}
                        />
                    </Button>

                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => {
                            audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                        }}
                    >
                        <FontAwesomeIcon icon={faForward} style={{ fontSize: '12px' }} />
                    </Button>

                    <div className="flex-grow-1">
                        <div
                            className="progress-container"
                            style={{ height: '6px', cursor: 'pointer' }}
                            onClick={handleSeek}
                        >
                            <ProgressBar
                                now={progress}
                                style={{ height: '6px' }}
                                variant="warning"
                            />
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                                {formatTime(currentTime)}
                            </small>
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                                {formatTime(duration)}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-muted"
                            onClick={toggleMute}
                        >
                            <FontAwesomeIcon
                                icon={isMuted ? faVolumeMute : faVolumeUp}
                                style={{ fontSize: '14px' }}
                            />
                        </Button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume * 100}
                            onChange={handleVolumeChange}
                            style={{ width: '60px', height: '4px' }}
                            className="form-range"
                        />
                    </div>
                </div>

                {/* Song Info */}
                {showDetails && (
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3">
                            <small className="text-muted">
                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                {sound.likes || 0}
                            </small>
                            <small className="text-muted">
                                {sound.plays || 0} écoutes
                            </small>
                        </div>
                        <span className="fw-bold text-warning">
                            {sound.price ? `${sound.price.toLocaleString()} FCFA` : 'Gratuit'}
                        </span>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AudioPlayer;
