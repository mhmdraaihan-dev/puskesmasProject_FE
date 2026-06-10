import PropTypes from 'prop-types';
import '../App.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isProcessing = false
}) => {
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
        <div className="dialog-overlay">
            <div className="content-card-light dialog-card">
                <div className="auth-eyebrow">Confirmation</div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
                <p className="dialog-message">{message}</p>

                <div className="dialog-actions">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isProcessing}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        disabled={isProcessing}
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
    type: PropTypes.oneOf(['danger', 'success', 'warning', 'info']),
    isProcessing: PropTypes.bool
};

export default ConfirmDialog;
