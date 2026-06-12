import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

/**
 * Modal Component
 * 
 * Displays a modal dialog with dark navy surface and cream text.
 * Supports focus trapping and backdrop dismissal.
 * Refactored from ConfirmDialog to use design system styling.
 * 
 * @component
 * @example
 * // Confirmation dialog
 * <Modal
 *   isOpen={showModal}
 *   onClose={handleClose}
 *   title="Hapus Data"
 *   type="danger"
 * >
 *   <p>Apakah Anda yakin ingin menghapus data ini?</p>
 *   <div className="modal-actions">
 *     <button onClick={handleClose} className="btn-secondary-on-dark">
 *       Batal
 *     </button>
 *     <button onClick={handleDelete} className="btn-danger">
 *       Hapus
 *     </button>
 *   </div>
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus modal after a small delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus();
      }, 10);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to previous element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div 
        ref={modalRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="modal-close"
              aria-label="Tutup modal"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  /**
   * Controls modal visibility
   */
  isOpen: PropTypes.bool.isRequired,
  
  /**
   * Callback when modal is closed
   */
  onClose: PropTypes.func.isRequired,
  
  /**
   * Modal title (displayed in header)
   */
  title: PropTypes.string.isRequired,
  
  /**
   * Modal content
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Modal size
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /**
   * Whether clicking backdrop closes modal
   */
  closeOnBackdrop: PropTypes.bool,
  
  /**
   * Whether to show close button in header
   */
  showCloseButton: PropTypes.bool,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default Modal;
