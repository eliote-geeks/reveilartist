import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp
} from '@fortawesome/free-solid-svg-icons';

const FloatingActionButton = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <div className="floating-fab-container">
                {/* Bouton de retour en haut */}
                <OverlayTrigger
                    placement="left"
                    overlay={<Tooltip>Retour en haut</Tooltip>}
                >
                    <Button
                        className="fab-button"
                        onClick={scrollToTop}
                        variant="primary"
                    >
                        <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                </OverlayTrigger>
            </div>

            <style jsx>{`
                .floating-fab-container {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 1000;
                }

                .fab-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border: none;
                    transition: all 0.3s ease;
                }

                .fab-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
                }

                @media (max-width: 768px) {
                    .floating-fab-container {
                        bottom: 20px;
                        right: 20px;
                    }

                    .fab-button {
                        width: 50px;
                        height: 50px;
                    }
                }
            `}</style>
        </>
    );
};

export default FloatingActionButton;
