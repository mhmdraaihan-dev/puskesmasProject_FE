import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

/**
 * Card Component
 * 
 * Container component for grouping related content with design system surface variants.
 * Supports multiple background variants, padding sizes, and border radius options.
 * 
 * @component
 * @example
 * // Canvas variant (cream background)
 * <Card variant="canvas" padding="xl" rounded="lg">
 *   <h2>Card Title</h2>
 *   <p>Card content...</p>
 * </Card>
 * 
 * @example
 * // Dark surface variant for data tables
 * <Card variant="surface-dark" padding="lg" rounded="md">
 *   <Table data={data} />
 * </Card>
 */
const Card = ({ 
  variant = 'canvas', 
  padding = 'xl', 
  rounded = 'lg',
  children,
  className = '',
  ...rest
}) => {
  return (
    <div 
      className={`card card--${variant} card--padding-${padding} card--rounded-${rounded} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  /**
   * Visual variant determining background color and text color
   * - canvas: Cream background (#faf9f5) with dark text
   * - surface-card: Elevated surface (#efe9de) with dark text
   * - surface-dark: Dark navy (#181715) with cream text
   */
  variant: PropTypes.oneOf(['canvas', 'surface-card', 'surface-dark']),
  
  /**
   * Internal padding size
   * - sm: 12px
   * - md: 16px
   * - lg: 24px
   * - xl: 32px
   */
  padding: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  
  /**
   * Border radius size
   * - sm: 6px
   * - md: 8px
   * - lg: 12px
   * - xl: 16px
   */
  rounded: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  
  /**
   * Card content
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default Card;
