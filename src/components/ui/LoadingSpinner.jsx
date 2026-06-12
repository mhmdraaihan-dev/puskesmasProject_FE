import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * LoadingSpinner Component
 * 
 * Displays a loading spinner with coral primary color.
 * Centers spinner in container with appropriate aria-label for accessibility.
 * 
 * **Validates: Requirements 2.1, 2.2, 5.9**
 * - 2.1: Uses coral primary (#cc785c) for spinner color
 * - 2.2: Supports size variants matching design system
 * - 5.9: Provides loading state with accessibility support
 * 
 * @component
 * @example
 * // Default medium size
 * <LoadingSpinner />
 * 
 * @example
 * // Small size with custom aria-label
 * <LoadingSpinner size="sm" label="Loading data..." />
 * 
 * @example
 * // Large size
 * <LoadingSpinner size="lg" />
 */
const LoadingSpinner = ({ 
  size = 'md',
  label = 'Loading...',
  className = ''
}) => {
  return (
    <div 
      className={`loading-spinner-container ${className}`}
      role="status"
      aria-live="polite"
    >
      <div 
        className={`loading-spinner loading-spinner--${size}`}
        aria-label={label}
      >
        <svg 
          className="loading-spinner__svg"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="loading-spinner__circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

LoadingSpinner.propTypes = {
  /**
   * Size variant for the spinner
   * - sm: 24px (small inline loading)
   * - md: 40px (default, general purpose)
   * - lg: 64px (large page-level loading)
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  /**
   * Accessible label for screen readers
   */
  label: PropTypes.string,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default LoadingSpinner;
