import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumb trail showing current page location.
 * Uses muted color from design system with body-sm typography.
 * 
 * @component
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Dashboard', path: '/' },
 *     { label: 'Users', path: '/users' },
 *     { label: 'Edit User' }
 *   ]}
 * />
 */
const Breadcrumbs = ({ items, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="breadcrumbs__item">
              {!isLast && item.path ? (
                <>
                  <Link 
                    to={item.path} 
                    className="breadcrumbs__link"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight 
                    size={14} 
                    className="breadcrumbs__separator"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <span 
                  className="breadcrumbs__current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  /**
   * Array of breadcrumb items
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * Display label
       */
      label: PropTypes.string.isRequired,
      /**
       * Link path (optional for last item)
       */
      path: PropTypes.string,
    })
  ).isRequired,
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default Breadcrumbs;
