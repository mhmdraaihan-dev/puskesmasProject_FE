import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './Tooltip.css';

/**
 * Tooltip Component
 * 
 * Displays a tooltip on hover (especially useful for collapsed sidebar icons).
 * Uses dark navy surface with cream text and arrow pointer.
 * 
 * @component
 * @example
 * <Tooltip content="Dashboard" placement="right">
 *   <button className="icon-button">
 *     <HomeIcon />
 *   </button>
 * </Tooltip>
 */
const Tooltip = ({ 
  children, 
  content, 
  placement = 'top',
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + 8;
          break;
        default:
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 8;
      if (left < padding) {
        left = padding;
      } else if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }

      if (top < padding) {
        top = padding;
      } else if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setPosition({ top, left });
    }
  }, [isVisible, placement]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="tooltip-trigger"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`tooltip tooltip--${placement} ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`
          }}
          role="tooltip"
        >
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>,
        document.body
      )}
    </>
  );
};

Tooltip.propTypes = {
  /**
   * Element that triggers the tooltip
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Tooltip content (text or React node)
   */
  content: PropTypes.node,
  
  /**
   * Tooltip placement relative to trigger element
   */
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  
  /**
   * Delay in milliseconds before showing tooltip
   */
  delay: PropTypes.number,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default Tooltip;
