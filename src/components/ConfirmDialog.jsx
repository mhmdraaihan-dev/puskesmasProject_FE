import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import '../App.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    const getButtonStyle = () => {
        switch (type) {
            case 'danger':
                return {
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    border: '1px solid #ef4444',
                    color: '#ef4444'
                };
            case 'success':
                return {
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                    border: '1px solid #10b981',
                    color: '#10b981'
                };
            case 'warning':
                return {
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    border: '1px solid #fbbf24',
                    color: '#fbbf24'
                };
            default:
                return {
                    backgroundColor: 'rgba(59, 130, 246, 0.3)',
                    border: '1px solid #3b82f6',
                    color: '#3b82f6'
                };
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="auth-card" style={{ maxWidth: '400px', margin: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>{message}</p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        className="btn-primary"
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--glass-border)',
                            padding: '0.5rem 1rem'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{
                            ...getButtonStyle(),
                            padding: '0.5rem 1rem'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
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
    type: PropTypes.oneOf(['danger', 'success', 'warning', 'info'])
};

export default ConfirmDialog;
