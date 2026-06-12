import React from 'react';
import PropTypes from 'prop-types';
import Modal from './ui/Modal';

/**
 * ConfirmDialog Component (Backward Compatibility Wrapper)
 * 
 * This component wraps the new Modal component to maintain backward compatibility
 * with existing code that uses ConfirmDialog.
 * 
 * For new code, use Modal component directly from ./ui/Modal
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    type = 'danger',
    isProcessing = false
}) => {
    const getButtonClassName = () => {
        switch (type) {
            case 'danger':
                return 'btn-danger';
            case 'success':
                return 'btn-primary';
            case 'warning':
                return 'btn-primary';
            default:
                return 'btn-primary';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <p>{message}</p>
            <div className="modal-actions">
                <button
                    onClick={onClose}
                    className="btn-secondary-on-dark"
                    disabled={isProcessing}
                    type="button"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className={getButtonClassName()}
                    disabled={isProcessing}
                    type="button"
                >
                    {isProcessing ? 'Memproses...' : confirmText}
                </button>
            </div>
        </Modal>
    );
};

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    type: PropTypes.oneOf(['danger', 'success', 'warning', 'info']),
    isProcessing: PropTypes.bool
};

export default ConfirmDialog;
