import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Button Component - Design System
 * 
 * Button with multiple variants, sizes, and states.
 * 
 * Variants:
 * - primary: Coral background, white text
 * - secondary: Canvas background, dark text
 * - secondary-on-dark: Dark elevated background, cream text
 * - text-link: No background, coral text
 * - icon-circular: Circular button for icons
 * 
 * Sizes: sm, md, lg
 * 
 * @component
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) => {
  const buttonClass = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full-width',
    loading && 'button--loading',
    disabled && 'button--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClass}
      {...props}
    >
      {loading && (
        <span className="button__loader">
          <Loader2 size={16} className="button__loader-icon" />
        </span>
      )}
      {icon && !loading && (
        <span className="button__icon">
          {icon}
        </span>
      )}
      {children && <span className="button__text">{children}</span>}
    </button>
  );
};

export default Button;
