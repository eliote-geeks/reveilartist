import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const ToastNotification = ({
    show,
    onClose,
    title,
    message,
    variant = 'success', // success, error, info, warning
    delay = 5000
}) => {
    const getIcon = () => {
        switch (variant) {
            case 'success':
                return faCheckCircle;
            case 'error':
                return faTimesCircle;
            case 'warning':
                return faExclamationCircle;
            case 'info':
                return faInfoCircle;
            default:
                return faCheckCircle;
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'success':
                return 'text-success';
            case 'error':
                return 'text-danger';
            case 'warning':
                return 'text-warning';
            case 'info':
                return 'text-info';
            default:
                return 'text-success';
        }
    };

    return (
        <ToastContainer
            position="top-end"
            className="position-fixed"
            style={{ top: '20px', right: '20px', zIndex: 9999 }}
        >
            <Toast
                show={show}
                onClose={onClose}
                delay={delay}
                autohide={variant !== 'error'}
                className="shadow-lg"
            >
                <Toast.Header className="border-0">
                    <FontAwesomeIcon
                        icon={getIcon()}
                        className={`me-2 ${getIconColor()}`}
                    />
                    <strong className="me-auto">{title}</strong>
                </Toast.Header>
                <Toast.Body className="text-muted">
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default ToastNotification;
