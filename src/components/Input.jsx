import React, { forwardRef } from 'react';
import '../styles/design-system.css';
import './Input.css';

/**
 * Input Component - Design System
 * 
 * Form input component with design system styling including:
 * - Cream canvas background with hairline borders
 * - 40px height
 * - Coral focus state with 3px outer ring at 15% alpha
 * - Error state with error color
 * - Required field asterisk in error color
 * - Helper text and error message display with body-sm typography
 * - Disabled state styling
 * 
 * Validates Requirements: 2.1, 2.2, 2.8, 6.3, 6.4, 6.5, 6.6, 9.7, 9.8
 */
const Input = forwardRef(({ 
  label, 
  type = 'text', 
  name, 
  placeholder, 
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required" aria-label="required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''} ${disabled ? 'input--disabled' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="input-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${name}-helper`} className="input-helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
