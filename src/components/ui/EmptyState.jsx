import React from 'react';
import PropTypes from 'prop-types';
import './EmptyState.css';

/**
 * EmptyState Component
 * 
 * Displays a centered empty state message with optional action button.
 * Used when data lists are empty or no results are found.
 * 
 * @component
 * @example
 * // Simple message
 * <EmptyState message="Belum ada data pasien" />
 * 
 * @example
 * // With action button
 * <EmptyState 
 *   message="Belum ada data pemeriksaan kehamilan" 
 *   action={{
 *     label: "Tambah Data Baru",
 *     onClick: () => navigate('/pemeriksaan-kehamilan/add')
 *   }}
 * />
 */
const EmptyState = ({ message, action, className = '' }) => {
  return (
    <div className={`empty-state ${className}`}>
      <p className="empty-state__message">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="empty-state__action"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  /**
   * Message to display (required)
   * Should be a helpful message explaining why the state is empty
   */
  message: PropTypes.string.isRequired,
  
  /**
   * Optional action button configuration
   * Provides a CTA for users to add new data or take action
   */
  action: PropTypes.shape({
    /**
     * Button label text
     */
    label: PropTypes.string.isRequired,
    /**
     * Click handler for the button
     */
    onClick: PropTypes.func.isRequired,
  }),
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default EmptyState;
